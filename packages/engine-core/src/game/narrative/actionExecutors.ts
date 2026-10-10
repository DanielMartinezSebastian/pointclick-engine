import type { ClockPort } from "../../ports/clock";
import type { GameCommand } from "../commands/types";
import type { GameEvent, GameEventHandler, GameEventType } from "../events/types";
import type { ScriptHandler } from "../runtime/types";
import {
  getInputLockState,
  getInventoryState,
  getSceneState,
  usePlacedItemsStateStore,
} from "../state";
import type { GameVec3 } from "../types";
import type { Action } from "./actions";

/** Lo que el secuenciador necesita del runtime (todo inyectado: sin acoplarse a el). */
export interface SequencerEnv {
  execute(cmd: GameCommand): void;
  emit(event: GameEvent): void;
  on<T extends GameEventType>(type: T, handler: GameEventHandler<T>): () => void;
  clock: ClockPort;
  instantWalk: boolean;
  getItem(id: string): { name: string; spriteUrl: string } | undefined;
  getHandler(name: string): ScriptHandler | undefined;
}

/** Contexto de la accion en curso. Todo lo que espere debe pasar por `wait`. */
export interface ActionContext {
  env: SequencerEnv;
  /** true si el guion fue cancelado: tras cualquier espera, comprobarlo antes de actuar. */
  isCancelled(): boolean;
  /**
   * Espera hasta que `arm` llame a su `resolve`. `arm` devuelve la limpieza
   * (quitar suscripcion / temporizador), que se ejecuta al resolver o al cancelar.
   */
  wait(arm: (resolve: () => void) => () => void): Promise<void>;
  /** Fija el bloqueo de entrada; emite `input:lockChanged` solo si cambia. */
  setInputLock(locked: boolean): void;
}

/**
 * Ejecutor de una accion. Se registra por clave (`say`, `walkTo`...) con
 * `Sequencer.registerExecutor`; el bucle del secuenciador no sabe nada de cada accion.
 */
export type ActionExecutor = (action: Action, ctx: ActionContext) => void | Promise<void>;

const noop = () => {};

function field<T>(action: Action, key: string): T {
  return (action as unknown as Record<string, unknown>)[key] as T;
}

function sayExecutor(action: Action, ctx: ActionContext): Promise<void> {
  const speaker = field<string | undefined>(action, "speaker");
  return ctx.wait((resolve) => {
    // Suscribir antes de despachar: el cierre podria ser sincrono.
    const off = ctx.env.on("dialog:dismissed", () => resolve());
    ctx.env.execute({
      type: "dialog:trigger",
      dialogKey: field<string>(action, "say"),
      ...(speaker !== undefined ? { speaker } : {}),
    });
    return off;
  });
}

/**
 * walkTo: despacha `player:walkTo` y espera `player:walkCompleted` o `player:walkAborted`.
 * Si se aborta (p. ej. destino inalcanzable) la accion termina y el guion CONTINUA.
 * Con `instantWalk` el propio secuenciador coloca al jugador y emite `walkCompleted`.
 */
function walkToExecutor(action: Action, ctx: ActionContext): Promise<void> {
  const position = field<GameVec3>(action, "walkTo");
  return ctx.wait((resolve) => {
    let settled = false;
    const end = () => {
      settled = true;
      resolve();
    };
    const offs = [
      ctx.env.on("player:walkCompleted", end),
      ctx.env.on("player:walkAborted", end),
    ];
    ctx.env.execute({ type: "player:walkTo", position });
    if (!settled && ctx.env.instantWalk) {
      const scene = getSceneState();
      scene.setPlayerPosition(position);
      scene.setPlayerWalkingState(null);
      ctx.env.emit({ type: "player:walkCompleted", position });
    }
    return () => offs.forEach((off) => off());
  });
}

function giveItemExecutor(action: Action, ctx: ActionContext): void {
  const itemId = field<string>(action, "giveItem");
  const item = ctx.env.getItem(itemId);
  if (!item) {
    console.warn(`[sequencer] giveItem: item no registrado: ${itemId}`);
    return;
  }
  const added = getInventoryState().addItem({
    id: itemId,
    name: item.name,
    spriteUrl: item.spriteUrl,
  });
  if (added) {
    ctx.env.emit({ type: "item:pickedUp", itemId, quantity: 1 });
  } else {
    console.warn(`[sequencer] giveItem: inventario lleno, no cabe: ${itemId}`);
    ctx.env.emit({ type: "inventory:full", itemId });
  }
}

function removeItemExecutor(action: Action, ctx: ActionContext): void {
  const itemId = field<string>(action, "removeItem");
  const inv = getInventoryState();
  const index = inv.slots.findIndex((s) => s !== null && s.id === itemId);
  if (index < 0) {
    console.warn(`[sequencer] removeItem: el inventario no tiene: ${itemId}`);
    return;
  }
  inv.removeOne(index);
  ctx.env.emit({ type: "item:removed", itemId });
}

async function callExecutor(action: Action, ctx: ActionContext): Promise<void> {
  const name = field<string>(action, "call");
  const handler = ctx.env.getHandler(name);
  if (!handler) {
    console.warn(`[sequencer] call: sin manejador registrado: ${name}`);
    return;
  }
  let result: void | Promise<void>;
  try {
    result = handler(field<unknown>(action, "args"));
  } catch (error) {
    console.error(`[sequencer] call: el manejador "${name}" lanzo:`, error);
    return;
  }
  if (result && typeof (result as Promise<void>).then === "function") {
    const pending = result as Promise<void>;
    await ctx.wait((resolve) => {
      pending.then(
        () => resolve(),
        (error) => {
          console.error(`[sequencer] call: el manejador "${name}" rechazo:`, error);
          resolve();
        },
      );
      return noop;
    });
  }
}

/** startDialogue: la tarea 07 lo sustituye con `registerExecutor("startDialogue", ...)`. */
function startDialogueFallback(action: Action): void {
  console.warn(
    `[sequencer] startDialogue: no hay ejecutor de dialogos registrado: ${field<string>(action, "startDialogue")}`,
  );
}

/** Ejecutores por defecto, por clave de accion. */
export function createDefaultExecutors(): Map<string, ActionExecutor> {
  return new Map<string, ActionExecutor>([
    ["say", sayExecutor],
    ["walkTo", walkToExecutor],
    ["giveItem", giveItemExecutor],
    ["removeItem", removeItemExecutor],
    ["call", callExecutor],
    ["startDialogue", startDialogueFallback],
    [
      "setFlag",
      (a, ctx) =>
        ctx.env.execute({
          type: "state:setFlag",
          name: field<string>(a, "setFlag"),
          value: field<boolean | number | string | undefined>(a, "value") ?? true,
        }),
    ],
    [
      "changeScene",
      (a, ctx) => {
        const spawnPosition = field<GameVec3 | undefined>(a, "spawnPosition");
        ctx.env.execute({
          type: "scene:set",
          sceneId: field<string>(a, "changeScene"),
          ...(spawnPosition ? { spawnPosition } : {}),
        });
      },
    ],
    ["placeItem", (a) => usePlacedItemsStateStore.getState().addItem(field(a, "placeItem"))],
    [
      "removePlacedItem",
      (a) => usePlacedItemsStateStore.getState().removeItem(field<string>(a, "removePlacedItem")),
    ],
    [
      "wait",
      (a, ctx) => {
        const ms = field<number>(a, "wait");
        const delay = typeof ms === "number" && Number.isFinite(ms) && ms > 0 ? ms : 0;
        return ctx.wait((resolve) => ctx.env.clock.setTimeout(resolve, delay));
      },
    ],
    [
      "playSfx",
      (a, ctx) => ctx.env.execute({ type: "audio:playSfx", soundUrl: field<string>(a, "playSfx") }),
    ],
    ["lockInput", (a, ctx) => ctx.setInputLock(field<boolean>(a, "lockInput") === true)],
    [
      "emit",
      (a, ctx) => {
        const payload = field<unknown>(a, "payload");
        ctx.env.emit({
          type: "custom",
          name: field<string>(a, "emit"),
          ...(payload !== undefined ? { payload } : {}),
        });
      },
    ],
  ]);
}

/** Aplica el bloqueo al store y emite el evento solo si cambia. */
export function applyInputLock(env: SequencerEnv, locked: boolean): void {
  const lock = getInputLockState();
  if (lock.inputLocked === locked) return;
  lock.setInputLocked(locked);
  env.emit({ type: "input:lockChanged", locked });
}
