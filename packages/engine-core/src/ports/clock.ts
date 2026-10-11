/**
 * Clock port abstraction. Renderer-agnostic contract.
 *
 * Allows the game engine to measure time and schedule async operations
 * without relying on setTimeout directly.
 *
 * Implementations:
 * - System: wraps globalThis.setTimeout and Date.now
 * - Headless: manual time advance via HeadlessClock.advance(ms) for tests
 */
export interface ClockPort {
  /** Current time in milliseconds. */
  now(): number;

  /**
   * Schedule a callback to run after ms milliseconds.
   * Returns a cancel function that stops the callback if called before execution.
   */
  setTimeout(fn: () => void, ms: number): () => void;
}

/**
 * System clock implementation using globalThis.setTimeout and Date.now.
 * Safe for core (no window, no document, no React).
 */
export const systemClock: ClockPort = {
  now(): number {
    return Date.now();
  },

  setTimeout(fn: () => void, ms: number): () => void {
    const id = globalThis.setTimeout(fn, ms);
    return () => {
      globalThis.clearTimeout(id);
    };
  },
};
