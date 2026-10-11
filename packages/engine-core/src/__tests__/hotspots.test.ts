import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import {
  act,
  branch,
  cond,
  createGameRuntime,
  getAvailableVerbs,
  getConditionContext,
  getDefaultVerb,
  getInventoryState,
  getSceneState,
  getWorldState,
  otherwise,
  toRuntimeScene,
  useDialogStore,
  type GameEvent,
  type GameEventType,
  type GameRuntime,
  type GameSceneConfig,
  type GameSceneHotspot,
} from "../index";
import { HeadlessClock } from "../ports/headlessClock";
import { flush, makeItem, makeScene, resetStores } from "./sequencerHarness";

const box = {
  position: [2, 0, 2] as [number, number, number],
  halfSize: [0.5, 0.5, 0.5] as [number, number, number],
};
const hs = (id: string, extra: Partial<GameSceneHotspot> = {}): GameSceneHotspot => ({
  id,
  label: `hs.${id}`,
  ...box,
  ...extra,
});

let rt: GameRuntime;
let events: GameEvent[];

function start(
  hotspots: GameSceneHotspot[],
  opts: { blocked?: boolean; record?: GameEventType[] } = {},
) {
  const scenes: GameSceneConfig[] = [
    makeScene("hs-a", { hotspots }),
    makeScene("hs-blocked", {
      hotspots,
      interactions: [
        { id: "blocker", position: [0, 0, 0], halfSize: [20, 1, 20], hasCollision: true },
      ] as unknown as GameSceneConfig["interactions"],
    }),
  ];
  rt = createGameRuntime({
    scenes,
    items: [makeItem("hs-key"), makeItem("hs-coin")],
    clock: new HeadlessClock(),
    instantWalk: true,
  });
  rt.executeCommand({ type: "scene:set", sceneId: opts.blocked ? "hs-blocked" : "hs-a" });
  events = [];
  const types: GameEventType[] = opts.record ?? [
    "hotspot:interacted",
    "hotspot:noAction",
    "custom",
    "player:walkCompleted",
    "player:walkAborted",
  ];
  for (const t of types) rt.on(t, (e) => events.push(e as GameEvent));
}

const interact = async (
  hotspotId: string,
  verb: "look" | "use" | "talk" | "useItem",
  itemId?: string,
) => {
  rt.executeCommand({ type: "hotspot:interact", hotspotId, verb, ...(itemId ? { itemId } : {}) });
  await flush();
};
const customNames = () =>
  events.filter((e) => e.type === "custom").map((e) => (e as { name: string }).name);
const ofType = (t: string) => events.filter((e) => e.type === t);
const giveInv = (id: string) =>
  getInventoryState().addItem({ id, name: id, spriteUrl: `/${id}.png` });

beforeEach(resetStores);
afterEach(() => {
  rt?.dispose();
  resetStores();
  vi.restoreAllMocks();
});

describe("hotspot:interact por verbo", () => {
  it("look ejecuta su guion y emite interacted", async () => {
    start([hs("door", { verbs: { look: [otherwise(act.emit("looked"))] } })]);
    await interact("door", "look");
    expect(customNames()).toEqual(["looked"]);
    expect(ofType("hotspot:interacted")).toEqual([
      { type: "hotspot:interacted", hotspotId: "door", verb: "look" },
    ]);
  });

  it("use ejecuta su guion", async () => {
    start([hs("lever", { verbs: { use: [otherwise(act.setFlag("pulled"))] } })]);
    await interact("lever", "use");
    expect(getWorldState().flags.pulled).toBe(true);
  });

  it("talk ejecuta su guion", async () => {
    start([hs("npc", { verbs: { talk: [otherwise(act.emit("talked"))] } })]);
    await interact("npc", "talk");
    expect(customNames()).toEqual(["talked"]);
  });

  it("un say del guion muestra el dialogo", async () => {
    start([hs("sign", { verbs: { look: [otherwise(act.say("sign.text"))] } })]);
    await interact("sign", "look");
    expect(useDialogStore.getState().visible).toBe(true);
    expect(useDialogStore.getState().key).toBe("sign.text");
    rt.executeCommand({ type: "dialog:dismiss" });
    await flush();
  });

  it("el guion solo ejecuta el verbo pedido", async () => {
    start([
      hs("x", {
        verbs: { look: [otherwise(act.emit("look"))], use: [otherwise(act.emit("use"))] },
      }),
    ]);
    await interact("x", "use");
    expect(customNames()).toEqual(["use"]);
  });
});

describe("ramas", () => {
  const h = hs("chest", {
    verbs: {
      look: [branch(cond.flag("opened"), act.emit("open")), otherwise(act.emit("closed"))],
    },
  });

  it("elige la rama condicionada o el otherwise", async () => {
    start([h]);
    await interact("chest", "look");
    getWorldState().setFlag("opened", true);
    await interact("chest", "look");
    expect(customNames()).toEqual(["closed", "open"]);
  });

  it("el guion pone un flag que cambia la rama de la siguiente interaccion", async () => {
    start([
      hs("bell", {
        verbs: {
          use: [
            branch(cond.flag("rung"), act.emit("again")),
            otherwise(act.setFlag("rung"), act.emit("first")),
          ],
        },
      }),
    ]);
    await interact("bell", "use");
    await interact("bell", "use");
    expect(customNames()).toEqual(["first", "again"]);
  });

  it("sin rama aplicable emite noAction no-rule y no corre guion", async () => {
    start([hs("gate", { verbs: { look: [branch(cond.flag("never"), act.emit("x"))] } })], {
      record: ["hotspot:interacted", "hotspot:noAction", "script:started"],
    });
    await interact("gate", "look");
    expect(events).toEqual([
      { type: "hotspot:noAction", hotspotId: "gate", verb: "look", reason: "no-rule" },
    ]);
  });

  it("verbo sin definir -> no-rule", async () => {
    start([hs("g", { verbs: { look: [otherwise()] } })]);
    await interact("g", "talk");
    expect(ofType("hotspot:noAction")).toMatchObject([{ reason: "no-rule", verb: "talk" }]);
  });

  it("una rama con guion vacio cuenta como aplicable", async () => {
    start([hs("g", { verbs: { look: [otherwise()] } })]);
    await interact("g", "look");
    expect(ofType("hotspot:interacted")).toHaveLength(1);
    expect(ofType("hotspot:noAction")).toHaveLength(0);
  });
});

describe("visibleWhen y noAction", () => {
  it("not-found si el hotspot no existe", async () => {
    start([hs("a")]);
    vi.spyOn(console, "warn").mockImplementation(() => {});
    await interact("nope", "look");
    expect(ofType("hotspot:noAction")).toEqual([
      { type: "hotspot:noAction", hotspotId: "nope", verb: "look", reason: "not-found" },
    ]);
  });

  it("not-found en una escena sin hotspots", async () => {
    start([]);
    vi.spyOn(console, "warn").mockImplementation(() => {});
    await interact("a", "look");
    expect(ofType("hotspot:noAction")).toMatchObject([{ reason: "not-found" }]);
  });

  it("hidden si visibleWhen no se cumple; visible cuando se cumple", async () => {
    start([
      hs("secret", {
        visibleWhen: cond.flag("found"),
        verbs: { look: [otherwise(act.emit("seen"))] },
      }),
    ]);
    await interact("secret", "look");
    expect(ofType("hotspot:noAction")).toMatchObject([{ reason: "hidden" }]);
    expect(customNames()).toEqual([]);
    getWorldState().setFlag("found", true);
    await interact("secret", "look");
    expect(customNames()).toEqual(["seen"]);
  });

  it("missing-item si useItem sin itemId o con el item ausente", async () => {
    start([hs("lock", { useItemDefault: [otherwise(act.emit("x"))] })]);
    await interact("lock", "useItem", "hs-key");
    await interact("lock", "useItem");
    expect(ofType("hotspot:noAction")).toMatchObject([
      { reason: "missing-item", itemId: "hs-key" },
      { reason: "missing-item" },
    ]);
    expect(customNames()).toEqual([]);
  });
});

describe("useItem", () => {
  const lock = hs("lock", {
    useItem: {
      "hs-key": [
        otherwise(act.emit("keyed"), act.removeItem("hs-key"), act.setFlag("unlocked")),
      ],
    },
    useItemDefault: [otherwise(act.emit("nope"))],
  });

  it("usa la regla propia del item y el guion consume el item", async () => {
    start([lock]);
    giveInv("hs-key");
    await interact("lock", "useItem", "hs-key");
    expect(customNames()).toEqual(["keyed"]);
    expect(getWorldState().flags.unlocked).toBe(true);
    expect(getInventoryState().slots.every((s) => s === null)).toBe(true);
    expect(ofType("hotspot:interacted")).toEqual([
      { type: "hotspot:interacted", hotspotId: "lock", verb: "useItem", itemId: "hs-key" },
    ]);
  });

  it("cae a useItemDefault sin regla propia, y el item no se consume solo", async () => {
    start([lock]);
    giveInv("hs-coin");
    await interact("lock", "useItem", "hs-coin");
    expect(customNames()).toEqual(["nope"]);
    expect(getInventoryState().slots.some((s) => s?.id === "hs-coin")).toBe(true);
  });

  it("sin regla ni default -> no-rule", async () => {
    start([hs("lock", { useItem: { "hs-key": [otherwise()] } })]);
    giveInv("hs-coin");
    await interact("lock", "useItem", "hs-coin");
    expect(ofType("hotspot:noAction")).toMatchObject([{ reason: "no-rule", itemId: "hs-coin" }]);
  });
});

describe("approach", () => {
  it("camina al punto antes de actuar", async () => {
    start([hs("d", { approach: [3, 0, 3], verbs: { look: [otherwise(act.emit("acted"))] } })], {
      record: ["custom", "player:walkCompleted"],
    });
    await interact("d", "look");
    expect(events.map((e) => e.type)).toEqual(["player:walkCompleted", "custom"]);
    expect(getSceneState().playerPosition).toEqual([3, 0, 3]);
  });

  it("sin approach actua desde donde esta", async () => {
    start([hs("d", { verbs: { look: [otherwise(act.emit("acted"))] } })], {
      record: ["custom", "player:walkCompleted"],
    });
    await interact("d", "look");
    expect(events.map((e) => e.type)).toEqual(["custom"]);
  });

  it("si la caminata se aborta el guion sigue", async () => {
    start([hs("d", { approach: [3, 0, 3], verbs: { look: [otherwise(act.emit("acted"))] } })], {
      blocked: true,
    });
    await interact("d", "look");
    expect(ofType("player:walkAborted")).toHaveLength(1);
    expect(customNames()).toEqual(["acted"]);
  });
});

describe("getDefaultVerb / getAvailableVerbs", () => {
  const all = hs("a", {
    verbs: { look: [otherwise()], use: [otherwise()], talk: [otherwise()] },
  });
  const ctx = () => getConditionContext();

  it("prefiere talk, luego use, luego look", () => {
    start([]);
    expect(getDefaultVerb(all, ctx())).toBe("talk");
    expect(
      getDefaultVerb(hs("b", { verbs: { look: [otherwise()], use: [otherwise()] } }), ctx()),
    ).toBe("use");
    expect(getDefaultVerb(hs("c", { verbs: { look: [otherwise()] } }), ctx())).toBe("look");
  });

  it("devuelve null sin verbos aplicables", () => {
    start([]);
    expect(getDefaultVerb(hs("n"), ctx())).toBeNull();
    expect(
      getDefaultVerb(hs("n", { verbs: { talk: [branch(cond.flag("z"), act.emit("q"))] } }), ctx()),
    ).toBeNull();
  });

  it("solo cuenta verbos con rama aplicable en ese contexto", () => {
    start([]);
    const h = hs("m", {
      verbs: { talk: [branch(cond.flag("met"), act.emit("hi"))], look: [otherwise()] },
    });
    expect(getAvailableVerbs(h, ctx())).toEqual(["look"]);
    expect(getDefaultVerb(h, ctx())).toBe("look");
    getWorldState().setFlag("met", true);
    expect(getAvailableVerbs(h, ctx())).toEqual(["talk", "look"]);
    expect(getDefaultVerb(h, ctx())).toBe("talk");
  });

  it("getAvailableVerbs sigue el orden talk, use, look", () => {
    start([]);
    expect(getAvailableVerbs(all, ctx())).toEqual(["talk", "use", "look"]);
  });
});

describe("escenas", () => {
  it("toRuntimeScene conserva hotspots", () => {
    const hotspots = [hs("a")];
    expect(toRuntimeScene(makeScene("s", { hotspots })).hotspots).toBe(hotspots);
  });

  it("la escena activa los lleva; una escena sin hotspots no cambia", () => {
    start([hs("a")]);
    expect(getSceneState().scene.hotspots?.map((h) => h.id)).toEqual(["a"]);
    expect(toRuntimeScene(makeScene("plain")).hotspots).toBeUndefined();
  });
});
