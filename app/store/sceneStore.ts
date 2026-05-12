import { create } from "zustand";
import {
  SCENES,
  DEFAULT_SCENE_ID,
  type Scene,
  type SceneWall,
} from "../scenes/scenes";

function cloneWall(wall: SceneWall): SceneWall {
  return {
    position: [...wall.position] as [number, number, number],
    rotationY: wall.rotationY,
    halfSize: [...wall.halfSize] as [number, number, number],
  };
}

function cloneScene(scene: Scene): Scene {
  return {
    ...scene,
    playerSpawn: [...scene.playerSpawn] as [number, number, number],
    ground: { ...scene.ground },
    walls: scene.walls.map(cloneWall),
  };
}

type SceneStore = {
  sceneId: string;
  scene: Scene;
  selectedWallIndex: number | null;
  playerPosition: [number, number, number];
  respawnSignal: number;
  setScene: (id: string) => void;
  updateGround: (updater: (ground: Scene["ground"]) => Scene["ground"]) => void;
  selectWall: (index: number | null) => void;
  addWall: () => void;
  removeSelectedWall: () => void;
  updateSelectedWall: (updater: (wall: SceneWall) => SceneWall) => void;
  setPlayerPosition: (position: [number, number, number]) => void;
  requestRespawn: () => void;
};

export const useSceneStore = create<SceneStore>((set) => ({
  sceneId: DEFAULT_SCENE_ID,
  scene: cloneScene(SCENES[DEFAULT_SCENE_ID]),
  selectedWallIndex: SCENES[DEFAULT_SCENE_ID].walls.length > 0 ? 0 : null,
  playerPosition: cloneScene(SCENES[DEFAULT_SCENE_ID]).playerSpawn,
  respawnSignal: 0,
  setScene: (id: string) => {
    const scene = SCENES[id];
    if (!scene) return;
    const clonedScene = cloneScene(scene);
    set({
      sceneId: id,
      scene: clonedScene,
      selectedWallIndex: clonedScene.walls.length > 0 ? 0 : null,
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
  selectWall: (index) => set({ selectedWallIndex: index }),
  addWall: () =>
    set((state) => {
      const groundY = state.scene.ground.y;
      const newWall: SceneWall = {
        position: [
          state.playerPosition[0],
          groundY + 2,
          state.playerPosition[2],
        ],
        halfSize: [2, 2, 0.25],
        rotationY: 0,
      };

      return {
        scene: {
          ...state.scene,
          walls: [...state.scene.walls, newWall],
        },
        selectedWallIndex: state.scene.walls.length,
      };
    }),
  removeSelectedWall: () =>
    set((state) => {
      if (state.selectedWallIndex == null) return state;
      const walls = state.scene.walls.filter(
        (_, index) => index !== state.selectedWallIndex,
      );
      return {
        scene: {
          ...state.scene,
          walls,
        },
        selectedWallIndex:
          walls.length === 0
            ? null
            : Math.min(state.selectedWallIndex, walls.length - 1),
      };
    }),
  updateSelectedWall: (updater) =>
    set((state) => {
      if (state.selectedWallIndex == null) return state;
      const walls = state.scene.walls.map((wall, index) => {
        if (index !== state.selectedWallIndex) return wall;
        return updater(cloneWall(wall));
      });
      return {
        scene: {
          ...state.scene,
          walls,
        },
      };
    }),
  setPlayerPosition: (position) => set({ playerPosition: position }),
  requestRespawn: () =>
    set((state) => ({ respawnSignal: state.respawnSignal + 1 })),
}));
