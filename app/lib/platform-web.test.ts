import { afterEach, describe, expect, it, vi } from "vitest";

import {
  BrowserClipboardAdapter,
  BrowserRoutingAdapter,
  FetchNetworkAdapter,
  LocalStorageAdapter,
  NoopStorageAdapter,
} from "./platform-web";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("platform-web", () => {
  it("LocalStorageAdapter usa fallback seguro cuando no hay window", () => {
    const adapter = new LocalStorageAdapter();

    expect(adapter.getItem("k")).toBeNull();
    expect(() => adapter.setItem("k", "v")).not.toThrow();
    expect(() => adapter.removeItem("k")).not.toThrow();
  });

  it("NoopStorageAdapter persiste en memoria", () => {
    const adapter = new NoopStorageAdapter();
    adapter.setItem("k", "v");
    expect(adapter.getItem("k")).toBe("v");
    adapter.removeItem("k");
    expect(adapter.getItem("k")).toBeNull();
  });

  it("BrowserRoutingAdapter lee path del navegador cuando window existe", () => {
    vi.stubGlobal("window", {
      location: {
        href: "http://localhost/",
        pathname: "/debug",
      },
    });

    const adapter = new BrowserRoutingAdapter();
    expect(adapter.getCurrentPath()).toBe("/debug");

    adapter.navigate("/play");
    expect((globalThis as { window: { location: { href: string } } }).window.location.href).toBe("/play");
  });

  it("BrowserClipboardAdapter no falla sin navigator.clipboard", async () => {
    const adapter = new BrowserClipboardAdapter();
    await expect(adapter.writeText("hello")).resolves.toBeUndefined();
  });

  it("FetchNetworkAdapter normaliza respuestas exitosas", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ ok: 1 }),
      }),
    );

    const adapter = new FetchNetworkAdapter();
    const response = await adapter.request<{ ok: number }>("/api/test");
    expect(response).toEqual({ ok: true, status: 200, data: { ok: 1 } });
  });

  it("FetchNetworkAdapter devuelve status 0 cuando fetch falla", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));

    const adapter = new FetchNetworkAdapter();
    const response = await adapter.request("/api/fail");
    expect(response).toEqual({ ok: false, status: 0, data: null });
  });
});
