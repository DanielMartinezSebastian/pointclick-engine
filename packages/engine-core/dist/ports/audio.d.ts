import type { SoundCategory, SoundDefinition } from "../game/types";
export type AudioMuteTarget = "master" | SoundCategory;
export interface AudioPlayOptions {
    /** Override de volumen 0..1 para esta reproducción concreta. */
    volume?: number;
}
export interface AudioMusicOptions {
    fadeMs?: number;
    volume?: number;
}
/**
 * Port abstracto para reproducción de audio.
 * El adapter web (HTMLAudio/Howler/WebAudio) lo implementa fuera de core.
 */
export interface AudioPort {
    playSound(def: SoundDefinition, opts?: AudioPlayOptions): void;
    playMusic(def: SoundDefinition, opts?: AudioMusicOptions): void;
    stopMusic(opts?: AudioMusicOptions): void;
    setMuted(target: AudioMuteTarget, muted: boolean): void;
    setVolume(target: AudioMuteTarget, volume: number): void;
    preload(urls: string[]): Promise<void>;
    dispose(): void;
}
//# sourceMappingURL=audio.d.ts.map