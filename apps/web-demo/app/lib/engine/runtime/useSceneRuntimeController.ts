"use client";

import { useMemo } from "react";

import { SCENES } from "../../../demo/content/scenes";
import { useSceneStore, type GameScene } from "@pointclick/engine-core";

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
      storeSetScene(id, scene as GameScene);
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
