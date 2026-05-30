import type { AudioMuteTarget, AudioMusicOptions, AudioPlayOptions, AudioPort } from "./audio";
import type { SoundDefinition } from "../game/types";
export type HeadlessAudioCall = {
    type: "playSound";
    def: SoundDefinition;
    opts?: AudioPlayOptions;
} | {
    type: "playMusic";
    def: SoundDefinition;
    opts?: AudioMusicOptions;
} | {
    type: "stopMusic";
    opts?: AudioMusicOptions;
} | {
    type: "setMuted";
    target: AudioMuteTarget;
    muted: boolean;
} | {
    type: "setVolume";
    target: AudioMuteTarget;
    volume: number;
} | {
    type: "preload";
    urls: string[];
} | {
    type: "dispose";
};
export declare class HeadlessAudioAdapter implements AudioPort {
    readonly calls: HeadlessAudioCall[];
    playSound(def: SoundDefinition, opts?: AudioPlayOptions): void;
    playMusic(def: SoundDefinition, opts?: AudioMusicOptions): void;
    stopMusic(opts?: AudioMusicOptions): void;
    setMuted(target: AudioMuteTarget, muted: boolean): void;
    setVolume(target: AudioMuteTarget, volume: number): void;
    preload(urls: string[]): Promise<void>;
    dispose(): void;
    reset(): void;
}
//# sourceMappingURL=headlessAudio.d.ts.map