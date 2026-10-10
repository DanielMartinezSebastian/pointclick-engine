import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createInventoryRuleContext,
  getInventoryState,
  getPlacedItemsState,
  type PlacedSceneItem,
} from "@pointclick-engine/engine-core";

import { seedSceneItems } from "../inventory/seedScene";
import { applyPickup, releaseStaleLocks } from "../inventory/pickupHandlers";
import { applyDropMiss } from "../inventory/dropHandlers";
import type { InventoryHandlerEnv } from "../inventory/inventoryRuntimeTypes";

const placed = (id: string, extra: Partial<PlacedSceneItem> = {}): PlacedSceneItem => ({
  id,
  itemId: "thing",
  name: "Thing",
  spriteUrl: "/thing.png",
  worldPosition: [0, 0, 0],
  canPickup: true,
  hasCollision: false,
  collisionHalfSize: [0.5, 0.5, 0.5],
  ...extra,
});

beforeEach(() => {
  getPlacedItemsState().reset();
  getInventoryState().setSlots(Array.from({ length: 3 }, () => null));
});

describe("seedSceneItems", () => {
  it("sin callback no hace nada ni marca la escena", () => {
    expect(seedSceneItems("room", undefined)).toBe(false);
    expect(getPlacedItemsState().isSceneSeeded("room")).toBe(false);
  });

  it("escena ya sembrada: no llama al callback", () => {
    getPlacedItemsState().markSceneSeeded("room");
    const cb = vi.fn(() => [placed("a")]);
    expect(seedSceneItems("room", cb)).toBe(false);
    expect(cb).not.toHaveBeenCalled();
    expect(getPlacedItemsState().items).toHaveLength(0);
  });

  it("no sembrada: anade lo devuelto y marca la escena una sola vez", () => {
    const cb = vi.fn((_id: string, all: PlacedSceneItem[]) => [placed("a", { sceneId: "room" }), ...all.slice(0, 0)]);
    expect(seedSceneItems("room", cb)).toBe(true);
    expect(getPlacedItemsState().items.map((i) => i.id)).toEqual(["a"]);
    expect(getPlacedItemsState().isSceneSeeded("room")).toBe(true);
    expect(seedSceneItems("room", cb)).toBe(false);
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it("el callback recibe todos los items existentes", () => {
    getPlacedItemsState().setItems([placed("x")]);
    const cb = vi.fn(() => [placed("y")]);
    seedSceneItems("room", cb);
    expect(cb).toHaveBeenCalledWith("room", [expect.objectContaining({ id: "x" })]);
    expect(getPlacedItemsState().items.map((i) => i.id)).toEqual(["x", "y"]);
  });

  it("array vacio: marca la escena sin anadir ni reemplazar items", () => {
    const before = getPlacedItemsState().items;
    expect(seedSceneItems("room", () => [])).toBe(true);
    expect(getPlacedItemsState().items).toBe(before);
    expect(getPlacedItemsState().isSceneSeeded("room")).toBe(true);
  });

  it("null: la escena no se siembra ni se marca", () => {
    expect(seedSceneItems("other", () => null)).toBe(false);
    expect(getPlacedItemsState().isSceneSeeded("other")).toBe(false);
  });
});

describe("releaseStaleLocks", () => {
  it("libera solo los ids que ya no estan colocados", () => {
    const lock = new Set(["a", "b"]);
    releaseStaleLocks(lock, [placed("a")]);
    expect([...lock]).toEqual(["a"]);
  });
});

const ITEMS = {
  thing: {
    id: "thing",
    name: "Thing",
    spriteUrl: "/thing.png",
    interactionRules: {},
    defaultRule: { outcome: "return" },
  },
};

function makeEnv(items: Record<string, unknown> = ITEMS) {
  const shown: Array<{ text: string; dialogKey?: string }> = [];
  const clearDrag = vi.fn();
  const env: InventoryHandlerEnv = {
    ctx: createInventoryRuleContext(items as never),
    getPhrase: (key) => `phrase:${key}`,
    showSpeechBubble: (text, meta) => shown.push({ text, dialogKey: meta?.dialogKey }),
    onRuntimeEvent: undefined,
    clearDrag,
  };
  return { env, shown, clearDrag };
}

describe("applyPickup", () => {
  it("con el inventario abierto no hace nada ni bloquea", () => {
    const { env, shown } = makeEnv();
    const lock = new Set<string>();
    applyPickup(env, lock, true, placed("a"));
    expect(lock.size).toBe(0);
    expect(shown).toHaveLength(0);
  });

  it("item ya bloqueado: se ignora", () => {
    const { env, shown } = makeEnv();
    const lock = new Set(["a"]);
    applyPickup(env, lock, false, placed("a"));
    expect(shown).toHaveLength(0);
    expect(lock.has("a")).toBe(true);
  });

  it("item desconocido: ignora y libera el bloqueo", () => {
    const { env, shown } = makeEnv({});
    const lock = new Set<string>();
    getPlacedItemsState().setItems([placed("a")]);
    applyPickup(env, lock, false, placed("a"));
    expect(lock.has("a")).toBe(false);
    expect(shown).toHaveLength(0);
    expect(getPlacedItemsState().items).toHaveLength(1);
  });

  it("item sin canPickup: bloqueado, dialogo por defecto y libera el bloqueo", () => {
    const { env, shown } = makeEnv();
    const lock = new Set<string>();
    const item = placed("a", { canPickup: false });
    getPlacedItemsState().setItems([item]);
    applyPickup(env, lock, false, item);
    expect(shown).toEqual([{ text: "phrase:item.thing.pickup.blocked", dialogKey: "item.thing.pickup.blocked" }]);
    expect(lock.has("a")).toBe(false);
    expect(getPlacedItemsState().items).toHaveLength(1);
  });

  it("recoger: pasa al inventario, sale de los colocados y queda bloqueado hasta que desaparece", () => {
    const { env, shown } = makeEnv();
    const lock = new Set<string>();
    const item = placed("a");
    getPlacedItemsState().setItems([item]);
    applyPickup(env, lock, false, item);
    expect(getInventoryState().slots.filter(Boolean).map((s) => s?.id)).toEqual(["thing"]);
    expect(getPlacedItemsState().items).toHaveLength(0);
    expect(shown).toHaveLength(1);
    expect(lock.has("a")).toBe(true);
    releaseStaleLocks(lock, getPlacedItemsState().items);
    expect(lock.has("a")).toBe(false);
  });

  it("inventario lleno: avisa, no cambia nada y libera el bloqueo", () => {
    const { env, shown } = makeEnv();
    getInventoryState().setSlots([1, 2, 3].map((n) => ({ id: `i${n}`, name: "x", spriteUrl: "", quantity: 1 })));
    const lock = new Set<string>();
    const item = placed("a");
    getPlacedItemsState().setItems([item]);
    applyPickup(env, lock, false, item);
    expect(getPlacedItemsState().items).toHaveLength(1);
    expect(shown).toHaveLength(1);
    expect(lock.has("a")).toBe(false);
  });
});

describe("applyDropMiss", () => {
  it("usa getPhrase con la clave de fallo y limpia el arrastre", () => {
    const { env, shown, clearDrag } = makeEnv();
    applyDropMiss(env, [], { stack: { id: "thing", name: "Thing", spriteUrl: "", quantity: 1 }, fromSlotIndex: 0 });
    expect(shown).toHaveLength(1);
    expect(shown[0].text).toBe(`phrase:${shown[0].dialogKey}`);
    expect(clearDrag).toHaveBeenCalledTimes(1);
  });
});
