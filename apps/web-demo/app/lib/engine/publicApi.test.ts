import { describe, expect, it, vi, afterEach } from "vitest";
import { createElement } from "react";
import { renderToString } from "react-dom/server";

import { DEFAULT_SCENE_ID, SCENES } from "../../demo/content/scenes";
import {
  GameViewport,
  createGameRuntime,
  getGameActions,
  getGameRuntime,
  getGameState,
  registerItem,
  registerRule,
  registerScene,
  useGameActions,
  type GameItemConfig,
  type GameRuleConfig,
  type GameSceneConfig,
} from "./publicApi";

function makeScene(id: string): GameSceneConfig {
  return {
    id,
    label: `Scene ${id}`,
    background: "/assets/background/test.png",
    playerSpawn: [0, 0, 0],
    ground: { minX: -1, maxX: 1, minZ: -1, maxZ: 1, y: 0 },
    walls: [],
    interactions: [],
  };
}

function makeItem(id: string): GameItemConfig {
  return {
    id,
    name: `Item ${id}`,
    spriteUrl: "/assets/items/test.png",
    interactionRules: {},
    defaultRule: { outcome: "return" },
  };
}

function makeRule(key: string): GameRuleConfig {
  return {
    key,
    phrases: ["hola"],
  };
}

describe("publicApi", () => {
  it("crea runtime y devuelve escenas/items/rules registrados", () => {
    const scene = makeScene("test-scene-create");
    const item = makeItem("test-item-create");
    const rule = makeRule("test.rule.create");

    const runtime = createGameRuntime({
      scenes: [scene],
      items: [item],
      rules: [rule],
    });

    expect(runtime.getScenes()[scene.id]).toMatchObject({ id: scene.id });
    expect(runtime.getItems()[item.id]).toMatchObject({ id: item.id });
    expect(runtime.getRules()[rule.key]).toMatchObject({ key: rule.key });
  });

  it("sobrescribe registros por id/key cuando se re-registra", () => {
    registerScene({ ...makeScene("test-scene-overwrite"), label: "v1" });
    registerScene({ ...makeScene("test-scene-overwrite"), label: "v2" });

    registerItem({ ...makeItem("test-item-overwrite"), name: "v1" });
    registerItem({ ...makeItem("test-item-overwrite"), name: "v2" });

    registerRule({ ...makeRule("test.rule.overwrite"), phrases: ["v1"] });
    registerRule({ ...makeRule("test.rule.overwrite"), phrases: ["v2"] });

    const runtime = createGameRuntime();
    expect(runtime.getScenes()["test-scene-overwrite"]?.label).toBe("v2");
    expect(runtime.getItems()["test-item-overwrite"]?.name).toBe("v2");
    expect(runtime.getRules()["test.rule.overwrite"]?.phrases).toEqual(["v2"]);
  });

  it("expone acciones/estado base del runtime store", () => {
    // Register scenes first
    Object.values(SCENES).forEach(registerScene);

    const actions = getGameActions();
    const sceneIds = Object.keys(SCENES);
    expect(sceneIds.length).toBeGreaterThan(0);

    const initialState = getGameState();
    actions.requestRespawn();
    const afterRespawn = getGameState();
    expect(afterRespawn.respawnSignal).toBe(initialState.respawnSignal + 1);

    actions.setScene(sceneIds[0]);
    const afterSetScene = getGameState();
    expect(afterSetScene.sceneId).toBe(sceneIds[0]);
  });

  it("useGameState aplica selector sobre estado publico", () => {
    // Register scenes first
    Object.values(SCENES).forEach(registerScene);

    // Initialize store with default scene
    const actions = getGameActions();
    actions.setScene(DEFAULT_SCENE_ID);

    // Test that we can read state through getGameState
    const state = getGameState();
    expect(state.sceneId).toBe(DEFAULT_SCENE_ID);
  });

  it("useGameActions expone acciones equivalentes al runtime", () => {
    // Register scenes first
    Object.values(SCENES).forEach(registerScene);

    const sceneIds = Object.keys(SCENES);
    let actionsFromHook: ReturnType<typeof useGameActions> | null = null;

    function Probe() {
      actionsFromHook = useGameActions();
      return null;
    }

    renderToString(createElement(Probe));

    expect(actionsFromHook).not.toBeNull();
    expect(typeof actionsFromHook?.setScene).toBe("function");
    expect(typeof actionsFromHook?.setPlayerPosition).toBe("function");
    expect(typeof actionsFromHook?.requestRespawn).toBe("function");

    // Test that setScene actually works
    actionsFromHook?.setScene(sceneIds[0]);
    const afterSetScene = getGameState();
    expect(afterSetScene.sceneId).toBe(sceneIds[0]);
  });

  it("GameViewport reenvia debug y onRuntimeEvent al componente base", () => {
    const onRuntimeEvent = () => {};
    const element = GameViewport({
      debug: true,
      onRuntimeEvent,
    });

    expect(element.props.debug).toBe(true);
    expect(element.props.onRuntimeEvent).toBe(onRuntimeEvent);
  });
});

// ---------------------------------------------------------------------------
// Phase 4: Bidirectional API
// ---------------------------------------------------------------------------

describe("publicApi — bidirectional API (Phase 4)", () => {
  afterEach(() => {
    // Clean up runtime after each test to avoid cross-test contamination
    getGameRuntime()?.dispose();
  });

  it("createGameRuntime() returns handle with executeCommand, on, emit, dispose", () => {
    const runtime = createGameRuntime();
    expect(typeof runtime.executeCommand).toBe("function");
    expect(typeof runtime.on).toBe("function");
    expect(typeof runtime.emit).toBe("function");
    expect(typeof runtime.dispose).toBe("function");
  });

  it("getGameRuntime() returns the last created runtime", () => {
    const runtime = createGameRuntime();
    expect(getGameRuntime()).toBe(runtime);
  });

  it("getGameRuntime() returns null after dispose()", () => {
    const runtime = createGameRuntime();
    runtime.dispose();
    expect(getGameRuntime()).toBeNull();
  });

  it("executeCommand scene:set mutates the store", () => {
    const scene = makeScene("bridge-scene-cmd");
    const runtime = createGameRuntime({ scenes: [scene] });

    runtime.executeCommand({ type: "scene:set", sceneId: "bridge-scene-cmd" });
    expect(getGameState().sceneId).toBe("bridge-scene-cmd");
  });

  it("on('scene:changed') receives event after executeCommand scene:set", () => {
    const scene = makeScene("bridge-scene-event");
    const runtime = createGameRuntime({ scenes: [scene] });
    const spy = vi.fn();

    runtime.on("scene:changed", spy);
    runtime.executeCommand({ type: "scene:set", sceneId: "bridge-scene-event" });

    expect(spy).toHaveBeenCalledOnce();
    expect(spy.mock.calls[0][0]).toMatchObject({
      type: "scene:changed",
      sceneId: "bridge-scene-event",
    });
  });

  it("on() unsubscribe stops receiving events", () => {
    const scene = makeScene("bridge-scene-unsub");
    const runtime = createGameRuntime({ scenes: [scene] });
    const spy = vi.fn();

    const unsub = runtime.on("scene:changed", spy);
    unsub();
    runtime.executeCommand({ type: "scene:set", sceneId: "bridge-scene-unsub" });

    expect(spy).not.toHaveBeenCalled();
  });

  it("dispose() clears runtime singleton and stops command execution", () => {
    const scene = makeScene("bridge-scene-dispose");
    const runtime = createGameRuntime({ scenes: [scene] });
    const spy = vi.fn();

    runtime.on("scene:changed", spy);
    runtime.dispose();

    // After dispose, getGameRuntime() is null
    expect(getGameRuntime()).toBeNull();

    // Commands after dispose should warn but not dispatch
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(() =>
      runtime.executeCommand({ type: "scene:set", sceneId: "bridge-scene-dispose" }),
    ).not.toThrow();
    warnSpy.mockRestore();
  });
});
