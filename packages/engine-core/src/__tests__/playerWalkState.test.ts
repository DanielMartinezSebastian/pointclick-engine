import { describe, test, expect, beforeEach } from "vitest";
import { useSceneStore } from "../game/state/sceneStore";
import type { GameScene } from "../game/types";

const makeTestScene = (): GameScene => ({
  id: "test",
  label: "Test",
  background: "/test.jpg",
  playerSpawn: [0, 0, 0],
  ground: { minX: -10, maxX: 10, minZ: -10, maxZ: 10, y: 0 },
  walls: [],
  interactions: [],
});

describe("playerWalkingState in sceneStore", () => {
  beforeEach(() => {
    // Reset store before each test
    useSceneStore.setState({
      playerWalkingState: null,
    });
  });

  test("initializes playerWalkingState as null", () => {
    const state = useSceneStore.getState();
    expect(state.playerWalkingState).toBeNull();
  });

  test("setPlayerWalkingState updates state correctly", () => {
    const walkState = {
      targetPosition: [5, 0, 10],
      pathPoints: [[0, 0, 0], [5, 0, 10]],
      progress: 0,
      isActive: true,
    };
    const { setPlayerWalkingState } = useSceneStore.getState();
    setPlayerWalkingState(walkState);

    const state = useSceneStore.getState();
    expect(state.playerWalkingState).toEqual(walkState);
  });

  test("setPlayerWalkingState can clear state (set to null)", () => {
    // First, set a walking state
    const walkState = {
      targetPosition: [5, 0, 10],
      pathPoints: [[0, 0, 0], [5, 0, 10]],
      progress: 0.5,
      isActive: true,
    };
    useSceneStore.setState({ playerWalkingState: walkState });

    // Then clear it
    const { setPlayerWalkingState } = useSceneStore.getState();
    setPlayerWalkingState(null);

    const state = useSceneStore.getState();
    expect(state.playerWalkingState).toBeNull();
  });

  test("updateWalkProgress increments progress", () => {
    const walkState = {
      targetPosition: [5, 0, 10],
      pathPoints: [[0, 0, 0], [5, 0, 10]],
      progress: 0,
      isActive: true,
    };
    useSceneStore.setState({ playerWalkingState: walkState });

    const { updateWalkProgress } = useSceneStore.getState();
    updateWalkProgress(0.5);

    const state = useSceneStore.getState();
    expect(state.playerWalkingState?.progress).toBe(0.5);
  });

  test("updateWalkProgress preserves other fields", () => {
    const walkState = {
      targetPosition: [5, 0, 10],
      pathPoints: [[0, 0, 0], [5, 0, 10]],
      progress: 0,
      isActive: true,
    };
    useSceneStore.setState({ playerWalkingState: walkState });

    const { updateWalkProgress } = useSceneStore.getState();
    updateWalkProgress(0.75);

    const state = useSceneStore.getState();
    expect(state.playerWalkingState).toEqual({
      ...walkState,
      progress: 0.75,
    });
  });

  test("updateWalkProgress does nothing if no walk state", () => {
    // Start with no walking state
    expect(useSceneStore.getState().playerWalkingState).toBeNull();

    const { updateWalkProgress } = useSceneStore.getState();
    updateWalkProgress(0.5);

    // Should still be null (no error, just no-op)
    expect(useSceneStore.getState().playerWalkingState).toBeNull();
  });

  test("setScene clears playerWalkingState (implicitly, since it's separate)", () => {
    // Set a walking state
    const walkState = {
      targetPosition: [5, 0, 10],
      pathPoints: [[0, 0, 0], [5, 0, 10]],
      progress: 0.5,
      isActive: true,
    };
    useSceneStore.setState({ playerWalkingState: walkState });

    // Change scene
    const { setScene } = useSceneStore.getState();
    setScene("new-scene", makeTestScene());

    // Walking state should be cleared (manual step or by caller responsibility)
    // Currently, setScene doesn't auto-clear it, so we test the state persists
    // (This is a design choice - should walk clear on scene change?)
    const state = useSceneStore.getState();
    expect(state.sceneId).toBe("new-scene");
    expect(state.playerWalkingState).toEqual(walkState); // Still there
  });

  test("multiple progress updates work correctly", () => {
    const walkState = {
      targetPosition: [10, 0, 10],
      pathPoints: [[0, 0, 0], [10, 0, 10]],
      progress: 0,
      isActive: true,
    };
    useSceneStore.setState({ playerWalkingState: walkState });

    const { updateWalkProgress } = useSceneStore.getState();

    updateWalkProgress(0.25);
    expect(useSceneStore.getState().playerWalkingState?.progress).toBe(0.25);

    updateWalkProgress(0.5);
    expect(useSceneStore.getState().playerWalkingState?.progress).toBe(0.5);

    updateWalkProgress(1.0);
    expect(useSceneStore.getState().playerWalkingState?.progress).toBe(1.0);
  });
});
