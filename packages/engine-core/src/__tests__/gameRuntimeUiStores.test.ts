import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import {
  createGameRuntime,
  getGameState,
  getDialogState,
  getInventoryUiState,
  useDialogStore,
  useInventoryUiStore,
  type GameRuntime,
  type GameSceneConfig,
} from "../index";

function makeScene(id: string, extra: Partial<GameSceneConfig> = {}): GameSceneConfig {
  return {
    id,
    label: `Scene ${id}`,
    background: "/bg.png",
    playerSpawn: [1, 0, 1],
    ground: { minX: -5, maxX: 5, minZ: -5, maxZ: 5, y: 0 },
    walls: [],
    interactions: [],
    ...extra,
  };
}

const resetStores = () => {
  useDialogStore.setState({ text: "", key: undefined, visible: false, triggerCount: 0 });
  useInventoryUiStore.setState({ isOpen: false });
};

let rt: GameRuntime | null = null;
beforeEach(resetStores);
afterEach(() => {
  rt?.dispose();
  rt = null;
  resetStores();
  vi.restoreAllMocks();
});

describe("scene:set / transition:activate con spawn", () => {
  it("scene:set sin spawnPosition usa el playerSpawn de la escena", () => {
    rt = createGameRuntime({ scenes: [makeScene("ui-a")] });
    rt.executeCommand({ type: "scene:set", sceneId: "ui-a" });
    expect(getGameState().playerPosition).toEqual([1, 0, 1]);
  });

  it("scene:set con spawnPosition coloca al jugador ahí", () => {
    rt = createGameRuntime({ scenes: [makeScene("ui-a")] });
    rt.executeCommand({ type: "scene:set", sceneId: "ui-a", spawnPosition: [3, 0, -2] });
    expect(getGameState().playerPosition).toEqual([3, 0, -2]);
  });

  const withTransition = (spawnPosition?: [number, number, number]) => [
    makeScene("ui-from", {
      transitions: [
        {
          id: "ui-go",
          kind: "collision",
          targetSceneId: "ui-to",
          position: [0, 0, 0],
          halfSize: [1, 1, 1],
          ...(spawnPosition ? { spawnPosition } : {}),
        },
      ],
    }),
    makeScene("ui-to", { playerSpawn: [9, 0, 9] }),
  ];

  it("transition:activate con spawnPosition lo usa", () => {
    rt = createGameRuntime({ scenes: withTransition([2, 0, 4]) });
    rt.executeCommand({ type: "scene:set", sceneId: "ui-from" });
    rt.executeCommand({ type: "transition:activate", transitionId: "ui-go" });
    expect(getGameState().sceneId).toBe("ui-to");
    expect(getGameState().playerPosition).toEqual([2, 0, 4]);
  });

  it("transition:activate sin spawnPosition usa el playerSpawn destino", () => {
    rt = createGameRuntime({ scenes: withTransition() });
    rt.executeCommand({ type: "scene:set", sceneId: "ui-from" });
    rt.executeCommand({ type: "transition:activate", transitionId: "ui-go" });
    expect(getGameState().playerPosition).toEqual([9, 0, 9]);
  });
});

describe("dialog sin adapter (store del core)", () => {
  it("dialog:trigger escribe en el store del core", () => {
    rt = createGameRuntime({ rules: [{ key: "ui.d", phrases: ["hola"] }] });
    rt.executeCommand({ type: "dialog:trigger", dialogKey: "ui.d" });
    expect(getDialogState()).toMatchObject({ text: "hola", key: "ui.d", visible: true });
  });

  it("dialog:dismiss oculta el diálogo", () => {
    rt = createGameRuntime();
    rt.executeCommand({ type: "dialog:trigger", dialogKey: "ui.x" });
    rt.executeCommand({ type: "dialog:dismiss" });
    expect(getDialogState().visible).toBe(false);
  });

  it("triggerCount incrementa en cada disparo y no en dismiss", () => {
    rt = createGameRuntime();
    rt.executeCommand({ type: "dialog:trigger", dialogKey: "a" });
    rt.executeCommand({ type: "dialog:trigger", dialogKey: "a" });
    expect(getDialogState().triggerCount).toBe(2);
    rt.executeCommand({ type: "dialog:dismiss" });
    expect(getDialogState().triggerCount).toBe(2);
  });

  it("con dialogAdapter el store del core no se toca", () => {
    const adapter = { show: vi.fn(), hide: vi.fn() };
    rt = createGameRuntime({ dialogAdapter: adapter });
    rt.executeCommand({ type: "dialog:trigger", dialogKey: "k" });
    rt.executeCommand({ type: "dialog:dismiss" });
    expect(adapter.show).toHaveBeenCalledWith("k", "k");
    expect(adapter.hide).toHaveBeenCalled();
    expect(getDialogState()).toMatchObject({ visible: false, triggerCount: 0, text: "" });
  });

  it("show del store conserva forma de la demo (key opcional)", () => {
    useDialogStore.getState().show("t");
    expect(getDialogState()).toMatchObject({ text: "t", key: undefined, visible: true, triggerCount: 1 });
  });
});

describe("inventory sin adapter (store del core)", () => {
  it("inventory:toggle alterna el store", () => {
    rt = createGameRuntime();
    rt.executeCommand({ type: "inventory:toggle" });
    expect(getInventoryUiState().isOpen).toBe(true);
    rt.executeCommand({ type: "inventory:toggle" });
    expect(getInventoryUiState().isOpen).toBe(false);
  });

  it("con inventoryAdapter el store del core no se toca", () => {
    const adapter = { toggle: vi.fn(), isOpen: () => false };
    rt = createGameRuntime({ inventoryAdapter: adapter });
    rt.executeCommand({ type: "inventory:toggle" });
    expect(adapter.toggle).toHaveBeenCalledTimes(1);
    expect(getInventoryUiState().isOpen).toBe(false);
  });

  it("open/close del store funcionan", () => {
    getInventoryUiState().open();
    expect(getInventoryUiState().isOpen).toBe(true);
    getInventoryUiState().close();
    expect(getInventoryUiState().isOpen).toBe(false);
  });
});
