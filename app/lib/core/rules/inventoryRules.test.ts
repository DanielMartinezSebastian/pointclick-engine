import { describe, expect, it } from "vitest";

import {
  addOneToInventory,
  removeOneFromSlot,
  resolveInventoryDropHitDecision,
  resolveInventoryDropMissDialogKey,
  resolveInventoryDropOnPlayerMessage,
  resolvePickupPlacedItemDecision,
} from "./inventoryRules";

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
      kind: "drop-target",
      label: "Soporte del Gameboy",
      position: [3.27, -1.65, 19.71] as [number, number, number],
      halfSize: [0.95, 0.55, 0.95] as [number, number, number],
      hasCollision: true,
      acceptsItemIds: ["gameboy"],
      dialogKeys: {
        hit: "inventoryDropHit",
        miss: "inventoryDropMiss",
      },
    };

    const decision = resolveInventoryDropHitDecision({
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
    });

    expect(decision.kind).toBe("place");
    if (decision.kind !== "place") return;
    expect(decision.placedItem.id).toBe("gameboy-personal-room-gameboy-drop-target-123");
    expect(decision.dialogKey).toBe("item.gameboy.drop.personal-room-gameboy-drop-target.hit");
  });

  it("usa fallback de miss cuando no hay interaction", () => {
    const key = resolveInventoryDropMissDialogKey({
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
    const message = resolveInventoryDropOnPlayerMessage({
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
    const decision = resolvePickupPlacedItemDecision({
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
