# Bidirectional Communication

**Estado**: estable v0.4; catálogo ampliado en 0.6.0 (sin publicar) | **Última revisión**: 2026-10-11

## TL;DR

`createGameRuntime()` devuelve un handle con dos canales:

- **Commands** (web → juego): `runtime.executeCommand({ type, ...payload })`
- **Events** (juego → web): `const unsub = runtime.on(type, handler)`

Ambos son sincrónicos, fire-and-forget, y **no requieren React**.

## Quickstart

```ts
import { createGameRuntime } from "@pointclick-engine/engine-core";

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
| `scene:set` | `{ sceneId: string, spawnPosition? }` | Cambia la escena activa |
| `scene:respawn` | — | Reinicia player en spawn de la escena actual |
| `player:move` | `{ position: [x,y,z] }` | Teleporta player (sin pathfinding) |
| `player:stop` | — | Aborta una caminata por ruta (emite `player:walkAborted`) |
| `inventory:toggle` | — | Abre/cierra UI inventario |
| `inventory:pickup` | `{ itemId, placedItemId? }` | Recoge un ítem colocado de la escena activa |
| `inventory:drop` | `{ itemId, slotIndex, interactionId? \| hotspotId? }` | Suelta ítem sobre una interacción o un hotspot |
| `dialog:trigger` | `{ dialogKey, speaker? }` | Muestra el bocadillo de una clave |
| `dialog:dismiss` | — | Cierra diálogo activo |

Comandos sin executor registrado loguean un `console.warn` y no hacen nada.

### Comandos nuevos en 0.6.0

Fuente: `packages/engine-core/src/game/commands/types.ts`.

| Type | Payload | Efecto |
|------|---------|--------|
| `state:setFlag` | `{ name, value }` | Pone un flag (`boolean \| number \| string`) |
| `state:clearFlag` | `{ name }` | Borra un flag |
| `game:save` | `{ extra? }` | Guarda la partida (requiere `storage`) |
| `game:load` | — | Carga la partida guardada |
| `game:reset` | — | Vacía la partida y borra el guardado |
| `script:run` | `{ script, interrupt? }` | Ejecuta un guion |
| `script:cancelAll` | — | Cancela el guion en curso y la cola |
| `hotspot:interact` | `{ hotspotId, verb, itemId? }` | Verbo (`look`, `use`, `talk`) o `useItem` sobre un hotspot o NPC |
| `inventory:combine` | `{ itemId, withItemId }` | Combina dos ítems del inventario |
| `dialogue:start` | `{ dialogueId }` | Abre una conversación |
| `dialogue:choose` | `{ index }` | Elige una opción |
| `dialogue:advance` / `dialogue:end` | — | Cierra la línea / termina la conversación |

## Catálogo de eventos

| Type | Payload | Cuándo |
|------|---------|--------|
| `scene:changed` | `{ sceneId, scene }` | Tras `scene:set` aplicado |
| `scene:respawnRequested` | `{ sceneId }` | Tras `scene:respawn` |
| `player:moved` | `{ position, action }` | Cada frame de movimiento (alta frecuencia) |
| `player:collided` | `{ reason, position }` | Boundary / stuck |
| `item:pickedUp` | `{ itemId, quantity }` | Tras pickup exitoso |
| `item:dropped` | `{ itemId, outcome, interactionId? }` | Tras drop |
| `dialog:triggered` | `{ text, dialogKey?, source, speaker? }` | Diálogo mostrado |
| `dialog:dismissed` | `{ dialogKey? }` | Diálogo cerrado |

### Eventos nuevos en 0.6.0

Fuente: `packages/engine-core/src/game/events/types.ts`.

| Type | Payload | Cuándo |
|------|---------|--------|
| `state:flagChanged` | `{ name, value?, previous? }` | Cambia o se borra un flag |
| `game:saved` / `game:reset` | — | Tras guardar / reiniciar |
| `game:loaded` | `{ found, applied?, extra? }` | Tras `game:load` |
| `script:started` / `script:finished` | `{ id }` / `{ id, result }` | Un guion empieza / termina (`"finished"` o `"cancelled"`) |
| `input:lockChanged` | `{ locked }` | Cambia el bloqueo de entrada |
| `custom` | `{ name, payload? }` | Acción `emit` de un guion |
| `hotspot:interacted` | `{ hotspotId, verb, itemId? }` | Se aplicó una rama |
| `hotspot:noAction` | `{ hotspotId, verb, itemId?, reason }` | Sin rama (`not-found`, `hidden`, `missing-item`, `no-rule`) |
| `dialogue:started` / `nodeEntered` / `choiceMade` / `ended` | ver tipos | Ciclo de una conversación (`ended.reason`: `finished`, `ended`, `cancelled`) |
| `inventory:pickupFailed` | `{ itemId, reason }` | `not-found`, `blocked`, `full`, `unknown-item` |
| `inventory:full` / `item:removed` | `{ itemId }` | `giveItem` sin sitio / `removeItem` |
| `item:combined` / `item:combineFailed` | `{ itemId, withItemId }` | Resultado de `inventory:combine` |

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
import { getGameRuntime } from "@pointclick-engine/engine-core";
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
