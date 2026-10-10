import type { CommandHandler } from "../commands/CommandHandler";
import type { GameEvent } from "../events/types";
import {
  addOneToInventory,
  removeOneFromSlot,
  resolveInventoryDropHitDecision,
  resolvePickupPlacedItemDecision,
} from "../logic/rules/inventoryRules";
import { getInventoryState } from "../state/inventoryStore";
import { getPlacedItemsState } from "../state/placedItemsReactiveStore";
import { getSceneState } from "../state/sceneStore";
import { createInventoryRuleContext } from "./inventoryRuleContext";
import { itemRegistry } from "./registry";

/**
 * Comandos `inventory:pickup` e `inventory:drop` sobre los stores del core.
 *
 * Diferencia con el renderer: aqui solo cambian estado y se emiten eventos; NO se
 * muestran dialogos (el renderer enseña las claves `hitDialogKey`, `pickup*DialogKey`...).
 * Un guion que quiera texto lo declara con `say` (p. ej. via `hotspot:interact`).
 */
export function registerInventoryCommands(
  commands: CommandHandler,
  emit: (event: GameEvent) => void,
): void {
  const ruleContext = createInventoryRuleContext(() => Object.fromEntries(itemRegistry));

  commands.register("inventory:pickup", (cmd) => {
    const sceneId = getSceneState().sceneId;
    const placed = getPlacedItemsState().items.find((p) =>
      cmd.placedItemId !== undefined
        ? p.id === cmd.placedItemId
        : p.itemId === cmd.itemId && p.sceneId === sceneId,
    );
    const fail = (reason: "not-found" | "blocked" | "full" | "unknown-item") =>
      emit({ type: "inventory:pickupFailed", itemId: cmd.itemId, reason });
    if (!placed) return fail("not-found");

    const decision = resolvePickupPlacedItemDecision(ruleContext, { placedItem: placed });
    if (decision.kind === "ignore") return fail("unknown-item");
    if (decision.kind === "blocked") return fail("blocked");

    const result = addOneToInventory(getInventoryState().slots, decision.stack);
    if (!result.added) return fail("full");
    getInventoryState().setSlots(result.slots);
    getPlacedItemsState().removeItem(decision.placedItemId);
    emit({ type: "item:pickedUp", itemId: placed.itemId, quantity: 1 });
  });

  commands.register("inventory:drop", (cmd) => {
    if (cmd.hotspotId !== undefined) {
      commands.execute({
        type: "hotspot:interact",
        hotspotId: cmd.hotspotId,
        verb: "useItem",
        itemId: cmd.itemId,
      });
      return;
    }
    const dropped = (outcome: "consume" | "place" | "return", interactionId?: string) =>
      emit({
        type: "item:dropped",
        itemId: cmd.itemId,
        outcome,
        ...(interactionId !== undefined ? { interactionId } : {}),
      });

    const scene = getSceneState();
    const interaction =
      cmd.interactionId !== undefined
        ? scene.scene.interactions.find((i) => (i as { id?: string }).id === cmd.interactionId)
        : undefined;
    const stack = getInventoryState().slots[cmd.slotIndex];
    if (!interaction || !stack || stack.id !== cmd.itemId) return dropped("return", cmd.interactionId);

    const decision = resolveInventoryDropHitDecision(ruleContext, {
      interaction,
      payload: { stack, fromSlotIndex: cmd.slotIndex },
      now: Date.now(),
    });
    if (decision.kind === "place") {
      getInventoryState().setSlots(removeOneFromSlot(getInventoryState().slots, decision.fromSlotIndex));
      getPlacedItemsState().addItem({ ...decision.placedItem, sceneId: scene.sceneId });
      return dropped("place", cmd.interactionId);
    }
    if (decision.kind === "consume") {
      getInventoryState().setSlots(removeOneFromSlot(getInventoryState().slots, decision.fromSlotIndex));
      return dropped("consume", cmd.interactionId);
    }
    return dropped("return", cmd.interactionId);
  });
}
