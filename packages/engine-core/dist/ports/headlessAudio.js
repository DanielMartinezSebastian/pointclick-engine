export class HeadlessAudioAdapter {
    constructor() {
        this.calls = [];
    }
    playSound(def, opts) {
        this.calls.push({ type: "playSound", def, opts });
    }
    playMusic(def, opts) {
        this.calls.push({ type: "playMusic", def, opts });
    }
    stopMusic(opts) {
        this.calls.push({ type: "stopMusic", opts });
    }
    setMuted(target, muted) {
        this.calls.push({ type: "setMuted", target, muted });
    }
    setVolume(target, volume) {
        this.calls.push({ type: "setVolume", target, volume });
    }
    async preload(urls) {
        this.calls.push({ type: "preload", urls });
    }
    dispose() {
        this.calls.push({ type: "dispose" });
    }
    reset() {
        this.calls.length = 0;
    }
}
//# sourceMappingURL=headlessAudio.js.map