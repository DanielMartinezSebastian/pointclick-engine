import { describe, it, expect, vi, afterEach } from "vitest";
import {
  createGameRuntime,
  getGameRuntime,
  getGameState,
  getGameActions,
  registerScene,
  registerItem,
  registerRule,
  toRuntimeScene,
  useSceneStore,
  type GameRuntime,
  type GameSceneConfig,
  type GameItemConfig,
  type GameRuleConfig,
} from "../index";

function makeScene(id: string, extra: Partial<GameSceneConfig> = {}): GameSceneConfig {
  return {
    id,
    label: `Scene ${id}`,
    background: "/bg.png",
    playerSpawn: [0, 0, 0],
    ground: { minX: -5, maxX: 5, minZ: -5, maxZ: 5, y: 0 },
    walls: [],
    interactions: [],
    ...extra,
  };
}

function makeItem(id: string): GameItemConfig {
  return {
    id,
    name: id,
    spriteUrl: "/i.png",
    interactionRules: {},
    defaultRule: { outcome: "return" },
  };
}

const makeRule = (key: string): GameRuleConfig => ({ key, phrases: ["hola"] });

let rt: GameRuntime | null = null;
afterEach(() => {
  rt?.dispose();
  rt = null;
  vi.restoreAllMocks();
});

describe("registry", () => {
  it("createGameRuntime devuelve escenas/items/rules registrados", () => {
    rt = createGameRuntime({
      scenes: [makeScene("rt-a")],
      items: [makeItem("rt-item")],
      rules: [makeRule("rt.rule")],
    });
    expect(rt.getScenes()["rt-a"]).toMatchObject({ id: "rt-a" });
    expect(rt.getItems()["rt-item"]).toMatchObject({ id: "rt-item" });
    expect(rt.getRules()["rt.rule"]).toMatchObject({ key: "rt.rule" });
  });

  it("re-registrar sobreescribe por id/key", () => {
    registerScene(makeScene("rt-over", { label: "v1" }));
    registerScene(makeScene("rt-over", { label: "v2" }));
    registerItem({ ...makeItem("rt-over-i"), name: "v1" });
    registerItem({ ...makeItem("rt-over-i"), name: "v2" });
    registerRule({ key: "rt.over", phrases: ["v1"] });
    registerRule({ key: "rt.over", phrases: ["v2"] });
    rt = createGameRuntime();
    expect(rt.getScenes()["rt-over"]!.label).toBe("v2");
    expect(rt.getItems()["rt-over-i"]!.name).toBe("v2");
    expect(rt.getRules()["rt.over"]!.phrases).toEqual(["v2"]);
  });

  it("toRuntimeScene conserva transitions y music", () => {
    const cfg = makeScene("rt-conv", {
      music: { trackUrl: "/m.mp3" },
      transitions: [
        { id: "t", kind: "collision", targetSceneId: "x", position: [0, 0, 0], halfSize: [1, 1, 1] },
      ],
    });
    const scene = toRuntimeScene(cfg);
    expect(scene.music).toEqual({ trackUrl: "/m.mp3" });
    expect(scene.transitions).toHaveLength(1);
  });
});

describe("scene commands", () => {
  it("scene:set conserva transitions y music en el store", () => {
    rt = createGameRuntime({
      scenes: [
        makeScene("rt-full", {
          music: { trackUrl: "/m.mp3", persistAcrossScenes: true },
          transitions: [
            { id: "t1", kind: "collision", targetSceneId: "rt-b", position: [1, 0, 1], halfSize: [1, 1, 1] },
          ],
        }),
      ],
    });
    rt.executeCommand({ type: "scene:set", sceneId: "rt-full" });
    const { scene, sceneId } = useSceneStore.getState();
    expect(sceneId).toBe("rt-full");
    expect(scene.music).toEqual({ trackUrl: "/m.mp3", persistAcrossScenes: true });
    expect(scene.transitions?.map((t) => t.id)).toEqual(["t1"]);
  });

  it("scene:set emite scene:changed", () => {
    rt = createGameRuntime({ scenes: [makeScene("rt-ev")] });
    const handler = vi.fn();
    rt.on("scene:changed", handler);
    rt.executeCommand({ type: "scene:set", sceneId: "rt-ev" });
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0]![0]).toMatchObject({ sceneId: "rt-ev" });
  });

  it("scene:set con escena no registrada hace warn y no cambia estado", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    rt = createGameRuntime({ scenes: [makeScene("rt-keep")] });
    rt.executeCommand({ type: "scene:set", sceneId: "rt-keep" });
    rt.executeCommand({ type: "scene:set", sceneId: "no-existe" });
    expect(warn).toHaveBeenCalled();
    expect(getGameState().sceneId).toBe("rt-keep");
  });

  it("scene:respawn incrementa respawnSignal", () => {
    rt = createGameRuntime();
    const before = getGameState().respawnSignal;
    rt.executeCommand({ type: "scene:respawn" });
    expect(getGameState().respawnSignal).toBe(before + 1);
  });

  it("player:move actualiza la posición", () => {
    rt = createGameRuntime();
    rt.executeCommand({ type: "player:move", position: [2, 0, 3] });
    expect(getGameState().playerPosition).toEqual([2, 0, 3]);
  });
});

describe("transition commands", () => {
  const scenes = () => [
    makeScene("rt-from", {
      transitions: [
        { id: "go", kind: "collision", targetSceneId: "rt-to", position: [3, 0, 3], halfSize: [1, 1, 1] },
        { id: "bad", kind: "collision", targetSceneId: "rt-missing", position: [3, 0, 3], halfSize: [1, 1, 1] },
      ],
    }),
    makeScene("rt-to"),
  ];

  it("transition:activate cambia de escena y emite started + completed", () => {
    rt = createGameRuntime({ scenes: scenes() });
    rt.executeCommand({ type: "scene:set", sceneId: "rt-from" });
    const started = vi.fn();
    const completed = vi.fn();
    rt.on("transition:started", started);
    rt.on("transition:completed", completed);
    rt.executeCommand({ type: "transition:activate", transitionId: "go" });
    expect(getGameState().sceneId).toBe("rt-to");
    expect(started).toHaveBeenCalledWith({ type: "transition:started", transitionId: "go" });
    expect(completed).toHaveBeenCalledWith({
      type: "transition:completed",
      fromSceneId: "rt-from",
      toSceneId: "rt-to",
    });
  });

  it("transition:activate desconocida hace warn y no cambia escena", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    rt = createGameRuntime({ scenes: scenes() });
    rt.executeCommand({ type: "scene:set", sceneId: "rt-from" });
    rt.executeCommand({ type: "transition:activate", transitionId: "nope" });
    expect(warn).toHaveBeenCalled();
    expect(getGameState().sceneId).toBe("rt-from");
  });

  it("transition:activate a escena no registrada emite started pero no completed", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    rt = createGameRuntime({ scenes: scenes() });
    rt.executeCommand({ type: "scene:set", sceneId: "rt-from" });
    const started = vi.fn();
    const completed = vi.fn();
    rt.on("transition:started", started);
    rt.on("transition:completed", completed);
    rt.executeCommand({ type: "transition:activate", transitionId: "bad" });
    expect(started).toHaveBeenCalledTimes(1);
    expect(completed).not.toHaveBeenCalled();
    expect(getGameState().sceneId).toBe("rt-from");
  });
});

describe("player:walkTo", () => {
  it("destino alcanzable activa playerWalkingState y emite walkStarted", () => {
    rt = createGameRuntime({ scenes: [makeScene("rt-walk")] });
    rt.executeCommand({ type: "scene:set", sceneId: "rt-walk" });
    useSceneStore.getState().setPlayerWalkingState(null);
    const started = vi.fn();
    rt.on("player:walkStarted", started);
    rt.executeCommand({ type: "player:walkTo", position: [3, 0, 3] });
    const walking = useSceneStore.getState().playerWalkingState;
    expect(walking?.isActive).toBe(true);
    expect(walking!.pathPoints.length).toBeGreaterThanOrEqual(2);
    expect(walking!.targetPosition).toEqual([3, 0, 3]);
    expect(started).toHaveBeenCalledTimes(1);
  });

  it("destino inalcanzable emite walkAborted y no usa console.log", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    // Un bloque con colisión que cubre todo el suelo deja al jugador sin ruta.
    const blocker = {
      id: "blocker",
      position: [0, 0, 0],
      halfSize: [20, 1, 20],
      hasCollision: true,
    } as unknown as GameSceneConfig["interactions"][number];
    rt = createGameRuntime({ scenes: [makeScene("rt-walk2", { interactions: [blocker] })] });
    rt.executeCommand({ type: "scene:set", sceneId: "rt-walk2" });
    useSceneStore.getState().setPlayerWalkingState(null);
    const aborted = vi.fn();
    rt.on("player:walkAborted", aborted);
    rt.executeCommand({ type: "player:walkTo", position: [99, 0, 99] });
    expect(aborted).toHaveBeenCalledWith({ type: "player:walkAborted", reason: "unreachable" });
    expect(useSceneStore.getState().playerWalkingState).toBeNull();
    expect(log).not.toHaveBeenCalled();
  });
});

describe("dialog / inventory commands", () => {
  it("dialog:trigger sin adapter no lanza y emite el evento", () => {
    rt = createGameRuntime({ rules: [makeRule("rt.dlg")] });
    const handler = vi.fn();
    rt.on("dialog:triggered", handler);
    expect(() => rt!.executeCommand({ type: "dialog:trigger", dialogKey: "rt.dlg" })).not.toThrow();
    expect(handler).toHaveBeenCalledWith({
      type: "dialog:triggered",
      text: "hola",
      dialogKey: "rt.dlg",
      source: "command",
    });
  });

  it("dialog:trigger con clave sin regla usa la clave como texto y llama al adapter", () => {
    const adapter = { show: vi.fn(), hide: vi.fn() };
    rt = createGameRuntime({ dialogAdapter: adapter });
    rt.executeCommand({ type: "dialog:trigger", dialogKey: "rt.sin.regla" });
    expect(adapter.show).toHaveBeenCalledWith("rt.sin.regla", "rt.sin.regla");
  });

  it("dialog:dismiss incluye la clave activa y llama a hide", () => {
    const adapter = { show: vi.fn(), hide: vi.fn() };
    rt = createGameRuntime({ dialogAdapter: adapter });
    const handler = vi.fn();
    rt.on("dialog:dismissed", handler);
    rt.executeCommand({ type: "dialog:trigger", dialogKey: "k" });
    rt.executeCommand({ type: "dialog:dismiss" });
    expect(adapter.hide).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith({ type: "dialog:dismissed", dialogKey: "k" });
  });

  it("inventory:toggle delega en el adapter y es no-op sin él", () => {
    const adapter = { toggle: vi.fn(), isOpen: () => false };
    rt = createGameRuntime({ inventoryAdapter: adapter });
    rt.executeCommand({ type: "inventory:toggle" });
    expect(adapter.toggle).toHaveBeenCalledTimes(1);
    rt.dispose();
    rt = createGameRuntime();
    expect(() => rt!.executeCommand({ type: "inventory:toggle" })).not.toThrow();
  });
});

describe("accessors, bus y dispose", () => {
  it("getGameState / getGameActions.setScene funcionan sin hooks", () => {
    registerScene(makeScene("rt-acc"));
    getGameActions().setScene("rt-acc");
    expect(getGameState().sceneId).toBe("rt-acc");
  });

  it("getGameActions.setScene conserva transitions y music", () => {
    registerScene(
      makeScene("rt-acc2", {
        music: { trackUrl: "/x.mp3" },
        transitions: [
          { id: "q", kind: "collision", targetSceneId: "a", position: [0, 0, 0], halfSize: [1, 1, 1] },
        ],
      }),
    );
    getGameActions().setScene("rt-acc2");
    const { scene } = getGameState();
    expect(scene.music?.trackUrl).toBe("/x.mp3");
    expect(scene.transitions).toHaveLength(1);
  });

  it("getGameActions.setScene con escena no registrada hace warn", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    getGameActions().setScene("rt-ghost");
    expect(warn).toHaveBeenCalled();
  });

  it("emit y on funcionan, y unsubscribe corta la suscripción", () => {
    rt = createGameRuntime();
    const handler = vi.fn();
    const off = rt.on("dialog:dismissed", handler);
    rt.emit({ type: "dialog:dismissed" });
    off();
    rt.emit({ type: "dialog:dismissed" });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("getGameRuntime devuelve el handle activo", () => {
    rt = createGameRuntime();
    expect(getGameRuntime()).toBe(rt);
  });

  it("dispose limpia bus, comandos y singleton", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    rt = createGameRuntime({ scenes: [makeScene("rt-disp")] });
    const handler = vi.fn();
    rt.on("scene:changed", handler);
    rt.dispose();
    expect(getGameRuntime()).toBeNull();
    // comandos limpiados: ya no cambia de escena
    const before = getGameState().sceneId;
    rt.executeCommand({ type: "scene:set", sceneId: "rt-disp" });
    expect(getGameState().sceneId).toBe(before);
    // emisor del store desactivado y bus vacío
    useSceneStore.getState().setScene("rt-disp", toRuntimeScene(makeScene("rt-disp")));
    expect(handler).not.toHaveBeenCalled();
    rt = null;
  });

  it("dispose de un runtime antiguo no borra el singleton del nuevo", () => {
    const first = createGameRuntime();
    const second = createGameRuntime();
    first.dispose();
    expect(getGameRuntime()).toBe(second);
    rt = second;
  });
});
