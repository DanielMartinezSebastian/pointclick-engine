import {
  emitRuntimeEvent,
  getInventoryState,
  getPlacedItemsState,
  removeOneFromSlot,
  resolveInventoryDropHitDecision,
  resolveInventoryDropMissDialogKey,
  resolveInventoryDropOnPlayerMessage,
} from "@pointclick-engine/engine-core";

import type {
  DraggedInventoryPayload,
  DropInteraction,
  InventoryHandlerEnv,
} from "./inventoryRuntimeTypes";

/** Suelta un item sobre un target que lo acepta: aplica la decision de las reglas. */
export function applyDropHit(
  env: InventoryHandlerEnv,
  sceneId: string,
  interaction: DropInteraction,
  payload: DraggedInventoryPayload,
): void {
  const { ctx, getPhrase, showSpeechBubble, onRuntimeEvent, clearDrag } = env;
  const decision = resolveInventoryDropHitDecision(ctx, {
    interaction,
    payload,
    now: Date.now(),
  });

  if (decision.kind === "unknown-item") {
    emitRuntimeEvent(onRuntimeEvent, {
      type: "onDrop",
      outcome: "unknown-item",
      itemId: payload.stack.id,
      interactionId: interaction.id,
    });
    showSpeechBubble(decision.message);
    clearDrag();
    return;
  }

  if (decision.kind === "rule-miss") {
    emitRuntimeEvent(onRuntimeEvent, {
      type: "onDrop",
      outcome: "rule-miss",
      itemId: payload.stack.id,
      interactionId: interaction.id,
    });
    showSpeechBubble(getPhrase(decision.dialogKey), { dialogKey: decision.dialogKey });
    clearDrag();
    return;
  }

  if (decision.kind === "place") {
    emitRuntimeEvent(onRuntimeEvent, {
      type: "onDrop",
      outcome: "place",
      itemId: payload.stack.id,
      interactionId: interaction.id,
    });
    getInventoryState().setSlots(
      removeOneFromSlot(getInventoryState().slots, decision.fromSlotIndex),
    );
    getPlacedItemsState().addItem({ ...decision.placedItem, sceneId }); // sceneId: escena a la que pertenece
    showSpeechBubble(getPhrase(decision.dialogKey), { dialogKey: decision.dialogKey });
    clearDrag();
    return;
  }

  if (decision.kind === "consume") {
    emitRuntimeEvent(onRuntimeEvent, {
      type: "onDrop",
      outcome: "consume",
      itemId: payload.stack.id,
      interactionId: interaction.id,
    });
    getInventoryState().setSlots(
      removeOneFromSlot(getInventoryState().slots, decision.fromSlotIndex),
    );
    showSpeechBubble(getPhrase(decision.dialogKey), { dialogKey: decision.dialogKey });
    clearDrag();
    return;
  }

  emitRuntimeEvent(onRuntimeEvent, {
    type: "onDrop",
    outcome: "return",
    itemId: payload.stack.id,
    interactionId: interaction.id,
  });
  showSpeechBubble(getPhrase(decision.dialogKey), { dialogKey: decision.dialogKey });
  clearDrag();
}

/** Suelta fuera de un target valido (o sobre uno que no acepta el item): el item vuelve. */
export function applyDropMiss(
  env: InventoryHandlerEnv,
  sceneInteractions: DropInteraction[],
  payload: DraggedInventoryPayload,
  interaction?: DropInteraction,
): void {
  const { ctx, getPhrase, showSpeechBubble, onRuntimeEvent, clearDrag } = env;
  const fallbackMiss = resolveInventoryDropMissDialogKey(ctx, {
    payload,
    interaction,
    sceneInteractions,
  });

  emitRuntimeEvent(onRuntimeEvent, {
    type: "onDrop",
    outcome: "return",
    itemId: payload.stack.id,
    interactionId: interaction?.id,
  });
  showSpeechBubble(getPhrase(fallbackMiss), { dialogKey: fallbackMiss });
  clearDrag();
}

/** Suelta un item sobre el jugador. */
export function applyDropOnPlayer(
  env: InventoryHandlerEnv,
  payload: DraggedInventoryPayload,
): void {
  const { ctx, getPhrase, showSpeechBubble, onRuntimeEvent, clearDrag } = env;
  const message = resolveInventoryDropOnPlayerMessage(ctx, { payload });
  emitRuntimeEvent(onRuntimeEvent, {
    type: "onDrop",
    outcome: "on-player",
    itemId: payload.stack.id,
  });
  if (message.kind === "dialog-key") {
    showSpeechBubble(getPhrase(message.dialogKey), { dialogKey: message.dialogKey });
  } else {
    showSpeechBubble(message.text);
  }

  clearDrag();
}
