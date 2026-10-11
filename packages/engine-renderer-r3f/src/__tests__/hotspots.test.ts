import { afterEach, describe, expect, test } from "vitest";
import {
  clearRegistry,
  registerDictionary,
  translate,
  type ConditionContext,
  type GameSceneHotspot,
} from "@pointclick-engine/engine-core";
import {
  buildVerbLabels,
  clampMenuPosition,
  filterVisibleHotspots,
  planHotspotClick,
  pointInVolume,
  resolveDropOwner,
} from "../scene/hotspotLogic";
import { ENGINE_NO_ACTION_KEY, ENGINE_VERB_LABEL_KEYS, ensureEngineTexts } from "../i18n/engineTexts";

const ctx = (flags: ConditionContext["flags"] = {}): ConditionContext => ({
  flags,
  inventory: [],
  placedItems: [],
  sceneId: "s",
  visitedSceneIds: [],
});
const hotspot = (extra: Partial<GameSceneHotspot> = {}): GameSceneHotspot => ({
  id: "h",
  label: "hs.h",
  position: [0, 0, 0],
  halfSize: [1, 1, 1],
  ...extra,
});
const say = [{ do: [{ say: "x" }] }] as never;

describe("filterVisibleHotspots", () => {
  test("sin visibleWhen siempre visible; con visibleWhen filtra por flag", () => {
    const hs = [hotspot({ id: "a" }), hotspot({ id: "b", visibleWhen: { flag: "on", equals: true } })];
    expect(filterVisibleHotspots(hs, ctx()).map((h) => h.id)).toEqual(["a"]);
    expect(filterVisibleHotspots(hs, ctx({ on: true })).map((h) => h.id)).toEqual(["a", "b"]);
    expect(filterVisibleHotspots(undefined, ctx())).toEqual([]);
  });
});

describe("planHotspotClick", () => {
  test("un verbo: lo ejecuta directo", () => {
    expect(planHotspotClick(hotspot({ verbs: { look: say } }), ctx())).toEqual({ kind: "verb", verb: "look" });
  });
  test("varios verbos: menu en orden talk, use, look", () => {
    const plan = planHotspotClick(hotspot({ verbs: { look: say, talk: say, use: say } }), ctx());
    expect(plan).toEqual({ kind: "menu", verbs: ["talk", "use", "look"] });
  });
  test("sin verbos aplicables: pide look (el core responde noAction)", () => {
    expect(planHotspotClick(hotspot(), ctx())).toEqual({ kind: "verb", verb: "look" });
  });
});

describe("resolucion diana / hotspot al soltar un item", () => {
  const target = { position: [0, 0, 0] as [number, number, number], halfSize: [1, 1, 1] as [number, number, number] };
  test("punto dentro de la diana: gana la diana", () => {
    expect(resolveDropOwner([0.5, 0, 0.5], [target])).toBe("target");
  });
  test("punto fuera de las dianas: es del hotspot", () => {
    expect(resolveDropOwner([5, 0, 5], [target])).toBe("hotspot");
    expect(resolveDropOwner([0, 0, 0], [])).toBe("hotspot");
  });
  test("la caja de la diana es 1.1 x halfSize", () => {
    expect(pointInVolume([1.09, 0, 0], target)).toBe(true);
    expect(pointInVolume([1.11, 0, 0], target)).toBe(false);
  });
  test("respeta rotationY", () => {
    const long = { position: [0, 0, 0] as [number, number, number], halfSize: [3, 1, 0.5] as [number, number, number], rotationY: Math.PI / 2 };
    expect(pointInVolume([0, 0, 3], long)).toBe(true);
    expect(pointInVolume([3, 0, 0], long)).toBe(false);
  });
});

describe("clampMenuPosition", () => {
  const viewport = { width: 800, height: 600 };
  const size = { width: 150, height: 100 };
  test("dentro de la ventana no cambia", () => {
    expect(clampMenuPosition({ x: 100, y: 100 }, size, viewport)).toEqual({ x: 100, y: 100 });
  });
  test("pegado a los bordes se recoloca con margen", () => {
    expect(clampMenuPosition({ x: 790, y: 590 }, size, viewport)).toEqual({ x: 642, y: 492 });
    expect(clampMenuPosition({ x: -5, y: 0 }, size, viewport)).toEqual({ x: 8, y: 8 });
  });
});

describe("textos del motor (i18n)", () => {
  afterEach(() => clearRegistry());

  test("registra es y en por defecto y las etiquetas salen traducidas", () => {
    ensureEngineTexts();
    expect(translate(ENGINE_VERB_LABEL_KEYS.talk, { locale: "es" })).toBe("Hablar");
    expect(translate(ENGINE_VERB_LABEL_KEYS.talk, { locale: "en" })).toBe("Talk");
    expect(translate(ENGINE_NO_ACTION_KEY, { locale: "en" })).toContain("don't know");
    expect(buildVerbLabels((k) => translate(k, { locale: "es" }))).toEqual({
      look: "Mirar",
      use: "Usar",
      talk: "Hablar",
    });
  });

  test("no pisa las claves que el host ya definio y es idempotente", () => {
    registerDictionary("es", { [ENGINE_VERB_LABEL_KEYS.look]: { phrases: ["Examinar"] } });
    ensureEngineTexts();
    ensureEngineTexts();
    expect(translate(ENGINE_VERB_LABEL_KEYS.look, { locale: "es" })).toBe("Examinar");
    expect(translate(ENGINE_VERB_LABEL_KEYS.use, { locale: "es" })).toBe("Usar");
  });
});
