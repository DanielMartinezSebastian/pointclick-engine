import { describe, it, expect, beforeEach } from "vitest";
import { useSceneStore } from "../src/game/state/sceneStore";
import { sceneTransitionOnCollision } from "../src/game/logic/transitions";

describe("transition state management", () => {
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
      transitionStates: {},
    });
  });

  it("sets transition available", () => {
    useSceneStore.getState().setTransitionAvailable("exit-1", true);
    expect(useSceneStore.getState().transitionStates["exit-1"].isAvailable).toBe(true);

    useSceneStore.getState().setTransitionAvailable("exit-1", false);
    expect(useSceneStore.getState().transitionStates["exit-1"].isAvailable).toBe(false);
  });

  it("sets item occupying a transition zone", () => {
    useSceneStore.getState().setTransitionItemOccupying("room-unlock", "key");
    expect(useSceneStore.getState().transitionStates["room-unlock"].itemIdOccupying).toBe("key");
  });

  it("clears item occupying when set to undefined", () => {
    useSceneStore.getState().setTransitionItemOccupying("room-unlock", "key");
    useSceneStore.getState().setTransitionItemOccupying("room-unlock", undefined);
    expect(useSceneStore.getState().transitionStates["room-unlock"].itemIdOccupying).toBeUndefined();
  });

  it("preserves other transition state fields when updating availability", () => {
    useSceneStore.getState().setTransitionItemOccupying("exit-1", "potion");
    useSceneStore.getState().setTransitionAvailable("exit-1", false);
    const state = useSceneStore.getState().transitionStates["exit-1"];
    expect(state.isAvailable).toBe(false);
    expect(state.itemIdOccupying).toBe("potion");
  });

  it("clones transitions when setScene is called", () => {
    const original = sceneTransitionOnCollision({
      id: "exit",
      targetSceneId: "town",
      position: [1, 2, 3],
      halfSize: [1, 1, 1],
    });
    useSceneStore.getState().setScene("test", {
      id: "test",
      label: "Test",
      background: "/bg.jpg",
      playerSpawn: [0, 0, 0],
      ground: { minX: 0, maxX: 10, minZ: 0, maxZ: 10, y: -1 },
      walls: [],
      interactions: [],
      transitions: [original],
    });
    const storedTransition = useSceneStore.getState().scene.transitions![0];
    (original.position as [number, number, number])[0] = 99;
    expect(storedTransition.position[0]).toBe(1);
  });
});
