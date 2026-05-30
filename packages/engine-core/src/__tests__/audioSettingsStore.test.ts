import { describe, it, expect, beforeEach } from "vitest";
import {
  createAudioSettingsStore,
  loadAudioSettings,
  saveAudioSettings,
  AUDIO_SETTINGS_STORAGE_KEY,
  type AudioSettingsStore,
} from "../game/state/audioSettingsStore";
import { DEFAULT_AUDIO_SETTINGS } from "../game/types";

const fakeStorage = () => {
  const map = new Map<string, string>();
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => {
      map.set(k, v);
    },
    _map: map,
  };
};

describe("audioSettingsStore", () => {
  let store: AudioSettingsStore;

  beforeEach(() => {
    store = createAudioSettingsStore();
  });

  it("initial state equals DEFAULT_AUDIO_SETTINGS", () => {
    const state = store.getState();
    expect(state).toEqual(DEFAULT_AUDIO_SETTINGS);
  });

  it("setMasterMuted updates masterMuted", () => {
    store.setMasterMuted(true);
    expect(store.getState().masterMuted).toBe(true);
    store.setMasterMuted(false);
    expect(store.getState().masterMuted).toBe(false);
  });

  it("setMusicMuted updates musicMuted", () => {
    store.setMusicMuted(true);
    expect(store.getState().musicMuted).toBe(true);
  });

  it("setSfxMuted updates sfxMuted", () => {
    store.setSfxMuted(true);
    expect(store.getState().sfxMuted).toBe(true);
  });

  it("volume values are clamped to [0, 1]", () => {
    store.setMasterVolume(-1);
    expect(store.getState().masterVolume).toBe(0);
    store.setMasterVolume(2);
    expect(store.getState().masterVolume).toBe(1);
    store.setMasterVolume(0.5);
    expect(store.getState().masterVolume).toBe(0.5);
  });

  it("setMuted('music', true) affects only music", () => {
    store.setMuted("music", true);
    const state = store.getState();
    expect(state.musicMuted).toBe(true);
    expect(state.sfxMuted).toBe(DEFAULT_AUDIO_SETTINGS.sfxMuted);
    expect(state.masterMuted).toBe(DEFAULT_AUDIO_SETTINGS.masterMuted);
  });

  it("getEffectiveVolume('music') returns musicVolume * masterVolume", () => {
    store.setMasterVolume(0.5);
    store.setMusicVolume(0.8);
    expect(store.getEffectiveVolume("music")).toBeCloseTo(0.4);
  });

  it("getEffectiveVolume returns 0 if masterMuted is true", () => {
    store.setMasterVolume(0.8);
    store.setMusicVolume(0.8);
    store.setMasterMuted(true);
    expect(store.getEffectiveVolume("music")).toBe(0);
  });

  it("getEffectiveVolume('ambient') is governed by sfxMuted", () => {
    store.setMasterVolume(0.8);
    store.setSfxVolume(0.8);
    store.setSfxMuted(true);
    expect(store.getEffectiveVolume("ambient")).toBe(0);
  });

  it("subscribe notifies on each state change", () => {
    const changes: any[] = [];
    const unsub = store.subscribe((state) => {
      changes.push({ ...state });
    });
    store.setMasterMuted(true);
    store.setMusicVolume(0.5);
    expect(changes.length).toBe(2);
    unsub();
  });

  it("unsubscribe stops notifications", () => {
    const changes: any[] = [];
    const unsub = store.subscribe(() => {
      changes.push(1);
    });
    store.setMasterMuted(true);
    unsub();
    store.setMasterMuted(false);
    expect(changes.length).toBe(1);
  });

  it("hydrate merges partial state", () => {
    store.hydrate({ musicVolume: 0.3 });
    const state = store.getState();
    expect(state.musicVolume).toBe(0.3);
    expect(state.masterMuted).toBe(DEFAULT_AUDIO_SETTINGS.masterMuted);
  });

  it("reset reverts to defaults", () => {
    store.setMasterMuted(true);
    store.setMusicVolume(0.1);
    store.reset();
    expect(store.getState()).toEqual(DEFAULT_AUDIO_SETTINGS);
  });

  it("loadAudioSettings returns null if key does not exist", () => {
    const storage = fakeStorage();
    const result = loadAudioSettings(storage);
    expect(result).toBeNull();
  });

  it("loadAudioSettings returns null if JSON is corrupted", () => {
    const storage = fakeStorage();
    storage.setItem(AUDIO_SETTINGS_STORAGE_KEY, "{ invalid json");
    const result = loadAudioSettings(storage);
    expect(result).toBeNull();
  });

  it("saveAudioSettings writes to correct key", () => {
    const storage = fakeStorage();
    const settings = { ...DEFAULT_AUDIO_SETTINGS, masterVolume: 0.5 };
    saveAudioSettings(storage, settings);
    const raw = storage.getItem(AUDIO_SETTINGS_STORAGE_KEY);
    expect(raw).toBeDefined();
    const parsed = JSON.parse(raw!);
    expect(parsed.masterVolume).toBe(0.5);
  });

  it("save → load roundtrip preserves values", () => {
    const storage = fakeStorage();
    const original = { ...DEFAULT_AUDIO_SETTINGS, musicVolume: 0.7 };
    saveAudioSettings(storage, original);
    const loaded = loadAudioSettings(storage);
    expect(loaded).toEqual(original);
  });
});
