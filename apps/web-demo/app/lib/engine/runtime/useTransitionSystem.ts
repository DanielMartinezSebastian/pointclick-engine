"use client";

import { useCallback, useEffect, useRef } from "react";
import { useSceneStore } from "@pointclick-engine/engine-core";
import { resolveTransitionFromItemDrop } from "@pointclick-engine/engine-core";
import { SCENES } from "../../../../demo-content/scenes/scenes";
import { getGameRuntime } from "../publicApi";
import { useDialogStore } from "../../../store/dialogStore";
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

      // Change scene first (playerWalkingState is now preserved during scene change)
      storeSetScene(targetSceneId, scene as Parameters<typeof storeSetScene>[1]);

      // Then emit walk command in the new scene with correct pathfinding context
      if (usedTransition && "entryPosition" in usedTransition && usedTransition.entryPosition) {
        const entryPos = usedTransition.entryPosition;
        console.log(`[useTransitionSystem] Emitting walkTo to ${JSON.stringify(entryPos)}`);
        // Emit walk command via runtime
        getGameRuntime()?.executeCommand({
          type: "player:walkTo",
          position: entryPos,
        });
      } else {
        console.log(`[useTransitionSystem] No entryPosition found on transition`, usedTransition);
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

      // Check if leaving personalRoom without collecting trophy
      if (currentSceneId === "personalRoom" && targetSceneId === "dungeon") {
        const trophyStillPlaced = placedItems.some(item => item.itemId === "trophy");
        if (trophyStillPlaced) {
          showDialog("Sería mejor recoger todo lo que pueda del cuarto antes de irme...", "interaction.trophy-pedestal.empty");
          return;
        }
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
   * Handles item-drop events from the inventory system.
   * Returns a passthrough handler that checks if the drop matches a transition.
   * Defers the scene change until the dialog is dismissed.
   */
  const wrapRuntimeEventForTransitions = useCallback(
    (passthrough: (event: RuntimeEvent) => void) =>
      (event: RuntimeEvent) => {
        if (event.type === "onDrop" && (event.outcome === "consume" || event.outcome === "place") && event.interactionId) {
          const scene = useSceneStore.getState().scene;
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
