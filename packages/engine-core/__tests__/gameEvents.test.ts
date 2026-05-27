import { describe, it, expect } from "vitest";
import {
  legacyRuntimeEventToGameEvent,
  gameEventToLegacyRuntimeEvent,
} from "../src/game/events/legacyAdapter";
import type { GameEvent, GameEventType } from "../src/game/events/types";
import type { RuntimeEvent } from "../src/game/types";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const moveEvent: RuntimeEvent = {
  type: "onMove",
  position: [1, 0, 2],
  action: "north",
};

const collideEvent: RuntimeEvent = {
  type: "onCollide",
  reason: "boundary",
  position: [3, 0, 4],
};

const dropEvent: RuntimeEvent = {
  type: "onDrop",
  outcome: "consume",
  itemId: "sword",
  interactionId: "chest-1",
};

const dialogEvent: RuntimeEvent = {
  type: "onDialog",
  text: "Hello world",
  dialogKey: "greeting",
  source: "boundary",
};

// ---------------------------------------------------------------------------
// legacyRuntimeEventToGameEvent
// ---------------------------------------------------------------------------

describe("legacyRuntimeEventToGameEvent", () => {
  it("maps onMove → player:moved", () => {
    const ge = legacyRuntimeEventToGameEvent(moveEvent);
    expect(ge.type).toBe("player:moved");
    if (ge.type === "player:moved") {
      expect(ge.position).toEqual([1, 0, 2]);
      expect(ge.action).toBe("north");
    }
  });

  it("maps onCollide → player:collided", () => {
    const ge = legacyRuntimeEventToGameEvent(collideEvent);
    expect(ge.type).toBe("player:collided");
    if (ge.type === "player:collided") {
      expect(ge.reason).toBe("boundary");
      expect(ge.position).toEqual([3, 0, 4]);
    }
  });

  it("maps onDrop → item:dropped", () => {
    const ge = legacyRuntimeEventToGameEvent(dropEvent);
    expect(ge.type).toBe("item:dropped");
    if (ge.type === "item:dropped") {
      expect(ge.itemId).toBe("sword");
      expect(ge.outcome).toBe("consume");
      expect(ge.interactionId).toBe("chest-1");
    }
  });

  it("maps onDialog → dialog:triggered", () => {
    const ge = legacyRuntimeEventToGameEvent(dialogEvent);
    expect(ge.type).toBe("dialog:triggered");
    if (ge.type === "dialog:triggered") {
      expect(ge.text).toBe("Hello world");
      expect(ge.dialogKey).toBe("greeting");
      expect(ge.source).toBe("boundary");
    }
  });
});

// ---------------------------------------------------------------------------
// gameEventToLegacyRuntimeEvent
// ---------------------------------------------------------------------------

describe("gameEventToLegacyRuntimeEvent", () => {
  it("maps player:moved → onMove", () => {
    const legacy = gameEventToLegacyRuntimeEvent({
      type: "player:moved",
      position: [5, 0, 6],
      action: "east",
    });
    expect(legacy).not.toBeNull();
    expect(legacy?.type).toBe("onMove");
    if (legacy?.type === "onMove") {
      expect(legacy.position).toEqual([5, 0, 6]);
      expect(legacy.action).toBe("east");
    }
  });

  it("maps player:collided → onCollide", () => {
    const legacy = gameEventToLegacyRuntimeEvent({
      type: "player:collided",
      reason: "stuck",
      position: [0, 0, 0],
    });
    expect(legacy?.type).toBe("onCollide");
  });

  it("maps item:dropped → onDrop", () => {
    const legacy = gameEventToLegacyRuntimeEvent({
      type: "item:dropped",
      itemId: "potion",
      outcome: "place",
      interactionId: "shelf",
    });
    expect(legacy?.type).toBe("onDrop");
    if (legacy?.type === "onDrop") {
      expect(legacy.itemId).toBe("potion");
      expect(legacy.outcome).toBe("place");
    }
  });

  it("maps dialog:triggered → onDialog", () => {
    const legacy = gameEventToLegacyRuntimeEvent({
      type: "dialog:triggered",
      text: "Test",
      source: "inventory",
    });
    expect(legacy?.type).toBe("onDialog");
  });

  it("returns null for events without legacy equivalent (scene:changed)", () => {
    const ge: GameEvent = {
      type: "scene:changed",
      sceneId: "town",
      scene: {
        id: "town",
        label: "Town",
        background: "/bg.jpg",
        playerSpawn: [0, 0, 0],
        ground: { minX: 0, maxX: 10, minZ: 0, maxZ: 10, y: 0 },
        walls: [],
        interactions: [],
      },
    };
    expect(gameEventToLegacyRuntimeEvent(ge)).toBeNull();
  });

  it("returns null for scene:respawnRequested", () => {
    expect(
      gameEventToLegacyRuntimeEvent({ type: "scene:respawnRequested", sceneId: "a" }),
    ).toBeNull();
  });

  it("returns null for item:pickedUp", () => {
    expect(
      gameEventToLegacyRuntimeEvent({ type: "item:pickedUp", itemId: "x", quantity: 1 }),
    ).toBeNull();
  });

  it("returns null for dialog:dismissed", () => {
    expect(gameEventToLegacyRuntimeEvent({ type: "dialog:dismissed" })).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Exhaustividad: todos los GameEventType aparecen al menos una vez
// ---------------------------------------------------------------------------

describe("GameEventType exhaustiveness", () => {
  const allTypes: GameEventType[] = [
    "scene:changed",
    "scene:respawnRequested",
    "player:moved",
    "player:collided",
    "item:pickedUp",
    "item:dropped",
    "dialog:triggered",
    "dialog:dismissed",
  ];

  it("has 8 distinct GameEvent types", () => {
    expect(allTypes).toHaveLength(8);
  });

  it("all types are distinct strings", () => {
    const unique = new Set(allTypes);
    expect(unique.size).toBe(allTypes.length);
  });
});
