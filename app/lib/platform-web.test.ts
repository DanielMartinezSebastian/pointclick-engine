import { afterEach, describe, expect, it, vi } from "vitest";

import {
  BrowserClipboardAdapter,
  BrowserEnvironmentAdapter,
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

  it("BrowserEnvironmentAdapter resuelve matchMedia y subscribe", () => {
    const addEventListener = vi.fn();
    const removeEventListener = vi.fn();

    vi.stubGlobal("window", {
      matchMedia: vi.fn().mockReturnValue({
        matches: true,
        addEventListener,
        removeEventListener,
      }),
      innerHeight: 720,
      requestAnimationFrame: vi.fn((cb: () => void) => {
        cb();
        return 123;
      }),
      cancelAnimationFrame: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    const adapter = new BrowserEnvironmentAdapter();
    const media = adapter.matchMedia("(max-width: 768px)");
    expect(media.matches).toBe(true);

    const off = media.subscribe(() => {});
    expect(addEventListener).toHaveBeenCalledWith("change", expect.any(Function));
    off();
    expect(removeEventListener).toHaveBeenCalledWith("change", expect.any(Function));

    expect(adapter.getInnerHeight(800)).toBe(720);
    expect(adapter.requestAnimationFrame(() => {})).toBe(123);
    adapter.cancelAnimationFrame(123);
  });

  it("BrowserEnvironmentAdapter usa fallback SSR seguro", () => {
    const adapter = new BrowserEnvironmentAdapter();
    const media = adapter.matchMedia("(max-width: 768px)");
    expect(media.matches).toBe(false);
    const off = media.subscribe(() => {});
    expect(typeof off).toBe("function");
    off();

    expect(adapter.getInnerHeight(640)).toBe(640);

    const disposeWindow = adapter.addWindowEventListener("click", () => {});
    const disposeDocument = adapter.addDocumentEventListener("click", () => {});
    expect(typeof disposeWindow).toBe("function");
    expect(typeof disposeDocument).toBe("function");

    const unmountStyle = adapter.mountStyleTag("data-test", "x", "body{}");
    expect(typeof unmountStyle).toBe("function");
    unmountStyle();
  });

  it("BrowserEnvironmentAdapter registra y desregistra listeners globales", () => {
    const addWindowListener = vi.fn();
    const removeWindowListener = vi.fn();
    const addDocumentListener = vi.fn();
    const removeDocumentListener = vi.fn();

    vi.stubGlobal("window", {
      addEventListener: addWindowListener,
      removeEventListener: removeWindowListener,
      matchMedia: vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
      innerHeight: 800,
      requestAnimationFrame: vi.fn(() => 1),
      cancelAnimationFrame: vi.fn(),
    });

    vi.stubGlobal("document", {
      addEventListener: addDocumentListener,
      removeEventListener: removeDocumentListener,
      createElement: vi.fn(() => ({
        setAttribute: vi.fn(),
        remove: vi.fn(),
      })),
      head: {
        appendChild: vi.fn(),
      },
    });

    const adapter = new BrowserEnvironmentAdapter();

    const winHandler = () => {};
    const disposeWindow = adapter.addWindowEventListener("pointerup", winHandler);
    expect(addWindowListener).toHaveBeenCalledWith("pointerup", winHandler, undefined);
    disposeWindow();
    expect(removeWindowListener).toHaveBeenCalledWith("pointerup", winHandler, undefined);

    const docHandler = () => {};
    const disposeDocument = adapter.addDocumentEventListener("mousedown", docHandler);
    expect(addDocumentListener).toHaveBeenCalledWith("mousedown", docHandler, undefined);
    disposeDocument();
    expect(removeDocumentListener).toHaveBeenCalledWith("mousedown", docHandler, undefined);
  });

  it("BrowserEnvironmentAdapter monta y desmonta style tag", () => {
    const styleElement = {
      setAttribute: vi.fn(),
      remove: vi.fn(),
      innerHTML: "",
    };

    const createElement = vi.fn().mockReturnValue(styleElement);
    const appendChild = vi.fn();

    vi.stubGlobal("window", {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      matchMedia: vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
      innerHeight: 800,
      requestAnimationFrame: vi.fn(() => 1),
      cancelAnimationFrame: vi.fn(),
    });

    vi.stubGlobal("document", {
      createElement,
      head: { appendChild },
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    const adapter = new BrowserEnvironmentAdapter();
    const unmount = adapter.mountStyleTag("data-debug", "true", "*{cursor:auto}");

    expect(createElement).toHaveBeenCalledWith("style");
    expect(styleElement.setAttribute).toHaveBeenCalledWith("data-debug", "true");
    expect(styleElement.innerHTML).toBe("*{cursor:auto}");
    expect(appendChild).toHaveBeenCalledWith(styleElement);

    unmount();
    expect(styleElement.remove).toHaveBeenCalledTimes(1);
  });
});
