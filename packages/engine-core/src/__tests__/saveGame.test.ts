import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  SAVE_FORMAT_VERSION,
  SAVE_STORAGE_KEY,
  applySaveMigrations,
  applySnapshot,
  captureSnapshot,
  clearSave,
  createGameRuntime,
  getInventoryState,
  getPlacedItemsState,
  getWorldState,
  loadGame,
  migrateLegacySave,
  saveGame,
  useInventoryStateStore,
  usePlacedItemsStateStore,
  useSceneStore,
  type GameRuntime,
  type GameSceneConfig,
  type GameSnapshot,
  type KeyValueStoragePort,
} from "../index";

function makeScene(id: string, spawn: [number, number, number] = [0, 0, 0]): GameSceneConfig {
  return {
    id,
    label: id,
    background: "/bg.png",
    playerSpawn: spawn,
    ground: { minX: -5, maxX: 5, minZ: -5, maxZ: 5, y: 0 },
    walls: [],
    interactions: [],
  };
}

function memStorage(initial: Record<string, string> = {}) {
  const data: Record<string, string> = { ...initial };
  const removeItem = vi.fn((k: string) => {
    delete data[k];
  });
  const storage: KeyValueStoragePort & { data: Record<string, string>; clear: () => void } = {
    data,
    getItem: (k) => (k in data ? data[k]! : null),
    setItem: (k, v) => {
      data[k] = v;
    },
    removeItem,
    clear: vi.fn(),
  };
  return storage;
}

const gb = { id: "gameboy", name: "Gameboy", spriteUrl: "/gb.png", quantity: 2 };
const trophy = {
  id: "trophy-ground",
  itemId: "trophy",
  interactionId: "trophy-ground-pickup",
  name: "Trophy",
  spriteUrl: "/t.png",
  worldPosition: [5.5, -1.3, 22] as [number, number, number],
  canPickup: true,
  sceneId: "kitchen",
};

let rt: GameRuntime | null = null;

function resetAll() {
  useInventoryStateStore.getState().reset(9);
  usePlacedItemsStateStore.getState().reset();
  getWorldState().reset();
  useSceneStore.setState({ sceneId: "", playerPosition: [0, 0, 0] });
}

function boot(storage?: KeyValueStoragePort) {
  rt = createGameRuntime({
    scenes: [makeScene("hall", [1, 0, 1]), makeScene("kitchen", [2, 0, 2])],
    storage,
  });
  return rt;
}

beforeEach(resetAll);
afterEach(() => {
  rt?.dispose();
  rt = null;
  resetAll();
  vi.restoreAllMocks();
});

function fillState() {
  useInventoryStateStore.getState().setSlots([gb, null, null]);
  getPlacedItemsState().setItems([trophy]);
  getPlacedItemsState().setSeededSceneIds(["kitchen"]);
  getWorldState().setFlag("metGuard", true);
  getWorldState().setFlag("coins", 3);
  getWorldState().markSceneVisited("hall");
}

describe("captureSnapshot / applySnapshot", () => {
  it("version es el primer campo y vale SAVE_FORMAT_VERSION", () => {
    boot();
    rt!.executeCommand({ type: "scene:set", sceneId: "hall" });
    const snap = captureSnapshot();
    expect(Object.keys(snap)[0]).toBe("version");
    expect(snap.version).toBe(SAVE_FORMAT_VERSION);
    expect(snap.sceneId).toBe("hall");
    expect(snap.playerPosition).toEqual([1, 0, 1]);
    expect(snap.extra).toBeUndefined();
  });

  it("ida y vuelta completa", () => {
    boot();
    rt!.executeCommand({ type: "scene:set", sceneId: "kitchen", spawnPosition: [3, 0, -2] });
    fillState();
    const snap = JSON.parse(JSON.stringify(captureSnapshot({ "door-states": { a: 1 } })));
    resetAll();
    rt!.executeCommand({ type: "scene:set", sceneId: "hall" });
    expect(applySnapshot(snap)).toBe(true);
    expect(useSceneStore.getState().sceneId).toBe("kitchen");
    expect(useSceneStore.getState().playerPosition).toEqual([3, 0, -2]);
    expect(getInventoryState().slots).toEqual([gb, null, null]);
    expect(getPlacedItemsState().items).toEqual([trophy]);
    expect(getPlacedItemsState().seededSceneIds).toEqual(["kitchen"]);
    expect(getWorldState().flags).toEqual({ metGuard: true, coins: 3 });
    expect(getWorldState().visitedSceneIds).toContain("hall");
  });

  it("restaura el estado ANTES de fijar la escena", () => {
    boot();
    const snap: GameSnapshot = {
      version: 1,
      sceneId: "kitchen",
      inventory: [gb],
      placedItems: [trophy],
      seededSceneIds: ["kitchen"],
      flags: { f: 1 },
      visitedSceneIds: [],
    };
    const seen: unknown[] = [];
    rt!.on("scene:changed", () => {
      seen.push({
        flags: { ...getWorldState().flags },
        inv: getInventoryState().slots.length,
        items: getPlacedItemsState().items.length,
      });
    });
    applySnapshot(snap);
    expect(seen).toEqual([{ flags: { f: 1 }, inv: 1, items: 1 }]);
  });

  it("sin playerPosition usa el spawn por defecto de la escena", () => {
    boot();
    applySnapshot({
      version: 1,
      sceneId: "kitchen",
      inventory: [],
      placedItems: [],
      seededSceneIds: [],
      flags: {},
      visitedSceneIds: [],
    });
    expect(useSceneStore.getState().playerPosition).toEqual([2, 0, 2]);
  });

  it("escena no registrada: no cambia de escena, avisa y devuelve false", () => {
    boot();
    rt!.executeCommand({ type: "scene:set", sceneId: "hall" });
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const ok = applySnapshot({
      version: 1,
      sceneId: "ghost",
      inventory: [],
      placedItems: [],
      seededSceneIds: [],
      flags: { x: true },
      visitedSceneIds: [],
    });
    expect(ok).toBe(false);
    expect(warn).toHaveBeenCalled();
    expect(useSceneStore.getState().sceneId).toBe("hall");
    // No se aplica a medias: el resto del estado tampoco cambia.
    expect(getWorldState().flags).toEqual({});
  });
});

describe("saveGame / loadGame / clearSave", () => {
  it("guarda JSON con version primero bajo pointclick-save", () => {
    boot();
    rt!.executeCommand({ type: "scene:set", sceneId: "hall" });
    const st = memStorage();
    saveGame(st, { extra: { k: 1 } });
    expect(Object.keys(st.data)).toEqual([SAVE_STORAGE_KEY]);
    expect(st.data["pointclick-save"]!.startsWith('{"version":1,')).toBe(true);
    expect(loadGame(st)!.extra).toEqual({ k: 1 });
  });

  it("clave personalizada", () => {
    const st = memStorage();
    saveGame(st, { key: "slot2" });
    expect(Object.keys(st.data)).toEqual(["slot2"]);
    expect(loadGame(st)).toBeNull();
    expect(loadGame(st, { key: "slot2" })).not.toBeNull();
  });

  it("loadGame: sin clave, JSON corrupto, no objeto y forma inesperada dan null sin lanzar", () => {
    expect(loadGame(memStorage())).toBeNull();
    expect(loadGame(memStorage({ [SAVE_STORAGE_KEY]: "{no json" }))).toBeNull();
    expect(loadGame(memStorage({ [SAVE_STORAGE_KEY]: "[1,2]" }))).toBeNull();
    expect(loadGame(memStorage({ [SAVE_STORAGE_KEY]: '{"version":1,"sceneId":3}' }))).toBeNull();
    expect(loadGame(memStorage({ [SAVE_STORAGE_KEY]: '{"sceneId":"a"}' }))).toBeNull();
  });

  it("loadGame: versión futura da null", () => {
    const snap = { ...captureSnapshot(), version: SAVE_FORMAT_VERSION + 1 };
    expect(loadGame(memStorage({ [SAVE_STORAGE_KEY]: JSON.stringify(snap) }))).toBeNull();
  });

  it("loadGame: getItem que lanza da null", () => {
    const st: KeyValueStoragePort = {
      getItem: () => {
        throw new Error("boom");
      },
      setItem: () => {},
    };
    expect(loadGame(st)).toBeNull();
  });

  it("clearSave borra solo su clave y nunca llama a clear()", () => {
    const st = memStorage({ other: "x", [SAVE_STORAGE_KEY]: "{}" });
    clearSave(st);
    expect(st.data).toEqual({ other: "x" });
    expect(st.clear).not.toHaveBeenCalled();
  });

  it("clearSave sin removeItem vacía la clave y loadGame da null", () => {
    const data: Record<string, string> = {};
    const st: KeyValueStoragePort = {
      getItem: (k) => data[k] ?? null,
      setItem: (k, v) => {
        data[k] = v;
      },
    };
    saveGame(st);
    clearSave(st);
    expect(loadGame(st)).toBeNull();
  });
});

describe("tabla de migraciones", () => {
  it("la tabla real está vacía y la v1 pasa tal cual", () => {
    const raw = { version: 1, a: 1 };
    expect(applySaveMigrations(raw)).toEqual(raw);
  });

  it("encadena migraciones inyectadas hasta el objetivo", () => {
    const out = applySaveMigrations({ version: 1, n: 0 }, 3, {
      1: (s) => ({ ...s, n: (s.n as number) + 1, a: true }),
      2: (s) => ({ ...s, n: (s.n as number) + 10 }),
    });
    expect(out).toEqual({ version: 3, n: 11, a: true });
  });

  it("falta un eslabón, versión inválida o superior: null", () => {
    expect(applySaveMigrations({ version: 1 }, 3, { 1: (s) => s })).toBeNull();
    expect(applySaveMigrations({ version: 0 }, 1)).toBeNull();
    expect(applySaveMigrations({ version: "1" }, 1)).toBeNull();
    expect(applySaveMigrations({ version: 2 }, 1)).toBeNull();
  });
});

describe("migrateLegacySave", () => {
  const legacyItems =
    '{"state":{"items":[{"id":"trophy-ground","itemId":"trophy","interactionId":"trophy-ground-pickup","name":"Trophy","spriteUrl":"/t.png","worldPosition":[5.5,-1.3,22],"canPickup":true,"sceneId":"kitchen"}],"initialItemsCreated":true},"version":0}';
  const legacySlots = '[{"id":"gameboy","name":"Gameboy","spriteUrl":"/gb.png","quantity":1},null,null]';

  it("sin ninguna clave antigua: null (las extraKeys no cuentan)", () => {
    const st = memStorage({ "door-states": "{}" });
    expect(
      migrateLegacySave(st, { defaultSceneId: "hall", extraKeys: ["door-states"] }),
    ).toBeNull();
  });

  it("lee las tres claves antiguas, texto plano de escena, y no escribe ni borra nada", () => {
    boot();
    const st = memStorage({
      "inventory-slots": legacySlots,
      "current-scene-id": "kitchen",
      "placed-items-state": legacyItems,
    });
    const before = { ...st.data };
    const snap = migrateLegacySave(st, {
      defaultSceneId: "hall",
      legacySeededSceneId: "kitchen",
    })!;
    expect(snap.version).toBe(SAVE_FORMAT_VERSION);
    expect(snap.sceneId).toBe("kitchen");
    expect(snap.inventory).toEqual([
      { id: "gameboy", name: "Gameboy", spriteUrl: "/gb.png", quantity: 1 },
      null,
      null,
    ]);
    expect(snap.placedItems).toHaveLength(1);
    expect(snap.seededSceneIds).toEqual(["kitchen"]);
    expect(snap.flags).toEqual({});
    expect(snap.playerPosition).toEqual([2, 0, 2]);
    expect(st.data).toEqual(before);
    expect(st.removeItem).not.toHaveBeenCalled();
  });

  it("claves ausentes: valores neutros; escena no registrada: sin playerPosition", () => {
    const st = memStorage({ "inventory-slots": legacySlots });
    const snap = migrateLegacySave(st, { defaultSceneId: "unknownScene" })!;
    expect(snap.sceneId).toBe("unknownScene");
    expect(snap.placedItems).toEqual([]);
    expect(snap.seededSceneIds).toEqual([]);
    expect("playerPosition" in snap).toBe(false);
    const only = migrateLegacySave(memStorage({ "current-scene-id": "hall" }), {
      defaultSceneId: "x",
    })!;
    expect(only.sceneId).toBe("hall");
    expect(only.inventory).toHaveLength(9);
    expect(only.inventory.every((s) => s === null)).toBe(true);
  });

  it("contenido ilegible se trata como ausente", () => {
    const st = memStorage({ "inventory-slots": "{bad", "placed-items-state": "[]" });
    const snap = migrateLegacySave(st, { defaultSceneId: "hall" })!;
    expect(snap.sceneId).toBe("hall");
    expect(snap.inventory).toHaveLength(9);
    expect(snap.placedItems).toEqual([]);
  });

  it("extraKeys: JSON parseado, texto si no es JSON, ausentes ignoradas", () => {
    const st = memStorage({
      "current-scene-id": "hall",
      "door-states": '{"state":{"doors":{"d1":true}},"version":0}',
      note: "hola mundo",
    });
    const snap = migrateLegacySave(st, {
      defaultSceneId: "hall",
      extraKeys: ["door-states", "note", "missing"],
    })!;
    expect(snap.extra).toEqual({
      "door-states": { state: { doors: { d1: true } }, version: 0 },
      note: "hola mundo",
    });
  });

  it("la instantánea migrada se puede guardar, cargar y aplicar", () => {
    boot();
    const st = memStorage({ "current-scene-id": "kitchen", "inventory-slots": legacySlots });
    const snap = migrateLegacySave(st, { defaultSceneId: "hall" })!;
    st.setItem(SAVE_STORAGE_KEY, JSON.stringify(snap));
    expect(applySnapshot(loadGame(st)!)).toBe(true);
    expect(useSceneStore.getState().sceneId).toBe("kitchen");
    expect(getInventoryState().slots).toHaveLength(3);
  });
});

describe("comandos y eventos", () => {
  it("game:save y game:load sin storage: avisan y no hacen nada", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    boot();
    const loaded = vi.fn();
    const saved = vi.fn();
    rt!.on("game:loaded", loaded);
    rt!.on("game:saved", saved);
    rt!.executeCommand({ type: "game:save" });
    rt!.executeCommand({ type: "game:load" });
    expect(warn).toHaveBeenCalledTimes(2);
    expect(loaded).not.toHaveBeenCalled();
    expect(saved).not.toHaveBeenCalled();
  });

  it("game:save emite game:saved y escribe; game:load restaura y emite game:loaded con extra", () => {
    const st = memStorage();
    boot(st);
    rt!.executeCommand({ type: "scene:set", sceneId: "kitchen", spawnPosition: [4, 0, 4] });
    fillState();
    const saved = vi.fn();
    const loaded = vi.fn();
    rt!.on("game:saved", saved);
    rt!.on("game:loaded", loaded);
    rt!.executeCommand({ type: "game:save", extra: { "door-states": { d: 1 } } });
    expect(saved).toHaveBeenCalledTimes(1);

    resetAll();
    rt!.executeCommand({ type: "scene:set", sceneId: "hall" });
    rt!.executeCommand({ type: "game:load" });
    expect(loaded).toHaveBeenCalledWith({
      type: "game:loaded",
      found: true,
      applied: true,
      extra: { "door-states": { d: 1 } },
    });
    expect(useSceneStore.getState().sceneId).toBe("kitchen");
    expect(useSceneStore.getState().playerPosition).toEqual([4, 0, 4]);
    expect(getWorldState().flags).toEqual({ metGuard: true, coins: 3 });
  });

  it("game:load sin partida emite found:false y no cambia nada", () => {
    boot(memStorage());
    rt!.executeCommand({ type: "scene:set", sceneId: "hall" });
    const loaded = vi.fn();
    rt!.on("game:loaded", loaded);
    rt!.executeCommand({ type: "game:load" });
    expect(loaded).toHaveBeenCalledWith({ type: "game:loaded", found: false });
    expect(useSceneStore.getState().sceneId).toBe("hall");
  });

  it("game:load con escena guardada no registrada: found true, applied false", () => {
    const st = memStorage({
      [SAVE_STORAGE_KEY]: JSON.stringify({ ...captureSnapshot(), sceneId: "ghost" }),
    });
    boot(st);
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const loaded = vi.fn();
    rt!.on("game:loaded", loaded);
    rt!.executeCommand({ type: "game:load" });
    expect(loaded).toHaveBeenCalledWith({ type: "game:loaded", found: true, applied: false });
  });

  it("game:reset vacía los stores, borra solo la clave de guardado y no cambia de escena", () => {
    const st = memStorage({ other: "keep" });
    boot(st);
    rt!.executeCommand({ type: "scene:set", sceneId: "kitchen" });
    fillState();
    rt!.executeCommand({ type: "game:save" });
    const reset = vi.fn();
    rt!.on("game:reset", reset);
    rt!.executeCommand({ type: "game:reset" });
    expect(reset).toHaveBeenCalledTimes(1);
    expect(getInventoryState().slots).toEqual(Array.from({ length: 9 }, () => null));
    expect(getPlacedItemsState().items).toEqual([]);
    expect(getPlacedItemsState().seededSceneIds).toEqual([]);
    expect(getWorldState().flags).toEqual({});
    expect(getWorldState().visitedSceneIds).toEqual([]);
    expect(st.data).toEqual({ other: "keep" });
    expect(st.clear).not.toHaveBeenCalled();
    expect(useSceneStore.getState().sceneId).toBe("kitchen");
  });

  it("game:reset sin storage resetea los stores sin fallar", () => {
    boot();
    fillState();
    rt!.executeCommand({ type: "game:reset" });
    expect(getWorldState().flags).toEqual({});
  });

  it("saveKey de la config se usa en save/load/reset", () => {
    const st = memStorage();
    rt = createGameRuntime({ scenes: [makeScene("hall")], storage: st, saveKey: "mine" });
    rt.executeCommand({ type: "game:save" });
    expect(Object.keys(st.data)).toEqual(["mine"]);
    rt.executeCommand({ type: "game:reset" });
    expect(st.data).toEqual({});
  });
});
