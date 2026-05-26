"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { getRandomPhrase } from "../../../demo/content/dialogs/getRandomPhrase";
import { browserEnvironmentAdapter } from "../../platform-web";
import type { SceneInteraction } from "../../../demo/content/scenes";
import type { PlacedSceneItem } from "../types/gameRuntime";
import { useProximityHintController } from "./useProximityHintController";
import {
  emitRuntimeEvent,
  type RuntimeEventHandler,
} from "@pointclick/engine-core";
import {
  addOneToInventory,
  inventoryRuleMessages,
  removeOneFromSlot,
  resolveInventoryDropHitDecision,
  resolveInventoryDropMissDialogKey,
  resolveInventoryDropOnPlayerMessage,
  resolvePickupPlacedItemDecision,
} from "../../core/rules/inventoryRules";

type InventoryStack = {
  id: string;
  name: string;
  spriteUrl: string;
  quantity: number;
};

type InventorySlots = Array<InventoryStack | null>;

type DraggedInventoryPayload = {
  stack: InventoryStack;
  fromSlotIndex: number;
};

type RuntimeDraggedStack = DraggedInventoryPayload & {
  pointerX: number;
  pointerY: number;
};

function createInitialInventorySlots(): InventorySlots {
  return Array.from({ length: 9 }, (_, index) => {
    if (index !== 0) return null;
    return {
      id: "gameboy",
      name: "Gameboy",
      spriteUrl: "/assets/gameboy/gameboy.png",
      quantity: 1,
    };
  });
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
  const [speechText, setSpeechText] = useState("");
  const [speechVisible, setSpeechVisible] = useState(false);
  const [speechTrigger, setSpeechTrigger] = useState(0);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [inventorySlots, setInventorySlots] = useState<InventorySlots>(() =>
    createInitialInventorySlots(),
  );
  const [draggedStack, setDraggedStack] = useState<RuntimeDraggedStack | null>(
    null,
  );
  const [placedItems, setPlacedItems] = useState<PlacedSceneItem[]>([]);
  const pickupLockRef = useRef<Set<string>>(new Set());

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

  const handleBoundaryHit = useCallback(
    (phrase: string) => {
      setSpeechText(phrase);
      setSpeechVisible(true);
      setSpeechTrigger((current) => current + 1);
      emitRuntimeEvent(onRuntimeEvent, {
        type: "onDialog",
        source: "boundary",
        text: phrase,
        dialogKey: "boundaryHit",
      });
    },
    [onRuntimeEvent],
  );

  const showSpeechBubble = useCallback(
    (
      nextText: string,
      meta?: { source?: "inventory" | "debug"; dialogKey?: string },
    ) => {
      setSpeechText(nextText);
      setSpeechVisible(true);
      setSpeechTrigger((current) => current + 1);
      emitRuntimeEvent(onRuntimeEvent, {
        type: "onDialog",
        source: meta?.source ?? "inventory",
        text: nextText,
        dialogKey: meta?.dialogKey,
      });
    },
    [onRuntimeEvent],
  );

  const hideSpeechBubble = useCallback(() => {
    setSpeechVisible(false);
  }, []);

  const handleInventoryDropHit = useCallback(
    (interaction: SceneInteraction, payload: DraggedInventoryPayload) => {
      const decision = resolveInventoryDropHitDecision({
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
        setInventorySlots((currentSlots) =>
          removeOneFromSlot(currentSlots, decision.fromSlotIndex),
        );
        setPlacedItems((currentPlaced) => [
          ...currentPlaced,
          decision.placedItem,
        ]);
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
        setInventorySlots((currentSlots) =>
          removeOneFromSlot(currentSlots, decision.fromSlotIndex),
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
      const fallbackMiss = resolveInventoryDropMissDialogKey({
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
      const message = resolveInventoryDropOnPlayerMessage({ payload });
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

      const decision = resolvePickupPlacedItemDecision({ placedItem });
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

      let added = false;
      setInventorySlots((currentSlots) => {
        const result = addOneToInventory(currentSlots, decision.stack);
        added = result.added;
        return result.added ? result.slots : currentSlots;
      });

      if (!added) {
        showSpeechBubble(inventoryRuleMessages.inventoryFull);
        pickupLockRef.current.delete(placedItem.id);
        return;
      }

      setPlacedItems((currentPlaced) =>
        currentPlaced.filter(
          (currentItem) => currentItem.id !== decision.placedItemId,
        ),
      );
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
      setPlacedItems((currentPlaced) =>
        currentPlaced.map((item) => {
          if (item.id !== id) return item;
          const worldPosition = [...item.worldPosition] as [
            number,
            number,
            number,
          ];
          worldPosition[axis] = value;
          return { ...item, worldPosition };
        }),
      );
    },
    [],
  );

  const movePlacedItemToPlayer = useCallback(
    (id: string) => {
      setPlacedItems((currentPlaced) =>
        currentPlaced.map((item) => {
          if (item.id !== id) return item;
          return {
            ...item,
            worldPosition: [
              playerPosition[0],
              item.worldPosition[1],
              playerPosition[2],
            ],
          };
        }),
      );
    },
    [playerPosition],
  );

  const removePlacedItemById = useCallback((id: string) => {
    setPlacedItems((currentPlaced) =>
      currentPlaced.filter((item) => item.id !== id),
    );
  }, []);

  const handleStartInventoryDrag = useCallback(
    (slotIndex: number, clientX: number, clientY: number) => {
      const stack = inventorySlots[slotIndex];
      if (!stack) return;

      setIsInventoryOpen(false);
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

  return {
    speechText,
    speechVisible,
    speechTrigger,
    isInventoryOpen,
    inventorySlots,
    draggedStack,
    placedItems,
    setIsInventoryOpen,
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
  };
}
