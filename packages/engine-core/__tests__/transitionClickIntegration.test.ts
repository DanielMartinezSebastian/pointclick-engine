import { describe, it, expect } from "vitest";
import {
  sceneTransitionOnCollision,
  findPath,
  resolveTransitionFromClickOnCollider,
} from "../src";
import type { GameScene, GameSceneGround } from "../src/game/types";

describe("Transition click integration", () => {
  const ground: GameSceneGround = {
    minX: -20,
    maxX: 20,
    minZ: -20,
    maxZ: 20,
    y: 0,
  };

  const testScene: GameScene = {
    id: "town",
    label: "Town",
    background: "town.jpg",
    playerSpawn: [0, 0, 0],
    ground,
    walls: [],
    interactions: [],
    transitions: [
      sceneTransitionOnCollision({
        id: "exit-north",
        targetSceneId: "forest",
        position: [0, 0, -15],
        halfSize: [5, 2, 2],
        targetPosition: [0, 0, -5],
      }),
    ],
  };

  it("should detect click on transition zone and provide walkable target", () => {
    const clickX = 0;
    const clickZ = -15;

    // Step 1: Detect that click hit a transition zone
    const match = resolveTransitionFromClickOnCollider(testScene, clickX, clickZ);
    expect(match).not.toBeNull();
    expect(match?.transition.id).toBe("exit-north");

    // Step 2: Use the transition's position as the walk target
    const walkTarget = match!.position;
    const playerStart = testScene.playerSpawn;

    // Step 3: Find a path to the transition
    const route = findPath({
      start: { x: playerStart[0], z: playerStart[2] },
      goal: { x: walkTarget[0], z: walkTarget[2] },
      bounds: ground,
      walls: testScene.walls,
      interactions: testScene.interactions,
    });

    // Step 4: Verify the path exists
    expect(route).toBeDefined();
    expect(route.length).toBeGreaterThan(0);

    // The last waypoint should be at or very close to the transition center
    const lastWaypoint = route[route.length - 1]!;
    const distToTransition = Math.sqrt(
      (lastWaypoint.x - walkTarget[0]) ** 2 +
        (lastWaypoint.z - walkTarget[2]) ** 2,
    );
    expect(distToTransition).toBeLessThan(1); // Within 1 unit
  });

  it("should NOT pathfind if click misses the transition zone", () => {
    const clickX = 15; // Far from the transition at X=-15
    const clickZ = -15;

    // Detect that click missed the transition zone
    const match = resolveTransitionFromClickOnCollider(testScene, clickX, clickZ);
    expect(match).toBeNull();

    // In the real system, it would just click-to-move normally
    // without trying to reach a transition
  });

  it("should work with multiple overlapping transitions (returns first match)", () => {
    const multiTransitionScene: GameScene = {
      ...testScene,
      transitions: [
        sceneTransitionOnCollision({
          id: "exit-1",
          targetSceneId: "dest1",
          position: [0, 0, -10],
          halfSize: [3, 2, 3],
        }),
        sceneTransitionOnCollision({
          id: "exit-2",
          targetSceneId: "dest2",
          position: [0, 0, -10],
          halfSize: [2, 2, 2],
        }),
      ],
    };

    const match = resolveTransitionFromClickOnCollider(
      multiTransitionScene,
      0,
      -10,
    );
    expect(match).not.toBeNull();
    // Should match the first one defined
    expect(match?.transition.id).toBe("exit-1");
  });

  it("should handle edge case: click exactly at zone boundary", () => {
    const match = resolveTransitionFromClickOnCollider(testScene, 5, -15);
    expect(match).not.toBeNull();
    expect(match?.transition.id).toBe("exit-north");

    const matchOutside = resolveTransitionFromClickOnCollider(testScene, 6, -15);
    expect(matchOutside).toBeNull();
  });
});
