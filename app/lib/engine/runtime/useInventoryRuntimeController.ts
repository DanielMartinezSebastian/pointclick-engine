"use client";

import { useCallback, useEffect, useState } from "react";

import { getRandomPhrase } from "../../../dialogs/getRandomPhrase";
import type { SceneInteraction } from "../../../scenes/scenes";
import type { InventorySlots } from "../../../components/InventoryUI";
import type { DraggedInventoryPayload } from "../../../components/inventory/SceneDropTargets";
import type { PlacedSceneItem } from "../types/gameRuntime";
import {
  addOneToInventory,
  inventoryRuleMessages,
  removeOneFromSlot,
  resolveInventoryDropHitDecision,
  resolveInventoryDropMissDialogKey,
  resolveInventoryDropOnPlayerMessage,
  resolvePickupPlacedItemDecision,
} from "../../core/rules/inventoryRules";

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
}: {
  sceneId: string;
  sceneInteractions: SceneInteraction[];
  playerPosition: [number, number, number];
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
  }, []);

  const showSpeechBubble = useCallback((nextText: string) => {
    setSpeechText(nextText);
    setSpeechVisible(true);
    setSpeechTrigger((current) => current + 1);
  }, []);

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
        showSpeechBubble(decision.message);
        setDraggedStack(null);
        return;
      }

      if (decision.kind === "rule-miss") {
        showSpeechBubble(getRandomPhrase(decision.dialogKey));
        setDraggedStack(null);
        return;
      }

      if (decision.kind === "place") {
        setInventorySlots((currentSlots) =>
          removeOneFromSlot(currentSlots, decision.fromSlotIndex),
        );
        setPlacedItems((currentPlaced) => [...currentPlaced, decision.placedItem]);
        showSpeechBubble(getRandomPhrase(decision.dialogKey));
        setDraggedStack(null);
        return;
      }

      if (decision.kind === "consume") {
        setInventorySlots((currentSlots) =>
          removeOneFromSlot(currentSlots, decision.fromSlotIndex),
        );
        showSpeechBubble(getRandomPhrase(decision.dialogKey));
        setDraggedStack(null);
        return;
      }

      showSpeechBubble(getRandomPhrase(decision.dialogKey));
      setDraggedStack(null);
    },
    [showSpeechBubble],
  );

  const handleInventoryDropMiss = useCallback(
    (payload: DraggedInventoryPayload, interaction?: SceneInteraction) => {
      const fallbackMiss = resolveInventoryDropMissDialogKey({
        payload,
        interaction,
        sceneInteractions,
      });

      showSpeechBubble(getRandomPhrase(fallbackMiss));
      setDraggedStack(null);
    },
    [sceneInteractions, showSpeechBubble],
  );

  const handleInventoryDropOnPlayer = useCallback(
    (payload: DraggedInventoryPayload) => {
      const message = resolveInventoryDropOnPlayerMessage({ payload });
      if (message.kind === "dialog-key") {
        showSpeechBubble(getRandomPhrase(message.dialogKey));
      } else {
        showSpeechBubble(message.text);
      }

      setDraggedStack(null);
    },
    [showSpeechBubble],
  );

  const handlePickupPlacedItem = useCallback(
    (placedItem: PlacedSceneItem) => {
      const decision = resolvePickupPlacedItemDecision({ placedItem });
      if (decision.kind === "ignore") {
        return;
      }

      if (decision.kind === "blocked") {
        showSpeechBubble(getRandomPhrase(decision.dialogKey));
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
        currentPlaced.filter((currentItem) => currentItem.id !== decision.placedItemId),
      );
      showSpeechBubble(getRandomPhrase(decision.successDialogKey));
    },
    [showSpeechBubble],
  );

  const updatePlacedItemPosition = useCallback(
    (id: string, axis: 0 | 1 | 2, value: number) => {
      setPlacedItems((currentPlaced) =>
        currentPlaced.map((item) => {
          if (item.id !== id) return item;
          const worldPosition = [...item.worldPosition] as [number, number, number];
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
            worldPosition: [playerPosition[0], item.worldPosition[1], playerPosition[2]],
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
      showSpeechBubble(getRandomPhrase("personalRoomWelcome"));
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
