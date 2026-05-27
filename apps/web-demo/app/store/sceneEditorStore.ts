import { create } from "zustand";

import { useSceneStore } from "@pointclick-engine/engine-core";
import type {
  GameSceneWall,
  GameSceneWallOpening,
  GameScene,
} from "@pointclick-engine/engine-core";

/**
 * sceneEditorStore – estado y acciones exclusivos del editor/debug.
 *
 * Invariantes de ownership:
 * - Este store es dueño de `selectedWallIndex` (selección de muro en editor).
 * - Las mutaciones de walls y ground se delegan a `sceneStore` para no
 *   duplicar estado de juego.
 * - sceneStore NO conoce este store (sin acoplamiento circular).
 * - La selección se resetea automáticamente al cambiar de escena vía
 *   subscripción a sceneStore.sceneId.
 */

type SceneEditorStore = {
  selectedWallIndex: number | null;

  // Selección
  selectWall: (index: number | null) => void;

  // Mutaciones de muros (delegan a sceneStore)
  addWall: () => void;
  addWallWithData: (wall: GameSceneWall) => void;
  removeSelectedWall: () => void;
  updateSelectedWall: (updater: (wall: GameSceneWall) => GameSceneWall) => void;

  // Opening CRUD for selected wall (Phase 6)
  addOpeningToSelectedWall: () => void;
  removeOpeningFromSelectedWall: (openingId: string) => void;
  updateOpeningInSelectedWall: (
    openingId: string,
    updater: (opening: GameSceneWallOpening) => GameSceneWallOpening,
  ) => void;

  // Texture helpers for selected wall (Phase 6)
  updateSelectedWallTextureUrl: (textureUrl: string | undefined) => void;
  updateSelectedWallTexturePosition: (
    axis: 0 | 1 | 2,
    value: number,
  ) => void;

  // Mutaciones de suelo (delegan a sceneStore)
  updateGround: (updater: (ground: GameScene["ground"]) => GameScene["ground"]) => void;

  // Sincronización interna
  _syncWallSelection: (wallsLength: number) => void;
};

export const useSceneEditorStore = create<SceneEditorStore>()((set, get) => ({
    selectedWallIndex: null,

    selectWall: (index) => set({ selectedWallIndex: index }),

    addWall: () => {
      const sceneState = useSceneStore.getState();
      const groundY = sceneState.scene.ground.y;
      const playerPosition = sceneState.playerPosition;

      const newWall: GameSceneWall = {
        // Default: wider (6m) and taller (5m) wall, half-unit thick
        position: [playerPosition[0], groundY + 2.5, playerPosition[2]],
        halfSize: [3, 2.5, 0.25],
        rotationY: 0,
      };

      sceneState.appendWall(newWall);
      set({ selectedWallIndex: sceneState.scene.walls.length });
    },

    addWallWithData: (wall) => {
      const sceneState = useSceneStore.getState();
      sceneState.appendWall(wall);
      set({ selectedWallIndex: sceneState.scene.walls.length });
    },

    removeSelectedWall: () => {
      const { selectedWallIndex } = get();
      if (selectedWallIndex == null) return;

      useSceneStore.getState().removeWall(selectedWallIndex);

      const newWalls = useSceneStore.getState().scene.walls;
      set({
        selectedWallIndex:
          newWalls.length === 0
            ? null
            : Math.min(selectedWallIndex, newWalls.length - 1),
      });
    },

    updateSelectedWall: (updater) => {
      const { selectedWallIndex } = get();
      if (selectedWallIndex == null) return;
      useSceneStore.getState().updateWall(selectedWallIndex, updater);
    },

    // ── Opening CRUD (Phase 6) ────────────────────────────────────────────────

    addOpeningToSelectedWall: () => {
      const { selectedWallIndex } = get();
      if (selectedWallIndex == null) return;

      const wall = useSceneStore.getState().scene.walls[selectedWallIndex];

      // Default: centered door (X=0), bottom flush with wall's bottom edge.
      //
      // Character physics radius = 0.5 units.
      // Default pathfinding obstaclePadding = 0.72 — opening needs halfX > 0.72
      // to be traversable. 1.5 (3m wide) gives comfortable passage.
      // halfY = 1.2 (2.4m tall) clears the character sprite with margin.
      const openingHalfY = Math.min(1.2, wall.halfSize[1]);
      const openingCenterY = -wall.halfSize[1] + openingHalfY; // bottom at wall base
      const openingHalfX = Math.min(1.5, wall.halfSize[0] * 0.5);
      // Depth: span full wall depth + margin so the cut is clean
      const openingHalfZ = wall.halfSize[2] + 0.05;

      const newOpening: GameSceneWallOpening = {
        id: `opening-${Date.now()}`,
        position: [0, openingCenterY, 0],
        halfSize: [openingHalfX, openingHalfY, openingHalfZ],
      };

      useSceneStore.getState().updateWall(selectedWallIndex, (wall) => ({
        ...wall,
        openings: [...(wall.openings ?? []), newOpening],
      }));
    },

    removeOpeningFromSelectedWall: (openingId) => {
      const { selectedWallIndex } = get();
      if (selectedWallIndex == null) return;

      useSceneStore.getState().updateWall(selectedWallIndex, (wall) => ({
        ...wall,
        openings: wall.openings?.filter((o) => o.id !== openingId),
      }));
    },

    updateOpeningInSelectedWall: (openingId, updater) => {
      const { selectedWallIndex } = get();
      if (selectedWallIndex == null) return;

      useSceneStore.getState().updateWall(selectedWallIndex, (wall) => ({
        ...wall,
        openings: wall.openings?.map((o) =>
          o.id === openingId ? updater(o) : o,
        ),
      }));
    },

    // ── Texture helpers (Phase 6) ─────────────────────────────────────────────

    updateSelectedWallTextureUrl: (textureUrl) => {
      const { selectedWallIndex } = get();
      if (selectedWallIndex == null) return;

      useSceneStore.getState().updateWall(selectedWallIndex, (wall) => ({
        ...wall,
        textureUrl: textureUrl || undefined,
      }));
    },

    updateSelectedWallTexturePosition: (axis, value) => {
      const { selectedWallIndex } = get();
      if (selectedWallIndex == null) return;

      useSceneStore.getState().updateWall(selectedWallIndex, (wall) => {
        const texturePosition = [
          ...(wall.texturePosition ?? [0, 0, 0]),
        ] as [number, number, number];
        texturePosition[axis] = value;
        return { ...wall, texturePosition };
      });
    },

    updateGround: (updater) => {
      useSceneStore.getState().updateGround(updater);
    },

    _syncWallSelection: (wallsLength) => {
      set({ selectedWallIndex: wallsLength > 0 ? 0 : null });
    },
}));

// Sincroniza la selección de muro cuando cambia la escena.
// Usa suscripción sin selector para evitar requerir middleware en sceneStore.
// sceneStore no conoce sceneEditorStore (sin acoplamiento circular).
let _lastSceneId = useSceneStore.getState().sceneId;
useSceneStore.subscribe((state) => {
  if (state.sceneId !== _lastSceneId) {
    _lastSceneId = state.sceneId;
    useSceneEditorStore.getState()._syncWallSelection(state.scene.walls.length);
  }
});
