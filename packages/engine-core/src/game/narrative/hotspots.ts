import type { CommandHandler } from "../commands/CommandHandler";
import type { GameEvent } from "../events/types";
import type { ScriptRun, Script } from "./actions";
import { getInventoryState } from "../state/inventoryStore";
import { getSceneState } from "../state/sceneStore";
import type { GameSceneHotspot, Verb } from "../types";
import { pickBranch } from "./branches";
import { evaluateCondition, getConditionContext, type ConditionContext } from "./conditions";

/** Orden de preferencia del verbo por defecto (y del menu de verbos). */
const VERB_ORDER: readonly Verb[] = ["talk", "use", "look"];

/** Verbos del hotspot que tienen una rama aplicable en este contexto, en orden talk, use, look. */
export function getAvailableVerbs(hotspot: GameSceneHotspot, ctx: ConditionContext): Verb[] {
  return VERB_ORDER.filter((verb) => pickBranch(hotspot.verbs?.[verb], ctx) !== null);
}

/** Entre los verbos con una rama aplicable: talk, luego use, luego look; `null` si ninguno. */
export function getDefaultVerb(hotspot: GameSceneHotspot, ctx: ConditionContext): Verb | null {
  return getAvailableVerbs(hotspot, ctx)[0] ?? null;
}

/** true si el hotspot es visible (sin `visibleWhen` siempre lo es). */
export function isHotspotVisible(hotspot: GameSceneHotspot, ctx: ConditionContext): boolean {
  return evaluateCondition(hotspot.visibleWhen, ctx);
}

function hasOwn(obj: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

/** Lo que necesitan los comandos de hotspot (inyectado desde createGameRuntime). */
export interface HotspotCommandDeps {
  emit(event: GameEvent): void;
  runScript(script: Script): ScriptRun;
}

/**
 * Registra `hotspot:interact`. Recibe `runScript` del secuenciador en lugar de
 * ampliar `registerRuntimeExecutors`: asi el secuenciador no sale del cierre de
 * `createGameRuntime` y cada modulo narrativo (hotspots, dialogos) se cablea igual.
 */
export function registerHotspotCommands(commands: CommandHandler, deps: HotspotCommandDeps): void {
  commands.register("hotspot:interact", (cmd) => {
    const { hotspotId, verb } = cmd;
    const itemId = cmd.itemId;
    const base = { hotspotId, verb, ...(itemId !== undefined ? { itemId } : {}) };
    const noAction = (reason: "not-found" | "hidden" | "missing-item" | "no-rule") =>
      deps.emit({ type: "hotspot:noAction", ...base, reason });

    const hotspot = getSceneState().scene.hotspots?.find((h) => h.id === hotspotId);
    if (!hotspot) {
      console.warn(`[hotspots] hotspot:interact — hotspot no encontrado en la escena activa: ${hotspotId}`);
      return noAction("not-found");
    }
    const ctx = getConditionContext();
    if (!isHotspotVisible(hotspot, ctx)) return noAction("hidden");

    let branches;
    if (verb === "useItem") {
      if (itemId === undefined || !getInventoryState().slots.some((s) => s?.id === itemId)) {
        return noAction("missing-item");
      }
      branches =
        hotspot.useItem && hasOwn(hotspot.useItem, itemId)
          ? hotspot.useItem[itemId]
          : hotspot.useItemDefault;
    } else {
      branches = hotspot.verbs?.[verb];
    }

    const body = pickBranch(branches, ctx);
    if (body === null) return noAction("no-rule");

    deps.emit({ type: "hotspot:interacted", ...base });
    const script: Script = hotspot.approach ? [{ walkTo: hotspot.approach }, ...body] : body;
    deps.runScript(script);
  });
}
