import type { CommandHandler } from "../commands/CommandHandler";
import type { GameEvent } from "../events/types";
import { getInventoryState } from "../state/inventoryStore";
import type { Branch, Script, ScriptRun } from "./actions";
import { pickBranch } from "./branches";
import { getConditionContext, type ConditionContext } from "./conditions";

/** Lo minimo que `resolveCombine` necesita de un item (`ItemDefinition` y `GameItemConfig` lo cumplen). */
export type CombinableItem = { id: string; combine?: Record<string, Branch[]> };

function hasOwn(obj: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

/**
 * Busca la regla en `a.combine[b]` y, si no existe, en `b.combine[a]`.
 * Devuelve el guion de la primera rama aplicable, o `null` si no hay ninguna.
 */
export function resolveCombine(
  a: CombinableItem,
  b: CombinableItem,
  ctx: ConditionContext,
): Script | null {
  if (a.combine && hasOwn(a.combine, b.id)) return pickBranch(a.combine[b.id], ctx);
  if (b.combine && hasOwn(b.combine, a.id)) return pickBranch(b.combine[a.id], ctx);
  return null;
}

/** Lo que necesita el comando de combinacion (inyectado desde createGameRuntime). */
export interface CombineCommandDeps {
  emit(event: GameEvent): void;
  runScript(script: Script): ScriptRun;
  getItem(id: string): CombinableItem | undefined;
}

/**
 * Registra `inventory:combine`. El guion decide el resultado (`removeItem`,
 * `giveItem`, `say`): el comando no quita ni anade items por su cuenta.
 */
export function registerCombineCommands(commands: CommandHandler, deps: CombineCommandDeps): void {
  commands.register("inventory:combine", (cmd) => {
    const { itemId, withItemId } = cmd;
    const base = { itemId, withItemId };
    const fail = () => deps.emit({ type: "item:combineFailed", ...base });

    if (itemId === withItemId) return fail();

    const slots = getInventoryState().slots;
    const inInventory = (id: string) => slots.some((slot) => slot?.id === id);
    if (!inInventory(itemId) || !inInventory(withItemId)) return fail();

    const a = deps.getItem(itemId);
    const b = deps.getItem(withItemId);
    if (!a || !b) return fail();

    const script = resolveCombine(a, b, getConditionContext());
    if (script === null) return fail();

    deps.emit({ type: "item:combined", ...base });
    deps.runScript(script);
  });
}
