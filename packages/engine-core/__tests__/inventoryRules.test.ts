import { describe, expect, it } from "vitest";

import {
  addOneToInventory,
  removeOneFromSlot,
  resolveInventoryDropHitDecision,
  resolveInventoryDropMissDialogKey,
  resolveInventoryDropOnPlayerMessage,
  resolvePickupPlacedItemDecision,
  type ItemDefinition,
  type ItemInteractionRule,
} from "../src/game/logic/rules/inventoryRules";

const mockItemDefs: Record<string, ItemDefinition> = {
  gameboy: {
    id: "gameboy",
    name: "Gameboy",
    spriteUrl: "/assets/gameboy/gameboy.png",
    descriptionDialogKey: "item.gameboy.description",
    interactionRules: {
      "personal-room-gameboy-drop-target": {
        outcome: "place",
        hitDialogKey: "item.gameboy.drop.personal-room-gameboy-drop-target.hit",
        missDialogKey:
          "item.gameboy.drop.personal-room-gameboy-drop-target.miss",
        placeCanPickup: true,
        placeHasCollision: true,
        placeCollisionHalfSize: [0.38, 0.38, 0.38],
        pickupSuccessDialogKey:
          "item.gameboy.pickup.personal-room-gameboy-drop-target.allowed",
        pickupBlockedDialogKey:
          "item.gameboy.pickup.personal-room-gameboy-drop-target.blocked",
      },
    },
    defaultRule: {
      outcome: "return",
      missDialogKey: "item.gameboy.drop.default.miss",
    },
  },
};

const mockContext = {
  getItemDefinition: (itemId: string) => mockItemDefs[itemId] ?? null,
  resolveItemRule: (itemId: string, interactionId: string): ItemInteractionRule | null => {
    const item = mockItemDefs[itemId];
    if (!item) return null;
    return item.interactionRules[interactionId] ?? item.defaultRule;
  },
};

describe("inventoryRules", () => {
  it("decrementa cantidad al remover una unidad", () => {
    const next = removeOneFromSlot(
      [
        {
          id: "gameboy",
          name: "Gameboy",
          spriteUrl: "/assets/gameboy/gameboy.png",
          quantity: 2,
        },
      ],
      0,
    );

    expect(next[0]?.quantity).toBe(1);
  });

  it("agrega una unidad a stack existente", () => {
    const result = addOneToInventory(
      [
        {
          id: "gameboy",
          name: "Gameboy",
          spriteUrl: "/assets/gameboy/gameboy.png",
          quantity: 1,
        },
      ],
      {
        id: "gameboy",
        name: "Gameboy",
        spriteUrl: "/assets/gameboy/gameboy.png",
      },
    );

    expect(result.added).toBe(true);
    expect(result.slots[0]?.quantity).toBe(2);
  });

  it("resuelve drop-hit place para gameboy en target valido", () => {
    const interaction = {
      id: "personal-room-gameboy-drop-target",
      position: [3.27, -1.65, 19.71] as [number, number, number],
      halfSize: [0.95, 0.55, 0.95] as [number, number, number],
      dialogKeys: {
        hit: "inventoryDropHit",
        miss: "inventoryDropMiss",
      },
    };

    const decision = resolveInventoryDropHitDecision(
      mockContext,
      {
        interaction,
        payload: {
          stack: {
            id: "gameboy",
            name: "Gameboy",
            spriteUrl: "/assets/gameboy/gameboy.png",
          },
          fromSlotIndex: 0,
        },
        now: 123,
      },
    );

    expect(decision.kind).toBe("place");
    if (decision.kind !== "place") return;
    expect(decision.placedItem.id).toBe("gameboy-personal-room-gameboy-drop-target-123");
    expect(decision.dialogKey).toBe("item.gameboy.drop.personal-room-gameboy-drop-target.hit");
  });

  it("usa fallback de miss cuando no hay interaction", () => {
    const key = resolveInventoryDropMissDialogKey(mockContext, {
      payload: {
        stack: {
          id: "gameboy",
          name: "Gameboy",
          spriteUrl: "/assets/gameboy/gameboy.png",
        },
        fromSlotIndex: 0,
      },
      sceneInteractions: [],
    });

    expect(key).toBe("inventoryDropMiss");
  });

  it("describe item al soltarlo sobre el player", () => {
    const message = resolveInventoryDropOnPlayerMessage(mockContext, {
      payload: {
        stack: {
          id: "gameboy",
          name: "Gameboy",
          spriteUrl: "/assets/gameboy/gameboy.png",
        },
        fromSlotIndex: 0,
      },
    });

    expect(message.kind).toBe("dialog-key");
  });

  it("bloquea pickup cuando el item no es levantable", () => {
    const decision = resolvePickupPlacedItemDecision(mockContext, {
      placedItem: {
        id: "placed-1",
        itemId: "gameboy",
        interactionId: "personal-room-gameboy-drop-target",
        name: "Gameboy",
        spriteUrl: "/assets/gameboy/gameboy.png",
        worldPosition: [0, 0, 0],
        canPickup: false,
      },
    });

    expect(decision.kind).toBe("blocked");
  });
});
