"use client";

import { useEffect, useMemo } from "react";

import { SCENES, DEFAULT_SCENE_ID } from "../../../../demo-content/scenes/scenes";
import { useSceneStore, type GameScene } from "@pointclick-engine/engine-core";
import { getGameRuntime } from "./publicApi";

export function useSceneRuntimeController() {
  const sceneId = useSceneStore((s) => s.sceneId);
  const sceneBackground = useSceneStore((s) => s.scene.background);
  const storeSetScene = useSceneStore((s) => s.setScene);
  const sceneInteractions = useSceneStore((s) => s.scene.interactions);
  const requestRespawn = useSceneStore((s) => s.requestRespawn);
  const playerPosition = useSceneStore((s) => s.playerPosition);
  const scenePlayerSpawn = useSceneStore((s) => s.scene.playerSpawn);
  const updateInteraction = useSceneStore((s) => s.updateInteraction);
  const resetInteractionsFromSceneConfig = useSceneStore(
    (s) => s.resetInteractionsFromSceneConfig,
  );

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
        storeSetScene(id, scene as GameScene, spawnPos);

        // Execute walk command if target position exists
        if ("targetPosition" in transitionToTarget && transitionToTarget.targetPosition) {
          setTimeout(() => {
            getGameRuntime()?.executeCommand({
              type: "player:walkTo",
              position: transitionToTarget.targetPosition,
            });
          }, 0);
        }
      } else {
        // No transition found, just change scene normally
        storeSetScene(id, scene as GameScene);
      }
    },
    [storeSetScene],
  );

  // Load default scene on mount if the store is empty (engine-core store
  // is agnostic and starts blank — the demo is responsible for seeding it).
  useEffect(() => {
    if (!useSceneStore.getState().sceneId) {
      const defaultScene = SCENES[DEFAULT_SCENE_ID];
      if (defaultScene) {
        storeSetScene(DEFAULT_SCENE_ID, defaultScene as GameScene);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    sceneId,
    sceneBackground,
    setScene,
    sceneInteractions,
    requestRespawn,
    playerPosition,
    scenePlayerSpawn,
    updateInteraction,
    resetInteractionsFromSceneConfig,
    sceneOptions,
  };
}
