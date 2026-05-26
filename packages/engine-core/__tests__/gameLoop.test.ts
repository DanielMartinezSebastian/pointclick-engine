import { describe, it, expect, vi } from "vitest";
import { HeadlessGameLoop } from "../src/ports/headlessGameLoop";

describe("HeadlessGameLoop", () => {
  it("invokes subscribed callbacks on step", () => {
    const loop = new HeadlessGameLoop();
    const cb = vi.fn();
    loop.subscribe(cb);
    loop.step(0.016);
    expect(cb).toHaveBeenCalledWith(0.016);
  });

  it("invokes multiple subscribers on step", () => {
    const loop = new HeadlessGameLoop();
    const cb1 = vi.fn();
    const cb2 = vi.fn();
    loop.subscribe(cb1);
    loop.subscribe(cb2);
    loop.step(0.033);
    expect(cb1).toHaveBeenCalledWith(0.033);
    expect(cb2).toHaveBeenCalledWith(0.033);
  });

  it("unsubscribe removes callback", () => {
    const loop = new HeadlessGameLoop();
    const cb = vi.fn();
    const unsub = loop.subscribe(cb);
    unsub();
    loop.step(0.016);
    expect(cb).not.toHaveBeenCalled();
  });

  it("passes correct delta on multiple steps", () => {
    const loop = new HeadlessGameLoop();
    const deltas: number[] = [];
    loop.subscribe((d) => deltas.push(d));
    loop.step(0.016);
    loop.step(0.032);
    loop.step(0.008);
    expect(deltas).toEqual([0.016, 0.032, 0.008]);
  });
});
