import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  cond,
  evaluateCondition as ev,
  getConditionContext,
  getWorldState,
  getInventoryState,
  getPlacedItemsState,
  useSceneStore,
  type Condition,
  type ConditionContext,
  type PlacedSceneItem,
} from "../index";

const stack = (id: string, quantity: number) => ({ id, name: id, spriteUrl: "", quantity });
const placed = (itemId: string, sceneId: string | undefined, interactionId: string): PlacedSceneItem => ({
  id: `${itemId}-${interactionId}`, itemId, interactionId, name: itemId, spriteUrl: "",
  worldPosition: [0, 0, 0], canPickup: false, sceneId,
});
const ctx = (over: Partial<ConditionContext> = {}): ConditionContext => ({
  flags: {},
  inventory: [],
  placedItems: [],
  sceneId: "room",
  visitedSceneIds: [],
  ...over,
});

describe("evaluateCondition: flag", () => {
  it("undefined es verdadero", () => expect(ev(undefined, ctx())).toBe(true));
  it("flag inexistente es falso", () => expect(ev(cond.flag("x"), ctx())).toBe(false));
  it("true / numero != 0 / cadena no vacia son verdaderos", () => {
    expect(ev(cond.flag("x"), ctx({ flags: { x: true } }))).toBe(true);
    expect(ev(cond.flag("x"), ctx({ flags: { x: 2 } }))).toBe(true);
    expect(ev(cond.flag("x"), ctx({ flags: { x: "a" } }))).toBe(true);
  });
  it("false / 0 / cadena vacia son falsos", () => {
    for (const v of [false, 0, ""]) expect(ev(cond.flag("x"), ctx({ flags: { x: v } }))).toBe(false);
  });
  it("equals compara estrictamente", () => {
    const c = ctx({ flags: { x: 3, s: "a" } });
    expect(ev(cond.flag("x", { equals: 3 }), c)).toBe(true);
    expect(ev(cond.flag("x", { equals: "3" }), c)).toBe(false);
    expect(ev(cond.flag("s", { equals: "a" }), c)).toBe(true);
  });
  it("equals contra undefined con flag inexistente", () => {
    expect(ev({ flag: "x", equals: undefined }, ctx())).toBe(true);
    expect(ev(cond.flag("x", { equals: false }), ctx())).toBe(false);
  });
  it("gte / lte", () => {
    const c = ctx({ flags: { n: 3 } });
    expect(ev(cond.flag("n", { gte: 3 }), c)).toBe(true);
    expect(ev(cond.flag("n", { gte: 4 }), c)).toBe(false);
    expect(ev(cond.flag("n", { lte: 3 }), c)).toBe(true);
    expect(ev(cond.flag("n", { lte: 2 }), c)).toBe(false);
  });
  it("gte / lte son falsos si el valor no es numero", () => {
    const c = ctx({ flags: { s: "5", b: true } });
    expect(ev(cond.flag("s", { gte: 0 }), c)).toBe(false);
    expect(ev(cond.flag("b", { lte: 10 }), c)).toBe(false);
    expect(ev(cond.flag("none", { gte: 0 }), c)).toBe(false);
  });
  it("varios operadores deben cumplirse todos", () => {
    const c = ctx({ flags: { n: 5 } });
    expect(ev(cond.flag("n", { gte: 3, lte: 7 }), c)).toBe(true);
    expect(ev(cond.flag("n", { gte: 3, lte: 4 }), c)).toBe(false);
    expect(ev(cond.flag("n", { equals: 5, gte: 6 }), c)).toBe(false);
  });
  it("flag con valor string 'false' es verdadero (cadena no vacia)", () => {
    expect(ev(cond.flag("x"), ctx({ flags: { x: "false" } }))).toBe(true);
  });
  it("nombres tipo prototipo no se heredan", () => {
    expect(ev(cond.flag("toString"), ctx())).toBe(false);
  });
});

describe("evaluateCondition: inventario, items, escenas", () => {
  const inv = [stack("key", 1), null, stack("coin", 2), stack("coin", 3)];
  it("hasItem por defecto equivale a atLeast 1", () => {
    expect(ev(cond.hasItem("key"), ctx({ inventory: inv }))).toBe(true);
    expect(ev(cond.hasItem("gem"), ctx({ inventory: inv }))).toBe(false);
    expect(ev(cond.hasItem("key"), ctx())).toBe(false);
  });
  it("hasItem ignora cantidades de otros ids y atLeast 0 es verdadero", () => {
    expect(ev(cond.hasItem("key", { atLeast: 2 }), ctx({ inventory: inv }))).toBe(false);
    expect(ev(cond.hasItem("gem", { atLeast: 0 }), ctx({ inventory: inv }))).toBe(true);
  });
  it("hasItem atLeast suma cantidades de todos los slots", () => {
    expect(ev(cond.hasItem("coin", { atLeast: 5 }), ctx({ inventory: inv }))).toBe(true);
    expect(ev(cond.hasItem("coin", { atLeast: 6 }), ctx({ inventory: inv }))).toBe(false);
  });
  const items = [placed("trophy", "room", "shelf"), placed("vase", undefined, "table")];
  it("itemPlaced sin restricciones: en cualquier escena", () => {
    expect(ev(cond.itemPlaced("trophy"), ctx({ placedItems: items }))).toBe(true);
    expect(ev(cond.itemPlaced("vase"), ctx({ placedItems: items }))).toBe(true);
    expect(ev(cond.itemPlaced("nope"), ctx({ placedItems: items }))).toBe(false);
  });
  it("itemPlaced inScene / at, combinados con Y", () => {
    const c = ctx({ placedItems: items });
    expect(ev(cond.itemPlaced("trophy", { inScene: "room" }), c)).toBe(true);
    expect(ev(cond.itemPlaced("trophy", { inScene: "town" }), c)).toBe(false);
    expect(ev(cond.itemPlaced("trophy", { at: "shelf" }), c)).toBe(true);
    expect(ev(cond.itemPlaced("trophy", { at: "table" }), c)).toBe(false);
    expect(ev(cond.itemPlaced("trophy", { inScene: "room", at: "shelf" }), c)).toBe(true);
    expect(ev(cond.itemPlaced("trophy", { inScene: "town", at: "shelf" }), c)).toBe(false);
    expect(ev(cond.itemPlaced("vase", { inScene: "room" }), c)).toBe(false);
  });
  it("inScene y visited", () => {
    const c = ctx({ visitedSceneIds: ["town"] });
    expect(ev(cond.inScene("room"), c)).toBe(true);
    expect(ev(cond.inScene("town"), c)).toBe(false);
    expect(ev(cond.visited("town"), c)).toBe(true);
    expect(ev(cond.visited("cave"), c)).toBe(false);
  });
});

describe("evaluateCondition: combinadores", () => {
  const c = ctx({ flags: { a: true, n: 2 }, visitedSceneIds: ["town"] });
  it("all vacio es verdadero, any vacio es falso", () => {
    expect(ev(cond.all(), c)).toBe(true);
    expect(ev(cond.any(), c)).toBe(false);
  });
  it("all / any / not", () => {
    expect(ev(cond.all(cond.flag("a"), cond.visited("town")), c)).toBe(true);
    expect(ev(cond.all(cond.flag("a"), cond.visited("cave")), c)).toBe(false);
    expect(ev(cond.any(cond.flag("zz"), cond.visited("town")), c)).toBe(true);
    expect(ev(cond.any(cond.flag("zz"), cond.visited("cave")), c)).toBe(false);
    expect(ev(cond.not(cond.flag("zz")), c)).toBe(true);
    expect(ev(cond.not(cond.flag("a")), c)).toBe(false);
  });
  it("anidamiento", () => {
    const nested = cond.all(
      cond.not(cond.any(cond.flag("zz"), cond.visited("cave"))),
      cond.any(cond.flag("n", { gte: 2 }), cond.inScene("x")),
    );
    expect(ev(nested, c)).toBe(true);
    expect(ev(cond.not(nested), c)).toBe(false);
  });
  it("all / any con hijos desconocidos no lanzan", () => {
    const bad = { zzz: 1 } as unknown as Condition;
    vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(ev(cond.all(bad), c)).toBe(false);
    expect(ev(cond.any(bad, cond.flag("a")), c)).toBe(true);
  });
  it("not de undefined (verdadero) es falso", () => {
    expect(ev({ not: undefined as unknown as Condition }, c)).toBe(false);
  });
});

describe("constructores", () => {
  it("producen objetos planos esperados", () => {
    expect(cond.flag("x")).toEqual({ flag: "x" });
    expect(cond.flag("n", { gte: 3 })).toEqual({ flag: "n", gte: 3 });
    expect(cond.hasItem("key")).toEqual({ hasItem: "key" });
    expect(cond.hasItem("coin", { atLeast: 2 })).toEqual({ hasItem: "coin", atLeast: 2 });
    expect(cond.itemPlaced("trophy", { inScene: "room" })).toEqual({ itemPlaced: "trophy", inScene: "room" });
    expect(cond.inScene("room")).toEqual({ inScene: "room" });
    expect(cond.visited("town")).toEqual({ visited: "town" });
    expect(cond.all(cond.flag("a"), cond.flag("b"))).toEqual({ all: [{ flag: "a" }, { flag: "b" }] });
    expect(cond.any(cond.flag("a"))).toEqual({ any: [{ flag: "a" }] });
    expect(cond.not(cond.flag("a"))).toEqual({ not: { flag: "a" } });
  });
  it("son serializables a JSON", () => {
    const c = cond.all(cond.flag("n", { gte: 1 }), cond.not(cond.visited("x")));
    expect(JSON.parse(JSON.stringify(c))).toEqual(c);
  });
});
describe("forma desconocida", () => {
  afterEach(() => vi.restoreAllMocks());
  it("evalua a false y avisa una sola vez sin lanzar", async () => {
    vi.resetModules();
    const mod = await import("../game/narrative/conditions");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(mod.evaluateCondition({ foo: 1 } as unknown as Condition, ctx())).toBe(false);
    expect(mod.evaluateCondition({ bar: 2 } as unknown as Condition, ctx())).toBe(false);
    expect(mod.evaluateCondition(null as unknown as Condition, ctx())).toBe(false);
    expect(warn).toHaveBeenCalledTimes(1);
  });
});

describe("getConditionContext", () => {
  beforeEach(() => {
    getWorldState().reset();
    getInventoryState().reset();
    getPlacedItemsState().reset();
    useSceneStore.setState({ sceneId: "" });
  });
  it("lee los stores actuales", () => {
    getWorldState().setFlag("seen", true);
    getWorldState().markSceneVisited("town");
    getPlacedItemsState().addItem(placed("trophy", "room", "shelf"));
    useSceneStore.setState({ sceneId: "room" });
    getInventoryState().addItem({ id: "key", name: "key", spriteUrl: "" });
    const c = getConditionContext();
    expect(c.flags).toEqual({ seen: true });
    expect(c.visitedSceneIds).toEqual(["town"]);
    expect(c.sceneId).toBe("room");
    expect(ev(cond.all(cond.flag("seen"), cond.hasItem("key"), cond.itemPlaced("trophy", { at: "shelf" })), c)).toBe(true);
  });
});
