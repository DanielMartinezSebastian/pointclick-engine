/**
 * Headless GameLoop for tests: tick manually via `step(delta)`.
 * No renderer dependency — suitable for unit tests.
 */
export class HeadlessGameLoop {
    constructor() {
        this.callbacks = new Set();
    }
    subscribe(callback) {
        this.callbacks.add(callback);
        return () => this.callbacks.delete(callback);
    }
    /** Manually advance one frame. Call this in tests to drive logic. */
    step(deltaSeconds) {
        for (const cb of this.callbacks)
            cb(deltaSeconds);
    }
}
//# sourceMappingURL=headlessGameLoop.js.map