import { type AudioSettings, type SoundCategory } from "../types";
type Listener = (settings: AudioSettings) => void;
type MuteTarget = "master" | SoundCategory;
interface MinimalStorage {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
}
export declare const AUDIO_SETTINGS_STORAGE_KEY = "audio-settings";
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
export declare function createAudioSettingsStore(initial?: AudioSettings): AudioSettingsStore;
export declare function loadAudioSettings(storage: MinimalStorage): Partial<AudioSettings> | null;
export declare function saveAudioSettings(storage: MinimalStorage, settings: AudioSettings): void;
export {};
//# sourceMappingURL=audioSettingsStore.d.ts.map