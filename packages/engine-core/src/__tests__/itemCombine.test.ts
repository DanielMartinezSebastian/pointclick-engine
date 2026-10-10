import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  act,
  branch,
  cond,
  createGameRuntime,
  getInventoryState,
  getWorldState,
  otherwise,
  type GameEvent,
  type GameEventType,
  type GameRuntime,
  type GameItemConfig,
  type GameSceneConfig,
} from "../index";
import { HeadlessClock } from "../ports/headlessClock";
import { flush, makeItem, makeScene, resetStores } from "./sequencerHarness";

let rt: GameRuntime;
let events: GameEvent[];

function start(items: GameItemConfig[] = []) {
  const scenes: GameSceneConfig[] = [makeScene("s")];
  rt = createGameRuntime({
    scenes,
    items,
    clock: new HeadlessClock(),
    instantWalk: true,
  });
  rt.executeCommand({ type: "scene:set", sceneId: "s" });
  events = [];
  const types: GameEventType[] = ["item:combined", "item:combineFailed", "custom"];
  for (const t of types) rt.on(t, (e) => events.push(e as GameEvent));
}

const combine = async (itemId: string, withItemId: string) => {
  rt.executeCommand({ type: "inventory:combine", itemId, withItemId });
  await flush();
};

const addItem = (id: string) =>
  getInventoryState().addItem({ id, name: id, spriteUrl: `/${id}.png` });

const customNames = () =>
  events.filter((e) => e.type === "custom").map((e) => (e as { name: string }).name);

const ofType = (t: string) => events.filter((e) => e.type === t);

beforeEach(resetStores);
afterEach(() => {
  rt?.dispose();
  resetStores();
  vi.restoreAllMocks();
});

describe("inventory:combine", () => {
  it("combina dos ítems y ejecuta el guion del primero", async () => {
    const rope = {
      ...makeItem("rope"),
      combine: {
        hook: [otherwise(act.emit("ropeHook"), act.removeItem("rope"), act.removeItem("hook"), act.giveItem("grapple"))],
      },
    };
    const hook = makeItem("hook");
    const grapple = makeItem("grapple");
    start([rope, hook, grapple]);
    addItem("rope");
    addItem("hook");
    await combine("rope", "hook");
    expect(customNames()).toEqual(["ropeHook"]);
    expect(getInventoryState().slots.some((s) => s?.id === "grapple")).toBe(true);
    expect(getInventoryState().slots.some((s) => s?.id === "rope")).toBe(false);
    expect(getInventoryState().slots.some((s) => s?.id === "hook")).toBe(false);
  });

  it("combina ítems cuando la regla está en el segundo ítem (simetría)", async () => {
    const rope = makeItem("rope");
    const hook = {
      ...makeItem("hook"),
      combine: {
        rope: [otherwise(act.emit("combined"))],
      },
    };
    start([rope, hook]);
    addItem("rope");
    addItem("hook");
    await combine("rope", "hook");
    expect(customNames()).toEqual(["combined"]);
    expect(ofType("item:combined")).toHaveLength(1);
  });

  it("emite item:combined al combinar con éxito", async () => {
    const rope = {
      ...makeItem("rope"),
      combine: {
        hook: [otherwise(act.emit("ok"))],
      },
    };
    const hook = makeItem("hook");
    start([rope, hook]);
    addItem("rope");
    addItem("hook");
    await combine("rope", "hook");
    expect(ofType("item:combined")).toEqual([
      { type: "item:combined", itemId: "rope", withItemId: "hook" },
    ]);
  });

  it("emite item:combineFailed si no hay regla aplicable", async () => {
    const rope = makeItem("rope");
    const hook = makeItem("hook");
    start([rope, hook]);
    addItem("rope");
    addItem("hook");
    await combine("rope", "hook");
    expect(ofType("item:combineFailed")).toEqual([
      { type: "item:combineFailed", itemId: "rope", withItemId: "hook" },
    ]);
    expect(ofType("item:combined")).toHaveLength(0);
  });

  it("emite item:combineFailed si falta uno de los ítems en el inventario", async () => {
    const rope = {
      ...makeItem("rope"),
      combine: {
        hook: [otherwise(act.emit("ok"))],
      },
    };
    const hook = makeItem("hook");
    start([rope, hook]);
    addItem("rope");
    // No agrega hook
    await combine("rope", "hook");
    expect(ofType("item:combineFailed")).toEqual([
      { type: "item:combineFailed", itemId: "rope", withItemId: "hook" },
    ]);
  });

  it("emite item:combineFailed si el primer ítem no está en el inventario", async () => {
    const rope = {
      ...makeItem("rope"),
      combine: {
        hook: [otherwise(act.emit("ok"))],
      },
    };
    const hook = makeItem("hook");
    start([rope, hook]);
    // No agrega rope
    addItem("hook");
    await combine("rope", "hook");
    expect(ofType("item:combineFailed")).toHaveLength(1);
  });

  it("emite item:combineFailed si se intenta combinar un ítem consigo mismo", async () => {
    const rope = {
      ...makeItem("rope"),
      combine: {
        rope: [otherwise(act.emit("self"))],
      },
    };
    start([rope]);
    addItem("rope");
    await combine("rope", "rope");
    expect(ofType("item:combineFailed")).toEqual([
      { type: "item:combineFailed", itemId: "rope", withItemId: "rope" },
    ]);
    expect(customNames()).toEqual([]);
  });

  it("usa rama condicionada que se cumple", async () => {
    const rope = {
      ...makeItem("rope"),
      combine: {
        hook: [
          branch(cond.flag("hasKnot"), act.emit("knotted")),
          otherwise(act.emit("plain")),
        ],
      },
    };
    const hook = makeItem("hook");
    start([rope, hook]);
    addItem("rope");
    addItem("hook");
    await combine("rope", "hook");
    expect(customNames()).toEqual(["plain"]);
    getWorldState().setFlag("hasKnot", true);
    // Clear events for next combine
    events = [];
    addItem("rope");
    addItem("hook");
    await combine("rope", "hook");
    expect(customNames()).toEqual(["knotted"]);
  });

  it("usa rama condicionada que NO se cumple", async () => {
    const rope = {
      ...makeItem("rope"),
      combine: {
        hook: [branch(cond.flag("never"), act.emit("never"))],
      },
    };
    const hook = makeItem("hook");
    start([rope, hook]);
    addItem("rope");
    addItem("hook");
    await combine("rope", "hook");
    expect(ofType("item:combineFailed")).toHaveLength(1);
    expect(customNames()).toEqual([]);
  });

  it("el guion consigue usar acciones complejas: removeItem, giveItem, setFlag", async () => {
    const sword = {
      ...makeItem("sword"),
      combine: {
        stone: [
          otherwise(
            act.removeItem("sword"),
            act.removeItem("stone"),
            act.giveItem("sharpSword"),
            act.setFlag("sharpened", true),
            act.emit("done"),
          ),
        ],
      },
    };
    const stone = makeItem("stone");
    const sharpSword = makeItem("sharpSword");
    start([sword, stone, sharpSword]);
    addItem("sword");
    addItem("stone");
    await combine("sword", "stone");
    expect(customNames()).toEqual(["done"]);
    expect(getWorldState().flags.sharpened).toBe(true);
    expect(getInventoryState().slots.some((s) => s?.id === "sharpSword")).toBe(true);
    expect(getInventoryState().slots.some((s) => s?.id === "sword")).toBe(false);
    expect(getInventoryState().slots.some((s) => s?.id === "stone")).toBe(false);
  });

  it("no ejecuta guion si falta algún ítem, incluso si hay regla", async () => {
    const rope = {
      ...makeItem("rope"),
      combine: {
        hook: [otherwise(act.setFlag("combined", true))],
      },
    };
    const hook = makeItem("hook");
    start([rope, hook]);
    addItem("rope");
    // Falta hook
    await combine("rope", "hook");
    expect(getWorldState().flags.combined).toBeUndefined();
    expect(ofType("item:combineFailed")).toHaveLength(1);
  });

  it("en orden inverso (hook + rope)", async () => {
    const rope = {
      ...makeItem("rope"),
      combine: {
        hook: [otherwise(act.emit("combined"))],
      },
    };
    const hook = makeItem("hook");
    start([rope, hook]);
    addItem("rope");
    addItem("hook");
    await combine("hook", "rope");
    expect(customNames()).toEqual(["combined"]);
  });
});
