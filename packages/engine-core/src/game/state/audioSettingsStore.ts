import {
  DEFAULT_AUDIO_SETTINGS,
  type AudioSettings,
  type SoundCategory,
} from "../types";

type Listener = (settings: AudioSettings) => void;
type MuteTarget = "master" | SoundCategory;

interface MinimalStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export const AUDIO_SETTINGS_STORAGE_KEY = "audio-settings";

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

export interface AudioSettingsStore {
  getState(): AudioSettings;
  subscribe(listener: Listener): () => void;
  setMasterMuted(muted: boolean): void;
  setMusicMuted(muted: boolean): void;
  setSfxMuted(muted: boolean): void;
  setMasterVolume(volume: number): void;
  setMusicVolume(volume: number): void;
  setSfxVolume(volume: number): void;
  setCurrentMusicTrackUrl(url: string | undefined): void;
  setMuted(target: MuteTarget, muted: boolean): void;
  setVolume(target: MuteTarget, volume: number): void;
  getEffectiveVolume(category: SoundCategory): number;
  hydrate(settings: Partial<AudioSettings>): void;
  reset(): void;
}

export function createAudioSettingsStore(
  initial: AudioSettings = DEFAULT_AUDIO_SETTINGS,
): AudioSettingsStore {
  let state: AudioSettings = { ...initial };
  const listeners = new Set<Listener>();
  const emit = () => listeners.forEach((l) => l(state));

  const update = (patch: Partial<AudioSettings>) => {
    state = { ...state, ...patch };
    emit();
  };

  const isCategoryMuted = (category: SoundCategory): boolean => {
    if (state.masterMuted) return true;
    if (category === "music" && state.musicMuted) return true;
    if (
      (category === "sfx" || category === "ui" || category === "ambient") &&
      state.sfxMuted
    )
      return true;
    return false;
  };

  return {
    getState: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    setMasterMuted: (m) => update({ masterMuted: m }),
    setMusicMuted: (m) => update({ musicMuted: m }),
    setSfxMuted: (m) => update({ sfxMuted: m }),
    setMasterVolume: (v) => update({ masterVolume: clamp01(v) }),
    setMusicVolume: (v) => update({ musicVolume: clamp01(v) }),
    setSfxVolume: (v) => update({ sfxVolume: clamp01(v) }),
    setCurrentMusicTrackUrl: (url) => update({ currentMusicTrackUrl: url }),
    setMuted(target, muted) {
      if (target === "master") update({ masterMuted: muted });
      else if (target === "music") update({ musicMuted: muted });
      else update({ sfxMuted: muted });
    },
    setVolume(target, volume) {
      const v = clamp01(volume);
      if (target === "master") update({ masterVolume: v });
      else if (target === "music") update({ musicVolume: v });
      else update({ sfxVolume: v });
    },
    getEffectiveVolume(category) {
      if (isCategoryMuted(category)) return 0;
      const base =
        category === "music" ? state.musicVolume : state.sfxVolume;
      return clamp01(base * state.masterVolume);
    },
    hydrate(patch) {
      const merged = { ...state, ...patch };
      merged.masterVolume = clamp01(merged.masterVolume);
      merged.musicVolume = clamp01(merged.musicVolume);
      merged.sfxVolume = clamp01(merged.sfxVolume);
      state = merged;
      emit();
    },
    reset() {
      state = { ...DEFAULT_AUDIO_SETTINGS };
      emit();
    },
  };
}

// --- Persistencia (helpers puros) ---

export function loadAudioSettings(
  storage: MinimalStorage,
): Partial<AudioSettings> | null {
  const raw = storage.getItem(AUDIO_SETTINGS_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<AudioSettings>;
    return parsed;
  } catch {
    return null;
  }
}

export function saveAudioSettings(
  storage: MinimalStorage,
  settings: AudioSettings,
): void {
  storage.setItem(AUDIO_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}
