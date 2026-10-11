"use client";

import { useMemo } from "react";

import { SCENES } from "../../../../demo-content/scenes/scenes";
import { useSceneStore } from "@pointclick-engine/engine-core";
import { getGameRuntime } from "../publicApi";

type StoreSetScene = ReturnType<typeof useSceneStore.getState>["setScene"];

/**
 * Selector de escena del panel de debug: opciones y `setScene` con entrada animada.
 * El estado de escena, la siembra y la persistencia viven en `useGameViewportController`
 * (renderer); este hook solo recibe su `storeSetScene`.
 */
export function useDemoSceneDebug(storeSetScene: StoreSetScene) {
  const sceneOptions = useMemo(
    () => Object.values(SCENES).map((s) => ({ label: s.label, value: s.id })),
    [],
  );

  const setScene = useMemo(
    () => (id: string) => {
      const scene = SCENES[id];
      if (!scene) {
        console.warn(`Scene not found: ${id}`);
        return;
      }
      // When changing scene from debug menu, look for a transition to that scene
      // and use its spawn/target positions for animated entry
      const currentScene = useSceneStore.getState().scene;
      const transitionToTarget = currentScene?.transitions?.find((t) => t.targetSceneId === id);

      if (transitionToTarget && "spawnPosition" in transitionToTarget && transitionToTarget.spawnPosition) {
        // Use transition's spawn position
        const spawnPos = transitionToTarget.spawnPosition;
        const targetPos = "targetPosition" in transitionToTarget ? transitionToTarget.targetPosition : undefined;

        storeSetScene(id, scene, spawnPos);

        // Execute walk command if target position exists
        if (targetPos) {
          setTimeout(() => {
            getGameRuntime()?.executeCommand({
              type: "player:walkTo",
              position: targetPos,
            });
          }, 0);
        }
      } else {
        // No transition found, just change scene normally
        storeSetScene(id, scene);
      }
    },
    [storeSetScene],
  );

  return { sceneOptions, setScene };
}
