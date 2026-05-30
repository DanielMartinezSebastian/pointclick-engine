import type {
  AudioMuteTarget,
  AudioMusicOptions,
  AudioPlayOptions,
  AudioPort,
} from "./audio";
import type { SoundDefinition } from "../game/types";

export type HeadlessAudioCall =
  | { type: "playSound"; def: SoundDefinition; opts?: AudioPlayOptions }
  | { type: "playMusic"; def: SoundDefinition; opts?: AudioMusicOptions }
  | { type: "stopMusic"; opts?: AudioMusicOptions }
  | { type: "setMuted"; target: AudioMuteTarget; muted: boolean }
  | { type: "setVolume"; target: AudioMuteTarget; volume: number }
  | { type: "preload"; urls: string[] }
  | { type: "dispose" };

export class HeadlessAudioAdapter implements AudioPort {
  readonly calls: HeadlessAudioCall[] = [];

  playSound(def: SoundDefinition, opts?: AudioPlayOptions): void {
    this.calls.push({ type: "playSound", def, opts });
  }
  playMusic(def: SoundDefinition, opts?: AudioMusicOptions): void {
    this.calls.push({ type: "playMusic", def, opts });
  }
  stopMusic(opts?: AudioMusicOptions): void {
    this.calls.push({ type: "stopMusic", opts });
  }
  setMuted(target: AudioMuteTarget, muted: boolean): void {
    this.calls.push({ type: "setMuted", target, muted });
  }
  setVolume(target: AudioMuteTarget, volume: number): void {
    this.calls.push({ type: "setVolume", target, volume });
  }
  async preload(urls: string[]): Promise<void> {
    this.calls.push({ type: "preload", urls });
  }
  dispose(): void {
    this.calls.push({ type: "dispose" });
  }

  reset(): void {
    this.calls.length = 0;
  }
}
