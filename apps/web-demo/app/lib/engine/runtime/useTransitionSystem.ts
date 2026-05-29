"use client";

import { useCallback, useEffect, useRef } from "react";
import { useSceneStore } from "@pointclick-engine/engine-core";
import { resolveTransitionFromItemDrop } from "@pointclick-engine/engine-core";
import { SCENES } from "../../../../demo-content/scenes/scenes";
import { getGameRuntime } from "../publicApi";
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
  const isTransitioningRef = useRef(false);

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
      storeSetScene(targetSceneId, scene as Parameters<typeof storeSetScene>[1]);

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
      getGameRuntime()?.emit({
        type: "transition:triggered",
        transitionId,
        targetSceneId,
      });
      changeScene(targetSceneId, transitionId);
    },
    [changeScene],
  );

  /**
   * Handles item-drop events from the inventory system.
   * Returns a passthrough handler that checks if the drop matches a transition.
   */
  const wrapRuntimeEventForTransitions = useCallback(
    (passthrough: (event: RuntimeEvent) => void) =>
      (event: RuntimeEvent) => {
        if (event.type === "onDrop" && event.outcome === "consume" && event.interactionId) {
          const scene = useSceneStore.getState().scene;
          const gameEvent = {
            type: "item:dropped" as const,
            itemId: event.itemId,
            outcome: event.outcome as "consume",
            interactionId: event.interactionId,
          };
          const matching = resolveTransitionFromItemDrop(scene, gameEvent);
          if (matching) {
            getGameRuntime()?.emit({
              type: "transition:triggered",
              transitionId: matching.id,
              targetSceneId: matching.targetSceneId,
            });
            changeScene(matching.targetSceneId, matching.id);
          }
        }
        passthrough(event);
      },
    [changeScene],
  );

  return { handleTransitionTriggered, wrapRuntimeEventForTransitions };
}
