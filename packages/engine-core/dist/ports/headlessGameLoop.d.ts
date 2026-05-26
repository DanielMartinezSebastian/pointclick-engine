import type { GameLoopCallback, GameLoopPort, Unsubscribe } from "./gameLoop";
/**
 * Headless GameLoop for tests: tick manually via `step(delta)`.
 * No renderer dependency — suitable for unit tests.
 */
export declare class HeadlessGameLoop implements GameLoopPort {
    private callbacks;
    subscribe(callback: GameLoopCallback): Unsubscribe;
    /** Manually advance one frame. Call this in tests to drive logic. */
    step(deltaSeconds: number): void;
}
//# sourceMappingURL=headlessGameLoop.d.ts.map