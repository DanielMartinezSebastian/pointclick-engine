import { describe, it, expect, beforeEach } from "vitest";
import {
  HeadlessAudioAdapter,
  createAudioSettingsStore,
  type GameEvent,
} from "@pointclick-engine/engine-core";
import { useAudioSystem } from "../hooks/useAudioSystem";

class SimpleEventEmitter {
  private handlers = new Map<string, Set<(e: any) => void>>();

  on(type: string, handler: (e: any) => void) {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler);
    return () => {
      this.handlers.get(type)?.delete(handler);
    };
  }

  emit(event: GameEvent) {
    const handlers = this.handlers.get(event.type);
    if (handlers) {
      handlers.forEach((h) => h(event));
    }
  }
}

describe("useAudioSystem", () => {
  let runtime: SimpleEventEmitter;
  let adapter: HeadlessAudioAdapter;
  let settingsStore: ReturnType<typeof createAudioSettingsStore>;

  beforeEach(() => {
    runtime = new SimpleEventEmitter();
    adapter = new HeadlessAudioAdapter();
    settingsStore = createAudioSettingsStore();
  });

  it("playSound on item:pickedUp with default", () => {
    // Simulate hook effect
    useAudioSystem({
      runtime: runtime as any,
      port: adapter,
      defaults: { pickupSoundUrl: "/sounds/pickup.ogg" },
      scenes: {},
      items: {
        coin: {
          id: "coin",
          name: "Coin",
          spriteUrl: "",
          interactionRules: {},
          defaultRule: { outcome: "place" },
        },
      },
      transitions: {},
      settingsStore,
    });

    // Reset to only count new calls from emit
    adapter.reset();

    runtime.emit({
      type: "item:pickedUp",
      itemId: "coin",
      quantity: 1,
    } as any);

    expect(adapter.calls.length).toBeGreaterThan(0);
    const sfxCall = adapter.calls.find(
      (c) => c.type === "playSound",
    );
    expect(sfxCall).toBeDefined();
  });

  it("playSound with item override", () => {
    useAudioSystem({
      runtime: runtime as any,
      port: adapter,
      defaults: { pickupSoundUrl: "/sounds/pickup.ogg" },
      scenes: {},
      items: {
        sword: {
          id: "sword",
          name: "Sword",
          spriteUrl: "",
          interactionRules: {},
          defaultRule: { outcome: "place" },
          pickupSoundUrl: "/sounds/sword-pickup.ogg",
        },
      },
      transitions: {},
      settingsStore,
    });

    adapter.reset();

    runtime.emit({
      type: "item:pickedUp",
      itemId: "sword",
      quantity: 1,
    } as any);

    const sfxCall = adapter.calls.find((c) => c.type === "playSound");
    expect((sfxCall as any)?.def?.url).toBe("/sounds/sword-pickup.ogg");
  });

  it("playMusic on scene:changed with music config", () => {
    useAudioSystem({
      runtime: runtime as any,
      port: adapter,
      defaults: {},
      scenes: {
        town: {
          id: "town",
          label: "Town",
          background: "",
          playerSpawn: [0, 0, 0],
          ground: { minX: 0, maxX: 10, minZ: 0, maxZ: 10, y: 0 },
          walls: [],
          interactions: [],
          music: { trackUrl: "/music/town.mp3", fadeMs: 500 },
        },
      },
      items: {},
      transitions: {},
      settingsStore,
    });

    adapter.reset();

    runtime.emit({
      type: "scene:changed",
      sceneId: "town",
      scene: {
        id: "town",
        label: "Town",
        background: "",
        playerSpawn: [0, 0, 0],
        ground: { minX: 0, maxX: 10, minZ: 0, maxZ: 10, y: 0 },
        walls: [],
        interactions: [],
        music: { trackUrl: "/music/town.mp3", fadeMs: 500 },
      },
    } as any);

    const musicCall = adapter.calls.find((c) => c.type === "playMusic");
    expect(musicCall).toBeDefined();
    expect((musicCall as any)?.def?.url).toBe("/music/town.mp3");
  });

  it("setMuted sync from store to port", () => {
    useAudioSystem({
      runtime: runtime as any,
      port: adapter,
      defaults: {},
      scenes: {},
      items: {},
      transitions: {},
      settingsStore,
    });

    // Clear initial sync calls
    adapter.reset();

    // Change mute state
    settingsStore.setMasterMuted(true);

    const muteCall = adapter.calls.find((c) => c.type === "setMuted");
    expect(muteCall).toBeDefined();
    expect((muteCall as any)?.target).toBe("master");
    expect((muteCall as any)?.muted).toBe(true);
  });

  it("setVolume sync from store to port", () => {
    useAudioSystem({
      runtime: runtime as any,
      port: adapter,
      defaults: {},
      scenes: {},
      items: {},
      transitions: {},
      settingsStore,
    });

    adapter.reset();

    // Change volume
    settingsStore.setMusicVolume(0.5);

    const volCall = adapter.calls.find((c) => c.type === "setVolume");
    expect(volCall).toBeDefined();
    expect((volCall as any)?.target).toBe("music");
    expect((volCall as any)?.volume).toBe(0.5);
  });
});
