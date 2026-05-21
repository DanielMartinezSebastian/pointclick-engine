"use client";

import { useCallback, useEffect, useState } from "react";

import { getRandomPhrase } from "../../../demo/content/dialogs/getRandomPhrase";
import type { SceneInteraction } from "../../../demo/content/scenes";
import type { PlacedSceneItem } from "../types/gameRuntime";
import { emitRuntimeEvent, type RuntimeEventHandler } from "../types/runtimeEvents";
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

  const handleBoundaryHit = useCallback((phrase: string) => {
    setSpeechText(phrase);
    setSpeechVisible(true);
    setSpeechTrigger((current) => current + 1);
    emitRuntimeEvent(onRuntimeEvent, {
      type: "onDialog",
      source: "boundary",
      text: phrase,
      dialogKey: "boundaryHit",
    });
  }, [onRuntimeEvent]);

  const showSpeechBubble = useCallback((nextText: string, meta?: { source?: "inventory" | "debug"; dialogKey?: string }) => {
    setSpeechText(nextText);
    setSpeechVisible(true);
    setSpeechTrigger((current) => current + 1);
    emitRuntimeEvent(onRuntimeEvent, {
      type: "onDialog",
      source: meta?.source ?? "inventory",
      text: nextText,
      dialogKey: meta?.dialogKey,
    });
  }, [onRuntimeEvent]);

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
        showSpeechBubble(getRandomPhrase(decision.dialogKey), { dialogKey: decision.dialogKey });
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
        showSpeechBubble(getRandomPhrase(decision.dialogKey), { dialogKey: decision.dialogKey });
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
        showSpeechBubble(getRandomPhrase(decision.dialogKey), { dialogKey: decision.dialogKey });
        setDraggedStack(null);
        return;
      }

      emitRuntimeEvent(onRuntimeEvent, {
        type: "onDrop",
        outcome: "return",
        itemId: payload.stack.id,
        interactionId: interaction.id,
      });
      showSpeechBubble(getRandomPhrase(decision.dialogKey), { dialogKey: decision.dialogKey });
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
      showSpeechBubble(getRandomPhrase(fallbackMiss), { dialogKey: fallbackMiss });
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
        showSpeechBubble(getRandomPhrase(message.dialogKey), { dialogKey: message.dialogKey });
      } else {
        showSpeechBubble(message.text);
      }

      setDraggedStack(null);
    },
    [onRuntimeEvent, showSpeechBubble],
  );

  const handlePickupPlacedItem = useCallback(
    (placedItem: PlacedSceneItem) => {
      const decision = resolvePickupPlacedItemDecision({ placedItem });
      if (decision.kind === "ignore") {
        return;
      }

      if (decision.kind === "blocked") {
        emitRuntimeEvent(onRuntimeEvent, {
          type: "onDrop",
          outcome: "pickup-blocked",
          itemId: placedItem.itemId,
          interactionId: placedItem.interactionId,
        });
        showSpeechBubble(getRandomPhrase(decision.dialogKey), { dialogKey: decision.dialogKey });
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
    [onRuntimeEvent, showSpeechBubble],
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

  useEffect(() => {
    if (sceneId !== "personalRoom") return;

    const timeoutId = window.setTimeout(() => {
      showSpeechBubble(getRandomPhrase("personalRoomWelcome"), { dialogKey: "personalRoomWelcome" });
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
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
