/**
 * Web keyboard adapter. Listens to WASD/arrow keys and produces InputDirection.
 *
 * Usage:
 *   const kb = new WebKeyboardInput();
 *   kb.attach(window);
 *   // later:
 *   kb.detach(window);
 */
export class WebKeyboardInput {
    constructor() {
        this.direction = { horizontal: 0, vertical: 0 };
        this.keys = new Set();
        this.dirListeners = new Set();
        this.ptrListeners = new Set();
        this.onKeyDown = (e) => {
            this.keys.add(e.key.toLowerCase());
            this.updateDirection();
        };
        this.onKeyUp = (e) => {
            this.keys.delete(e.key.toLowerCase());
            this.updateDirection();
        };
    }
    attach(target) {
        target.addEventListener("keydown", this.onKeyDown);
        target.addEventListener("keyup", this.onKeyUp);
    }
    detach(target) {
        target.removeEventListener("keydown", this.onKeyDown);
        target.removeEventListener("keyup", this.onKeyUp);
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
    pushPointer(event) {
        for (const l of this.ptrListeners)
            l(event);
    }
    updateDirection() {
        const h = (this.keys.has("a") || this.keys.has("arrowleft") ? -1 : 0) +
            (this.keys.has("d") || this.keys.has("arrowright") ? 1 : 0);
        const v = (this.keys.has("w") || this.keys.has("arrowup") ? -1 : 0) +
            (this.keys.has("s") || this.keys.has("arrowdown") ? 1 : 0);
        this.direction = { horizontal: h, vertical: v };
        for (const l of this.dirListeners)
            l(this.direction);
    }
}
//# sourceMappingURL=keyboardInput.js.map