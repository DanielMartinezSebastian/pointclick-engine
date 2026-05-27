import { describe, expect, it } from "vitest";

import type { GameSceneWall, GameSceneWallOpening } from "../src/game/types";

describe("Wall types with openings (Phase 6)", () => {
  it("should allow creating a wall without openings (backward compatible)", () => {
    const wall: GameSceneWall = {
      position: [0, 0, 0],
      halfSize: [1, 2, 1],
      rotationY: 0,
    };
    expect(wall.openings).toBeUndefined();
    expect(wall.textureUrl).toBeUndefined();
    expect(wall.texturePosition).toBeUndefined();
  });

  it("should allow creating a wall with a single opening", () => {
    const opening: GameSceneWallOpening = {
      id: "door-1",
      position: [0, 0.5, 0],
      halfSize: [0.5, 1, 0.1],
    };
    const wall: GameSceneWall = {
      position: [5, 0, 5],
      halfSize: [2, 3, 0.2],
      rotationY: Math.PI / 2,
      openings: [opening],
      textureUrl: "/assets/wall-textures/door-frame.png",
      texturePosition: [0, 0, 0],
    };
    expect(wall.openings).toHaveLength(1);
    expect(wall.openings?.[0].id).toBe("door-1");
    expect(wall.textureUrl).toBeDefined();
    expect(wall.texturePosition).toEqual([0, 0, 0]);
  });

  it("should support multiple openings in a wall", () => {
    const wall: GameSceneWall = {
      position: [0, 0, 0],
      halfSize: [3, 2, 0.2],
      rotationY: 0,
      openings: [
        { id: "window-1", position: [-1, 1, 0], halfSize: [0.4, 0.5, 0.1] },
        { id: "window-2", position: [1, 1, 0], halfSize: [0.4, 0.5, 0.1] },
      ],
    };
    expect(wall.openings).toHaveLength(2);
    expect(wall.openings?.[0].id).toBe("window-1");
    expect(wall.openings?.[1].id).toBe("window-2");
  });

  it("should support wall with textureUrl but no openings", () => {
    const wall: GameSceneWall = {
      position: [3, 0, 3],
      halfSize: [2, 2, 0.2],
      rotationY: 0,
      textureUrl: "/assets/wall-textures/brick.png",
    };
    expect(wall.openings).toBeUndefined();
    expect(wall.textureUrl).toBe("/assets/wall-textures/brick.png");
  });
});
