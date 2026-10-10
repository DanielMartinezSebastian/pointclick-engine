import type { CommandHandler } from "../commands/CommandHandler";
import type { GameEvent } from "../events/types";
import { dialogueRegistry } from "../runtime/registry";
import { useDialogueStore, type DialogueChoiceView } from "../state/dialogueStore";
import { getInputLockState } from "../state/inputLockStore";
import { getWorldState } from "../state/worldStateStore";
import type { Action, Script, ScriptRun } from "./actions";
import type { ActionContext, ActionExecutor } from "./actionExecutors";
import { evaluateCondition, getConditionContext } from "./conditions";
import type {
  DialogueChoice,
  DialogueDefinition,
  DialogueEndReason,
  DialogueNode,
} from "./dialogueTypes";

/** Nodos seguidos sin esperar al jugador antes de cortar (proteccion contra bucles). */
export const MAX_DIALOGUE_STEPS = 500;

export interface DialogueEngineDeps {
  emit(event: GameEvent): void;
  runScript(script: Script): ScriptRun;
  registerExecutor(key: string, executor: ActionExecutor): () => void;
}

export interface DialogueEngine {
  /** Termina la conversacion activa (reason "cancelled") y suelta el ejecutor. */
  dispose(): void;
}

type Waiting = "dismiss" | "choice";
type VisibleChoice = { view: DialogueChoiceView; choice: DialogueChoice };

interface Session {
  def: DialogueDefinition;
  ctx: ActionContext;
  over: boolean;
  steps: number;
  bubbleOpen: boolean;
  visible: VisibleChoice[];
  waiting: { kind: Waiting; release: () => void } | null;
  chosen: number | null;
  wasLocked: boolean;
  offDismissed: () => void;
}

const onceFlag = (d: string, n: string, i: number) => `dlg.${d}.${n}.${i}`;

function computeVisible(def: DialogueDefinition, node: DialogueNode): VisibleChoice[] {
  if (!Array.isArray(node.choices)) return [];
  const ctx = getConditionContext();
  const flags = getWorldState().flags;
  const out: VisibleChoice[] = [];
  node.choices.forEach((choice, index) => {
    if (!choice || typeof choice !== "object") return;
    if (choice.once && flags[onceFlag(def.id, node.id, index)] === true) return;
    if (!evaluateCondition(choice.when, ctx)) return;
    out.push({ view: { index, textKey: choice.text }, choice });
  });
  return out;
}

/**
 * Motor de conversaciones. Corre SIEMPRE dentro de un guion (accion `startDialogue`):
 * los `do` de nodos y opciones se ejecutan "en linea" (`ctx.runInline`), sin pasar por
 * la cola del secuenciador, asi que no hay interbloqueo con el guion contenedor.
 */
export function registerDialogueCommands(
  commands: CommandHandler,
  deps: DialogueEngineDeps,
): DialogueEngine {
  let session: Session | null = null;

  function finish(s: Session, reason: DialogueEndReason): void {
    if (s.over) return;
    s.over = true;
    s.offDismissed();
    if (session === s) session = null;
    if (s.bubbleOpen) {
      s.bubbleOpen = false;
      s.ctx.env.execute({ type: "dialog:dismiss" });
    }
    useDialogueStore.getState().clear();
    if (!s.wasLocked) s.ctx.setInputLock(false);
    deps.emit({ type: "dialogue:ended", dialogueId: s.def.id, reason });
    s.waiting?.release();
  }

  /** Espera una entrada del jugador (cierre del bocadillo o eleccion). */
  async function awaitInput(s: Session, kind: Waiting, arm: () => void): Promise<void> {
    await s.ctx.wait((resolve) => {
      s.waiting = { kind, release: resolve };
      arm();
      return () => {
        s.waiting = null;
      };
    });
    s.steps = 0;
  }

  const stopped = (s: Session) => s.over || s.ctx.isCancelled();

  /** Entra en un nodo; devuelve el id del siguiente o undefined si termina. */
  async function enterNode(s: Session, node: DialogueNode): Promise<string | undefined> {
    const { def, ctx } = s;
    const store = useDialogueStore.getState();
    store.enterNode(def.id, node.id, node.speaker, node.line);
    deps.emit({ type: "dialogue:nodeEntered", dialogueId: def.id, nodeId: node.id });
    if (Array.isArray(node.do)) {
      await ctx.runInline(node.do);
      if (stopped(s)) return undefined;
    }
    s.visible = computeVisible(def, node);
    store.setChoices(s.visible.map((v) => v.view));
    const showLine = () => {
      if (typeof node.line !== "string") return;
      s.bubbleOpen = true;
      ctx.env.execute({
        type: "dialog:trigger",
        dialogKey: node.line!,
        ...(node.speaker !== undefined ? { speaker: node.speaker } : {}),
      });
    };
    if (s.visible.length === 0) {
      if (typeof node.line === "string") await awaitInput(s, "dismiss", showLine);
      return stopped(s) ? undefined : node.next;
    }
    s.chosen = null;
    await awaitInput(s, "choice", showLine);
    if (stopped(s) || s.chosen === null) return undefined;
    const picked = s.visible.find((v) => v.view.index === s.chosen)!;
    const index = picked.view.index;
    store.setChoices([]);
    deps.emit({ type: "dialogue:choiceMade", dialogueId: def.id, nodeId: node.id, index });
    if (picked.choice.once) {
      ctx.env.execute({ type: "state:setFlag", name: onceFlag(def.id, node.id, index), value: true });
    }
    if (s.bubbleOpen) {
      s.bubbleOpen = false;
      ctx.env.execute({ type: "dialog:dismiss" });
    }
    if (Array.isArray(picked.choice.do)) {
      await ctx.runInline(picked.choice.do);
      if (stopped(s)) return undefined;
    }
    return picked.choice.next;
  }

  async function runDialogue(id: string, ctx: ActionContext): Promise<void> {
    if (session) {
      console.warn(`[dialogue] startDialogue: ya hay un dialogo activo, se ignora: ${id}`);
      return;
    }
    const def = dialogueRegistry.get(id);
    const s: Session = {
      def: def ?? { id, start: "", nodes: [] },
      ctx,
      over: false,
      steps: 0,
      bubbleOpen: false,
      visible: [],
      waiting: null,
      chosen: null,
      wasLocked: getInputLockState().inputLocked,
      offDismissed: () => {},
    };
    session = s;
    deps.emit({ type: "dialogue:started", dialogueId: id });
    if (!def) {
      console.warn(`[dialogue] dialogo no registrado: ${id}`);
      return finish(s, "finished");
    }
    ctx.setInputLock(true);
    s.offDismissed = ctx.env.on("dialog:dismissed", () => {
      s.bubbleOpen = false;
      if (s.waiting?.kind === "dismiss") s.waiting.release();
    });
    const nodes = Array.isArray(def.nodes) ? def.nodes : [];
    let nodeId: string | undefined = def.start;
    while (nodeId !== undefined && !stopped(s)) {
      if (++s.steps > MAX_DIALOGUE_STEPS) {
        console.warn(`[dialogue] ${id}: mas de ${MAX_DIALOGUE_STEPS} nodos sin entrada del jugador, se corta`);
        break;
      }
      const node = nodes.find((n) => n?.id === nodeId);
      if (!node) {
        console.warn(`[dialogue] ${id}: nodo inexistente: ${nodeId}`);
        break;
      }
      nodeId = await enterNode(s, node);
    }
    finish(s, ctx.isCancelled() ? "cancelled" : "finished");
  }

  const restore = deps.registerExecutor("startDialogue", (action: Action, ctx) =>
    runDialogue(String((action as { startDialogue: string }).startDialogue), ctx),
  );

  commands.register("dialogue:start", (cmd) => {
    if (session) {
      console.warn(`[dialogue] dialogue:start: ya hay un dialogo activo, se ignora: ${cmd.dialogueId}`);
      return;
    }
    deps.runScript([{ startDialogue: cmd.dialogueId }]);
  });
  commands.register("dialogue:choose", (cmd) => {
    const s = session;
    if (!s || s.waiting?.kind !== "choice" || !s.visible.some((v) => v.view.index === cmd.index)) {
      console.warn(`[dialogue] dialogue:choose: eleccion no valida: ${String(cmd.index)}`);
      return;
    }
    s.chosen = cmd.index;
    s.waiting.release();
  });
  commands.register("dialogue:advance", () => {
    if (session?.waiting?.kind === "dismiss") session.ctx.env.execute({ type: "dialog:dismiss" });
  });
  commands.register("dialogue:end", () => {
    if (session) finish(session, "ended");
  });

  return {
    dispose() {
      if (session) finish(session, "cancelled");
      restore();
    },
  };
}
