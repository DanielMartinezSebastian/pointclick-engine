import type { GameLoopCallback, GameLoopPort, Unsubscribe } from "./gameLoop";

/**
 * Headless GameLoop for tests: tick manually via `step(delta)`.
 * No renderer dependency — suitable for unit tests.
 */
export class HeadlessGameLoop implements GameLoopPort {
  private callbacks = new Set<GameLoopCallback>();

  subscribe(callback: GameLoopCallback): Unsubscribe {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  /** Manually advance one frame. Call this in tests to drive logic. */
  step(deltaSeconds: number): void {
    for (const cb of this.callbacks) cb(deltaSeconds);
  }
}
