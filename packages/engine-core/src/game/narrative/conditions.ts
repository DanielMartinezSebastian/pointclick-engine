import type { InventorySlotsState, PlacedSceneItem } from "../types";
import { getInventoryState } from "../state/inventoryStore";
import { getPlacedItemsState } from "../state/placedItemsReactiveStore";
import { getSceneState } from "../state/sceneStore";
import { getWorldState, type FlagValue } from "../state/worldStateStore";

/**
 * Condiciones: dato serializable para preguntar por el estado del juego sin efectos.
 * El contenido es dato y puede venir mal escrito: una forma desconocida es `false`.
 */
export type Condition =
  | { flag: string; equals?: FlagValue; gte?: number; lte?: number } // sin operador: "es verdadero"
  | { hasItem: string; atLeast?: number }
  | { itemPlaced: string; inScene?: string; at?: string } // at = interactionId
  | { inScene: string }
  | { visited: string }
  | { all: Condition[] }
  | { any: Condition[] }
  | { not: Condition };

/** Todo lo que `evaluateCondition` necesita; se construye desde los stores o se inyecta. */
export interface ConditionContext {
  flags: Record<string, FlagValue>;
  inventory: InventorySlotsState;
  placedItems: PlacedSceneItem[];
  sceneId: string;
  visitedSceneIds: string[];
}

let warnedUnknown = false;

function has(obj: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

function warnUnknown(condition: unknown): false {
  if (!warnedUnknown) {
    warnedUnknown = true;
    console.warn("[conditions] Condicion con forma desconocida, se evalua a false:", condition);
  }
  return false;
}

function evalFlag(c: Record<string, unknown>, ctx: ConditionContext): boolean {
  const name = c.flag as string;
  const value: FlagValue | undefined = has(ctx.flags, name) ? ctx.flags[name] : undefined;
  const hasEquals = has(c, "equals");
  const hasGte = c.gte !== undefined;
  const hasLte = c.lte !== undefined;
  if (!hasEquals && !hasGte && !hasLte) {
    return (
      value === true ||
      (typeof value === "number" && value !== 0) ||
      (typeof value === "string" && value !== "")
    );
  }
  if (hasEquals && value !== c.equals) return false;
  if (hasGte && !(typeof value === "number" && value >= (c.gte as number))) return false;
  if (hasLte && !(typeof value === "number" && value <= (c.lte as number))) return false;
  return true;
}

function evalPlaced(c: Record<string, unknown>, ctx: ConditionContext): boolean {
  const { itemPlaced, inScene, at } = c as { itemPlaced: string; inScene?: string; at?: string };
  return ctx.placedItems.some(
    (p) =>
      p.itemId === itemPlaced &&
      (inScene === undefined || p.sceneId === inScene) &&
      (at === undefined || p.interactionId === at),
  );
}

/** Evalua una condicion. Pura: no lee stores. `undefined` cuenta como verdadero. */
export function evaluateCondition(
  condition: Condition | undefined,
  ctx: ConditionContext,
): boolean {
  if (condition === undefined) return true;
  const c = condition as unknown as Record<string, unknown>;
  if (c === null || typeof c !== "object") return warnUnknown(condition);
  if ("flag" in c) return evalFlag(c, ctx);
  if ("hasItem" in c) {
    const min = typeof c.atLeast === "number" ? c.atLeast : 1;
    const total = ctx.inventory.reduce(
      (n, s) => (s && s.id === c.hasItem ? n + s.quantity : n),
      0,
    );
    return total >= min;
  }
  if ("itemPlaced" in c) return evalPlaced(c, ctx);
  if ("inScene" in c) return ctx.sceneId === c.inScene;
  if ("visited" in c) return ctx.visitedSceneIds.includes(c.visited as string);
  if ("all" in c && Array.isArray(c.all)) {
    return (c.all as Condition[]).every((x) => evaluateCondition(x, ctx));
  }
  if ("any" in c && Array.isArray(c.any)) {
    return (c.any as Condition[]).some((x) => evaluateCondition(x, ctx));
  }
  if ("not" in c) return !evaluateCondition(c.not as Condition, ctx);
  return warnUnknown(condition);
}

/** Lee los stores actuales y construye el contexto. */
export function getConditionContext(): ConditionContext {
  const world = getWorldState();
  return {
    flags: world.flags,
    inventory: getInventoryState().slots,
    placedItems: getPlacedItemsState().items,
    sceneId: getSceneState().sceneId,
    visitedSceneIds: world.visitedSceneIds,
  };
}

/** Constructores: devuelven objetos planos serializables. */
export const cond = {
  flag: (
    name: string,
    op: { equals?: FlagValue; gte?: number; lte?: number } = {},
  ): Condition => ({ flag: name, ...op }),
  hasItem: (id: string, op: { atLeast?: number } = {}): Condition => ({ hasItem: id, ...op }),
  itemPlaced: (id: string, op: { inScene?: string; at?: string } = {}): Condition => ({
    itemPlaced: id,
    ...op,
  }),
  inScene: (sceneId: string): Condition => ({ inScene: sceneId }),
  visited: (sceneId: string): Condition => ({ visited: sceneId }),
  all: (...conditions: Condition[]): Condition => ({ all: conditions }),
  any: (...conditions: Condition[]): Condition => ({ any: conditions }),
  not: (condition: Condition): Condition => ({ not: condition }),
};
