/** Callback invoked each frame with delta time in seconds. */
export type GameLoopCallback = (deltaSeconds: number) => void;
/** Function returned by subscribe to remove the callback. */
export type Unsubscribe = () => void;
/**
 * Game loop abstraction. Renderer-agnostic contract.
 *
 * Implementations:
 * - R3F: wrap `useFrame((state, delta) => callback(delta))`
 * - Canvas2D: requestAnimationFrame loop
 * - Headless: manual tick via `HeadlessGameLoop.step(delta)` for tests
 */
export interface GameLoopPort {
    /** Subscribe a callback to be called each frame. Returns unsubscribe fn. */
    subscribe(callback: GameLoopCallback): Unsubscribe;
    /** Optional: pause/resume the loop. Some impls may noop. */
    pause?(): void;
    resume?(): void;
}
//# sourceMappingURL=gameLoop.d.ts.map