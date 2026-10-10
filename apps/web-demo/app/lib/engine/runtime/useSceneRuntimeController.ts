"use client";

import { useMemo } from "react";

import { SCENES, DEFAULT_SCENE_ID } from "../../../../demo-content/scenes/scenes";
import { useSceneStore } from "@pointclick-engine/engine-core";
import {
  useSceneRuntime,
  type SceneProgressStorage,
} from "@pointclick-engine/engine-renderer-r3f";
import { getGameRuntime } from "../publicApi";
import {
  loadCurrentSceneId,
  saveCurrentSceneId,
} from "../../gamePersistence";

const SCENE_STORAGE: SceneProgressStorage = {
  loadSceneId: loadCurrentSceneId,
  saveSceneId: saveCurrentSceneId,
};

const resolveDemoScene = (id: string) => SCENES[id] ?? null;

export function useSceneRuntimeController() {
  const {
    sceneId,
    sceneBackground,
    storeSetScene,
    sceneInteractions,
    requestRespawn,
    playerPosition,
    scenePlayerSpawn,
    updateInteraction,
    resetInteractionsFromSceneConfig,
  } = useSceneRuntime({
    initialSceneId: DEFAULT_SCENE_ID,
    storage: SCENE_STORAGE,
    // La demo mantiene en el store su escena completa (SCENES), no la
    // proyeccion del registro del core.
    resolveScene: resolveDemoScene,
  });

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
