import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import {
  createGameRuntime,
  getWorldState,
  useWorldStateStore,
  useSceneStore,
  type GameRuntime,
  type GameSceneConfig,
} from "../index";

function makeScene(id: string): GameSceneConfig {
  return {
    id,
    label: `Scene ${id}`,
    background: "/bg.png",
    playerSpawn: [0, 0, 0],
    ground: { minX: -5, maxX: 5, minZ: -5, maxZ: 5, y: 0 },
    walls: [],
    interactions: [],
  };
}

const resetAll = () => {
  getWorldState().reset();
  useSceneStore.setState({ sceneId: "" });
};

let rt: GameRuntime | null = null;
beforeEach(resetAll);
afterEach(() => {
  rt?.dispose();
  rt = null;
  resetAll();
  vi.restoreAllMocks();
});

describe("worldStateStore (sin runtime)", () => {
  it("setFlag guarda y clearFlag borra", () => {
    getWorldState().setFlag("a", true);
    getWorldState().setFlag("n", 3);
    getWorldState().setFlag("s", "x");
    expect(getWorldState().flags).toEqual({ a: true, n: 3, s: "x" });
    getWorldState().clearFlag("n");
    expect(getWorldState().flags).toEqual({ a: true, s: "x" });
  });

  it("setFlag con el mismo valor no notifica a suscriptores", () => {
    getWorldState().setFlag("a", 1);
    const spy = vi.fn();
    const unsub = useWorldStateStore.subscribe(spy);
    getWorldState().setFlag("a", 1);
    expect(spy).not.toHaveBeenCalled();
    unsub();
  });

  it("clearFlag de un flag inexistente no notifica", () => {
    const spy = vi.fn();
    const unsub = useWorldStateStore.subscribe(spy);
    getWorldState().clearFlag("nope");
    expect(spy).not.toHaveBeenCalled();
    unsub();
  });

  it("markSceneVisited no duplica y conserva el orden", () => {
    const w = getWorldState();
    w.markSceneVisited("b");
    w.markSceneVisited("a");
    w.markSceneVisited("b");
    expect(getWorldState().visitedSceneIds).toEqual(["b", "a"]);
  });

  it("setAll reemplaza flags y escenas (sin duplicados)", () => {
    getWorldState().setFlag("old", 1);
    getWorldState().setAll({ flags: { k: "v" }, visitedSceneIds: ["x", "y", "x"] });
    expect(getWorldState().flags).toEqual({ k: "v" });
    expect(getWorldState().visitedSceneIds).toEqual(["x", "y"]);
  });

  it("reset vacía todo", () => {
    getWorldState().setFlag("a", true);
    getWorldState().markSceneVisited("s");
    getWorldState().reset();
    expect(getWorldState().flags).toEqual({});
    expect(getWorldState().visitedSceneIds).toEqual([]);
  });
});

describe("runtime: comandos y evento state:flagChanged", () => {
  it("state:setFlag escribe y emite sin previous la primera vez", () => {
    rt = createGameRuntime();
    const spy = vi.fn();
    rt.on("state:flagChanged", spy);
    rt.executeCommand({ type: "state:setFlag", name: "door", value: true });
    expect(getWorldState().flags.door).toBe(true);
    expect(spy).toHaveBeenCalledTimes(1);
    const ev = spy.mock.calls[0]![0];
    expect(ev).toEqual({ type: "state:flagChanged", name: "door", value: true });
    expect("previous" in ev).toBe(false);
  });

  it("el evento trae previous al cambiar el valor", () => {
    rt = createGameRuntime();
    rt.executeCommand({ type: "state:setFlag", name: "n", value: 1 });
    const spy = vi.fn();
    rt.on("state:flagChanged", spy);
    rt.executeCommand({ type: "state:setFlag", name: "n", value: 2 });
    expect(spy).toHaveBeenCalledWith({ type: "state:flagChanged", name: "n", value: 2, previous: 1 });
  });

  it("mismo valor no emite", () => {
    rt = createGameRuntime();
    rt.executeCommand({ type: "state:setFlag", name: "n", value: 1 });
    const spy = vi.fn();
    rt.on("state:flagChanged", spy);
    rt.executeCommand({ type: "state:setFlag", name: "n", value: 1 });
    expect(spy).not.toHaveBeenCalled();
  });

  it("state:clearFlag emite con previous y sin value", () => {
    rt = createGameRuntime();
    rt.executeCommand({ type: "state:setFlag", name: "s", value: "x" });
    const spy = vi.fn();
    rt.on("state:flagChanged", spy);
    rt.executeCommand({ type: "state:clearFlag", name: "s" });
    expect(getWorldState().flags).toEqual({});
    expect(spy).toHaveBeenCalledWith({ type: "state:flagChanged", name: "s", previous: "x" });
  });

  it("clearFlag de flag inexistente no emite", () => {
    rt = createGameRuntime();
    const spy = vi.fn();
    rt.on("state:flagChanged", spy);
    rt.executeCommand({ type: "state:clearFlag", name: "zz" });
    expect(spy).not.toHaveBeenCalled();
  });

  it("emite también con getWorldState().setFlag directo", () => {
    rt = createGameRuntime();
    const spy = vi.fn();
    rt.on("state:flagChanged", spy);
    getWorldState().setFlag("direct", 7);
    expect(spy).toHaveBeenCalledWith({ type: "state:flagChanged", name: "direct", value: 7 });
  });

  it("setAll emite un evento por cada flag que difiere", () => {
    rt = createGameRuntime();
    getWorldState().setFlag("a", 1);
    getWorldState().setFlag("b", 1);
    const spy = vi.fn();
    rt.on("state:flagChanged", spy);
    getWorldState().setAll({ flags: { b: 1, c: 2 }, visitedSceneIds: [] });
    const names = spy.mock.calls.map((c) => c[0].name).sort();
    expect(names).toEqual(["a", "c"]);
  });
});

describe("runtime: escenas visitadas y dispose", () => {
  it("scene:set marca visitadas sin duplicados y en orden", () => {
    rt = createGameRuntime({ scenes: [makeScene("w-a"), makeScene("w-b")] });
    rt.executeCommand({ type: "scene:set", sceneId: "w-a" });
    rt.executeCommand({ type: "scene:set", sceneId: "w-b" });
    rt.executeCommand({ type: "scene:set", sceneId: "w-a" });
    expect(getWorldState().visitedSceneIds).toEqual(["w-a", "w-b"]);
  });

  it("marca la escena ya activa al crear el runtime", () => {
    useSceneStore.setState({ sceneId: "pre-active" });
    rt = createGameRuntime();
    expect(getWorldState().visitedSceneIds).toEqual(["pre-active"]);
  });

  it("tras dispose no se emite ni se marca nada", () => {
    rt = createGameRuntime({ scenes: [makeScene("w-c")] });
    const spy = vi.fn();
    rt.on("state:flagChanged", spy);
    const scene = rt.getScenes()["w-c"]!;
    rt.dispose();
    getWorldState().setFlag("late", true);
    useSceneStore.getState().setScene("w-c", scene as never);
    expect(spy).not.toHaveBeenCalled();
    expect(getWorldState().visitedSceneIds).toEqual([]);
    rt = null;
  });

  it("un segundo runtime tras dispose no duplica eventos", () => {
    const first = createGameRuntime();
    first.dispose();
    rt = createGameRuntime();
    const spy = vi.fn();
    rt.on("state:flagChanged", spy);
    getWorldState().setFlag("once", true);
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
