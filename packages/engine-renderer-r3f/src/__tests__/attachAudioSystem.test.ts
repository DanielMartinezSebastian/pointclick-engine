import { describe, it, expect, beforeEach } from "vitest";
import {
  HeadlessAudioAdapter,
  createAudioSettingsStore,
  type GameEvent,
  type GameScene,
  type ItemDefinition,
} from "@pointclick-engine/engine-core";
import { attachAudioSystem } from "../hooks/attachAudioSystem";

class SimpleEventEmitter {
  private handlers = new Map<string, Set<(e: GameEvent) => void>>();

  on(type: GameEvent["type"], handler: (e: GameEvent) => void) {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler);
    return () => {
      this.handlers.get(type)?.delete(handler);
    };
  }

  emit(event: GameEvent) {
    this.handlers.get(event.type)?.forEach((h) => h(event));
  }
}

const makeItem = (id: string, extra: Partial<ItemDefinition> = {}): ItemDefinition => ({
  id,
  name: id,
  spriteUrl: "",
  interactionRules: {},
  defaultRule: { outcome: "place" },
  ...extra,
});

const townScene: GameScene = {
  id: "town",
  label: "Town",
  background: "",
  playerSpawn: [0, 0, 0],
  ground: { minX: 0, maxX: 10, minZ: 0, maxZ: 10, y: 0 },
  walls: [],
  interactions: [],
  music: { trackUrl: "/music/town.mp3", fadeMs: 500 },
} as GameScene;

describe("attachAudioSystem", () => {
  let runtime: SimpleEventEmitter;
  let adapter: HeadlessAudioAdapter;
  let settingsStore: ReturnType<typeof createAudioSettingsStore>;

  const base = () => ({
    runtime,
    port: adapter,
    defaults: {},
    scenes: {},
    items: {},
    transitions: {},
    settingsStore,
  });

  beforeEach(() => {
    runtime = new SimpleEventEmitter();
    adapter = new HeadlessAudioAdapter();
    settingsStore = createAudioSettingsStore();
  });

  it("playSound on item:pickedUp with default", () => {
    attachAudioSystem({
      ...base(),
      defaults: { pickupSoundUrl: "/sounds/pickup.ogg" },
      items: { coin: makeItem("coin") },
    });

    adapter.reset();

    runtime.emit({ type: "item:pickedUp", itemId: "coin", quantity: 1 } as GameEvent);

    expect(adapter.calls.length).toBeGreaterThan(0);
    const sfxCall = adapter.calls.find((c) => c.type === "playSound");
    expect(sfxCall).toBeDefined();
  });

  it("playSound with item override", () => {
    attachAudioSystem({
      ...base(),
      defaults: { pickupSoundUrl: "/sounds/pickup.ogg" },
      items: {
        sword: makeItem("sword", { pickupSoundUrl: "/sounds/sword-pickup.ogg" }),
      },
    });

    adapter.reset();

    runtime.emit({ type: "item:pickedUp", itemId: "sword", quantity: 1 } as GameEvent);

    const sfxCall = adapter.calls.find((c) => c.type === "playSound");
    expect(sfxCall?.type === "playSound" && sfxCall.def.url).toBe(
      "/sounds/sword-pickup.ogg",
    );
  });

  it("playMusic on scene:changed with music config", () => {
    attachAudioSystem({ ...base(), scenes: { town: townScene } });

    adapter.reset();

    runtime.emit({
      type: "scene:changed",
      sceneId: "town",
      scene: townScene,
    } as GameEvent);

    const musicCall = adapter.calls.find((c) => c.type === "playMusic");
    expect(musicCall).toBeDefined();
    expect(musicCall?.type === "playMusic" && musicCall.def.url).toBe(
      "/music/town.mp3",
    );
  });

  it("setMuted sync from store to port", () => {
    attachAudioSystem(base());

    adapter.reset();
    settingsStore.setMasterMuted(true);

    const muteCall = adapter.calls.find((c) => c.type === "setMuted");
    expect(muteCall).toBeDefined();
    expect(muteCall?.type === "setMuted" && muteCall.target).toBe("master");
    expect(muteCall?.type === "setMuted" && muteCall.muted).toBe(true);
  });

  it("setVolume sync from store to port", () => {
    attachAudioSystem(base());

    adapter.reset();
    settingsStore.setMusicVolume(0.5);

    // applySettings re-sincroniza todos los targets (master primero): buscar el de music.
    const volCall = adapter.calls.find(
      (c) => c.type === "setVolume" && c.target === "music",
    );
    expect(volCall).toBeDefined();
    expect(volCall?.type === "setVolume" && volCall.target).toBe("music");
    expect(volCall?.type === "setVolume" && volCall.volume).toBe(0.5);
  });

  it("cleanup unsubscribes from runtime events and settings", () => {
    const detach = attachAudioSystem({
      ...base(),
      defaults: { pickupSoundUrl: "/sounds/pickup.ogg" },
      items: { coin: makeItem("coin") },
    });

    detach();
    adapter.reset();

    runtime.emit({ type: "item:pickedUp", itemId: "coin", quantity: 1 } as GameEvent);
    settingsStore.setMasterMuted(true);
    settingsStore.setMusicVolume(0.3);

    expect(adapter.calls).toEqual([]);
  });
});
