# Platform Ports & Adapters

## Concepto

**Port**: interface agnóstica definida en core.
**Adapter**: implementación específica de plataforma.

Core depende del port (interface). El adapter se inyecta al runtime.

## Ports actuales

Definidos en `apps/web-demo/app/lib/platform-web.ts` (post-Fase 2 se moverán a `packages/engine-core/src/platform/ports.ts`).

| Port | Capacidades |
|------|-------------|
| `StoragePort` | `getItem`, `setItem`, `removeItem` |
| `ClipboardPort` | `writeText`, `readText` |
| `RoutingPort` | `getPath`, `navigate` |
| `NetworkPort` | `fetch` (con timeout/retry) |
| `TimerPort` | `now`, `setTimeout`, `clearTimeout` |
| `EnvironmentPort` | `isProduction`, `addWindowEventListener` |

## Adapters web

| Adapter | Implementa | Usa |
|---------|-----------|-----|
| `localStorageAdapter` | StoragePort | `window.localStorage` |
| `browserClipboardAdapter` | ClipboardPort | `navigator.clipboard` |
| `browserRoutingAdapter` | RoutingPort | `window.location` |
| `fetchNetworkAdapter` | NetworkPort | `fetch()` global |
| `browserTimerAdapter` | TimerPort | `Date.now`, `setTimeout` |
| `browserEnvironmentAdapter` | EnvironmentPort | `process.env.NODE_ENV`, `window.addEventListener` |

Barrel: `webPlatform`

## SSR-safe

Cada adapter implementa **graceful degradation**:

```ts
export const localStorageAdapter: StoragePort = {
  getItem: (k) => typeof window === 'undefined' ? null : window.localStorage.getItem(k),
  // ...
};
```

## Cómo añadir un nuevo port

1. Define interface en core (`packages/engine-core/src/platform/ports.ts`)
2. Implementa adapter web en `apps/web-demo/app/lib/platform-web.ts`
3. Añade a `webPlatform` barrel
4. Documenta aquí

## Cómo usar desde el host

```ts
import { webPlatform } from './lib/platform-web';

await webPlatform.clipboard.writeText('copiado');
const dispose = webPlatform.env.addWindowEventListener('pointerup', handler);
dispose();
```

## Anti-patterns

| ❌ | ✅ |
|----|----|
| `window.localStorage.getItem` en core | Inyectar `StoragePort` |
| Adapter que asume `window` existe | Check `typeof window === 'undefined'` |
| Mezclar lógica de juego en adapter | Adapter solo implementa el port |
