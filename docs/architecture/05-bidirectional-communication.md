# Bidirectional Communication

**Estado**: estable v0.4 | **Última revisión**: 2026-05-27

## TL;DR

`createGameRuntime()` devuelve un handle con dos canales:

- **Commands** (web → juego): `runtime.executeCommand({ type, ...payload })`
- **Events** (juego → web): `const unsub = runtime.on(type, handler)`

Ambos son sincrónicos, fire-and-forget, y **no requieren React**.

## Quickstart

```ts
import { createGameRuntime } from "@pointclick-engine/engine-renderer-r3f"; // facade re-export

const runtime = createGameRuntime({ scenes, items, rules });

// Escuchar eventos
const unsub = runtime.on("scene:changed", (e) => {
  console.log("now in:", e.sceneId);
});

// Enviar comandos
runtime.executeCommand({ type: "scene:set", sceneId: "town" });

// Limpieza
unsub();
runtime.dispose();
```

## Catálogo de comandos

| Type | Payload | Efecto |
|------|---------|--------|
| `scene:set` | `{ sceneId: string }` | Cambia la escena activa |
| `scene:respawn` | — | Reinicia player en spawn de la escena actual |
| `player:move` | `{ position: [x,y,z] }` | Teleporta player (sin pathfinding) |
| `player:stop` | — | Cancela movimiento en curso *(not yet wired — Phase 5)* |
| `inventory:toggle` | — | Abre/cierra UI inventario *(not yet wired — Phase 5)* |
| `inventory:pickup` | `{ itemId: string }` | Mete ítem al inventario *(not yet wired — Phase 5)* |
| `inventory:drop` | `{ itemId: string, slotIndex: number }` | Suelta ítem *(not yet wired — Phase 5)* |
| `dialog:trigger` | `{ dialogKey: string }` | Muestra diálogo por clave *(not yet wired — Phase 5)* |
| `dialog:dismiss` | — | Cierra diálogo activo *(not yet wired — Phase 5)* |

Comandos sin executor real loguean un `console.warn` y no hacen nada. Se cablearán en Phase 5.

## Catálogo de eventos

| Type | Payload | Cuándo |
|------|---------|--------|
| `scene:changed` | `{ sceneId, scene }` | Tras `scene:set` aplicado |
| `scene:respawnRequested` | `{ sceneId }` | Tras `scene:respawn` |
| `player:moved` | `{ position, action }` | Cada frame de movimiento (alta frecuencia) |
| `player:collided` | `{ reason, position }` | Boundary / stuck |
| `item:pickedUp` | `{ itemId, quantity }` | Tras pickup exitoso |
| `item:dropped` | `{ itemId, outcome, interactionId? }` | Tras drop |
| `dialog:triggered` | `{ text, dialogKey?, source }` | Diálogo mostrado |
| `dialog:dismissed` | `{ dialogKey? }` | Diálogo cerrado |

> **Nota sobre `player:moved`**: se emite a ~60Hz. Si el consumer hace operaciones costosas
> en este handler, añadir throttle/debounce en el callback — nunca en el motor.

## Patrones de integración

### React (dentro de la demo)

```tsx
useEffect(() => {
  const rt = getGameRuntime();
  if (!rt) return;
  const unsub = rt.on("scene:changed", (e) => console.log(e.sceneId));
  return () => unsub();
}, []);
```

### HTML plano / Vue / Svelte / Electron preload

Ver ejemplo funcional: `apps/web-demo/app/example-bridge/`

```html
<script type="module">
  import { createGameRuntime } from "https://.../engine-bundle.js";
  const rt = createGameRuntime({ scenes, items, rules });
  document.querySelector("#btn-town").onclick = () =>
    rt.executeCommand({ type: "scene:set", sceneId: "town" });
  rt.on("dialog:triggered", (e) => showHtmlToast(e.text));
</script>
```

### postMessage / iframe / WebView

```ts
// En el iframe padre (receptor de eventos)
const rt = createGameRuntime({ ... });
rt.on("scene:changed", (e) =>
  parent.postMessage({ kind: "event", event: e }, "*"),
);

// Recibir comandos desde el padre
window.addEventListener("message", (msg) => {
  if (msg.data?.kind === "command") rt.executeCommand(msg.data.cmd);
});
```

## Acceder al runtime singleton

Si no tienes referencia directa al handle (ej. dentro de un componente que no lo creó):

```ts
import { getGameRuntime } from "@pointclick-engine/engine-renderer-r3f";
const rt = getGameRuntime(); // null si no se ha llamado createGameRuntime todavía
rt?.executeCommand({ type: "scene:respawn" });
```

## Errores comunes

| Error | Causa | Solución |
|-------|-------|----------|
| Listener no recibe eventos | Olvidar llamar al `unsubscribe` devuelto por `on()` antes de remontar | Guardar y llamar en cleanup de `useEffect` |
| `getGameRuntime()` es null al inicio | `createGameRuntime` no se llamó aún | Llamarlo antes de usar `getGameRuntime`; o usar `runtime.on` desde el hook que crea el runtime |
| `scene:set` no hace nada | La escena no está registrada | Pasar `scenes: [...]` en `createGameRuntime` o llamar `registerScene` antes |
| Comandos masivos por frame | `player:move` llamado en un loop sin throttle | Throttle en el caller; el bus es síncrono y bloqueante |

## Ver también

- **ADR-0006** (decisiones de diseño): `docs/decisions/0006-command-event-architecture.md`
- **API pública** (contrato formal): `docs/architecture/02-public-api.md`
- **Ejemplo funcional**: `apps/web-demo/app/example-bridge/`
- **Implementación commands**: `packages/engine-core/src/game/commands/`
- **Implementación events**: `packages/engine-core/src/game/events/`
