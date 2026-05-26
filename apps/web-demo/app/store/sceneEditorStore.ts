import { create } from "zustand";

import { useSceneStore } from "./sceneStore";
import type { SceneWall, Scene } from "../demo/content/scenes";

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
  addWallWithData: (wall: SceneWall) => void;
  removeSelectedWall: () => void;
  updateSelectedWall: (updater: (wall: SceneWall) => SceneWall) => void;

  // Mutaciones de suelo (delegan a sceneStore)
  updateGround: (updater: (ground: Scene["ground"]) => Scene["ground"]) => void;

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

      const newWall: SceneWall = {
        position: [playerPosition[0], groundY + 2, playerPosition[2]],
        halfSize: [2, 2, 0.25],
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
