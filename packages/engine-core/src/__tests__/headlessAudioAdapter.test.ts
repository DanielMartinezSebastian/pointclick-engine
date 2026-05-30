import { describe, it, expect } from "vitest";
import { HeadlessAudioAdapter } from "../ports/headlessAudio";
import type { SoundDefinition } from "../game/types";

describe("HeadlessAudioAdapter", () => {
  it("records all calls in order", () => {
    const adapter = new HeadlessAudioAdapter();
    const def: SoundDefinition = {
      id: "test",
      url: "/sounds/test.ogg",
      category: "sfx",
    };
    adapter.playSound(def);
    adapter.setMuted("master", true);
    adapter.playSound(def);
    expect(adapter.calls.length).toBe(3);
    expect(adapter.calls[0].type).toBe("playSound");
    expect(adapter.calls[1].type).toBe("setMuted");
    expect(adapter.calls[2].type).toBe("playSound");
  });

  it("reset clears the log", () => {
    const adapter = new HeadlessAudioAdapter();
    const def: SoundDefinition = {
      id: "test",
      url: "/sounds/test.ogg",
      category: "sfx",
    };
    adapter.playSound(def);
    expect(adapter.calls.length).toBe(1);
    adapter.reset();
    expect(adapter.calls.length).toBe(0);
  });

  it("playSound registers def and opts exactly", () => {
    const adapter = new HeadlessAudioAdapter();
    const def: SoundDefinition = {
      id: "test",
      url: "/sounds/test.ogg",
      volume: 0.7,
      category: "sfx",
    };
    adapter.playSound(def, { volume: 0.5 });
    const call = adapter.calls[0];
    expect(call.type).toBe("playSound");
    expect((call as any).def).toEqual(def);
    expect((call as any).opts).toEqual({ volume: 0.5 });
  });

  it("setMuted registers target and muted", () => {
    const adapter = new HeadlessAudioAdapter();
    adapter.setMuted("master", true);
    const call = adapter.calls[0];
    expect(call.type).toBe("setMuted");
    expect((call as any).target).toBe("master");
    expect((call as any).muted).toBe(true);
  });

  it("preload resolves without error", async () => {
    const adapter = new HeadlessAudioAdapter();
    await expect(
      adapter.preload(["/sounds/1.ogg", "/sounds/2.ogg"])
    ).resolves.toBeUndefined();
    expect(adapter.calls.length).toBe(1);
    expect(adapter.calls[0].type).toBe("preload");
  });

  it("dispose registers correct entry type", () => {
    const adapter = new HeadlessAudioAdapter();
    adapter.dispose();
    const call = adapter.calls[0];
    expect(call.type).toBe("dispose");
  });
});
