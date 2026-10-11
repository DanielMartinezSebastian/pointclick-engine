import { describe, expect, it } from "vitest";

import {
  resolveInventoryDropHitDecision,
  resolveInventoryDropMissDialogKey,
  resolveInventoryDropOnPlayerMessage,
  resolvePickupPlacedItemDecision,
  type ItemDefinition,
  type ItemInteractionRule,
} from "../game/logic/rules/inventoryRules";

// Paridad con la version de la demo (referencia de comportamiento): los
// fallbacks de dialogKey usan `??` (solo null/undefined), nunca `||`.

const items: Record<string, ItemDefinition> = {
  key: {
    id: "key",
    name: "Llave",
    spriteUrl: "/key.png",
    interactionRules: {
      door: { outcome: "consume", hitDialogKey: "item.key.hit" as never },
      empty: { outcome: "consume", hitDialogKey: "" as never },
      "empty-place": { outcome: "place", hitDialogKey: "" as never },
      "empty-return": { outcome: "return", hitDialogKey: "" as never, missDialogKey: "miss" as never },
      "empty-miss": { outcome: "return", missDialogKey: "" as never },
    },
    defaultRule: { outcome: "return", missDialogKey: "item.key.default.miss" as never },
  },
};

const ctx = {
  getItemDefinition: (id: string) => items[id] ?? null,
  resolveItemRule: (id: string, interactionId: string): ItemInteractionRule | null => {
    const item = items[id];
    if (!item) return null;
    return item.interactionRules[interactionId] ?? item.defaultRule;
  },
};

const payload = { stack: { id: "key", name: "Llave", spriteUrl: "/key.png" }, fromSlotIndex: 2 };
const base = { position: [0, 0, 0] as [number, number, number], halfSize: [1, 1, 1] as [number, number, number] };
const dialogKeys = { hit: "scene.hit", miss: "scene.miss" };

describe("inventoryRules paridad con la demo", () => {
  it("consume: hitDialogKey vacio se respeta (no cae a la escena)", () => {
    const d = resolveInventoryDropHitDecision(ctx, {
      interaction: { ...base, id: "empty", dialogKeys } as never,
      payload,
      now: 1,
    });
    expect(d).toEqual({ kind: "consume", fromSlotIndex: 2, dialogKey: "" });
  });

  it("place: hitDialogKey vacio se respeta", () => {
    const d = resolveInventoryDropHitDecision(ctx, {
      interaction: { ...base, id: "empty-place", dialogKeys } as never,
      payload,
      now: 1,
    });
    expect(d.kind).toBe("place");
    if (d.kind !== "place") return;
    expect(d.dialogKey).toBe("");
  });

  it("return: hitDialogKey vacio se respeta (no cae a missDialogKey)", () => {
    const d = resolveInventoryDropHitDecision(ctx, {
      interaction: { ...base, id: "empty-return", dialogKeys } as never,
      payload,
      now: 1,
    });
    expect(d).toEqual({ kind: "return", dialogKey: "" });
  });

  it("rule-miss: dialogKeys.miss vacio de la escena se respeta", () => {
    const d = resolveInventoryDropHitDecision(
      { ...ctx, resolveItemRule: () => null },
      { interaction: { ...base, id: "x", dialogKeys: { hit: "h", miss: "" } } as never, payload, now: 1 },
    );
    expect(d).toEqual({ kind: "rule-miss", dialogKey: "" });
  });

  it("drop miss: missDialogKey vacio de la regla se respeta", () => {
    const key = resolveInventoryDropMissDialogKey(ctx, {
      payload,
      interaction: { ...base, id: "empty-miss", dialogKeys } as never,
      sceneInteractions: [],
    });
    expect(key).toBe("");
  });

  it("drop miss: orden regla > interaction > primer drop-target > default", () => {
    const targets = [{ ...base, kind: "drop-target", dialogKeys: { hit: "h", miss: "first.miss" } }] as never;
    expect(
      resolveInventoryDropMissDialogKey(ctx, {
        payload,
        interaction: { ...base, id: "unknown", dialogKeys } as never,
        sceneInteractions: targets,
      }),
    ).toBe("item.key.default.miss");
    expect(
      resolveInventoryDropMissDialogKey({ ...ctx, resolveItemRule: () => null }, {
        payload,
        interaction: { ...base, id: "u", dialogKeys } as never,
        sceneInteractions: targets,
      }),
    ).toBe("scene.miss");
    expect(
      resolveInventoryDropMissDialogKey(ctx, { payload, sceneInteractions: targets }),
    ).toBe("first.miss");
  });

  it("pickup: dialogKeys vacios en el item colocado se respetan", () => {
    const blocked = resolvePickupPlacedItemDecision(ctx, {
      placedItem: {
        id: "p", itemId: "key", interactionId: "door", name: "Llave", spriteUrl: "/k.png",
        worldPosition: [0, 0, 0], canPickup: false, pickupBlockedDialogKey: "" as never,
      },
    });
    expect(blocked).toEqual({ kind: "blocked", dialogKey: "" });
    const allowed = resolvePickupPlacedItemDecision(ctx, {
      placedItem: {
        id: "p", itemId: "key", interactionId: "door", name: "Llave", spriteUrl: "/k.png",
        worldPosition: [0, 0, 0], canPickup: true, pickupSuccessDialogKey: "" as never,
      },
    });
    expect(allowed.kind === "allow" && allowed.successDialogKey).toBe("");
  });

  it("pickup: claves por defecto item.<id>.pickup.<tipo>", () => {
    const placedItem = {
      id: "p", itemId: "key", interactionId: "door", name: "Llave", spriteUrl: "/k.png",
      worldPosition: [0, 0, 0] as [number, number, number],
    };
    expect(resolvePickupPlacedItemDecision(ctx, { placedItem: { ...placedItem, canPickup: false } }))
      .toEqual({ kind: "blocked", dialogKey: "item.key.pickup.blocked" });
    const ok = resolvePickupPlacedItemDecision(ctx, { placedItem: { ...placedItem, canPickup: true } });
    expect(ok.kind === "allow" && ok.successDialogKey).toBe("item.key.pickup.allowed");
    expect(resolvePickupPlacedItemDecision(ctx, { placedItem: { ...placedItem, itemId: "nope", canPickup: true } }))
      .toEqual({ kind: "ignore" });
  });

  it("drop sobre player: item desconocido y item sin descriptionDialogKey", () => {
    expect(
      resolveInventoryDropOnPlayerMessage(ctx, { payload: { ...payload, stack: { ...payload.stack, id: "zz" } } }),
    ).toEqual({ kind: "text", text: "No conozco este item todavía." });
    expect(resolveInventoryDropOnPlayerMessage(ctx, { payload })).toEqual({ kind: "text", text: "Es Llave." });
  });

  it("drop hit: item desconocido -> unknown-item", () => {
    const d = resolveInventoryDropHitDecision(ctx, {
      interaction: { ...base, id: "door", dialogKeys } as never,
      payload: { ...payload, stack: { ...payload.stack, id: "zz" } },
      now: 1,
    });
    expect(d.kind).toBe("unknown-item");
  });
});
