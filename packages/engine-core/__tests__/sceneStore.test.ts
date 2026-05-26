import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  useSceneStore,
  getSceneState,
  subscribeSceneState,
} from "../src/game/state/sceneStore";
import type { GameScene } from "../src/game/types";

describe("sceneStore", () => {
  beforeEach(() => {
    useSceneStore.setState({
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
    });
  });

  it("can read state without React", () => {
    const state = getSceneState();
    expect(state).toBeDefined();
    expect(state.sceneId).toBe("");
  });

  it("setScene updates sceneId and scene", () => {
    const testScene: GameScene = {
      id: "test-scene",
      label: "Test Scene",
      background: "/test.jpg",
      playerSpawn: [1, 2, 3],
      ground: { minX: -10, maxX: 10, minZ: -10, maxZ: 10, y: 0 },
      walls: [],
      interactions: [],
    };

    useSceneStore.getState().setScene("test-scene", testScene);
    const state = getSceneState();

    expect(state.sceneId).toBe("test-scene");
    expect(state.scene.id).toBe("test-scene");
    expect(state.scene.label).toBe("Test Scene");
    expect(state.playerPosition).toEqual([1, 2, 3]);
  });

  it("can subscribe to state changes without React", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeSceneState(listener);

    const testScene: GameScene = {
      id: "test",
      label: "Test",
      background: "/test.jpg",
      playerSpawn: [0, 0, 0],
      ground: { minX: 0, maxX: 0, minZ: 0, maxZ: 0, y: 0 },
      walls: [],
      interactions: [],
    };

    useSceneStore.getState().setScene("test", testScene);

    expect(listener).toHaveBeenCalled();
    unsubscribe();
  });

  it("setPlayerPosition updates position", () => {
    useSceneStore.getState().setPlayerPosition([5, 6, 7]);
    expect(getSceneState().playerPosition).toEqual([5, 6, 7]);
  });

  it("requestRespawn increments respawnSignal", () => {
    const initialSignal = getSceneState().respawnSignal;
    useSceneStore.getState().requestRespawn();
    expect(getSceneState().respawnSignal).toBe(initialSignal + 1);
  });

  it("clones scene to prevent external mutations", () => {
    const testScene: GameScene = {
      id: "test",
      label: "Test",
      background: "/test.jpg",
      playerSpawn: [0, 0, 0],
      ground: { minX: -10, maxX: 10, minZ: -10, maxZ: 10, y: 0 },
      walls: [{ position: [1, 2, 3], halfSize: [1, 1, 1] }],
      interactions: [],
    };

    useSceneStore.getState().setScene("test", testScene);

    const storedWall = getSceneState().scene.walls[0];
    const originalWall = testScene.walls[0];

    expect(storedWall).toEqual(originalWall);
    expect(storedWall).not.toBe(originalWall);
  });
});
