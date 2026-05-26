import type { DirectionListener, InputDirection, InputPort, InputPointerEvent, InputUnsubscribe, PointerListener } from "./input";
/**
 * Headless InputPort for tests. Call `pushDirection` and `pushPointer`
 * to simulate input. No DOM dependency.
 */
export declare class HeadlessInput implements InputPort {
    private direction;
    private dirListeners;
    private ptrListeners;
    onDirection(l: DirectionListener): InputUnsubscribe;
    onPointer(l: PointerListener): InputUnsubscribe;
    getDirection(): InputDirection;
    /** Simulate a direction input event. */
    pushDirection(dir: InputDirection): void;
    /** Simulate a pointer/click event. */
    pushPointer(event: InputPointerEvent): void;
}
//# sourceMappingURL=headlessInput.d.ts.map