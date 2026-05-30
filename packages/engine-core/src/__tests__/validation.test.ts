import { describe, test, expect } from "vitest";
import { validateEntryPosition, validateWalkPath } from "../game/utils/validation";
import type { GameScene } from "../game/types";

const makeTestScene = (): GameScene => ({
  id: "test-scene",
  label: "Test Scene",
  background: "/test.jpg",
  playerSpawn: [0, 0, 0],
  ground: {
    minX: -10,
    maxX: 10,
    minZ: -10,
    maxZ: 10,
    y: 0,
  },
  walls: [
    {
      position: [5, 0, 0],
      halfSize: [1, 2, 1],
      rotationY: 0,
    },
  ],
  interactions: [],
});

const makeSceneWithWall = (wallPos: [number, number, number]): GameScene => ({
  ...makeTestScene(),
  walls: [
    {
      position: wallPos,
      halfSize: [1, 2, 1],
      rotationY: 0,
    },
  ],
});

describe("validateEntryPosition", () => {
  test("accepts valid position in ground", () => {
    const scene = makeTestScene();
    const result = validateEntryPosition([0, 0, 0], scene);
    expect(result.valid).toBe(true);
  });

  test("accepts position away from walls", () => {
    const scene = makeTestScene();
    const result = validateEntryPosition([-8, 0, -8], scene);
    expect(result.valid).toBe(true);
  });

  test("rejects position outside ground bounds (X positive)", () => {
    const scene = makeTestScene();
    const result = validateEntryPosition([20, 0, 0], scene);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain("outside ground bounds (X)");
  });

  test("rejects position outside ground bounds (X negative)", () => {
    const scene = makeTestScene();
    const result = validateEntryPosition([-20, 0, 0], scene);
    expect(result.valid).toBe(false);
  });

  test("rejects position outside ground bounds (Z positive)", () => {
    const scene = makeTestScene();
    const result = validateEntryPosition([0, 0, 20], scene);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain("outside ground bounds (Z)");
  });

  test("rejects position outside ground bounds (Z negative)", () => {
    const scene = makeTestScene();
    const result = validateEntryPosition([0, 0, -20], scene);
    expect(result.valid).toBe(false);
  });

  test("rejects position with wrong Y", () => {
    const scene = makeTestScene();
    const result = validateEntryPosition([0, 5, 0], scene);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain("Y mismatch");
  });

  test("rejects position inside wall", () => {
    const scene = makeSceneWithWall([5, 0, 0]);
    const result = validateEntryPosition([5, 0, 0], scene);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain("inside wall");
  });

  test("rejects position near wall (buffer)", () => {
    const scene = makeSceneWithWall([5, 0, 0]);
    // Wall is at [5, 0, 0] with halfSize [1, 2, 1]
    // So it extends from x=4 to x=6, z=-1 to z=1
    // With buffer, position [5.2, 0, 0] should be inside buffer zone
    const result = validateEntryPosition([5.2, 0, 0], scene);
    expect(result.valid).toBe(false);
  });
});

describe("validateWalkPath", () => {
  test("accepts reachable path between two valid positions", () => {
    const scene = makeTestScene();
    const result = validateWalkPath([0, 0, 0], [5, 0, 5], scene);
    expect(result.reachable).toBe(true);
    expect(result.path).toBeDefined();
    expect(result.path!.length).toBeGreaterThan(0);
  });

  test("rejects path when start is invalid", () => {
    const scene = makeTestScene();
    const result = validateWalkPath([100, 0, 0], [5, 0, 5], scene);
    expect(result.reachable).toBe(false);
  });

  test("rejects path when destination is invalid", () => {
    const scene = makeTestScene();
    const result = validateWalkPath([0, 0, 0], [100, 0, 0], scene);
    expect(result.reachable).toBe(false);
  });

  test("rejects path when start is inside wall", () => {
    const scene = makeSceneWithWall([0, 0, 0]);
    const result = validateWalkPath([0, 0, 0], [5, 0, 5], scene);
    expect(result.reachable).toBe(false);
  });

  test("rejects path when destination is inside wall", () => {
    const scene = makeSceneWithWall([5, 0, 5]);
    const result = validateWalkPath([0, 0, 0], [5, 0, 5], scene);
    expect(result.reachable).toBe(false);
  });

  test("returns path points for valid path", () => {
    const scene = makeTestScene();
    const result = validateWalkPath([0, 0, 0], [9, 0, 9], scene);
    expect(result.reachable).toBe(true);
    expect(result.path).toEqual([[0, 0, 0], [9, 0, 9]]);
  });
});
