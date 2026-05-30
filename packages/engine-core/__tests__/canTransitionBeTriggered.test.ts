import { describe, it, expect } from "vitest";
import {
  sceneTransitionOnCollision,
  sceneTransitionOnItemDrop,
  sceneTransitionOnItemConsume,
  sceneTransitionOnItemInteraction,
  canTransitionBeTriggered,
} from "../src";
import type { InventoryStackState, PlacedSceneItem } from "../src/game/types";

describe("canTransitionBeTriggered", () => {
  const emptyInventory: (InventoryStackState | null)[] = [null, null, null];
  const emptyScene: PlacedSceneItem[] = [];

  describe("collision transitions", () => {
    it("should always allow collision transitions", () => {
      const transition = sceneTransitionOnCollision({
        id: "exit",
        targetSceneId: "next",
        position: [0, 0, 0],
        halfSize: [5, 2, 5],
      });

      expect(canTransitionBeTriggered(transition, emptyInventory, emptyScene)).toBe(true);
      expect(canTransitionBeTriggered(transition, [], [])).toBe(true);
    });
  });

  describe("item-drop transitions (used to validate scene clearance)", () => {
    it("should allow if no item is required", () => {
      const transition = sceneTransitionOnItemDrop({
        id: "drop-zone",
        targetSceneId: "next",
        position: [0, 0, 0],
        halfSize: [2, 1, 2],
        // No requiresItemId
      });

      expect(canTransitionBeTriggered(transition, emptyInventory, emptyScene)).toBe(true);
    });

    it("should block if required item is still placed in scene (not taken)", () => {
      const transition = sceneTransitionOnItemDrop({
        id: "room-exit",
        targetSceneId: "next",
        position: [0, 0, 0],
        halfSize: [5, 2, 5],
        requiresItemId: "trophy",
      });

      const sceneItems: PlacedSceneItem[] = [
        {
          id: "trophy-1",
          itemId: "trophy",
          interactionId: "pedestal",
          name: "Trophy",
          spriteUrl: "trophy.png",
          worldPosition: [0, 0, 0],
          canPickup: true,
        },
      ];

      // Trophy is still in this room → block departure
      expect(canTransitionBeTriggered(transition, emptyInventory, sceneItems)).toBe(false);
    });

    it("should allow if required item is in inventory (taken from scene)", () => {
      const transition = sceneTransitionOnItemDrop({
        id: "room-exit",
        targetSceneId: "next",
        position: [0, 0, 0],
        halfSize: [5, 2, 5],
        requiresItemId: "trophy",
      });

      const inventory: (InventoryStackState | null)[] = [
        { id: "trophy", name: "Trophy", spriteUrl: "trophy.png", quantity: 1 },
        null,
        null,
      ];

      // Trophy is in inventory → allow departure
      expect(canTransitionBeTriggered(transition, inventory, emptyScene)).toBe(true);
    });

    it("should allow if required item is gone (taken elsewhere)", () => {
      const transition = sceneTransitionOnItemDrop({
        id: "room-exit",
        targetSceneId: "next",
        position: [0, 0, 0],
        halfSize: [5, 2, 5],
        requiresItemId: "trophy",
      });

      // Trophy is not in inventory, not in this scene → already taken/placed elsewhere
      expect(canTransitionBeTriggered(transition, emptyInventory, emptyScene)).toBe(true);
    });
  });

  describe("item-consume transitions", () => {
    it("should always allow item-consume (item status is handled elsewhere)", () => {
      const transition = sceneTransitionOnItemConsume({
        id: "consume-zone",
        targetSceneId: "next",
        position: [0, 0, 0],
        halfSize: [2, 1, 2],
        requiresItemId: "potion",
      });

      expect(canTransitionBeTriggered(transition, emptyInventory, emptyScene)).toBe(true);

      const inventory: (InventoryStackState | null)[] = [
        { id: "potion", name: "Potion", spriteUrl: "potion.png", quantity: 1 },
        null,
        null,
      ];

      expect(canTransitionBeTriggered(transition, inventory, emptyScene)).toBe(true);
    });
  });

  describe("item-interaction transitions", () => {
    it("should allow if required item is in inventory", () => {
      const transition = sceneTransitionOnItemInteraction({
        id: "interact-zone",
        targetSceneId: "next",
        position: [0, 0, 0],
        halfSize: [2, 1, 2],
        requiresItemId: "key",
      });

      const inventory: (InventoryStackState | null)[] = [
        { id: "key", name: "Key", spriteUrl: "key.png", quantity: 1 },
        null,
        null,
      ];

      expect(canTransitionBeTriggered(transition, inventory, emptyScene)).toBe(true);
    });

    it("should allow if required item is placed in scene", () => {
      const transition = sceneTransitionOnItemInteraction({
        id: "interact-zone",
        targetSceneId: "next",
        position: [0, 0, 0],
        halfSize: [2, 1, 2],
        requiresItemId: "trophy",
      });

      const sceneItems: PlacedSceneItem[] = [
        {
          id: "trophy-1",
          itemId: "trophy",
          interactionId: "pedestal",
          name: "Trophy",
          spriteUrl: "trophy.png",
          worldPosition: [0, 0, 0],
          canPickup: true,
        },
      ];

      expect(canTransitionBeTriggered(transition, emptyInventory, sceneItems)).toBe(true);
    });

    it("should block if required item is NOT in inventory nor in scene", () => {
      const transition = sceneTransitionOnItemInteraction({
        id: "interact-zone",
        targetSceneId: "next",
        position: [0, 0, 0],
        halfSize: [2, 1, 2],
        requiresItemId: "key",
      });

      // Key is not available anywhere
      expect(canTransitionBeTriggered(transition, emptyInventory, emptyScene)).toBe(false);
    });
  });

  describe("real-world scenario: trophy left in another room", () => {
    it("should allow personalRoom→dungeon if trophy is NOT in personalRoom (taken/placed elsewhere)", () => {
      const transition = sceneTransitionOnItemDrop({
        id: "personalroom-exit",
        targetSceneId: "dungeon",
        position: [0, 0, 0],
        halfSize: [5, 2, 5],
        requiresItemId: "trophy",
      });

      // Trophy is in town (placed there), not in personalRoom
      const personalRoomItems: PlacedSceneItem[] = [];
      const personalRoomInventory: (InventoryStackState | null)[] = [null, null, null];

      // Should be allowed because trophy requirement is "satisfied" (not here, so must be elsewhere)
      expect(canTransitionBeTriggered(transition, personalRoomInventory, personalRoomItems)).toBe(
        true,
      );
    });

    it("should block personalRoom→dungeon if trophy is still in personalRoom (not taken)", () => {
      const transition = sceneTransitionOnItemDrop({
        id: "personalroom-exit",
        targetSceneId: "dungeon",
        position: [0, 0, 0],
        halfSize: [5, 2, 5],
        requiresItemId: "trophy",
      });

      const personalRoomItems: PlacedSceneItem[] = [
        {
          id: "trophy-1",
          itemId: "trophy",
          interactionId: "pedestal",
          name: "Trophy",
          spriteUrl: "trophy.png",
          worldPosition: [0, 0, 0],
          canPickup: true,
        },
      ];

      // Should be blocked because trophy is still here
      expect(canTransitionBeTriggered(transition, emptyInventory, personalRoomItems)).toBe(false);
    });
  });
});
