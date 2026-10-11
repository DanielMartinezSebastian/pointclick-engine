import {
  addOneToInventory,
  emitRuntimeEvent,
  getInventoryState,
  getPlacedItemsState,
  inventoryRuleMessages,
  resolvePickupPlacedItemDecision,
  type PlacedSceneItem,
} from "@pointclick-engine/engine-core";

import type { InventoryHandlerEnv } from "./inventoryRuntimeTypes";

/**
 * Recoge un item colocado. `lock` evita dobles recogidas del mismo item mientras
 * se resuelve. Los cambios de inventario y de items colocados se aplican juntos.
 */
export function applyPickup(
  env: InventoryHandlerEnv,
  lock: Set<string>,
  isInventoryOpen: boolean,
  placedItem: PlacedSceneItem,
): void {
  const { ctx, getPhrase, showSpeechBubble, onRuntimeEvent } = env;
  if (isInventoryOpen) {
    return;
  }

  if (lock.has(placedItem.id)) {
    return;
  }

  lock.add(placedItem.id);

  const decision = resolvePickupPlacedItemDecision(ctx, { placedItem });
  if (decision.kind === "ignore") {
    lock.delete(placedItem.id);
    return;
  }

  if (decision.kind === "blocked") {
    emitRuntimeEvent(onRuntimeEvent, {
      type: "onDrop",
      outcome: "pickup-blocked",
      itemId: placedItem.itemId,
      interactionId: placedItem.interactionId,
    });
    showSpeechBubble(getPhrase(decision.dialogKey), { dialogKey: decision.dialogKey });
    lock.delete(placedItem.id);
    return;
  }

  // Try to add to inventory first, but don't apply state changes yet
  const inventoryResult = addOneToInventory(getInventoryState().slots, decision.stack);

  if (!inventoryResult.added) {
    showSpeechBubble(inventoryRuleMessages.inventoryFull);
    lock.delete(placedItem.id);
    return;
  }

  // If we get here, inventory has space. Apply both changes atomically:
  // 1. Update inventory
  getInventoryState().setSlots(inventoryResult.slots);

  // 2. Remove from placed items
  getPlacedItemsState().removeItem(decision.placedItemId);

  emitRuntimeEvent(onRuntimeEvent, {
    type: "onDrop",
    outcome: "pickup-success",
    itemId: placedItem.itemId,
    interactionId: placedItem.interactionId,
  });
  showSpeechBubble(getPhrase(decision.successDialogKey));
}

/** Libera del bloqueo los items que ya no estan colocados. */
export function releaseStaleLocks(lock: Set<string>, placedItems: PlacedSceneItem[]): void {
  if (lock.size === 0) return;
  for (const lockedItemId of Array.from(lock)) {
    if (!placedItems.some((item) => item.id === lockedItemId)) {
      lock.delete(lockedItemId);
    }
  }
}
