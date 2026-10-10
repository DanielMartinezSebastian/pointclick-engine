"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { getRandomPhrase } from "../../../../demo-content/dialogs/getRandomPhrase";
import { browserEnvironmentAdapter } from "../../platform-web";
import type { SceneInteraction } from "../../../../demo-content/scenes/scenes";
import {
  getInventoryState,
  getPlacedItemsState,
  useInventoryStateStore,
  usePlacedItemsStateStore,
  type PlacedSceneItem,
} from "@pointclick-engine/engine-core";
import { useProximityHintController } from "@pointclick-engine/engine-renderer-r3f";
import { createInventoryRuleContext } from "@pointclick-engine/engine-core";
import { getGameRuntime } from "../publicApi";
import {
  emitRuntimeEvent,
  type RuntimeEventHandler,
} from "@pointclick-engine/engine-core";
import { useDialogStore } from "../../../store/dialogStore";
import { useInventoryStore } from "../../../store/inventoryStore";
import {
  addOneToInventory,
  inventoryRuleMessages,
  removeOneFromSlot,
  resolveInventoryDropHitDecision,
  resolveInventoryDropMissDialogKey,
  resolveInventoryDropOnPlayerMessage,
  resolvePickupPlacedItemDecision,
} from "@pointclick-engine/engine-core";
import { startGamePersistence } from "../../gamePersistence";

// Escena que siembra el trofeo inicial (la que sembraba el antiguo flag initialItemsCreated).
const SEED_SCENE_ID = "personalRoom";

// Origen del registro de items: el runtime activo (page.tsx y example-bridge registran ITEMS).
// Se resuelve en cada uso, no al montar. Sin runtime el registro esta vacio (items desconocidos).
const inventoryRuleContext = createInventoryRuleContext(() => getGameRuntime()?.getItems() ?? {});

type InventoryStack = {
  id: string;
  name: string;
  spriteUrl: string;
  quantity: number;
};

type DraggedInventoryPayload = {
  stack: InventoryStack;
  fromSlotIndex: number;
};

type RuntimeDraggedStack = DraggedInventoryPayload & {
  pointerX: number;
  pointerY: number;
};

function createInitialPlacedItems(sceneId: string): PlacedSceneItem[] {
  return [
    {
      id: "trophy-ground",
      itemId: "trophy",
      interactionId: "trophy-ground-pickup",
      name: "Trophy",
      spriteUrl: "/assets/trophy/trophy.png",
      worldPosition: [5.5, -1.3, 22.0],
      canPickup: true,
      hasCollision: true,
      collisionHalfSize: [0.5, 0.8, 0.5],
      sceneId, // Track which scene this item belongs to
      // No dialog keys for ground pickup - will use defaults from resolvePickupPlacedItemDecision
    },
  ];
}

export function useInventoryRuntimeController({
  sceneId,
  sceneInteractions,
  playerPosition,
  onRuntimeEvent,
}: {
  sceneId: string;
  sceneInteractions: SceneInteraction[];
  playerPosition: [number, number, number];
  onRuntimeEvent?: RuntimeEventHandler;
}) {
  // Dialog state now lives in dialogStore (wirable via dialog:trigger / dialog:dismiss commands)
  const showDialog = useDialogStore((s) => s.show);
  const dismissDialog = useDialogStore((s) => s.dismiss);

  // Inventory visibility now lives in inventoryStore (wirable via inventory:toggle command)
  const isInventoryOpen = useInventoryStore((s) => s.isOpen);

  // Inventario e ítems colocados viven en los stores del core. gamePersistence los
  // hidrata al importarse (antes del primer render) y solo guarda desde startGamePersistence.
  const inventorySlots = useInventoryStateStore((s) => s.slots);
  const placedItems = usePlacedItemsStateStore((s) => s.items);
  const [draggedStack, setDraggedStack] = useState<RuntimeDraggedStack | null>(
    null,
  );
  const pickupLockRef = useRef<Set<string>>(new Set());

  // Guardado automático de ambos stores (ya hidratados) mientras el hook esté montado.
  useEffect(() => startGamePersistence(), []);

  useEffect(() => {
    if (pickupLockRef.current.size === 0) {
      return;
    }

    for (const lockedItemId of Array.from(pickupLockRef.current)) {
      const stillExists = placedItems.some((item) => item.id === lockedItemId);
      if (!stillExists) {
        pickupLockRef.current.delete(lockedItemId);
      }
    }
  }, [placedItems]);

  // Siembra del trofeo: solo en personalRoom, una vez por partida (escena marcada como
  // sembrada) y solo si el trofeo no existe ya en ninguna escena. Idempotente (StrictMode).
  useEffect(() => {
    if (sceneId !== SEED_SCENE_ID) return;
    const state = getPlacedItemsState();
    if (state.isSceneSeeded(SEED_SCENE_ID)) return;
    const trophyTakenOrMovedElsewhere = state.items.some((i) => i.itemId === "trophy");
    if (!trophyTakenOrMovedElsewhere) {
      state.setItems([...state.items, ...createInitialPlacedItems(sceneId)]);
    }
    state.markSceneSeeded(SEED_SCENE_ID);
  }, [sceneId]);

  const handleBoundaryHit = useCallback(
    (phrase: string) => {
      showDialog(phrase, "boundaryHit");
      emitRuntimeEvent(onRuntimeEvent, {
        type: "onDialog",
        source: "boundary",
        text: phrase,
        dialogKey: "boundaryHit",
      });
    },
    [onRuntimeEvent, showDialog],
  );

  const showSpeechBubble = useCallback(
    (
      nextText: string,
      meta?: { source?: "inventory" | "debug"; dialogKey?: string },
    ) => {
      showDialog(nextText, meta?.dialogKey);
      emitRuntimeEvent(onRuntimeEvent, {
        type: "onDialog",
        source: meta?.source ?? "inventory",
        text: nextText,
        dialogKey: meta?.dialogKey,
      });
    },
    [onRuntimeEvent, showDialog],
  );

  const hideSpeechBubble = useCallback(() => {
    dismissDialog();
  }, [dismissDialog]);

  const handleInventoryDropHit = useCallback(
    (interaction: SceneInteraction, payload: DraggedInventoryPayload) => {
      const decision = resolveInventoryDropHitDecision(inventoryRuleContext, {
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
        setDraggedStack(null);
        return;
      }

      if (decision.kind === "rule-miss") {
        emitRuntimeEvent(onRuntimeEvent, {
          type: "onDrop",
          outcome: "rule-miss",
          itemId: payload.stack.id,
          interactionId: interaction.id,
        });
        showSpeechBubble(getRandomPhrase(decision.dialogKey), {
          dialogKey: decision.dialogKey,
        });
        setDraggedStack(null);
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
        showSpeechBubble(getRandomPhrase(decision.dialogKey), {
          dialogKey: decision.dialogKey,
        });
        setDraggedStack(null);
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
        showSpeechBubble(getRandomPhrase(decision.dialogKey), {
          dialogKey: decision.dialogKey,
        });
        setDraggedStack(null);
        return;
      }

      emitRuntimeEvent(onRuntimeEvent, {
        type: "onDrop",
        outcome: "return",
        itemId: payload.stack.id,
        interactionId: interaction.id,
      });
      showSpeechBubble(getRandomPhrase(decision.dialogKey), {
        dialogKey: decision.dialogKey,
      });
      setDraggedStack(null);
    },
    [onRuntimeEvent, showSpeechBubble],
  );

  const handleInventoryDropMiss = useCallback(
    (payload: DraggedInventoryPayload, interaction?: SceneInteraction) => {
      const fallbackMiss = resolveInventoryDropMissDialogKey(inventoryRuleContext, {
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
      showSpeechBubble(getRandomPhrase(fallbackMiss), {
        dialogKey: fallbackMiss,
      });
      setDraggedStack(null);
    },
    [onRuntimeEvent, sceneInteractions, showSpeechBubble],
  );

  const handleInventoryDropOnPlayer = useCallback(
    (payload: DraggedInventoryPayload) => {
      const message = resolveInventoryDropOnPlayerMessage(inventoryRuleContext, { payload });
      emitRuntimeEvent(onRuntimeEvent, {
        type: "onDrop",
        outcome: "on-player",
        itemId: payload.stack.id,
      });
      if (message.kind === "dialog-key") {
        showSpeechBubble(getRandomPhrase(message.dialogKey), {
          dialogKey: message.dialogKey,
        });
      } else {
        showSpeechBubble(message.text);
      }

      setDraggedStack(null);
    },
    [onRuntimeEvent, showSpeechBubble],
  );

  const handlePickupPlacedItem = useCallback(
    (placedItem: PlacedSceneItem) => {
      if (isInventoryOpen) {
        return;
      }

      if (pickupLockRef.current.has(placedItem.id)) {
        return;
      }

      pickupLockRef.current.add(placedItem.id);

      const decision = resolvePickupPlacedItemDecision(inventoryRuleContext, { placedItem });
      if (decision.kind === "ignore") {
        pickupLockRef.current.delete(placedItem.id);
        return;
      }

      if (decision.kind === "blocked") {
        emitRuntimeEvent(onRuntimeEvent, {
          type: "onDrop",
          outcome: "pickup-blocked",
          itemId: placedItem.itemId,
          interactionId: placedItem.interactionId,
        });
        showSpeechBubble(getRandomPhrase(decision.dialogKey), {
          dialogKey: decision.dialogKey,
        });
        pickupLockRef.current.delete(placedItem.id);
        return;
      }

      // Try to add to inventory first, but don't apply state changes yet
      const inventoryResult = addOneToInventory(
        getInventoryState().slots,
        decision.stack,
      );

      if (!inventoryResult.added) {
        showSpeechBubble(inventoryRuleMessages.inventoryFull);
        pickupLockRef.current.delete(placedItem.id);
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
      showSpeechBubble(getRandomPhrase(decision.successDialogKey));
    },
    [isInventoryOpen, onRuntimeEvent, showSpeechBubble],
  );

  const updatePlacedItemPosition = useCallback(
    (id: string, axis: 0 | 1 | 2, value: number) => {
      getPlacedItemsState().updateItemPosition(id, axis, value);
    },
    [],
  );

  const movePlacedItemToPlayer = useCallback(
    (id: string) => {
      const item = getPlacedItemsState().items.find((i) => i.id === id);
      if (!item) return;
      getPlacedItemsState().setItemPosition(id, [
        playerPosition[0],
        item.worldPosition[1],
        playerPosition[2],
      ]);
    },
    [playerPosition],
  );

  const removePlacedItemById = useCallback((id: string) => {
    getPlacedItemsState().removeItem(id);
  }, []);

  const handleStartInventoryDrag = useCallback(
    (slotIndex: number, clientX: number, clientY: number) => {
      const stack = inventorySlots[slotIndex];
      if (!stack) return;

      useInventoryStore.getState().close();
      setDraggedStack({
        stack,
        fromSlotIndex: slotIndex,
        pointerX: clientX,
        pointerY: clientY,
      });
    },
    [inventorySlots],
  );

  const handleInteractionInspect = useCallback(
    (interaction: SceneInteraction) => {
      if (!interaction.hintDialogKeys) return;

      // Si hay un ítem colocado que puede recogerse, no disparamos el hint:
      // el click será gestionado por el sistema de pickup, no por el de pistas.
      const hasPickableItem = placedItems.some(
        (item) => item.interactionId === interaction.id && item.canPickup,
      );
      if (hasPickableItem) return;

      const isOccupied = placedItems.some(
        (item) => item.interactionId === interaction.id,
      );
      const dialogKey = isOccupied
        ? interaction.hintDialogKeys.occupied
        : interaction.hintDialogKeys.empty;

      showSpeechBubble(getRandomPhrase(dialogKey), { dialogKey });
    },
    [placedItems, showSpeechBubble],
  );

  useProximityHintController({
    playerPosition,
    interactions: sceneInteractions,
    placedItems,
    showSpeechBubble,
    getPhrase: getRandomPhrase,
  });

  useEffect(() => {
    if (sceneId !== "personalRoom") return;

    // Double-rAF: el speech inicial dispara DESPUÉS de que R3F haya corrido
    // al menos un useFrame. setTimeout(0) se ejecutaba antes del primer
    // requestAnimationFrame, dejando el sprite en SPRITE_MIN_SCALE sin que
    // useFrame hubiera corregido aún la escala por profundidad.
    let outerHandle: number | null = null;
    let innerHandle: number | null = null;

    outerHandle = browserEnvironmentAdapter.requestAnimationFrame(() => {
      outerHandle = null;
      innerHandle = browserEnvironmentAdapter.requestAnimationFrame(() => {
        innerHandle = null;
        showSpeechBubble(getRandomPhrase("personalRoomWelcome"), {
          dialogKey: "personalRoomWelcome",
        });
      });
    });

    return () => {
      if (outerHandle !== null) browserEnvironmentAdapter.cancelAnimationFrame(outerHandle);
      if (innerHandle !== null) browserEnvironmentAdapter.cancelAnimationFrame(innerHandle);
    };
  }, [sceneId, showSpeechBubble]);

  const handleItemInteract = useCallback(
    (item: PlacedSceneItem) => {
      // Emit item interaction event — useTransitionSystem listens for this
      // to check if there's a matching transition
      emitRuntimeEvent(onRuntimeEvent, {
        type: "onDrop",
        outcome: "item-interact",
        itemId: item.itemId,
        interactionId: item.interactionId,
      });
    },
    [onRuntimeEvent],
  );

  return {
    // Note: speechText, speechVisible, speechTrigger are now in dialogStore
    // Note: isInventoryOpen is now in inventoryStore
    isInventoryOpen,
    inventorySlots,
    draggedStack,
    placedItems,
    handleBoundaryHit,
    showSpeechBubble,
    hideSpeechBubble,
    handleInteractionInspect,
    handleInventoryDropHit,
    handleInventoryDropMiss,
    handleInventoryDropOnPlayer,
    handlePickupPlacedItem,
    updatePlacedItemPosition,
    movePlacedItemToPlayer,
    removePlacedItemById,
    handleStartInventoryDrag,
    handleItemInteract,
  };
}
