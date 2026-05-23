/**
 * platform-web – Capa de interoperabilidad web.
 *
 * Define puertos (interfaces) para las capacidades de plataforma web:
 * storage, routing, clipboard, network y timers.
 *
 * El runtime consume estos puertos en lugar de llamar directamente a APIs
 * web (localStorage, navigator.clipboard, fetch, etc.), lo que permite:
 * - Fallback seguro en SSR/entornos sin window.
 * - Sustituir adapters en tests sin mockear globals.
 * - Ampliar hacia otras plataformas sin cambiar código del motor.
 *
 * Uso:
 * ```ts
 * import { localStorageAdapter, browserClipboardAdapter } from "@/lib/platform-web";
 * ```
 */

// ---------------------------------------------------------------------------
// StoragePort – persistencia clave/valor
// ---------------------------------------------------------------------------

/** Puerto de almacenamiento persistente (clave/valor). */
export interface StoragePort {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/**
 * Adapter que delega en localStorage con fallback seguro para SSR.
 * No lanza en entornos sin window (Node.js, Edge runtime).
 */
export class LocalStorageAdapter implements StoragePort {
  private get store(): Storage | null {
    if (typeof window === "undefined") return null;
    try {
      return window.localStorage;
    } catch {
      return null;
    }
  }

  getItem(key: string): string | null {
    return this.store?.getItem(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.store?.setItem(key, value);
  }

  removeItem(key: string): void {
    this.store?.removeItem(key);
  }
}

/** Adapter de localStorage listo para usar. */
export const localStorageAdapter: StoragePort = new LocalStorageAdapter();

/** Adapter noop útil para tests o entornos sin persistencia. */
export class NoopStorageAdapter implements StoragePort {
  private readonly _data = new Map<string, string>();
  getItem(key: string): string | null {
    return this._data.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this._data.set(key, value);
  }
  removeItem(key: string): void {
    this._data.delete(key);
  }
}

// ---------------------------------------------------------------------------
// ClipboardPort – portapapeles
// ---------------------------------------------------------------------------

/** Puerto de escritura en portapapeles. */
export interface ClipboardPort {
  writeText(text: string): Promise<void>;
}

/**
 * Adapter que delega en navigator.clipboard.
 * Devuelve error silencioso si el API no está disponible (SSR, iframes sin permiso).
 */
export class BrowserClipboardAdapter implements ClipboardPort {
  async writeText(text: string): Promise<void> {
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      return;
    }
    await navigator.clipboard.writeText(text);
  }
}

/** Adapter de portapapeles del navegador listo para usar. */
export const browserClipboardAdapter: ClipboardPort =
  new BrowserClipboardAdapter();

// ---------------------------------------------------------------------------
// RoutingPort – navegación
// ---------------------------------------------------------------------------

/** Puerto de navegación entre rutas. */
export interface RoutingPort {
  navigate(path: string): void;
  getCurrentPath(): string;
}

/** Adapter que delega en window.location (sólo en cliente). */
export class BrowserRoutingAdapter implements RoutingPort {
  navigate(path: string): void {
    if (typeof window === "undefined") return;
    window.location.href = path;
  }

  getCurrentPath(): string {
    if (typeof window === "undefined") return "/";
    return window.location.pathname;
  }
}

/** Adapter de routing del navegador listo para usar. */
export const browserRoutingAdapter: RoutingPort = new BrowserRoutingAdapter();

// ---------------------------------------------------------------------------
// NetworkPort – peticiones de red
// ---------------------------------------------------------------------------

/** Opciones para una petición de red. */
export type NetworkRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  body?: string;
};

/** Respuesta normalizada de una petición de red. */
export type NetworkResponse<T = unknown> = {
  ok: boolean;
  status: number;
  data: T | null;
};

/** Puerto de red para peticiones HTTP. */
export interface NetworkPort {
  request<T = unknown>(
    url: string,
    options?: NetworkRequestOptions,
  ): Promise<NetworkResponse<T>>;
}

/** Adapter que delega en fetch. */
export class FetchNetworkAdapter implements NetworkPort {
  async request<T = unknown>(
    url: string,
    options: NetworkRequestOptions = {},
  ): Promise<NetworkResponse<T>> {
    try {
      const response = await fetch(url, {
        method: options.method ?? "GET",
        headers: options.headers,
        body: options.body,
      });

      let data: T | null = null;
      try {
        data = (await response.json()) as T;
      } catch {
        data = null;
      }

      return { ok: response.ok, status: response.status, data };
    } catch {
      return { ok: false, status: 0, data: null };
    }
  }
}

/** Adapter de red listo para usar. */
export const fetchNetworkAdapter: NetworkPort = new FetchNetworkAdapter();

// ---------------------------------------------------------------------------
// TimerPort – temporizadores
// ---------------------------------------------------------------------------

export type TimerHandle = ReturnType<typeof globalThis.setTimeout>;

/** Puerto para temporizadores (timeout/interval) desacoplado de window. */
export interface TimerPort {
  setTimeout(callback: () => void, delayMs?: number): TimerHandle;
  clearTimeout(handle: TimerHandle | null | undefined): void;
  setInterval(callback: () => void, delayMs?: number): TimerHandle;
  clearInterval(handle: TimerHandle | null | undefined): void;
}

/** Adapter de temporizadores usando globalThis para SSR/cliente. */
export class BrowserTimerAdapter implements TimerPort {
  setTimeout(callback: () => void, delayMs?: number): TimerHandle {
    return globalThis.setTimeout(callback, delayMs);
  }

  clearTimeout(handle: TimerHandle | null | undefined): void {
    if (handle == null) return;
    globalThis.clearTimeout(handle);
  }

  setInterval(callback: () => void, delayMs?: number): TimerHandle {
    return globalThis.setInterval(callback, delayMs);
  }

  clearInterval(handle: TimerHandle | null | undefined): void {
    if (handle == null) return;
    globalThis.clearInterval(handle);
  }
}

/** Adapter de temporizadores listo para usar. */
export const browserTimerAdapter: TimerPort = new BrowserTimerAdapter();

// ---------------------------------------------------------------------------
// Barrel: plataforma completa lista para usar
// ---------------------------------------------------------------------------

/** Conjunto de adapters web por defecto. Úsalo en el cliente. */
export const webPlatform = {
  storage: localStorageAdapter,
  clipboard: browserClipboardAdapter,
  routing: browserRoutingAdapter,
  network: fetchNetworkAdapter,
  timer: browserTimerAdapter,
} as const;

export type WebPlatform = typeof webPlatform;
