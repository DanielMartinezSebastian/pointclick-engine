import { describe, it, expect, vi } from "vitest";
import { EventBus } from "../src/events/EventBus";

describe("EventBus", () => {
  it("emits to subscribers", () => {
    const bus = new EventBus();
    const fn = vi.fn();
    bus.on("test", fn);
    bus.emit("test", { x: 1 });
    expect(fn).toHaveBeenCalledWith({ x: 1 });
  });

  it("unsubscribe removes listener", () => {
    const bus = new EventBus();
    const fn = vi.fn();
    const off = bus.on("test", fn);
    off();
    bus.emit("test", null);
    expect(fn).not.toHaveBeenCalled();
  });

  it("handles multiple subscribers", () => {
    const bus = new EventBus();
    const fn1 = vi.fn();
    const fn2 = vi.fn();
    bus.on("test", fn1);
    bus.on("test", fn2);
    bus.emit("test", { value: 42 });
    expect(fn1).toHaveBeenCalledWith({ value: 42 });
    expect(fn2).toHaveBeenCalledWith({ value: 42 });
  });

  it("clear removes all listeners", () => {
    const bus = new EventBus();
    const fn1 = vi.fn();
    const fn2 = vi.fn();
    bus.on("event1", fn1);
    bus.on("event2", fn2);
    bus.clear();
    bus.emit("event1", {});
    bus.emit("event2", {});
    expect(fn1).not.toHaveBeenCalled();
    expect(fn2).not.toHaveBeenCalled();
  });
});
