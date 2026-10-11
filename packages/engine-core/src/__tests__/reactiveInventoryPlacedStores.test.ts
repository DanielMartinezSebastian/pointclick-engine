import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  useInventoryStateStore,
  getInventoryState,
  usePlacedItemsStateStore,
  getPlacedItemsState,
  selectPlacedItemsForScene,
  loadInventorySlotsState,
  saveInventorySlotsState,
  loadPlacedItemsState,
  savePlacedItemsState,
  type KeyValueStoragePort,
  type PlacedSceneItem,
} from "../index";

function memStorage(initial: Record<string, string> = {}): KeyValueStoragePort & {
  data: Record<string, string>;
} {
  const data = { ...initial };
  return {
    data,
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => {
      data[k] = v;
    },
    removeItem: (k) => {
      delete data[k];
    },
  };
}

const gb = { id: "gameboy", name: "Gameboy", spriteUrl: "/assets/gameboy/gameboy.png" };
const key = { id: "gold-key", name: "Llave dorada", spriteUrl: "/assets/key/gold-key.png" };

function placed(id: string, sceneId?: string): PlacedSceneItem {
  return {
    id,
    itemId: "trophy",
    interactionId: "x",
    name: "Trophy",
    spriteUrl: "/t.png",
    worldPosition: [1, 2, 3],
    canPickup: true,
    sceneId,
  };
}

beforeEach(() => {
  useInventoryStateStore.getState().reset(9);
  usePlacedItemsStateStore.getState().reset();
});

describe("inventory reactive store", () => {
  it("starts with 9 empty slots", () => {
    expect(getInventoryState().slots).toHaveLength(9);
    expect(getInventoryState().slots.every((s) => s === null)).toBe(true);
  });

  it("addItem puts the item in the first empty slot", () => {
    expect(getInventoryState().addItem(gb)).toBe(true);
    expect(getInventoryState().slots[0]).toEqual({ ...gb, quantity: 1 });
  });

  it("addItem stacks an existing id", () => {
    getInventoryState().addItem(gb);
    getInventoryState().addItem(key);
    getInventoryState().addItem(gb);
    expect(getInventoryState().slots[0]?.quantity).toBe(2);
    expect(getInventoryState().slots[1]?.id).toBe("gold-key");
  });

  it("addItem returns false when full and leaves state unchanged", () => {
    useInventoryStateStore.getState().reset(1);
    expect(getInventoryState().addItem(gb)).toBe(true);
    const before = getInventoryState().slots;
    expect(getInventoryState().addItem(key)).toBe(false);
    expect(getInventoryState().slots).toBe(before);
  });

  it("addItem still stacks when otherwise full", () => {
    useInventoryStateStore.getState().reset(1);
    getInventoryState().addItem(gb);
    expect(getInventoryState().addItem(gb)).toBe(true);
    expect(getInventoryState().slots[0]?.quantity).toBe(2);
  });

  it("removeOne decrements then empties the slot", () => {
    getInventoryState().addItem(gb);
    getInventoryState().addItem(gb);
    getInventoryState().removeOne(0);
    expect(getInventoryState().slots[0]?.quantity).toBe(1);
    getInventoryState().removeOne(0);
    expect(getInventoryState().slots[0]).toBeNull();
  });

  it("removeOne on empty/invalid slot is a no-op without notifying", () => {
    const listener = vi.fn();
    const unsub = useInventoryStateStore.subscribe(listener);
    getInventoryState().removeOne(3);
    getInventoryState().removeOne(99);
    expect(listener).not.toHaveBeenCalled();
    unsub();
  });

  it("setSlots replaces all slots", () => {
    getInventoryState().setSlots([{ ...gb, quantity: 3 }, null]);
    expect(getInventoryState().slots).toHaveLength(2);
    expect(getInventoryState().slots[0]?.quantity).toBe(3);
  });

  it("setSlotCount pads and truncates", () => {
    getInventoryState().addItem(gb);
    getInventoryState().setSlotCount(12);
    expect(getInventoryState().slots).toHaveLength(12);
    getInventoryState().setSlotCount(2);
    expect(getInventoryState().slots).toHaveLength(2);
    expect(getInventoryState().slots[0]?.id).toBe("gameboy");
    expect(getInventoryState().slotCount).toBe(2);
  });

  it("reset empties and optionally changes the slot count", () => {
    getInventoryState().addItem(gb);
    getInventoryState().reset(4);
    expect(getInventoryState().slots).toEqual([null, null, null, null]);
  });

  it("subscribers are notified of changes and can unsubscribe", () => {
    const listener = vi.fn();
    const unsub = useInventoryStateStore.subscribe(listener);
    getInventoryState().addItem(gb);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0].slots[0].id).toBe("gameboy");
    unsub();
    getInventoryState().addItem(key);
    expect(listener).toHaveBeenCalledTimes(1);
  });
});

describe("placed items reactive store", () => {
  it("add, remove by id and set", () => {
    const s = getPlacedItemsState();
    s.addItem(placed("a", "s1"));
    s.addItem(placed("b", "s2"));
    expect(getPlacedItemsState().items.map((i) => i.id)).toEqual(["a", "b"]);
    getPlacedItemsState().removeItem("a");
    expect(getPlacedItemsState().items.map((i) => i.id)).toEqual(["b"]);
    getPlacedItemsState().setItems([placed("z")]);
    expect(getPlacedItemsState().items.map((i) => i.id)).toEqual(["z"]);
  });

  it("updateItemPosition changes one axis immutably", () => {
    getPlacedItemsState().addItem(placed("a", "s1"));
    const original = getPlacedItemsState().items[0];
    getPlacedItemsState().updateItemPosition("a", 2, 9);
    expect(getPlacedItemsState().items[0].worldPosition).toEqual([1, 2, 9]);
    expect(original.worldPosition).toEqual([1, 2, 3]);
  });

  it("setItemPosition replaces the whole position", () => {
    getPlacedItemsState().addItem(placed("a", "s1"));
    getPlacedItemsState().setItemPosition("a", [7, 8, 9]);
    expect(getPlacedItemsState().items[0].worldPosition).toEqual([7, 8, 9]);
  });

  it("selectPlacedItemsForScene filters by sceneId", () => {
    const items = [placed("a", "s1"), placed("b", "s2"), placed("c", "s1"), placed("d")];
    expect(selectPlacedItemsForScene(items, "s1").map((i) => i.id)).toEqual(["a", "c"]);
    expect(selectPlacedItemsForScene(items, "none")).toEqual([]);
  });

  it("seeded scenes: mark, query, idempotent", () => {
    expect(getPlacedItemsState().isSceneSeeded("room")).toBe(false);
    getPlacedItemsState().markSceneSeeded("room");
    getPlacedItemsState().markSceneSeeded("room");
    expect(getPlacedItemsState().isSceneSeeded("room")).toBe(true);
    expect(getPlacedItemsState().isSceneSeeded("other")).toBe(false);
    expect(getPlacedItemsState().seededSceneIds).toEqual(["room"]);
  });

  it("reset clears items and seeded scenes", () => {
    getPlacedItemsState().addItem(placed("a", "s1"));
    getPlacedItemsState().markSceneSeeded("s1");
    getPlacedItemsState().reset();
    expect(getPlacedItemsState().items).toEqual([]);
    expect(getPlacedItemsState().seededSceneIds).toEqual([]);
  });

  it("subscribers are notified of changes", () => {
    const listener = vi.fn();
    const unsub = usePlacedItemsStateStore.subscribe(listener);
    getPlacedItemsState().addItem(placed("a", "s1"));
    getPlacedItemsState().markSceneSeeded("s1");
    expect(listener).toHaveBeenCalledTimes(2);
    unsub();
  });
});

describe("persistence by port", () => {
  it("round-trips slots", () => {
    const st = memStorage();
    const slots = [{ ...gb, quantity: 2 }, null, { ...key, quantity: 1 }];
    saveInventorySlotsState(st, slots);
    expect(loadInventorySlotsState(st)).toEqual(slots);
  });

  it("reads the exact legacy slots format (plain JSON array under 'inventory-slots')", () => {
    const st = memStorage({
      "inventory-slots":
        '[{"id":"gameboy","name":"Gameboy","spriteUrl":"/assets/gameboy/gameboy.png","quantity":1},null,null]',
    });
    const slots = loadInventorySlotsState(st);
    expect(slots).toHaveLength(3);
    expect(slots?.[0]?.id).toBe("gameboy");
    expect(slots?.[1]).toBeNull();
  });

  it("writes slots as a plain JSON array under 'inventory-slots'", () => {
    const st = memStorage();
    saveInventorySlotsState(st, [null, null]);
    expect(st.data["inventory-slots"]).toBe("[null,null]");
  });

  it("slots: corrupt JSON, wrong shape and missing key return null", () => {
    expect(loadInventorySlotsState(memStorage({ "inventory-slots": "{oops" }))).toBeNull();
    expect(loadInventorySlotsState(memStorage({ "inventory-slots": '{"a":1}' }))).toBeNull();
    expect(loadInventorySlotsState(memStorage())).toBeNull();
  });

  it("slots: honours a custom key and a throwing port", () => {
    const st = memStorage();
    saveInventorySlotsState(st, [null], "custom");
    expect(loadInventorySlotsState(st, "custom")).toEqual([null]);
    const bad: KeyValueStoragePort = {
      getItem: () => {
        throw new Error("denied");
      },
      setItem: () => {},
    };
    expect(loadInventorySlotsState(bad)).toBeNull();
  });

  it("reads the exact legacy zustand persist format with initialItemsCreated=true", () => {
    const legacy =
      '{"state":{"items":[{"id":"trophy-ground","itemId":"trophy","interactionId":"trophy-ground-pickup","name":"Trophy","spriteUrl":"/assets/trophy/trophy.png","worldPosition":[5.5,-1.3,22],"canPickup":true,"hasCollision":true,"collisionHalfSize":[0.5,0.8,0.5],"sceneId":"personalRoom"}],"initialItemsCreated":true},"version":0}';
    const st = memStorage({ "placed-items-state": legacy });
    const loaded = loadPlacedItemsState(st, { legacySeededSceneId: "personalRoom" });
    expect(loaded?.items).toHaveLength(1);
    expect(loaded?.items[0].id).toBe("trophy-ground");
    expect(loaded?.seededSceneIds).toEqual(["personalRoom"]);
  });

  it("legacy flag true without legacySeededSceneId seeds nothing; false seeds nothing", () => {
    const t = memStorage({
      "placed-items-state": '{"state":{"items":[],"initialItemsCreated":true},"version":0}',
    });
    expect(loadPlacedItemsState(t)?.seededSceneIds).toEqual([]);
    const f = memStorage({
      "placed-items-state": '{"state":{"items":[],"initialItemsCreated":false},"version":0}',
    });
    expect(loadPlacedItemsState(f, { legacySeededSceneId: "room" })?.seededSceneIds).toEqual([]);
  });

  it("round-trips placed items and seeded scenes in the zustand persist wrapper", () => {
    const st = memStorage();
    const data = { items: [placed("a", "s1")], seededSceneIds: ["s1"] };
    savePlacedItemsState(st, data);
    expect(JSON.parse(st.data["placed-items-state"])).toEqual({
      state: data,
      version: 0,
    });
    expect(loadPlacedItemsState(st, { legacySeededSceneId: "ignored" })).toEqual(data);
  });

  it("placed items: corrupt JSON and unexpected shapes return null", () => {
    const k = "placed-items-state";
    expect(loadPlacedItemsState(memStorage({ [k]: "not json" }))).toBeNull();
    expect(loadPlacedItemsState(memStorage({ [k]: "[]" }))).toBeNull();
    expect(loadPlacedItemsState(memStorage({ [k]: '{"state":{"items":3}}' }))).toBeNull();
    expect(loadPlacedItemsState(memStorage({ [k]: '{"version":0}' }))).toBeNull();
    expect(loadPlacedItemsState(memStorage())).toBeNull();
  });

  it("hydrates both stores from persisted data", () => {
    const st = memStorage();
    saveInventorySlotsState(st, [{ ...gb, quantity: 4 }, null]);
    savePlacedItemsState(st, { items: [placed("a", "s1")], seededSceneIds: ["s1"] });
    getInventoryState().setSlots(loadInventorySlotsState(st) ?? []);
    const p = loadPlacedItemsState(st);
    getPlacedItemsState().setItems(p?.items ?? []);
    getPlacedItemsState().setSeededSceneIds(p?.seededSceneIds ?? []);
    expect(getInventoryState().slots[0]?.quantity).toBe(4);
    expect(getPlacedItemsState().isSceneSeeded("s1")).toBe(true);
    expect(selectPlacedItemsForScene(getPlacedItemsState().items, "s1")).toHaveLength(1);
  });
});
