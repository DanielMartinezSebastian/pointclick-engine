import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import {
  act,
  createGameRuntime,
  getInventoryState,
  getPlacedItemsState,
  getWorldState,
  otherwise,
  type GameEvent,
  type GameEventType,
  type GameItemConfig,
  type GameRuntime,
  type PlacedSceneItem,
} from "../index";
import { HeadlessClock } from "../ports/headlessClock";
import { flush, makeItem, makeScene, resetStores } from "./sequencerHarness";

const interaction = {
  id: "table",
  kind: "drop-target",
  position: [1, 0, 1],
  halfSize: [0.5, 0.5, 0.5],
  dialogKeys: { hit: "t.hit", miss: "t.miss" },
  label: "table",
};

const items: GameItemConfig[] = [
  { ...makeItem("ic-key"), interactionRules: { table: { outcome: "place", placeCanPickup: true } } },
  { ...makeItem("ic-coin"), interactionRules: { table: { outcome: "consume" } } },
  makeItem("ic-gem"), // default: return
  { ...makeItem("ic-bad"), interactionRules: { table: { outcome: "rule-miss" } } },
  {
    ...makeItem("ic-fixed"),
    interactionRules: { table: { outcome: "place", placeCanPickup: false } },
  },
];

let rt: GameRuntime;
let events: GameEvent[];

beforeEach(() => {
  resetStores();
  rt = createGameRuntime({
    scenes: [
      makeScene("ic-a", {
        interactions: [interaction] as never,
        hotspots: [
          {
            id: "altar",
            label: "altar",
            position: [0, 0, 0],
            halfSize: [1, 1, 1],
            useItem: { "ic-coin": [otherwise(act.setFlag("offered"))] },
          },
        ],
      }),
      makeScene("ic-b"),
    ],
    items,
    clock: new HeadlessClock(),
    instantWalk: true,
  });
  rt.executeCommand({ type: "scene:set", sceneId: "ic-a" });
  events = [];
  const types: GameEventType[] = [
    "item:pickedUp",
    "item:dropped",
    "inventory:pickupFailed",
    "hotspot:interacted",
  ];
  for (const t of types) rt.on(t, (e) => events.push(e as GameEvent));
});
afterEach(() => {
  rt.dispose();
  resetStores();
  vi.restoreAllMocks();
});

const give = (id: string) =>
  getInventoryState().addItem({ id, name: id, spriteUrl: `/${id}.png` });
const slotOf = (id: string) => getInventoryState().slots.findIndex((s) => s?.id === id);
const placed = (over: Partial<PlacedSceneItem> = {}): PlacedSceneItem => ({
  id: "p1",
  itemId: "ic-key",
  interactionId: "table",
  name: "ic-key",
  spriteUrl: "/ic-key.png",
  worldPosition: [1, 1, 1],
  canPickup: true,
  sceneId: "ic-a",
  ...over,
});

describe("inventory:pickup", () => {
  it("recoge el primer item colocado de la escena actual", () => {
    getPlacedItemsState().addItem(placed());
    rt.executeCommand({ type: "inventory:pickup", itemId: "ic-key" });
    expect(getPlacedItemsState().items).toEqual([]);
    expect(slotOf("ic-key")).toBeGreaterThanOrEqual(0);
    expect(events).toEqual([{ type: "item:pickedUp", itemId: "ic-key", quantity: 1 }]);
  });

  it("ignora los items colocados en otra escena", () => {
    getPlacedItemsState().addItem(placed({ sceneId: "ic-b" }));
    rt.executeCommand({ type: "inventory:pickup", itemId: "ic-key" });
    expect(getPlacedItemsState().items).toHaveLength(1);
    expect(events).toEqual([
      { type: "inventory:pickupFailed", itemId: "ic-key", reason: "not-found" },
    ]);
  });

  it("con placedItemId recoge ese concreto", () => {
    getPlacedItemsState().addItem(placed({ id: "p1" }));
    getPlacedItemsState().addItem(placed({ id: "p2" }));
    rt.executeCommand({ type: "inventory:pickup", itemId: "ic-key", placedItemId: "p2" });
    expect(getPlacedItemsState().items.map((p) => p.id)).toEqual(["p1"]);
    expect(getInventoryState().slots[0]?.quantity).toBe(1);
  });

  it("bloqueado: no cambia nada y emite pickupFailed blocked", () => {
    getPlacedItemsState().addItem(placed({ canPickup: false }));
    rt.executeCommand({ type: "inventory:pickup", itemId: "ic-key" });
    expect(getPlacedItemsState().items).toHaveLength(1);
    expect(slotOf("ic-key")).toBe(-1);
    expect(events).toEqual([
      { type: "inventory:pickupFailed", itemId: "ic-key", reason: "blocked" },
    ]);
  });

  it("inventario lleno: no cambia nada y emite pickupFailed full", () => {
    for (let i = 0; i < 9; i++) {
      getInventoryState().addItem({ id: `filler-${i}`, name: "f", spriteUrl: "/f.png" });
    }
    getPlacedItemsState().addItem(placed());
    rt.executeCommand({ type: "inventory:pickup", itemId: "ic-key" });
    expect(getPlacedItemsState().items).toHaveLength(1);
    expect(events).toEqual([{ type: "inventory:pickupFailed", itemId: "ic-key", reason: "full" }]);
  });

  it("inexistente: pickupFailed not-found", () => {
    rt.executeCommand({ type: "inventory:pickup", itemId: "ic-key" });
    rt.executeCommand({ type: "inventory:pickup", itemId: "ic-key", placedItemId: "ghost" });
    expect(events.map((e) => (e as { reason: string }).reason)).toEqual(["not-found", "not-found"]);
  });

  it("item no registrado: pickupFailed unknown-item", () => {
    getPlacedItemsState().addItem(placed({ itemId: "mystery" }));
    rt.executeCommand({ type: "inventory:pickup", itemId: "mystery" });
    expect(events).toEqual([
      { type: "inventory:pickupFailed", itemId: "mystery", reason: "unknown-item" },
    ]);
  });
});

describe("inventory:drop", () => {
  it("place: quita del slot y coloca el item en la escena activa", () => {
    give("ic-key");
    rt.executeCommand({
      type: "inventory:drop",
      itemId: "ic-key",
      slotIndex: 0,
      interactionId: "table",
    });
    expect(slotOf("ic-key")).toBe(-1);
    const [item] = getPlacedItemsState().items;
    expect(item).toMatchObject({
      itemId: "ic-key",
      interactionId: "table",
      sceneId: "ic-a",
      canPickup: true,
    });
    expect(events).toEqual([
      { type: "item:dropped", itemId: "ic-key", outcome: "place", interactionId: "table" },
    ]);
  });

  it("place y luego pickup cierran el ciclo", () => {
    give("ic-key");
    rt.executeCommand({
      type: "inventory:drop",
      itemId: "ic-key",
      slotIndex: 0,
      interactionId: "table",
    });
    rt.executeCommand({ type: "inventory:pickup", itemId: "ic-key" });
    expect(slotOf("ic-key")).toBe(0);
    expect(getPlacedItemsState().items).toEqual([]);
  });

  it("consume: quita del slot sin colocar", () => {
    give("ic-coin");
    rt.executeCommand({
      type: "inventory:drop",
      itemId: "ic-coin",
      slotIndex: 0,
      interactionId: "table",
    });
    expect(slotOf("ic-coin")).toBe(-1);
    expect(getPlacedItemsState().items).toEqual([]);
    expect(events).toEqual([
      { type: "item:dropped", itemId: "ic-coin", outcome: "consume", interactionId: "table" },
    ]);
  });

  it("consume solo quita una unidad de un stack", () => {
    give("ic-coin");
    give("ic-coin");
    rt.executeCommand({
      type: "inventory:drop",
      itemId: "ic-coin",
      slotIndex: 0,
      interactionId: "table",
    });
    expect(getInventoryState().slots[0]?.quantity).toBe(1);
  });

  it("return: la regla por defecto devuelve el item sin cambios", () => {
    give("ic-gem");
    rt.executeCommand({
      type: "inventory:drop",
      itemId: "ic-gem",
      slotIndex: 0,
      interactionId: "table",
    });
    expect(slotOf("ic-gem")).toBe(0);
    expect(events).toEqual([
      { type: "item:dropped", itemId: "ic-gem", outcome: "return", interactionId: "table" },
    ]);
  });

  it("rule-miss (regla invalida) se trata como return, sin cambios", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    give("ic-bad");
    rt.executeCommand({
      type: "inventory:drop",
      itemId: "ic-bad",
      slotIndex: 0,
      interactionId: "table",
    });
    expect(slotOf("ic-bad")).toBe(0);
    expect(getPlacedItemsState().items).toEqual([]);
    expect(events).toMatchObject([{ type: "item:dropped", outcome: "return" }]);
  });

  it("sin destino: return sin cambios ni interactionId", () => {
    give("ic-key");
    rt.executeCommand({ type: "inventory:drop", itemId: "ic-key", slotIndex: 0 });
    expect(slotOf("ic-key")).toBe(0);
    expect(events).toEqual([{ type: "item:dropped", itemId: "ic-key", outcome: "return" }]);
  });

  it("interaccion inexistente o slot que no contiene el item: return", () => {
    give("ic-key");
    rt.executeCommand({
      type: "inventory:drop",
      itemId: "ic-key",
      slotIndex: 0,
      interactionId: "ghost",
    });
    rt.executeCommand({
      type: "inventory:drop",
      itemId: "ic-key",
      slotIndex: 5,
      interactionId: "table",
    });
    expect(slotOf("ic-key")).toBe(0);
    expect(events.map((e) => (e as { outcome: string }).outcome)).toEqual(["return", "return"]);
  });

  it("sobre un hotspot equivale a hotspot:interact useItem", async () => {
    give("ic-coin");
    rt.executeCommand({
      type: "inventory:drop",
      itemId: "ic-coin",
      slotIndex: 0,
      hotspotId: "altar",
    });
    await flush();
    expect(getWorldState().flags.offered).toBe(true);
    expect(events).toEqual([
      { type: "hotspot:interacted", hotspotId: "altar", verb: "useItem", itemId: "ic-coin" },
    ]);
    // El guion decide: sin removeItem el item sigue en el inventario.
    expect(slotOf("ic-coin")).toBe(0);
  });

  it("place con canPickup false deja el item fijo y el pickup falla blocked", () => {
    give("ic-fixed");
    rt.executeCommand({
      type: "inventory:drop",
      itemId: "ic-fixed",
      slotIndex: 0,
      interactionId: "table",
    });
    rt.executeCommand({ type: "inventory:pickup", itemId: "ic-fixed" });
    expect(getPlacedItemsState().items).toHaveLength(1);
    expect(events.at(-1)).toMatchObject({ type: "inventory:pickupFailed", reason: "blocked" });
  });
});
