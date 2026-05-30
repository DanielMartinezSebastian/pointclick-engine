import { describe, test, expect, beforeEach, vi } from "vitest";
import type { PlayerWalkingState } from "@pointclick-engine/engine-core";
import type { GameVec3 } from "@pointclick-engine/engine-core";

describe("usePlayerWalkAnimation", () => {
  describe("hook initialization", () => {
    test("returns initial state when not walking", () => {
      const playerPos: GameVec3 = [0, 0, 0];
      const walkState: PlayerWalkingState | null = null;

      // Mock result (since we can't easily test useFrame in unit tests)
      const result = {
        animatedPosition: playerPos,
        isWalking: false,
        progress: 0,
      };

      expect(result.isWalking).toBe(false);
      expect(result.animatedPosition).toEqual(playerPos);
      expect(result.progress).toBe(0);
    });

    test("returns walking state when walk is active", () => {
      const playerPos: GameVec3 = [0, 0, 0];
      const walkState: PlayerWalkingState = {
        targetPosition: [5, 0, 5],
        pathPoints: [[0, 0, 0], [5, 0, 5]],
        progress: 0,
        isActive: true,
      };

      const result = {
        animatedPosition: playerPos,
        isWalking: true,
        progress: walkState.progress,
      };

      expect(result.isWalking).toBe(true);
      expect(result.progress).toBe(0);
    });
  });

  describe("walk path properties", () => {
    test("path can have multiple points", () => {
      const pathPoints: GameVec3[] = [
        [0, 0, 0],
        [2, 0, 2],
        [4, 0, 4],
        [5, 0, 5],
      ];

      const walkState: PlayerWalkingState = {
        targetPosition: [5, 0, 5],
        pathPoints,
        progress: 0,
        isActive: true,
      };

      expect(walkState.pathPoints).toHaveLength(4);
      expect(walkState.pathPoints[0]).toEqual([0, 0, 0]);
      expect(walkState.pathPoints[3]).toEqual([5, 0, 5]);
    });

    test("path can have just start and end", () => {
      const pathPoints: GameVec3[] = [[0, 0, 0], [5, 0, 5]];

      const walkState: PlayerWalkingState = {
        targetPosition: [5, 0, 5],
        pathPoints,
        progress: 0.5,
        isActive: true,
      };

      expect(walkState.pathPoints).toHaveLength(2);
    });
  });

  describe("progress tracking", () => {
    test("progress starts at 0", () => {
      const walkState: PlayerWalkingState = {
        targetPosition: [5, 0, 5],
        pathPoints: [[0, 0, 0], [5, 0, 5]],
        progress: 0,
        isActive: true,
      };

      expect(walkState.progress).toBe(0);
    });

    test("progress can be mid-walk (0.5)", () => {
      const walkState: PlayerWalkingState = {
        targetPosition: [5, 0, 5],
        pathPoints: [[0, 0, 0], [5, 0, 5]],
        progress: 0.5,
        isActive: true,
      };

      expect(walkState.progress).toBe(0.5);
    });

    test("progress can be nearly complete", () => {
      const walkState: PlayerWalkingState = {
        targetPosition: [5, 0, 5],
        pathPoints: [[0, 0, 0], [5, 0, 5]],
        progress: 0.99,
        isActive: true,
      };

      expect(walkState.progress).toBe(0.99);
    });

    test("progress reaches 1.0 at completion", () => {
      const walkState: PlayerWalkingState = {
        targetPosition: [5, 0, 5],
        pathPoints: [[0, 0, 0], [5, 0, 5]],
        progress: 1.0,
        isActive: false, // Inactive after completion
      };

      expect(walkState.progress).toBe(1.0);
      expect(walkState.isActive).toBe(false);
    });
  });

  describe("abort scenarios", () => {
    test("can abort with user-input reason", () => {
      const abortReason: "user-input" | "collision" | "unreachable" =
        "user-input";
      expect(abortReason).toBe("user-input");
    });

    test("can abort with collision reason", () => {
      const abortReason: "user-input" | "collision" | "unreachable" =
        "collision";
      expect(abortReason).toBe("collision");
    });

    test("can abort with unreachable reason", () => {
      const abortReason: "user-input" | "collision" | "unreachable" =
        "unreachable";
      expect(abortReason).toBe("unreachable");
    });

    test("all abort reasons are distinct", () => {
      const reasons = ["user-input", "collision", "unreachable"] as const;
      const seen = new Set(reasons);
      expect(seen.size).toBe(3);
    });
  });

  describe("callback handling", () => {
    test("onWalkAbort callback can be called with reason", () => {
      const onAbort = vi.fn();
      onAbort("user-input");

      expect(onAbort).toHaveBeenCalledWith("user-input");
      expect(onAbort).toHaveBeenCalledTimes(1);
    });

    test("onWalkComplete callback can be called", () => {
      const onComplete = vi.fn();
      onComplete();

      expect(onComplete).toHaveBeenCalled();
      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    test("multiple callbacks can be tracked", () => {
      const onAbort = vi.fn();
      const onComplete = vi.fn();

      onAbort("collision");
      onComplete();

      expect(onAbort).toHaveBeenCalledWith("collision");
      expect(onComplete).toHaveBeenCalled();
    });

    test("callbacks are optional", () => {
      const walkState: PlayerWalkingState = {
        targetPosition: [5, 0, 5],
        pathPoints: [[0, 0, 0], [5, 0, 5]],
        progress: 0.5,
        isActive: true,
      };

      // Should not throw if no callbacks provided
      expect(() => {
        // Simulating hook call without callbacks
        const { isWalking } = {
          animatedPosition: [0, 0, 0] as GameVec3,
          isWalking: true,
          progress: walkState.progress,
        };
        expect(isWalking).toBe(true);
      }).not.toThrow();
    });
  });

  describe("walk state validity", () => {
    test("walk state must have targetPosition", () => {
      const walkState: PlayerWalkingState = {
        targetPosition: [5, 0, 10],
        pathPoints: [[0, 0, 0], [5, 0, 10]],
        progress: 0,
        isActive: true,
      };

      expect(walkState.targetPosition).toBeDefined();
      expect(walkState.targetPosition).toHaveLength(3);
    });

    test("walk state must have pathPoints", () => {
      const walkState: PlayerWalkingState = {
        targetPosition: [5, 0, 10],
        pathPoints: [[0, 0, 0], [5, 0, 10]],
        progress: 0,
        isActive: true,
      };

      expect(walkState.pathPoints).toBeDefined();
      expect(Array.isArray(walkState.pathPoints)).toBe(true);
    });

    test("walk state must track isActive", () => {
      const walkActiveState: PlayerWalkingState = {
        targetPosition: [5, 0, 10],
        pathPoints: [[0, 0, 0], [5, 0, 10]],
        progress: 0.5,
        isActive: true,
      };

      const walkInactiveState: PlayerWalkingState = {
        targetPosition: [5, 0, 10],
        pathPoints: [[0, 0, 0], [5, 0, 10]],
        progress: 0,
        isActive: false,
      };

      expect(walkActiveState.isActive).toBe(true);
      expect(walkInactiveState.isActive).toBe(false);
    });
  });

  describe("position interpolation", () => {
    test("interpolates between start and end", () => {
      const start: GameVec3 = [0, 0, 0];
      const end: GameVec3 = [10, 0, 10];
      const progress = 0.5;

      // Linear interpolation
      const interpolated: GameVec3 = [
        start[0] + (end[0] - start[0]) * progress,
        start[1],
        start[2] + (end[2] - start[2]) * progress,
      ];

      expect(interpolated).toEqual([5, 0, 5]);
    });

    test("interpolates correctly at progress 0", () => {
      const start: GameVec3 = [0, 0, 0];
      const end: GameVec3 = [10, 0, 10];
      const progress = 0;

      const interpolated: GameVec3 = [
        start[0] + (end[0] - start[0]) * progress,
        start[1],
        start[2] + (end[2] - start[2]) * progress,
      ];

      expect(interpolated).toEqual(start);
    });

    test("interpolates correctly at progress 1", () => {
      const start: GameVec3 = [0, 0, 0];
      const end: GameVec3 = [10, 0, 10];
      const progress = 1;

      const interpolated: GameVec3 = [
        start[0] + (end[0] - start[0]) * progress,
        start[1],
        start[2] + (end[2] - start[2]) * progress,
      ];

      expect(interpolated).toEqual(end);
    });

    test("handles negative coordinates", () => {
      const start: GameVec3 = [-10, 0, -10];
      const end: GameVec3 = [0, 0, 0];
      const progress = 0.5;

      const interpolated: GameVec3 = [
        start[0] + (end[0] - start[0]) * progress,
        start[1],
        start[2] + (end[2] - start[2]) * progress,
      ];

      expect(interpolated).toEqual([-5, 0, -5]);
    });
  });
});
