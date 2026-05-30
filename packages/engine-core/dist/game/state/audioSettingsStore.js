import { DEFAULT_AUDIO_SETTINGS, } from "../types";
export const AUDIO_SETTINGS_STORAGE_KEY = "audio-settings";
const clamp01 = (n) => Math.max(0, Math.min(1, n));
export function createAudioSettingsStore(initial = DEFAULT_AUDIO_SETTINGS) {
    let state = { ...initial };
    const listeners = new Set();
    const emit = () => listeners.forEach((l) => l(state));
    const update = (patch) => {
        state = { ...state, ...patch };
        emit();
    };
    const isCategoryMuted = (category) => {
        if (state.masterMuted)
            return true;
        if (category === "music" && state.musicMuted)
            return true;
        if ((category === "sfx" || category === "ui" || category === "ambient") &&
            state.sfxMuted)
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
            if (target === "master")
                update({ masterMuted: muted });
            else if (target === "music")
                update({ musicMuted: muted });
            else
                update({ sfxMuted: muted });
        },
        setVolume(target, volume) {
            const v = clamp01(volume);
            if (target === "master")
                update({ masterVolume: v });
            else if (target === "music")
                update({ musicVolume: v });
            else
                update({ sfxVolume: v });
        },
        getEffectiveVolume(category) {
            if (isCategoryMuted(category))
                return 0;
            const base = category === "music" ? state.musicVolume : state.sfxVolume;
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
export function loadAudioSettings(storage) {
    const raw = storage.getItem(AUDIO_SETTINGS_STORAGE_KEY);
    if (!raw)
        return null;
    try {
        const parsed = JSON.parse(raw);
        return parsed;
    }
    catch {
        return null;
    }
}
export function saveAudioSettings(storage, settings) {
    storage.setItem(AUDIO_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}
//# sourceMappingURL=audioSettingsStore.js.map