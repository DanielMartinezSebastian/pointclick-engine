import { describe, it, expect, vi } from "vitest";
import { systemClock, HeadlessClock } from "../ports";

describe("ClockPort", () => {
  describe("HeadlessClock", () => {
    it("should initialize with time 0", () => {
      const clock = new HeadlessClock();
      expect(clock.now()).toBe(0);
    });

    it("should fire timers in order of due time", () => {
      const clock = new HeadlessClock();
      const events: number[] = [];

      clock.setTimeout(() => events.push(1), 100);
      clock.setTimeout(() => events.push(2), 50);
      clock.setTimeout(() => events.push(3), 150);

      clock.advance(200);

      expect(events).toEqual([2, 1, 3]);
    });

    it("should allow canceling a timer", () => {
      const clock = new HeadlessClock();
      const events: string[] = [];

      const cancel = clock.setTimeout(() => events.push("should-not-run"), 100);
      clock.setTimeout(() => events.push("should-run"), 200);

      cancel();
      clock.advance(300);

      expect(events).toEqual(["should-run"]);
    });

    it("should handle nested timers scheduled during advance", () => {
      const clock = new HeadlessClock();
      const events: number[] = [];

      clock.setTimeout(() => {
        events.push(1);
        clock.setTimeout(() => events.push(2), 50);
      }, 100);

      clock.advance(200);

      expect(events).toEqual([1, 2]);
    });

    it("should advance(0) execute nothing", () => {
      const clock = new HeadlessClock();
      const events: string[] = [];

      clock.setTimeout(() => events.push("fired"), 100);
      clock.advance(0);

      expect(events).toEqual([]);
      expect(clock.pending()).toBe(1);
    });

    it("should report pending timer count", () => {
      const clock = new HeadlessClock();

      expect(clock.pending()).toBe(0);

      const cancel1 = clock.setTimeout(() => {}, 100);
      expect(clock.pending()).toBe(1);

      const cancel2 = clock.setTimeout(() => {}, 200);
      expect(clock.pending()).toBe(2);

      cancel1();
      expect(clock.pending()).toBe(1);

      clock.advance(300);
      expect(clock.pending()).toBe(0);
    });

    it("should handle multiple advance calls correctly", () => {
      const clock = new HeadlessClock();
      const events: number[] = [];

      clock.setTimeout(() => events.push(1), 50);
      clock.setTimeout(() => events.push(2), 150);

      clock.advance(100);
      expect(events).toEqual([1]);
      expect(clock.now()).toBe(100);

      clock.advance(100);
      expect(events).toEqual([1, 2]);
      expect(clock.now()).toBe(200);
    });

    it("should handle timers scheduled in the same millisecond", () => {
      const clock = new HeadlessClock();
      const events: number[] = [];

      clock.setTimeout(() => events.push(1), 100);
      clock.setTimeout(() => events.push(2), 100);
      clock.setTimeout(() => events.push(3), 100);

      clock.advance(100);

      expect(events.length).toBe(3);
      expect(events.sort()).toEqual([1, 2, 3]);
    });

    it("should update now() when advancing", () => {
      const clock = new HeadlessClock();

      expect(clock.now()).toBe(0);
      clock.advance(50);
      expect(clock.now()).toBe(50);
      clock.advance(30);
      expect(clock.now()).toBe(80);
    });
  });

  describe("HeadlessClock: zero-delay and ordering", () => {
    it("fires a zero-delay timer on advance(0)", () => {
      const clock = new HeadlessClock();
      const events: string[] = [];
      clock.setTimeout(() => events.push("now"), 0);
      clock.advance(0);
      expect(events).toEqual(["now"]);
      expect(clock.pending()).toBe(0);
    });

    it("fires a zero-delay timer scheduled inside a callback", () => {
      const clock = new HeadlessClock();
      const events: string[] = [];
      clock.setTimeout(() => {
        events.push("first");
        clock.setTimeout(() => events.push("chained"), 0);
      }, 10);
      clock.advance(10);
      expect(events).toEqual(["first", "chained"]);
    });

    it("fires timers with the same due time in scheduling order", () => {
      const clock = new HeadlessClock();
      const events: number[] = [];
      clock.setTimeout(() => events.push(1), 20);
      clock.setTimeout(() => events.push(2), 20);
      clock.setTimeout(() => events.push(3), 20);
      clock.advance(20);
      expect(events).toEqual([1, 2, 3]);
    });

    it("reports the due time, not the target, to a callback", () => {
      const clock = new HeadlessClock();
      const seen: number[] = [];
      clock.setTimeout(() => seen.push(clock.now()), 30);
      clock.advance(100);
      expect(seen).toEqual([30]);
      expect(clock.now()).toBe(100);
    });

    it("does not fire a timer cancelled by an earlier callback", () => {
      const clock = new HeadlessClock();
      const events: string[] = [];
      let cancelLater = () => {};
      clock.setTimeout(() => {
        events.push("first");
        cancelLater();
      }, 10);
      cancelLater = clock.setTimeout(() => events.push("later"), 20);
      clock.advance(50);
      expect(events).toEqual(["first"]);
    });
  });

  describe("systemClock", () => {
    it("should return current time with now()", () => {
      const before = Date.now();
      const time = systemClock.now();
      const after = Date.now();

      expect(time).toBeGreaterThanOrEqual(before);
      expect(time).toBeLessThanOrEqual(after);
    });

    it("should schedule a callback with setTimeout", async () => {
      return new Promise<void>((resolve) => {
        const startTime = systemClock.now();
        const called: number[] = [];

        systemClock.setTimeout(() => {
          called.push(systemClock.now());
          expect(called[0] - startTime).toBeGreaterThanOrEqual(50);
          resolve();
        }, 50);
      });
    });

    it("should allow canceling a scheduled callback", async () => {
      return new Promise<void>((resolve) => {
        let called = false;

        const cancel = systemClock.setTimeout(() => {
          called = true;
        }, 100);

        cancel();

        systemClock.setTimeout(() => {
          expect(called).toBe(false);
          resolve();
        }, 150);
      });
    });
  });

  describe("ClockPort interface compliance", () => {
    it("should work with HeadlessClock and systemClock interchangeably", () => {
      const headless = new HeadlessClock();
      const events: string[] = [];

      headless.setTimeout(() => events.push("a"), 100);
      headless.setTimeout(() => events.push("b"), 50);

      headless.advance(200);

      expect(events).toEqual(["b", "a"]);
    });
  });
});
