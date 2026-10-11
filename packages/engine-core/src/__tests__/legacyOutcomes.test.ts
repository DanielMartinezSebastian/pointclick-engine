import { describe, it, expect } from "vitest";
import { legacyRuntimeEventToGameEvent, gameEventToLegacyRuntimeEvent } from "../game/events/legacyAdapter";
import type { RuntimeEvent } from "../game/types";
import type { GameEvent } from "../game/events/types";

/**
 * Tests that verify all legacy outcome values from onDrop events are correctly
 * preserved when converting between RuntimeEvent and GameEvent representations.
 */
describe("Legacy outcomes preservation", () => {
  describe("Rule results (consume, place, return)", () => {
    it("outcome 'consume' is preserved without modification", () => {
      const runtimeEvent: RuntimeEvent = {
        type: "onDrop",
        outcome: "consume",
        itemId: "potion",
        interactionId: "cauldron-1",
      };

      const gameEvent = legacyRuntimeEventToGameEvent(runtimeEvent);
      expect(gameEvent.type).toBe("item:dropped");
      if (gameEvent.type === "item:dropped") {
        expect(gameEvent.outcome).toBe("consume");
        expect(gameEvent.itemId).toBe("potion");
        expect(gameEvent.interactionId).toBe("cauldron-1");
      }
    });

    it("outcome 'place' is preserved without modification", () => {
      const runtimeEvent: RuntimeEvent = {
        type: "onDrop",
        outcome: "place",
        itemId: "statue",
        interactionId: "pedestal-2",
      };

      const gameEvent = legacyRuntimeEventToGameEvent(runtimeEvent);
      expect(gameEvent.type).toBe("item:dropped");
      if (gameEvent.type === "item:dropped") {
        expect(gameEvent.outcome).toBe("place");
        expect(gameEvent.itemId).toBe("statue");
      }
    });

    it("outcome 'return' is preserved without modification", () => {
      const runtimeEvent: RuntimeEvent = {
        type: "onDrop",
        outcome: "return",
        itemId: "sword",
      };

      const gameEvent = legacyRuntimeEventToGameEvent(runtimeEvent);
      expect(gameEvent.type).toBe("item:dropped");
      if (gameEvent.type === "item:dropped") {
        expect(gameEvent.outcome).toBe("return");
      }
    });
  });

  describe("No matching rule outcomes (rule-miss, unknown-item, on-player)", () => {
    it("outcome 'rule-miss' is preserved without modification", () => {
      const runtimeEvent: RuntimeEvent = {
        type: "onDrop",
        outcome: "rule-miss",
        itemId: "key",
        interactionId: "door-1",
      };

      const gameEvent = legacyRuntimeEventToGameEvent(runtimeEvent);
      expect(gameEvent.type).toBe("item:dropped");
      if (gameEvent.type === "item:dropped") {
        expect(gameEvent.outcome).toBe("rule-miss");
      }
    });

    it("outcome 'unknown-item' is preserved without modification", () => {
      const runtimeEvent: RuntimeEvent = {
        type: "onDrop",
        outcome: "unknown-item",
        itemId: "mystery-object",
        interactionId: "table-1",
      };

      const gameEvent = legacyRuntimeEventToGameEvent(runtimeEvent);
      expect(gameEvent.type).toBe("item:dropped");
      if (gameEvent.type === "item:dropped") {
        expect(gameEvent.outcome).toBe("unknown-item");
      }
    });

    it("outcome 'on-player' is preserved without modification", () => {
      const runtimeEvent: RuntimeEvent = {
        type: "onDrop",
        outcome: "on-player",
        itemId: "coin",
      };

      const gameEvent = legacyRuntimeEventToGameEvent(runtimeEvent);
      expect(gameEvent.type).toBe("item:dropped");
      if (gameEvent.type === "item:dropped") {
        expect(gameEvent.outcome).toBe("on-player");
      }
    });
  });

  describe("Legacy outcomes (pickup-blocked, item-interact)", () => {
    it("deprecated outcome 'pickup-blocked' is preserved for backward compatibility", () => {
      const runtimeEvent: RuntimeEvent = {
        type: "onDrop",
        outcome: "pickup-blocked",
        itemId: "vase",
        interactionId: "shelf-1",
      };

      const gameEvent = legacyRuntimeEventToGameEvent(runtimeEvent);
      expect(gameEvent.type).toBe("item:dropped");
      if (gameEvent.type === "item:dropped") {
        expect(gameEvent.outcome).toBe("pickup-blocked");
        expect(gameEvent.itemId).toBe("vase");
      }
    });

    it("deprecated outcome 'item-interact' is preserved for backward compatibility", () => {
      const runtimeEvent: RuntimeEvent = {
        type: "onDrop",
        outcome: "item-interact",
        itemId: "painting",
        interactionId: "wall-1",
      };

      const gameEvent = legacyRuntimeEventToGameEvent(runtimeEvent);
      expect(gameEvent.type).toBe("item:dropped");
      if (gameEvent.type === "item:dropped") {
        expect(gameEvent.outcome).toBe("item-interact");
      }
    });
  });

  describe("Reverse mapping preserves all outcomes", () => {
    it("reverses item:dropped with consume back to onDrop", () => {
      const gameEvent: GameEvent = {
        type: "item:dropped",
        itemId: "potion",
        outcome: "consume",
        interactionId: "cauldron",
      };

      const runtimeEvent = gameEventToLegacyRuntimeEvent(gameEvent);
      expect(runtimeEvent?.type).toBe("onDrop");
      if (runtimeEvent?.type === "onDrop") {
        expect(runtimeEvent.outcome).toBe("consume");
        expect(runtimeEvent.itemId).toBe("potion");
      }
    });

    it("reverses item:dropped with rule-miss back to onDrop", () => {
      const gameEvent: GameEvent = {
        type: "item:dropped",
        itemId: "key",
        outcome: "rule-miss",
        interactionId: "door",
      };

      const runtimeEvent = gameEventToLegacyRuntimeEvent(gameEvent);
      expect(runtimeEvent?.type).toBe("onDrop");
      if (runtimeEvent?.type === "onDrop") {
        expect(runtimeEvent.outcome).toBe("rule-miss");
      }
    });

    it("reverses item:dropped with pickup-blocked back to onDrop", () => {
      const gameEvent: GameEvent = {
        type: "item:dropped",
        itemId: "vase",
        outcome: "pickup-blocked",
        interactionId: "shelf",
      };

      const runtimeEvent = gameEventToLegacyRuntimeEvent(gameEvent);
      expect(runtimeEvent?.type).toBe("onDrop");
      if (runtimeEvent?.type === "onDrop") {
        expect(runtimeEvent.outcome).toBe("pickup-blocked");
      }
    });
  });
});
