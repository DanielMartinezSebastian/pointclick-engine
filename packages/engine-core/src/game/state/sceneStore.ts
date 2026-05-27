import { create } from "zustand";
import type {
  GameScene,
  GameSceneWall,
  GameSceneInteractionFull,
  GameVec3,
} from "../types";
import type { GameEvent } from "../events/types";

// ---------------------------------------------------------------------------
// Event emitter hook (injected by createGameRuntime — zero-event mode by default)
// ---------------------------------------------------------------------------

type StoreEmitter = (event: GameEvent) => void;

let _emitter: StoreEmitter | null = null;

/**
 * Inyecta el emisor de eventos del runtime. Llamado por `createGameRuntime`
 * al inicializar el bus. Si no se llama, el store funciona en zero-event mode.
 */
export function setSceneStoreEmitter(emitter: StoreEmitter | null): void {
  _emitter = emitter;
}

function emit(event: GameEvent): void {
  if (_emitter) _emitter(event);
}

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

function cloneWall(wall: GameSceneWall): GameSceneWall {
  return {
    position: [...wall.position] as [number, number, number],
    rotationY: wall.rotationY,
    halfSize: [...wall.halfSize] as [number, number, number],
    openings: wall.openings
      ? wall.openings.map((opening) => ({
          id: opening.id,
          position: [...opening.position] as [number, number, number],
          halfSize: [...opening.halfSize] as [number, number, number],
        }))
      : undefined,
    textureUrl: wall.textureUrl,
    texturePosition: wall.texturePosition
      ? ([...wall.texturePosition] as [number, number, number])
      : undefined,
  };
}

function cloneInteraction(
  interaction: GameSceneInteractionFull
): GameSceneInteractionFull {
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

function cloneScene(scene: GameScene): GameScene {
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
  scene: GameScene;
  playerPosition: GameVec3;
  respawnSignal: number;

  // Runtime actions
  setScene: (id: string, scene: GameScene) => void;
  updateInteraction: (
    id: string,
    updater: (interaction: GameSceneInteractionFull) => GameSceneInteractionFull
  ) => void;
  resetInteractionsFromSceneConfig: () => void;
  setPlayerPosition: (position: GameVec3) => void;
  requestRespawn: () => void;

  // Mutation helpers used by sceneEditorStore (no selection tracking)
  updateGround: (updater: (ground: GameScene["ground"]) => GameScene["ground"]) => void;
  appendWall: (wall: GameSceneWall) => void;
  removeWall: (index: number) => void;
  updateWall: (index: number, updater: (wall: GameSceneWall) => GameSceneWall) => void;
};

export const useSceneStore = create<SceneStore>((set, get) => ({
  sceneId: "",
  scene: {
    id: "",
    label: "",
    background: "",
    playerSpawn: [0, 0, 0],
    ground: { minX: 0, maxX: 0, minZ: 0, maxZ: 0, y: 0 },
    walls: [],
    interactions: [],
  },
  playerPosition: [0, 0, 0],
  respawnSignal: 0,
  setScene: (id: string, scene: GameScene) => {
    const clonedScene = cloneScene(scene);
    logSceneStore("set-scene", {
      fromSceneId: get().sceneId,
      toSceneId: id,
      spawn: clonedScene.playerSpawn,
    });
    set({
      sceneId: id,
      scene: clonedScene,
      playerPosition: [...clonedScene.playerSpawn] as GameVec3,
    });
    emit({ type: "scene:changed", sceneId: id, scene: clonedScene });
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
          i !== index ? wall : updater(cloneWall(wall))
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
      logSceneStore("reset-interactions", {
        sceneId: state.sceneId,
        interactionCount: state.scene.interactions.length,
      });
      return {
        scene: {
          ...state.scene,
          interactions: state.scene.interactions.map(cloneInteraction),
        },
      };
    }),
  setPlayerPosition: (position) => set({ playerPosition: position }),
  requestRespawn: () => {
    const state = get();
    const nextRespawnSignal = state.respawnSignal + 1;
    logSceneStore("request-respawn", {
      sceneId: state.sceneId,
      previousRespawnSignal: state.respawnSignal,
      nextRespawnSignal,
      currentPlayerPosition: state.playerPosition,
    });
    set({ respawnSignal: nextRespawnSignal });
    emit({ type: "scene:respawnRequested", sceneId: state.sceneId });
  },
}));

/** Read state without React (for use from other renderers or tests) */
export function getSceneState() {
  return useSceneStore.getState();
}

/** Subscribe to state changes without React */
export function subscribeSceneState(
  listener: (state: ReturnType<typeof useSceneStore.getState>) => void
) {
  return useSceneStore.subscribe(listener);
}
