"use client";

import { useCallback, useEffect, useRef } from "react";
import { useSceneStore } from "@pointclick-engine/engine-core";
import { resolveTransitionFromItemDrop, resolveTransitionFromItemInteraction, canTransitionBeTriggered } from "@pointclick-engine/engine-core";
import { SCENES } from "../../../../demo-content/scenes/scenes";
import { getGameRuntime } from "../publicApi";
import { useDialogStore } from "../../../store/dialogStore";
import { useInventoryStore } from "../../../store/inventoryStore";
import { usePlacedItemsStore } from "../../../store/placedItemsStore";
import { getRandomPhrase } from "../../../../demo-content/dialogs/getRandomPhrase";
import type { RuntimeEvent } from "@pointclick-engine/engine-core";

/**
 * Wires scene transitions into the demo.
 *
 * Handles:
 * - Collision-based transitions (via `handleTransitionTriggered` callback)
 * - Item-drop-based transitions (by watching `item:dropped` events)
 *
 * Scene changes are applied directly via sceneStore for demo compatibility
 * (scenes are defined in SCENES, not registered via createGameRuntime).
 */
export function useTransitionSystem() {
  const storeSetScene = useSceneStore((s) => s.setScene);
  const placedItems = usePlacedItemsStore((s) => s.items);
  const isTransitioningRef = useRef(false);
  const showDialog = useDialogStore((s) => s.show);
  const dialogVisible = useDialogStore((s) => s.visible);
  const pendingTransitionRef = useRef<{ id: string; targetSceneId: string } | null>(null);

  const changeScene = useCallback(
    (targetSceneId: string, transitionId: string) => {
      if (isTransitioningRef.current) return;
      const scene = SCENES[targetSceneId];
      if (!scene) {
        console.warn(`[transition] target scene not found: ${targetSceneId}`);
        return;
      }
      isTransitioningRef.current = true;

      // Emit transition:started via runtime bus (if runtime is active)
      getGameRuntime()?.emit({
        type: "transition:started",
        transitionId,
      });

      const fromSceneId = useSceneStore.getState().sceneId;
      const fromScene = useSceneStore.getState().scene;

      // Find the transition that was used to trigger this scene change
      const usedTransition = fromScene.transitions?.find((t) => t.id === transitionId);

      // Change scene first with optional custom spawn position
      const spawnPos = usedTransition && "spawnPosition" in usedTransition ? usedTransition.spawnPosition : undefined;
      storeSetScene(targetSceneId, scene as Parameters<typeof storeSetScene>[1], spawnPos);

      // Then emit walk command in the new scene with correct pathfinding context
      if (usedTransition && "targetPosition" in usedTransition && usedTransition.targetPosition) {
        const targetPos = usedTransition.targetPosition;
        console.log(`[useTransitionSystem] Emitting walkTo to ${JSON.stringify(targetPos)}`);
        // Emit walk command via runtime
        getGameRuntime()?.executeCommand({
          type: "player:walkTo",
          position: targetPos,
        });
      } else {
        console.log(`[useTransitionSystem] No targetPosition found on transition`, usedTransition);
      }

      getGameRuntime()?.emit({
        type: "transition:completed",
        fromSceneId,
        toSceneId: targetSceneId,
      });

      // Reset guard after a brief delay so re-entering the same zone works
      setTimeout(() => {
        isTransitioningRef.current = false;
      }, 800);
    },
    [storeSetScene],
  );

  /** Called by SceneTransitions renderer when player enters a collision zone. */
  const handleTransitionTriggered = useCallback(
    (transitionId: string, targetSceneId: string) => {
      const currentSceneId = useSceneStore.getState().sceneId;
      const currentScene = useSceneStore.getState().scene;
      const transition = currentScene.transitions?.find((t) => t.id === transitionId);

      if (!transition) {
        console.warn(`[transition] transition not found: ${transitionId}`);
        return;
      }

      // Use core resolver to check if transition can be triggered.
      // Filter placedItems to only those in the current scene for accurate validation.
      const inventoryItems = useInventoryStore.getState().slots;
      const sceneOnlyItems = placedItems.filter((item) => item.sceneId === currentSceneId);
      const canTrigger = canTransitionBeTriggered(transition, inventoryItems, sceneOnlyItems);

      if (!canTrigger) {
        // Transition is blocked — show appropriate dialog based on transition type
        if (transition.kind === "item-drop" && transition.requiresItemId) {
          showDialog(
            "Sería mejor recoger todo lo que pueda del cuarto antes de irme...",
            "interaction.trophy-pedestal.empty",
          );
        } else if (transition.kind === "item-interaction" && transition.requiresItemId) {
          showDialog(
            "Necesito algo para interactuar con esto.",
            "interaction.required-item-missing",
          );
        }
        return;
      }

      getGameRuntime()?.emit({
        type: "transition:triggered",
        transitionId,
        targetSceneId,
      });
      changeScene(targetSceneId, transitionId);
    },
    [changeScene, showDialog, placedItems],
  );

  /**
   * Handles item-drop and item-interact events from the inventory system.
   * Returns a passthrough handler that checks if the drop/interact matches a transition.
   * Defers the scene change until the dialog is dismissed.
   */
  const wrapRuntimeEventForTransitions = useCallback(
    (passthrough: (event: RuntimeEvent) => void) =>
      (event: RuntimeEvent) => {
        const scene = useSceneStore.getState().scene;

        if (event.type === "onDrop" && (event.outcome === "consume" || event.outcome === "place") && event.interactionId) {
          const gameEvent = {
            type: "item:dropped" as const,
            itemId: event.itemId,
            outcome: event.outcome as "consume" | "place",
            interactionId: event.interactionId,
          };
          const matching = resolveTransitionFromItemDrop(scene, gameEvent);
          if (matching) {
            getGameRuntime()?.emit({
              type: "transition:triggered",
              transitionId: matching.id,
              targetSceneId: matching.targetSceneId,
            });
            // Store transition to trigger after dialog closes
            pendingTransitionRef.current = { id: matching.id, targetSceneId: matching.targetSceneId };
          }
        }

        if (event.type === "onDrop" && event.outcome === "item-interact" && event.interactionId) {
          const matching = resolveTransitionFromItemInteraction(scene, event.itemId, event.interactionId);
          if (matching) {
            getGameRuntime()?.emit({
              type: "transition:triggered",
              transitionId: matching.id,
              targetSceneId: (matching as any).targetSceneId,
            });
            // Store transition to trigger after dialog closes
            pendingTransitionRef.current = { id: matching.id, targetSceneId: (matching as any).targetSceneId };
          }
        }

        passthrough(event);
      },
    [],
  );

  // Execute pending transition after dialog is dismissed
  useEffect(() => {
    if (!dialogVisible && pendingTransitionRef.current) {
      const t = pendingTransitionRef.current;
      pendingTransitionRef.current = null;
      changeScene(t.targetSceneId, t.id);
    }
  }, [dialogVisible, changeScene]);

  return { handleTransitionTriggered, wrapRuntimeEventForTransitions };
}
