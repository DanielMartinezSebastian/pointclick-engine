import { describe, it, expect, vi, beforeEach } from "vitest";
import { CommandHandler } from "../src/game/commands/CommandHandler";
import type { GameCommand } from "../src/game/commands/types";

let handler: CommandHandler;

beforeEach(() => {
  handler = new CommandHandler();
});

describe("CommandHandler.register + execute", () => {
  it("invokes registered executor with correct payload", () => {
    const spy = vi.fn();
    handler.register("scene:set", spy);
    handler.execute({ type: "scene:set", sceneId: "town" });
    expect(spy).toHaveBeenCalledOnce();
    expect(spy).toHaveBeenCalledWith({ type: "scene:set", sceneId: "town" });
  });

  it("invokes onUnknown for commands without executor (does not throw)", () => {
    const onUnknown = vi.fn();
    const h = new CommandHandler({ onUnknown });
    expect(() => h.execute({ type: "scene:respawn" })).not.toThrow();
    expect(onUnknown).toHaveBeenCalledOnce();
    expect(onUnknown).toHaveBeenCalledWith({ type: "scene:respawn" });
  });

  it("default onUnknown is console.warn (no throw)", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(() => handler.execute({ type: "player:stop" })).not.toThrow();
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it("second register() for same type overwrites the first", () => {
    const first = vi.fn();
    const second = vi.fn();
    handler.register("scene:set", first);
    handler.register("scene:set", second);
    handler.execute({ type: "scene:set", sceneId: "cave" });
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledOnce();
  });

  it("unsubscribe from register() stops dispatching", () => {
    const spy = vi.fn();
    const unsub = handler.register("scene:set", spy);
    unsub();
    handler.execute({ type: "scene:set", sceneId: "cave" });
    expect(spy).not.toHaveBeenCalled();
  });

  it("clear() removes all executors", () => {
    const spy = vi.fn();
    handler.register("scene:set", spy);
    handler.register("scene:respawn", spy);
    handler.clear();
    handler.execute({ type: "scene:set", sceneId: "x" });
    handler.execute({ type: "scene:respawn" });
    expect(spy).not.toHaveBeenCalled();
  });

  it("registeredTypes() lists currently registered types", () => {
    handler.register("scene:set", vi.fn());
    handler.register("player:move", vi.fn());
    const types = handler.registeredTypes();
    expect(types).toContain("scene:set");
    expect(types).toContain("player:move");
    expect(types).toHaveLength(2);
  });

  it("executing different command types dispatches to their respective executors", () => {
    const sceneSpy = vi.fn();
    const respawnSpy = vi.fn();
    handler.register("scene:set", sceneSpy);
    handler.register("scene:respawn", respawnSpy);

    handler.execute({ type: "scene:set", sceneId: "forest" });
    handler.execute({ type: "scene:respawn" });

    expect(sceneSpy).toHaveBeenCalledOnce();
    expect(respawnSpy).toHaveBeenCalledOnce();
  });

  it("passes full payload to executor (player:move)", () => {
    const spy = vi.fn();
    handler.register("player:move", spy);
    const cmd: GameCommand = { type: "player:move", position: [1, 2, 3] };
    handler.execute(cmd);
    expect(spy).toHaveBeenCalledWith(cmd);
  });
});
