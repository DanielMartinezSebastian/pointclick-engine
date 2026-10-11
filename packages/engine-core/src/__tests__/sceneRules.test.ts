import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import {
  act,
  branch,
  cond,
  createGameRuntime,
  evaluateTransitionGate,
  getConditionContext,
  getDeclaredScene,
  getInventoryState,
  getPlacedItemsState,
  getSceneRuleContext,
  getWorldState,
  otherwise,
  resolveEnterScript,
  resolveInitialItems,
  toRuntimeScene,
  type ConditionContext,
  type GameEvent,
  type GameRuntime,
  type GameSceneConfig,
  type PlacedSceneItem,
  type SceneInitialItem,
} from "../index";
import { HeadlessClock } from "../ports/headlessClock";
import { flush, makeItem, makeScene, resetStores } from "./sequencerHarness";

const placed = (itemId: string, extra: Partial<PlacedSceneItem> = {}): PlacedSceneItem => ({
  id: `p-${itemId}`,
  itemId,
  interactionId: "spot",
  name: itemId,
  spriteUrl: `/${itemId}.png`,
  worldPosition: [0, 0, 0],
  canPickup: true,
  ...extra,
});

const ctx = (extra: Partial<ConditionContext> = {}): ConditionContext => ({
  flags: {},
  inventory: [],
  placedItems: [],
  sceneId: "room",
  visitedSceneIds: [],
  ...extra,
});

const trophyRule = cond.all(cond.not(cond.itemPlaced("trophy")), cond.not(cond.hasItem("trophy")));

beforeEach(resetStores);

describe("resolveInitialItems", () => {
  it("devuelve null sin initialItems", () => {
    expect(resolveInitialItems("room", undefined, ctx())).toBeNull();
  });
  it("devuelve [] con initialItems vacio", () => {
    expect(resolveInitialItems("room", [], ctx())).toEqual([]);
  });
  it("incluye items sin when", () => {
    const out = resolveInitialItems("room", [{ item: placed("a") }, { item: placed("b") }], ctx());
    expect(out?.map((i) => i.itemId)).toEqual(["a", "b"]);
  });
  it("filtra por when", () => {
    const entries: SceneInitialItem[] = [
      { item: placed("a"), when: cond.flag("on") },
      { item: placed("b"), when: cond.flag("off") },
    ];
    const out = resolveInitialItems("room", entries, ctx({ flags: { on: true } }));
    expect(out?.map((i) => i.itemId)).toEqual(["a"]);
  });
  it("asigna sceneId solo si falta", () => {
    const out = resolveInitialItems(
      "room",
      [{ item: placed("a") }, { item: placed("b", { sceneId: "other" }) }],
      ctx(),
    );
    expect(out?.map((i) => i.sceneId)).toEqual(["room", "other"]);
  });
  it("no muta el item original", () => {
    const item = placed("a");
    resolveInitialItems("room", [{ item }], ctx());
    expect(item.sceneId).toBeUndefined();
  });
  it("regla del trofeo: se siembra si no existe en ninguna escena ni en el inventario", () => {
    const entries: SceneInitialItem[] = [{ item: placed("trophy"), when: trophyRule }];
    expect(resolveInitialItems("room", entries, ctx())).toHaveLength(1);
  });
  it("regla del trofeo: no se siembra si ya esta colocado en otra escena", () => {
    const entries: SceneInitialItem[] = [{ item: placed("trophy"), when: trophyRule }];
    const placedElsewhere = [placed("trophy", { sceneId: "other" })];
    expect(resolveInitialItems("room", entries, ctx({ placedItems: placedElsewhere }))).toEqual([]);
  });
  it("regla del trofeo: no se siembra si el jugador lo lleva", () => {
    const entries: SceneInitialItem[] = [{ item: placed("trophy"), when: trophyRule }];
    const inventory = [{ id: "trophy", name: "t", spriteUrl: "/t.png", quantity: 1 }];
    expect(resolveInitialItems("room", entries, ctx({ inventory }))).toEqual([]);
  });
  it("ignora entradas mal formadas", () => {
    const bad = [null, {}, { item: placed("a") }] as unknown as SceneInitialItem[];
    expect(resolveInitialItems("room", bad, ctx())?.map((i) => i.itemId)).toEqual(["a"]);
  });
});

describe("resolveEnterScript", () => {
  it("null sin onEnter", () => {
    expect(resolveEnterScript(undefined, ctx())).toBeNull();
  });
  it("elige la primera rama que se cumple", () => {
    const script = resolveEnterScript(
      [branch(cond.flag("x"), act.emit("x")), otherwise(act.emit("default"))],
      ctx(),
    );
    expect(script).toEqual([act.emit("default")]);
  });
  it("null si ninguna rama se cumple", () => {
    expect(resolveEnterScript([branch(cond.flag("x"), act.emit("x"))], ctx())).toBeNull();
  });
  it("solo la primera vez con not(visited)", () => {
    const onEnter = [branch(cond.not(cond.visited("room")), act.emit("welcome"))];
    expect(resolveEnterScript(onEnter, ctx())).not.toBeNull();
    expect(resolveEnterScript(onEnter, ctx({ visitedSceneIds: ["room"] }))).toBeNull();
  });
});

describe("evaluateTransitionGate", () => {
  it("permite sin when", () => {
    expect(evaluateTransitionGate({}, ctx())).toEqual({ allowed: true });
  });
  it("permite si when se cumple", () => {
    expect(evaluateTransitionGate({ when: cond.flag("ok") }, ctx({ flags: { ok: true } }))).toEqual({
      allowed: true,
    });
  });
  it("bloquea con el guion blocked si when no se cumple", () => {
    const blocked = [act.emit("nope")];
    expect(evaluateTransitionGate({ when: cond.flag("ok"), blocked }, ctx())).toEqual({
      allowed: false,
      blocked,
    });
  });
  it("bloquea con guion vacio si no hay blocked", () => {
    expect(evaluateTransitionGate({ when: cond.flag("ok") }, ctx())).toEqual({
      allowed: false,
      blocked: [],
    });
  });
});

describe("integracion con el runtime", () => {
  let rt: GameRuntime;
  afterEach(() => {
    rt?.dispose();
    resetStores();
    vi.restoreAllMocks();
  });

  const start = (scenes: GameSceneConfig[]) => {
    rt = createGameRuntime({
      scenes,
      items: [makeItem("trophy")],
      clock: new HeadlessClock(),
      instantWalk: true,
    });
  };

  it("toRuntimeScene conserva initialItems y onEnter", () => {
    const cfg = makeScene("r", {
      initialItems: [{ item: placed("a") }],
      onEnter: [otherwise(act.emit("hi"))],
    });
    const scene = toRuntimeScene(cfg);
    expect(scene.initialItems).toEqual(cfg.initialItems);
    expect(scene.onEnter).toEqual(cfg.onEnter);
  });

  it("una escena sin campos nuevos no los define", () => {
    const scene = toRuntimeScene(makeScene("plain"));
    expect(scene.initialItems).toBeUndefined();
    expect(scene.onEnter).toBeUndefined();
    expect(scene.transitions).toBeUndefined();
  });

  it("getDeclaredScene devuelve la escena activa o la registrada", () => {
    start([
      makeScene("sr-a", { onEnter: [otherwise(act.emit("a"))] }),
      makeScene("sr-b", { initialItems: [{ item: placed("a") }] }),
    ]);
    rt.executeCommand({ type: "scene:set", sceneId: "sr-a" });
    expect(getDeclaredScene("sr-a")?.onEnter).toHaveLength(1);
    expect(getDeclaredScene("sr-b")?.initialItems).toHaveLength(1);
    expect(getDeclaredScene("sr-missing")).toBeUndefined();
  });

  it("la escena activa en el store lleva los campos declarativos", () => {
    start([makeScene("sr-c", { initialItems: [{ item: placed("a") }], onEnter: [otherwise([])] })]);
    rt.executeCommand({ type: "scene:set", sceneId: "sr-c" });
    const declared = getDeclaredScene("sr-c");
    expect(declared?.initialItems).toHaveLength(1);
    expect(declared?.onEnter).toHaveLength(1);
  });

  it("getSceneRuleContext sustituye sceneId y placedItems", () => {
    start([makeScene("sr-d")]);
    rt.executeCommand({ type: "scene:set", sceneId: "sr-d" });
    const c = getSceneRuleContext("other", [placed("z")]);
    expect(c.sceneId).toBe("other");
    expect(c.placedItems.map((i) => i.itemId)).toEqual(["z"]);
    expect(getSceneRuleContext("other").placedItems).toEqual(getConditionContext().placedItems);
  });

  it("el guion de onEnter se ejecuta con runScript", async () => {
    start([makeScene("sr-e", { onEnter: [otherwise(act.setFlag("entered"))] })]);
    rt.executeCommand({ type: "scene:set", sceneId: "sr-e" });
    const script = resolveEnterScript(getDeclaredScene("sr-e")?.onEnter, getSceneRuleContext("sr-e"));
    rt.runScript(script ?? []);
    await flush();
    expect(getWorldState().flags.entered).toBe(true);
  });

  it("el guion blocked se ejecuta con runScript", async () => {
    start([makeScene("sr-f")]);
    rt.executeCommand({ type: "scene:set", sceneId: "sr-f" });
    const events: GameEvent[] = [];
    rt.on("custom", (e) => events.push(e as GameEvent));
    const gate = evaluateTransitionGate(
      { when: cond.hasItem("trophy"), blocked: [act.emit("locked")] },
      getSceneRuleContext("sr-f"),
    );
    expect(gate.allowed).toBe(false);
    if (!gate.allowed) rt.runScript(gate.blocked);
    await flush();
    expect(events.map((e) => (e as { name: string }).name)).toEqual(["locked"]);
  });

  it("la transicion se permite al cumplirse when con el estado real", () => {
    start([makeScene("sr-g")]);
    rt.executeCommand({ type: "scene:set", sceneId: "sr-g" });
    const t = { when: cond.hasItem("trophy") };
    expect(evaluateTransitionGate(t, getSceneRuleContext("sr-g")).allowed).toBe(false);
    getInventoryState().addItem({ id: "trophy", name: "t", spriteUrl: "/t.png" });
    expect(evaluateTransitionGate(t, getSceneRuleContext("sr-g")).allowed).toBe(true);
  });

  it("la regla del trofeo usa el estado real de los stores", () => {
    start([makeScene("sr-h")]);
    rt.executeCommand({ type: "scene:set", sceneId: "sr-h" });
    const entries: SceneInitialItem[] = [{ item: placed("trophy"), when: trophyRule }];
    const seed = () =>
      resolveInitialItems("sr-h", entries, getSceneRuleContext("sr-h", getPlacedItemsState().items));
    expect(seed()).toHaveLength(1);
    getPlacedItemsState().setItems([placed("trophy", { sceneId: "sr-other" })]);
    expect(seed()).toEqual([]);
  });
});
