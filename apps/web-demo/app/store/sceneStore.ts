import { create } from "zustand";
import {
  SCENES,
  DEFAULT_SCENE_ID,
  type Scene,
  type SceneInteraction,
  type SceneWall,
} from "../demo/content/scenes";

const SHOULD_LOG_STATE_TRANSITIONS = process.env.NODE_ENV !== "production";

function logSceneStore(event: string, payload: Record<string, unknown>) {
  if (!SHOULD_LOG_STATE_TRANSITIONS) return;
  if (typeof window !== "undefined") {
    const nextEntry = { scope: "scene-store", event, payload, ts: Date.now() };
    const currentTrace =
      (window as unknown as { __gameTrace?: unknown[] }).__gameTrace ?? [];
    (window as unknown as { __gameTrace: unknown[] }).__gameTrace = [
      ...currentTrace,
      nextEntry,
    ].slice(-300);
  }
  console.info(`[scene-store] ${event}`, payload);
}

function cloneWall(wall: SceneWall): SceneWall {
  return {
    position: [...wall.position] as [number, number, number],
    rotationY: wall.rotationY,
    halfSize: [...wall.halfSize] as [number, number, number],
  };
}

function cloneInteraction(interaction: SceneInteraction): SceneInteraction {
  return {
    ...interaction,
    position: [...interaction.position] as [number, number, number],
    halfSize: [...interaction.halfSize] as [number, number, number],
    acceptsItemIds: interaction.acceptsItemIds
      ? [...interaction.acceptsItemIds]
      : undefined,
    dialogKeys: { ...interaction.dialogKeys },
  };
}

function cloneScene(scene: Scene): Scene {
  return {
    ...scene,
    playerSpawn: [...scene.playerSpawn] as [number, number, number],
    ground: { ...scene.ground },
    walls: scene.walls.map(cloneWall),
    interactions: scene.interactions.map(cloneInteraction),
  };
}

/**
 * sceneStore – estado runtime de la escena activa.
 *
 * Invariantes de ownership:
 * - Propietario de: sceneId, scene (datos runtime), playerPosition, respawnSignal.
 * - NO gestiona estado de editor (selección de muros, etc). Ver sceneEditorStore.
 * - appendWall / removeWall / updateWall son helpers de mutación que el editor
 *   puede invocar vía sceneEditorStore sin acoplar stores en sentido contrario.
 */
type SceneStore = {
  // Runtime state
  sceneId: string;
  scene: Scene;
  playerPosition: [number, number, number];
  respawnSignal: number;

  // Runtime actions
  setScene: (id: string) => void;
  updateInteraction: (
    id: string,
    updater: (interaction: SceneInteraction) => SceneInteraction,
  ) => void;
  resetInteractionsFromSceneConfig: () => void;
  setPlayerPosition: (position: [number, number, number]) => void;
  requestRespawn: () => void;

  // Mutation helpers used by sceneEditorStore (no selection tracking)
  updateGround: (updater: (ground: Scene["ground"]) => Scene["ground"]) => void;
  appendWall: (wall: SceneWall) => void;
  removeWall: (index: number) => void;
  updateWall: (index: number, updater: (wall: SceneWall) => SceneWall) => void;
};

export const useSceneStore = create<SceneStore>((set) => ({
  sceneId: DEFAULT_SCENE_ID,
  scene: cloneScene(SCENES[DEFAULT_SCENE_ID]),
  playerPosition: cloneScene(SCENES[DEFAULT_SCENE_ID]).playerSpawn,
  respawnSignal: 0,
  setScene: (id: string) => {
    const scene = SCENES[id];
    if (!scene) return;
    const clonedScene = cloneScene(scene);
    logSceneStore("set-scene", {
      fromSceneId: useSceneStore.getState().sceneId,
      toSceneId: id,
      spawn: clonedScene.playerSpawn,
    });
    set({
      sceneId: id,
      scene: clonedScene,
      playerPosition: [...clonedScene.playerSpawn] as [number, number, number],
    });
  },
  updateGround: (updater) =>
    set((state) => ({
      scene: {
        ...state.scene,
        ground: updater({ ...state.scene.ground }),
      },
    })),
  appendWall: (wall) =>
    set((state) => ({
      scene: {
        ...state.scene,
        walls: [...state.scene.walls, cloneWall(wall)],
      },
    })),
  removeWall: (index) =>
    set((state) => ({
      scene: {
        ...state.scene,
        walls: state.scene.walls.filter((_, i) => i !== index),
      },
    })),
  updateWall: (index, updater) =>
    set((state) => ({
      scene: {
        ...state.scene,
        walls: state.scene.walls.map((wall, i) =>
          i !== index ? wall : updater(cloneWall(wall)),
        ),
      },
    })),
  updateInteraction: (id, updater) =>
    set((state) => ({
      scene: {
        ...state.scene,
        interactions: state.scene.interactions.map((interaction) => {
          if (interaction.id !== id) return interaction;
          return updater(cloneInteraction(interaction));
        }),
      },
    })),
  resetInteractionsFromSceneConfig: () =>
    set((state) => {
      const sceneFromConfig = SCENES[state.sceneId];
      if (!sceneFromConfig) return state;
      logSceneStore("reset-interactions", {
        sceneId: state.sceneId,
        interactionCount: sceneFromConfig.interactions.length,
      });
      return {
        scene: {
          ...state.scene,
          interactions: sceneFromConfig.interactions.map(cloneInteraction),
        },
      };
    }),
  setPlayerPosition: (position) => set({ playerPosition: position }),
  requestRespawn: () =>
    set((state) => {
      const nextRespawnSignal = state.respawnSignal + 1;
      logSceneStore("request-respawn", {
        sceneId: state.sceneId,
        previousRespawnSignal: state.respawnSignal,
        nextRespawnSignal,
        currentPlayerPosition: state.playerPosition,
      });
      return { respawnSignal: nextRespawnSignal };
    }),
}));
