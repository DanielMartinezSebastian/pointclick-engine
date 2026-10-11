import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import {
  act,
  cond,
  createGameRuntime,
  dialogue,
  getAvailableVerbs,
  getConditionContext,
  getDefaultVerb,
  getSceneState,
  getWorldState,
  isHotspotVisible,
  npcToHotspot,
  otherwise,
  toRuntimeScene,
  useDialogStore,
  type GameEvent,
  type GameRuntime,
  type GameSceneNpc,
} from "../index";
import { HeadlessClock } from "../ports/headlessClock";
import { flush, makeScene, resetStores } from "./sequencerHarness";

const npc = (extra: Partial<GameSceneNpc> = {}): GameSceneNpc => ({
  id: "guard",
  name: "npc.guard",
  characterId: "guard-char",
  position: [2, 0, 3],
  ...extra,
});

let rt: GameRuntime | undefined;
beforeEach(resetStores);
afterEach(() => {
  rt?.dispose();
  rt = undefined;
  resetStores();
  vi.restoreAllMocks();
});

describe("npcToHotspot", () => {
  it("proyecta id, nombre, posicion y campos opcionales", () => {
    const h = npcToHotspot(
      npc({ hasCollision: true, approach: [1, 0, 1], visibleWhen: cond.flag("x") }),
    );
    expect(h).toMatchObject({
      id: "guard",
      label: "npc.guard",
      position: [2, 2, 3],
      hasCollision: true,
      approach: [1, 0, 1],
      visibleWhen: { flag: "x" },
    });
    expect(h.halfSize).toHaveLength(3);
    expect(h.verbs).toBeUndefined();
  });

  it("no anade claves opcionales ausentes", () => {
    expect(Object.keys(npcToHotspot(npc())).sort()).toEqual(["halfSize", "id", "label", "position"]);
  });

  it("dialogueId equivale a verbs.talk con startDialogue", () => {
    const h = npcToHotspot(npc({ dialogueId: "chat" }));
    expect(h.verbs?.talk).toEqual([{ do: [{ startDialogue: "chat" }] }]);
    expect(getDefaultVerb(h, getConditionContext())).toBe("talk");
  });

  it("dialogueId conserva los otros verbos propios", () => {
    const look = [otherwise(act.emit("looked"))];
    const h = npcToHotspot(npc({ dialogueId: "chat", verbs: { look } }));
    expect(h.verbs?.look).toBe(look);
    expect(getAvailableVerbs(h, getConditionContext())).toEqual(["talk", "look"]);
  });

  it("un verbs.talk explicito gana sobre dialogueId", () => {
    const talk = [otherwise(act.emit("custom-talk"))];
    expect(npcToHotspot(npc({ dialogueId: "chat", verbs: { talk } })).verbs?.talk).toBe(talk);
  });

  it("no muta el NPC y conserva useItem", () => {
    const verbs = { look: [otherwise(act.emit("l"))] };
    const useItem = { key: [otherwise(act.emit("k"))] };
    const n = npc({ dialogueId: "chat", verbs, useItem });
    const h = npcToHotspot(n);
    expect(n.verbs).toBe(verbs);
    expect(verbs).not.toHaveProperty("talk");
    expect(h.useItem).toBe(useItem);
  });

  it("visibleWhen condiciona la visibilidad del hotspot proyectado", () => {
    const h = npcToHotspot(npc({ visibleWhen: cond.flag("shown") }));
    expect(isHotspotVisible(h, getConditionContext())).toBe(false);
    getWorldState().setFlag("shown", true);
    expect(isHotspotVisible(h, getConditionContext())).toBe(true);
  });
});

describe("toRuntimeScene con npcs", () => {
  it("anade los NPCs a hotspots tras los propios y conserva npcs", () => {
    const hotspots = [
      { id: "door", label: "d", position: [0, 0, 0], halfSize: [1, 1, 1] },
    ] as never;
    const npcs = [npc()];
    const scene = toRuntimeScene(makeScene("s", { hotspots, npcs }));
    expect(scene.hotspots?.map((h) => h.id)).toEqual(["door", "guard"]);
    expect(scene.npcs).toBe(npcs);
  });

  it("sin npcs, hotspots es la misma referencia y npcs no existe", () => {
    const hotspots = [] as never;
    const scene = toRuntimeScene(makeScene("s", { hotspots }));
    expect(scene.hotspots).toBe(hotspots);
    expect(scene.npcs).toBeUndefined();
    expect(toRuntimeScene(makeScene("plain")).hotspots).toBeUndefined();
  });
});

describe("hotspot:interact con un NPC", () => {
  function start(npcs: GameSceneNpc[]) {
    rt = createGameRuntime({
      scenes: [makeScene("npc-a", { npcs })],
      clock: new HeadlessClock(),
      instantWalk: true,
    });
    rt.executeCommand({ type: "scene:set", sceneId: "npc-a" });
    const events: GameEvent[] = [];
    rt.on("hotspot:interacted", (e) => events.push(e as GameEvent));
    rt.on("hotspot:noAction", (e) => events.push(e as GameEvent));
    rt.on("custom", (e) => events.push(e as GameEvent));
    return events;
  }

  it("la escena activa lleva el NPC como hotspot", () => {
    start([npc()]);
    expect(getSceneState().scene.hotspots?.map((h) => h.id)).toEqual(["guard"]);
  });

  it("ejecuta los verbos del NPC", async () => {
    const events = start([npc({ verbs: { look: [otherwise(act.emit("looked"))] } })]);
    rt!.executeCommand({ type: "hotspot:interact", hotspotId: "guard", verb: "look" });
    await flush();
    expect(events.map((e) => e.type)).toEqual(["hotspot:interacted", "custom"]);
  });

  it("un NPC con visibleWhen falso responde hidden", async () => {
    const events = start([npc({ visibleWhen: cond.flag("shown"), verbs: { look: [otherwise()] } })]);
    rt!.executeCommand({ type: "hotspot:interact", hotspotId: "guard", verb: "look" });
    await flush();
    expect(events).toEqual([
      { type: "hotspot:noAction", hotspotId: "guard", verb: "look", reason: "hidden" },
    ]);
  });

  it("talk con dialogueId arranca el dialogo del NPC", async () => {
    rt = createGameRuntime({
      scenes: [makeScene("npc-d", { npcs: [npc({ dialogueId: "guard-chat" })] })],
      dialogues: [
        dialogue.define("guard-chat", "n1", dialogue.node("n1", { speaker: "guard", line: "guard.hi" })),
      ],
      clock: new HeadlessClock(),
      instantWalk: true,
    });
    rt.executeCommand({ type: "scene:set", sceneId: "npc-d" });
    rt.executeCommand({ type: "hotspot:interact", hotspotId: "guard", verb: "talk" });
    await flush();
    expect(useDialogStore.getState().visible).toBe(true);
    expect(useDialogStore.getState().key).toBe("guard.hi");
    expect(useDialogStore.getState().speaker).toBe("guard");
    rt.executeCommand({ type: "dialog:dismiss" });
    await flush();
  });
  it("proyecta useItemDefault para los items sin regla propia", () => {
    const fallback = [{ do: [{ emit: "nope" }] }];
    const h = npcToHotspot({ id: "n", name: "n", characterId: "c", position: [0, 0, 0], useItemDefault: fallback });
    expect(h.useItemDefault).toBe(fallback);
  });
});
