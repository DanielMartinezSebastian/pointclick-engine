import type { ClockPort } from "./clock";

/**
 * Headless Clock for tests: time advances only via advance(ms).
 * No dependency on globalThis.setTimeout — suitable for deterministic unit tests.
 */
export class HeadlessClock implements ClockPort {
  private currentTime = 0;
  private nextId = 0;
  private timers = new Map<number, { dueTime: number; fn: () => void }>();

  now(): number {
    return this.currentTime;
  }

  setTimeout(fn: () => void, ms: number): () => void {
    const id = this.nextId++;
    const dueTime = this.currentTime + ms;
    this.timers.set(id, { dueTime, fn });

    return () => {
      this.timers.delete(id);
    };
  }

  /**
   * Advance the clock by ms milliseconds and fire every timer due by then, in
   * order of due time (ties in scheduling order). Timers scheduled by a callback
   * also fire if they fall within the same advance, including zero-delay ones.
   * `advance(0)` fires the timers that are already due.
   */
  advance(ms: number): void {
    const targetTime = this.currentTime + Math.max(0, ms);

    for (;;) {
      let nextId: number | null = null;
      let nextDue = Infinity;
      // Map iteration is insertion order, so the first match wins ties.
      for (const [id, { dueTime }] of this.timers) {
        if (dueTime <= targetTime && dueTime < nextDue) {
          nextDue = dueTime;
          nextId = id;
        }
      }
      if (nextId === null) break;

      const { fn } = this.timers.get(nextId)!;
      this.timers.delete(nextId);
      this.currentTime = Math.max(this.currentTime, nextDue);
      fn();
    }

    this.currentTime = targetTime;
  }

  /** Return the number of pending timers. */
  pending(): number {
    return this.timers.size;
  }
}
