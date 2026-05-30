import { describe, it, expect } from "vitest";
import {
  sceneTransitionOnCollision,
  resolveTransitionFromClickOnCollider,
} from "../src/game/logic";
import type { GameScene } from "../src/game/types";

describe("resolveTransitionFromClickOnCollider", () => {
  const createTestScene = (transitions: any[]): GameScene => ({
    id: "test",
    label: "Test Scene",
    background: "bg",
    playerSpawn: [0, 0, 0],
    ground: { minX: -10, maxX: 10, minZ: -10, maxZ: 10, y: 0 },
    walls: [],
    interactions: [],
    transitions,
  });

  it("should return null if no transitions", () => {
    const scene = createTestScene([]);
    const result = resolveTransitionFromClickOnCollider(scene, 0, 0);
    expect(result).toBeNull();
  });

  it("should detect click inside collision transition zone", () => {
    const transition = sceneTransitionOnCollision({
      id: "exit-1",
      targetSceneId: "next-scene",
      position: [5, 1, 5] as any,
      halfSize: [2, 1, 2] as any,
    });

    const scene = createTestScene([transition]);

    // Click inside the zone (5±2, 5±2)
    const result = resolveTransitionFromClickOnCollider(scene, 5, 5);
    expect(result).not.toBeNull();
    expect(result?.transition.id).toBe("exit-1");
    expect(result?.position).toEqual([5, 1, 5]);
  });

  it("should detect click at the edges of collision zone", () => {
    const transition = sceneTransitionOnCollision({
      id: "exit-2",
      targetSceneId: "another",
      position: [0, 1, 0] as any,
      halfSize: [3, 1, 3] as any,
    });

    const scene = createTestScene([transition]);

    // Click at edge (0±3, 0±3)
    const resultRight = resolveTransitionFromClickOnCollider(scene, 3, 0);
    expect(resultRight).not.toBeNull();

    const resultBottom = resolveTransitionFromClickOnCollider(scene, 0, 3);
    expect(resultBottom).not.toBeNull();

    const resultCorner = resolveTransitionFromClickOnCollider(scene, 3, 3);
    expect(resultCorner).not.toBeNull();
  });

  it("should not detect click outside collision zone", () => {
    const transition = sceneTransitionOnCollision({
      id: "exit-3",
      targetSceneId: "far-away",
      position: [10, 1, 10] as any,
      halfSize: [2, 1, 2] as any,
    });

    const scene = createTestScene([transition]);

    // Click outside (10±2, 10±2)
    const result = resolveTransitionFromClickOnCollider(scene, 20, 20);
    expect(result).toBeNull();
  });

  it("should return the first matching transition if multiple overlap", () => {
    const transition1 = sceneTransitionOnCollision({
      id: "exit-a",
      targetSceneId: "dest-a",
      position: [0, 1, 0] as any,
      halfSize: [5, 1, 5] as any,
    });

    const transition2 = sceneTransitionOnCollision({
      id: "exit-b",
      targetSceneId: "dest-b",
      position: [0, 1, 0] as any,
      halfSize: [3, 1, 3] as any,
    });

    const scene = createTestScene([transition1, transition2]);

    // Click inside both zones
    const result = resolveTransitionFromClickOnCollider(scene, 2, 2);
    expect(result).not.toBeNull();
    // Should return the first matching one
    expect(result?.transition.id).toBe("exit-a");
  });

  it("should ignore non-collision transitions", () => {
    const collisionTransition = sceneTransitionOnCollision({
      id: "collision-exit",
      targetSceneId: "next",
      position: [0, 1, 0] as any,
      halfSize: [2, 1, 2] as any,
    });

    const itemDropTransition = {
      kind: "item-drop",
      id: "drop-target",
      targetSceneId: "after-drop",
      position: [0, 1, 0] as any,
      halfSize: [2, 1, 2] as any,
    } as any;

    const scene = createTestScene([collisionTransition, itemDropTransition]);

    // Click at (0,0) should only match the collision transition
    const result = resolveTransitionFromClickOnCollider(scene, 0, 0);
    expect(result?.transition.id).toBe("collision-exit");
  });

  it("should handle negative coordinates", () => {
    const transition = sceneTransitionOnCollision({
      id: "negative",
      targetSceneId: "somewhere",
      position: [-5, 1, -5] as any,
      halfSize: [2, 1, 2] as any,
    });

    const scene = createTestScene([transition]);

    // Click inside negative zone
    const result = resolveTransitionFromClickOnCollider(scene, -5, -5);
    expect(result).not.toBeNull();
    expect(result?.transition.id).toBe("negative");
  });
});
