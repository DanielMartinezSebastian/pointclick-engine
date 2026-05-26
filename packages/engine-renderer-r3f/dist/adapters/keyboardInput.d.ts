import type { InputDirection, InputPort, DirectionListener, PointerListener, InputUnsubscribe, InputPointerEvent } from "@pointclick/engine-core";
/**
 * Web keyboard adapter. Listens to WASD/arrow keys and produces InputDirection.
 *
 * Usage:
 *   const kb = new WebKeyboardInput();
 *   kb.attach(window);
 *   // later:
 *   kb.detach(window);
 */
export declare class WebKeyboardInput implements InputPort {
    private direction;
    private keys;
    private dirListeners;
    private ptrListeners;
    private readonly onKeyDown;
    private readonly onKeyUp;
    attach(target: Window | HTMLElement): void;
    detach(target: Window | HTMLElement): void;
    onDirection(l: DirectionListener): InputUnsubscribe;
    onPointer(l: PointerListener): InputUnsubscribe;
    getDirection(): InputDirection;
    pushPointer(event: InputPointerEvent): void;
    private updateDirection;
}
//# sourceMappingURL=keyboardInput.d.ts.map