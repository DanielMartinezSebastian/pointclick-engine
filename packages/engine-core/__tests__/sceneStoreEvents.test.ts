import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  useSceneStore,
  setSceneStoreEmitter,
} from "../src/game/state/sceneStore";
import type { GameScene } from "../src/game/types";
import type { GameEvent } from "../src/game/events/types";

const sceneFixture: GameScene = {
  id: "test-scene",
  label: "Test Scene",
  background: "/bg.jpg",
  playerSpawn: [0, 0, 0],
  ground: { minX: -10, maxX: 10, minZ: -10, maxZ: 10, y: 0 },
  walls: [],
  interactions: [],
};

beforeEach(() => {
  // Reset store to clean state
  useSceneStore.setState({
    sceneId: "",
    scene: {
      id: "",
      label: "",
      background: "",
      playerSpawn: [0, 0, 0],
      ground: { minX: 0, maxX: 0, minZ: 0, maxZ: 0, y: 0 },
      walls: [],
      interactions: [],
    },
    playerPosition: [0, 0, 0],
    respawnSignal: 0,
  });
  // Ensure emitter starts null
  setSceneStoreEmitter(null);
});

afterEach(() => {
  // Clean up emitter after each test
  setSceneStoreEmitter(null);
});

describe("sceneStore events — zero-event mode", () => {
  it("setScene does not throw when no emitter is registered", () => {
    expect(() =>
      useSceneStore.getState().setScene("test-scene", sceneFixture),
    ).not.toThrow();
  });

  it("requestRespawn does not throw when no emitter is registered", () => {
    useSceneStore.getState().setScene("test-scene", sceneFixture);
    expect(() => useSceneStore.getState().requestRespawn()).not.toThrow();
  });
});

describe("sceneStore events — with emitter", () => {
  it("setScene emits scene:changed with correct payload", () => {
    const spy = vi.fn<[GameEvent], void>();
    setSceneStoreEmitter(spy);

    useSceneStore.getState().setScene("test-scene", sceneFixture);

    expect(spy).toHaveBeenCalledOnce();
    const emitted = spy.mock.calls[0][0];
    expect(emitted.type).toBe("scene:changed");
    if (emitted.type === "scene:changed") {
      expect(emitted.sceneId).toBe("test-scene");
      expect(emitted.scene.id).toBe("test-scene");
    }
  });

  it("requestRespawn emits scene:respawnRequested with current sceneId", () => {
    const spy = vi.fn<[GameEvent], void>();
    useSceneStore.getState().setScene("level-1", sceneFixture);

    setSceneStoreEmitter(spy);
    spy.mockClear(); // clear the setScene emission

    useSceneStore.getState().requestRespawn();

    expect(spy).toHaveBeenCalledOnce();
    const emitted = spy.mock.calls[0][0];
    expect(emitted.type).toBe("scene:respawnRequested");
    if (emitted.type === "scene:respawnRequested") {
      expect(emitted.sceneId).toBe("level-1");
    }
  });

  it("setPlayerPosition does NOT emit any event", () => {
    const spy = vi.fn<[GameEvent], void>();
    setSceneStoreEmitter(spy);

    useSceneStore.getState().setPlayerPosition([5, 0, 5]);

    expect(spy).not.toHaveBeenCalled();
  });

  it("setSceneStoreEmitter(null) deactivates emissions", () => {
    const spy = vi.fn<[GameEvent], void>();
    setSceneStoreEmitter(spy);
    setSceneStoreEmitter(null);

    useSceneStore.getState().setScene("test-scene", sceneFixture);

    expect(spy).not.toHaveBeenCalled();
  });
});
