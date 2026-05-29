import { describe, it, expect } from "vitest";
import {
  sceneTransitionOnCollision,
  sceneTransitionOnItemDrop,
  sceneTransitionOnItemConsume,
} from "../src/game/logic/transitions";
import type { GameScene } from "../src/game/types";

describe("scene transition types", () => {
  it("creates a collision transition", () => {
    const t = sceneTransitionOnCollision({
      id: "exit-1",
      targetSceneId: "level-2",
      position: [0, 0, 0],
      halfSize: [1, 2, 1],
    });
    expect(t.kind).toBe("collision");
    expect(t.targetSceneId).toBe("level-2");
    expect(t.id).toBe("exit-1");
  });

  it("creates an item-drop transition", () => {
    const t = sceneTransitionOnItemDrop({
      id: "unlock-room",
      targetSceneId: "personal-room",
      position: [3, 0, 5],
      halfSize: [1, 1, 1],
      requiresItemId: "key",
      consumeItem: false,
    });
    expect(t.kind).toBe("item-drop");
    expect(t.consumeItem).toBe(false);
    expect(t.requiresItemId).toBe("key");
  });

  it("creates an item-consume transition", () => {
    const t = sceneTransitionOnItemConsume({
      id: "use-potion",
      targetSceneId: "cave",
      position: [0, 0, 0],
      halfSize: [1, 1, 1],
      requiresItemId: "potion",
    });
    expect(t.kind).toBe("item-consume");
    expect(t.requiresItemId).toBe("potion");
  });

  it("allows transitions in GameScene definition", () => {
    const scene: GameScene = {
      id: "level-1",
      label: "Level 1",
      background: "/bg.jpg",
      playerSpawn: [0, 0, 0],
      ground: { minX: 0, maxX: 10, minZ: 0, maxZ: 10, y: -1 },
      walls: [],
      interactions: [],
      transitions: [
        sceneTransitionOnCollision({
          id: "exit",
          targetSceneId: "town",
          position: [8, 0, 5],
          halfSize: [1, 2, 1],
        }),
      ],
    };
    expect(scene.transitions).toHaveLength(1);
    expect(scene.transitions![0].kind).toBe("collision");
  });

  it("scene without transitions is backward compatible", () => {
    const scene: GameScene = {
      id: "level-1",
      label: "Level 1",
      background: "/bg.jpg",
      playerSpawn: [0, 0, 0],
      ground: { minX: 0, maxX: 10, minZ: 0, maxZ: 10, y: -1 },
      walls: [],
      interactions: [],
    };
    expect(scene.transitions).toBeUndefined();
  });

  it("collision transition carries optional dialog keys", () => {
    const t = sceneTransitionOnCollision({
      id: "exit",
      targetSceneId: "town",
      position: [0, 0, 0],
      halfSize: [1, 1, 1],
      preTransitionDialogKey: "exit.confirm",
      postTransitionDialogKey: "arrived.town",
    });
    expect(t.preTransitionDialogKey).toBe("exit.confirm");
    expect(t.postTransitionDialogKey).toBe("arrived.town");
  });
});
