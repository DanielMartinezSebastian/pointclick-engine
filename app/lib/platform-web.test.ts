import { afterEach, describe, expect, it, vi } from "vitest";

import {
  BrowserClipboardAdapter,
  BrowserRoutingAdapter,
  BrowserTimerAdapter,
  FetchNetworkAdapter,
  LocalStorageAdapter,
  NoopStorageAdapter,
} from "./platform-web";

afterEach(() => {
  vi.useRealTimers();
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

  it("BrowserTimerAdapter ejecuta y cancela timeouts", () => {
    vi.useFakeTimers();
    const adapter = new BrowserTimerAdapter();
    const onTimeout = vi.fn();
    const onCanceled = vi.fn();

    const timeoutHandle = adapter.setTimeout(onTimeout, 25);
    const canceledHandle = adapter.setTimeout(onCanceled, 25);
    adapter.clearTimeout(canceledHandle);

    vi.advanceTimersByTime(30);

    expect(onTimeout).toHaveBeenCalledTimes(1);
    expect(onCanceled).not.toHaveBeenCalled();

    adapter.clearTimeout(timeoutHandle);
    adapter.clearTimeout(null);
    adapter.clearTimeout(undefined);
  });

  it("BrowserTimerAdapter ejecuta y cancela intervals", () => {
    vi.useFakeTimers();
    const adapter = new BrowserTimerAdapter();
    const onInterval = vi.fn();

    const intervalHandle = adapter.setInterval(onInterval, 10);
    vi.advanceTimersByTime(35);
    expect(onInterval).toHaveBeenCalledTimes(3);

    adapter.clearInterval(intervalHandle);
    vi.advanceTimersByTime(30);
    expect(onInterval).toHaveBeenCalledTimes(3);

    adapter.clearInterval(null);
    adapter.clearInterval(undefined);
  });
});
