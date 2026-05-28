import { create } from "zustand";

import { useSceneStore } from "@pointclick-engine/engine-core";
import type {
  GameSceneWall,
  GameSceneWallOpening,
  GameScene,
} from "@pointclick-engine/engine-core";
import { useEditorModeStore } from "./editorModeStore";

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
 *
 * Wall placement invariant: every wall coming in via `addWall*` or any
 * `updateWall*` mutation gets its base snapped to `ground.y` (via
 * `snapWallToGround`) unless the user opts out with
 * `editorModeStore.wallAllowBelowGround = true`. This keeps walls and the
 * floor visually coherent without having to do the math by hand.
 */

/**
 * Snap a wall so its base sits exactly on `groundY`. Returns the wall as-is
 * when the editor's "allow below ground" override is enabled.
 */
function snapWallToGround(wall: GameSceneWall, groundY: number): GameSceneWall {
  if (useEditorModeStore.getState().wallAllowBelowGround) return wall;
  const desiredY = groundY + wall.halfSize[1];
  if (wall.position[1] === desiredY) return wall;
  return {
    ...wall,
    position: [wall.position[0], desiredY, wall.position[2]],
  };
}

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

      // Default wall is 6m wide × 8m tall × 0.5m thick. The tall height is
      // intentional so that a default opening (see addOpeningToSelectedWall)
      // clears the character sprite's worst-case height — keeps walls usable
      // out-of-the-box for indoor levels with doorways.
      const newWall: GameSceneWall = {
        position: [playerPosition[0], groundY + 4, playerPosition[2]],
        halfSize: [3, 4, 0.25],
        rotationY: 0,
      };

      sceneState.appendWall(newWall);
      set({ selectedWallIndex: sceneState.scene.walls.length });
    },

    addWallWithData: (wall) => {
      const sceneState = useSceneStore.getState();
      sceneState.appendWall(snapWallToGround(wall, sceneState.scene.ground.y));
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
      const sceneState = useSceneStore.getState();
      const groundY = sceneState.scene.ground.y;
      sceneState.updateWall(selectedWallIndex, (wall) =>
        snapWallToGround(updater(wall), groundY),
      );
    },

    // ── Opening CRUD (Phase 6) ────────────────────────────────────────────────

    addOpeningToSelectedWall: () => {
      const { selectedWallIndex } = get();
      if (selectedWallIndex == null) return;

      const wall = useSceneStore.getState().scene.walls[selectedWallIndex];

      // Default opening: full-height doorway that just leaves a slim lintel
      // on top, so any character sprite (which scales with depth up to
      // SPRITE_MAX_SCALE=2.94 → ~5.88m tall) can walk through without
      // clipping the wall segment above.
      //
      // Local Y convention (wall_center is 0; wall spans -halfY..+halfY):
      //   bottom_local = -halfY                (= flush with wall base)
      //   top_local    = +halfY - lintel       (leaves a thin lintel)
      //   centerY      = -lintel / 2
      //   halfY_open   = halfY - lintel / 2
      //
      // Lintel thickness is capped to 0.5 to keep the look "door-shaped",
      // but never more than 25% of the wall to avoid eating the opening on
      // very short walls.
      const lintelThickness = Math.min(0.5, wall.halfSize[1] * 0.5);
      const openingCenterY = -lintelThickness / 2;
      const openingHalfY = wall.halfSize[1] - lintelThickness / 2;

      // Width: 3m wide door (halfX=1.5), capped to half the wall length so
      // it always leaves solid jambs. Pathfinding's obstaclePadding (0.72)
      // leaves 0.78 of clearance per side, comfortably above char halfX 0.55.
      const openingHalfX = Math.min(1.5, wall.halfSize[0] * 0.5);

      // Depth: must cover the wall thickness PLUS the pathfinder's
      // obstaclePadding (0.72 default in core findPath). If we only cover the
      // wall thickness, grid cells near the wall's front/back faces fall
      // `insideWall && !insideOpening` and get blocked → no path through.
      // 0.85 gives a clean visual cut in 3D plus pathfinding clearance.
      const openingHalfZ = wall.halfSize[2] + 0.85;

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
