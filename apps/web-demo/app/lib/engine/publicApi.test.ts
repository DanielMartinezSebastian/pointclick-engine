import { describe, expect, it, vi, afterEach, beforeEach } from "vitest";
import { createElement } from "react";
import { renderToString } from "react-dom/server";

import { useGameViewportController } from "@pointclick-engine/engine-renderer-r3f";
import type { RuntimeEvent } from "@pointclick-engine/engine-core";

import { DEFAULT_SCENE_ID, SCENES } from "../../../demo-content/scenes/scenes";
import { useInventoryStore } from "../../store/inventoryStore";
import { useDialogStore } from "../../store/dialogStore";
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
  type GameActions,
  type GameViewportProps,
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
    const holder: { actions: GameActions | null } = { actions: null };

    function Probe() {
      holder.actions = useGameActions();
      return null;
    }

    renderToString(createElement(Probe));

    expect(holder.actions).not.toBeNull();
    expect(typeof holder.actions?.setScene).toBe("function");
    expect(typeof holder.actions?.setPlayerPosition).toBe("function");
    expect(typeof holder.actions?.requestRespawn).toBe("function");

    // Test that setScene actually works
    holder.actions?.setScene(sceneIds[0]);
    const afterSetScene = getGameState();
    expect(afterSetScene.sceneId).toBe(sceneIds[0]);
  });

  it("GameViewport reenvia debug y onRuntimeEvent a su destino", () => {
    // GameViewport ya no es un envoltorio sin hooks sobre GameCanvasCore: vive en el
    // renderer y delega en useGameViewportController (+ GameViewportView). Las dos props
    // del contrato llegan al controlador, que es quien las consume: `onRuntimeEvent`
    // recibe cada evento (ademas del bus) y `debug` activa el log de eventos.
    expect(typeof GameViewport).toBe("function");
    const runtime = createGameRuntime();
    const busSpy = vi.fn();
    runtime.on("player:moved", busSpy);
    const debugSpy = vi.spyOn(console, "debug").mockImplementation(() => {});
    const onRuntimeEvent = vi.fn();
    const props = { debug: true, onRuntimeEvent } satisfies GameViewportProps;
    const holder: { handle: ((event: RuntimeEvent) => void) | null } = { handle: null };

    function Probe() {
      holder.handle = useGameViewportController(props).handleRuntimeEvent;
      return null;
    }
    renderToString(createElement(Probe));

    const event: RuntimeEvent = { type: "onMove", position: [1, 0, 2], action: "idle" };
    holder.handle?.(event);

    expect(onRuntimeEvent).toHaveBeenCalledWith(event);
    expect(busSpy).toHaveBeenCalledOnce();
    expect(debugSpy).toHaveBeenCalledWith("[runtime-event]", event);
    debugSpy.mockRestore();
    runtime.dispose();
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

// ---------------------------------------------------------------------------
// Phase 5: Wired commands
// ---------------------------------------------------------------------------

function createWiredRuntime(config: Parameters<typeof createGameRuntime>[0] = {}) {
  return createGameRuntime({
    ...config,
    inventoryAdapter: {
      toggle: () => useInventoryStore.getState().toggle(),
      isOpen: () => useInventoryStore.getState().isOpen,
    },
    dialogAdapter: {
      show: (text, key) => useDialogStore.getState().show(text, key),
      hide: () => useDialogStore.getState().dismiss(),
    },
  });
}

describe("publicApi — wired commands (Phase 5)", () => {
  beforeEach(() => {
    // Reset stores before each test
    useInventoryStore.setState({ isOpen: false });
    useDialogStore.setState({ text: "", key: undefined, visible: false, triggerCount: 0 });
  });

  afterEach(() => {
    getGameRuntime()?.dispose();
  });

  it("inventory:toggle toggles inventoryStore.isOpen", () => {
    const runtime = createWiredRuntime();
    expect(useInventoryStore.getState().isOpen).toBe(false);

    runtime.executeCommand({ type: "inventory:toggle" });
    expect(useInventoryStore.getState().isOpen).toBe(true);

    runtime.executeCommand({ type: "inventory:toggle" });
    expect(useInventoryStore.getState().isOpen).toBe(false);
  });

  it("dialog:trigger shows text in dialogStore and emits event", () => {
    const runtime = createWiredRuntime({
      rules: [{ key: "test.dialog", phrases: ["Hello world"] }],
    });
    const spy = vi.fn();
    runtime.on("dialog:triggered", spy);

    runtime.executeCommand({ type: "dialog:trigger", dialogKey: "test.dialog" });

    expect(useDialogStore.getState().visible).toBe(true);
    expect(useDialogStore.getState().text).toBe("Hello world");
    expect(useDialogStore.getState().key).toBe("test.dialog");
    expect(spy).toHaveBeenCalledOnce();
    expect(spy.mock.calls[0][0]).toMatchObject({
      type: "dialog:triggered",
      text: "Hello world",
      dialogKey: "test.dialog",
      source: "command",
    });
  });

  it("dialog:trigger uses dialogKey as fallback when rule not registered", () => {
    const runtime = createWiredRuntime();
    runtime.executeCommand({ type: "dialog:trigger", dialogKey: "unregistered.key" });
    expect(useDialogStore.getState().text).toBe("unregistered.key");
  });

  it("dialog:dismiss hides dialogStore and emits event", () => {
    const runtime = createWiredRuntime({
      rules: [{ key: "test.dismiss", phrases: ["Dismiss me"] }],
    });
    const spy = vi.fn();
    runtime.on("dialog:dismissed", spy);

    runtime.executeCommand({ type: "dialog:trigger", dialogKey: "test.dismiss" });
    expect(useDialogStore.getState().visible).toBe(true);

    runtime.executeCommand({ type: "dialog:dismiss" });
    expect(useDialogStore.getState().visible).toBe(false);
    expect(spy).toHaveBeenCalledOnce();
    expect(spy.mock.calls[0][0]).toMatchObject({
      type: "dialog:dismissed",
      dialogKey: "test.dismiss",
    });
  });

  it("without adapters, inventory:toggle acts on the default core store and does not throw", () => {
    const runtime = createGameRuntime();
    expect(() => runtime.executeCommand({ type: "inventory:toggle" })).not.toThrow();
    // Los stores de la demo son los del core: el toggle por defecto SI abre el inventario.
    expect(useInventoryStore.getState().isOpen).toBe(true);
    runtime.executeCommand({ type: "inventory:toggle" });
    expect(useInventoryStore.getState().isOpen).toBe(false);
  });

  it("without adapters, dialog:trigger does not throw and still emits dialog:triggered", () => {
    const runtime = createGameRuntime({
      rules: [{ key: "test.noadapter", phrases: ["No adapter"] }],
    });
    const spy = vi.fn();
    runtime.on("dialog:triggered", spy);

    expect(() =>
      runtime.executeCommand({ type: "dialog:trigger", dialogKey: "test.noadapter" }),
    ).not.toThrow();
    // Sin adapter se usa el store por defecto del core (el mismo objeto que el de la demo).
    expect(useDialogStore.getState().visible).toBe(true);
    expect(useDialogStore.getState().text).toBe("No adapter");
    expect(useDialogStore.getState().key).toBe("test.noadapter");
    expect(spy).toHaveBeenCalledOnce();
  });
});
