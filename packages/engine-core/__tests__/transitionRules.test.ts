import { describe, it, expect } from "vitest";
import { resolveTransitionFromItemDrop } from "../src/game/logic/rules/transitionRules";
import { sceneTransitionOnItemDrop } from "../src/game/logic/transitions";
import type { GameScene } from "../src/game/types";
import type { GameEvent } from "../src/game/events/types";

const baseScene: GameScene = {
  id: "test",
  label: "Test",
  background: "/bg.jpg",
  playerSpawn: [0, 0, 0],
  ground: { minX: 0, maxX: 10, minZ: 0, maxZ: 10, y: -1 },
  walls: [],
  interactions: [],
  transitions: [
    sceneTransitionOnItemDrop({
      id: "unlock-room",
      targetSceneId: "personal-room",
      position: [5, 0, 5],
      halfSize: [1, 1, 1],
      requiresItemId: "key",
      consumeItem: true,
    }),
  ],
};

function makeDropEvent(
  overrides: Partial<Extract<GameEvent, { type: "item:dropped" }>> = {},
): Extract<GameEvent, { type: "item:dropped" }> {
  return {
    type: "item:dropped",
    itemId: "key",
    outcome: "consume",
    interactionId: "unlock-room",
    ...overrides,
  };
}

describe("resolveTransitionFromItemDrop", () => {
  it("returns matching transition when interactionId and itemId match", () => {
    const result = resolveTransitionFromItemDrop(baseScene, makeDropEvent());
    expect(result).not.toBeNull();
    expect(result!.id).toBe("unlock-room");
    expect(result!.targetSceneId).toBe("personal-room");
  });

  it("returns null when interactionId does not match any transition", () => {
    const result = resolveTransitionFromItemDrop(
      baseScene,
      makeDropEvent({ interactionId: "some-other-zone" }),
    );
    expect(result).toBeNull();
  });

  it("returns null when itemId does not match requiresItemId", () => {
    const result = resolveTransitionFromItemDrop(
      baseScene,
      makeDropEvent({ itemId: "wrong-key" }),
    );
    expect(result).toBeNull();
  });

  it("returns transition when requiresItemId is unset (accepts any item)", () => {
    const sceneAny: GameScene = {
      ...baseScene,
      transitions: [
        sceneTransitionOnItemDrop({
          id: "any-item-exit",
          targetSceneId: "other",
          position: [0, 0, 0],
          halfSize: [1, 1, 1],
        }),
      ],
    };
    const result = resolveTransitionFromItemDrop(
      sceneAny,
      makeDropEvent({ interactionId: "any-item-exit", itemId: "whatever" }),
    );
    expect(result).not.toBeNull();
    expect(result!.id).toBe("any-item-exit");
  });

  it("returns null when scene has no transitions", () => {
    const noTransScene: GameScene = { ...baseScene, transitions: undefined };
    const result = resolveTransitionFromItemDrop(noTransScene, makeDropEvent());
    expect(result).toBeNull();
  });

  it("returns null when interactionId is undefined", () => {
    const result = resolveTransitionFromItemDrop(
      baseScene,
      makeDropEvent({ interactionId: undefined }),
    );
    expect(result).toBeNull();
  });
});
