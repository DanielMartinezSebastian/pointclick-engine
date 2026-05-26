/**
 * Headless InputPort for tests. Call `pushDirection` and `pushPointer`
 * to simulate input. No DOM dependency.
 */
export class HeadlessInput {
    constructor() {
        this.direction = { horizontal: 0, vertical: 0 };
        this.dirListeners = new Set();
        this.ptrListeners = new Set();
    }
    onDirection(l) {
        this.dirListeners.add(l);
        return () => this.dirListeners.delete(l);
    }
    onPointer(l) {
        this.ptrListeners.add(l);
        return () => this.ptrListeners.delete(l);
    }
    getDirection() {
        return this.direction;
    }
    /** Simulate a direction input event. */
    pushDirection(dir) {
        this.direction = dir;
        for (const l of this.dirListeners)
            l(dir);
    }
    /** Simulate a pointer/click event. */
    pushPointer(event) {
        for (const l of this.ptrListeners)
            l(event);
    }
}
//# sourceMappingURL=headlessInput.js.map