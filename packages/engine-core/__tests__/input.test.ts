import { describe, it, expect, vi } from "vitest";
import { HeadlessInput } from "../src/ports/headlessInput";

describe("HeadlessInput", () => {
  it("notifies direction listeners on pushDirection", () => {
    const input = new HeadlessInput();
    const cb = vi.fn();
    input.onDirection(cb);
    input.pushDirection({ horizontal: 1, vertical: 0 });
    expect(cb).toHaveBeenCalledWith({ horizontal: 1, vertical: 0 });
    expect(input.getDirection()).toEqual({ horizontal: 1, vertical: 0 });
  });

  it("notifies pointer listeners on pushPointer", () => {
    const input = new HeadlessInput();
    const cb = vi.fn();
    input.onPointer(cb);
    input.pushPointer({ worldX: 1, worldZ: 2, button: "primary" });
    expect(cb).toHaveBeenCalledWith({ worldX: 1, worldZ: 2, button: "primary" });
  });

  it("unsubscribes direction listener", () => {
    const input = new HeadlessInput();
    const cb = vi.fn();
    const unsub = input.onDirection(cb);
    unsub();
    input.pushDirection({ horizontal: -1, vertical: 1 });
    expect(cb).not.toHaveBeenCalled();
  });

  it("unsubscribes pointer listener", () => {
    const input = new HeadlessInput();
    const cb = vi.fn();
    const unsub = input.onPointer(cb);
    unsub();
    input.pushPointer({ worldX: 0, worldZ: 0, button: "secondary" });
    expect(cb).not.toHaveBeenCalled();
  });

  it("getDirection returns latest direction after push", () => {
    const input = new HeadlessInput();
    expect(input.getDirection()).toEqual({ horizontal: 0, vertical: 0 });
    input.pushDirection({ horizontal: -1, vertical: 0.5 });
    expect(input.getDirection()).toEqual({ horizontal: -1, vertical: 0.5 });
  });

  it("notifies multiple listeners", () => {
    const input = new HeadlessInput();
    const cb1 = vi.fn();
    const cb2 = vi.fn();
    input.onDirection(cb1);
    input.onDirection(cb2);
    input.pushDirection({ horizontal: 0, vertical: 1 });
    expect(cb1).toHaveBeenCalledOnce();
    expect(cb2).toHaveBeenCalledOnce();
  });
});
