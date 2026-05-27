# Task 07: Bidirectional communication docs

**Phase**: 4 | **Estimate**: 2h | **Owner**: —

## Context

Phase 4 entrega un contrato nuevo (`executeCommand` / `on` / `emit`) que debe documentarse para futuros integradores y para el README final cuando se publique en npm. Documento canónico: `docs/architecture/05-bidirectional-communication.md`. También actualizar `docs/architecture/02-public-api.md` y `docs/README.md` (índice).

## Prerequisites

- [ ] Task 05 done (API estable)
- [ ] Task 06 done (ejemplo funcional referenciable)

## Action

### 1. Crear `docs/architecture/05-bidirectional-communication.md`

Estructura (mantener < 200 líneas):

```markdown
# Bidirectional Communication

**Estado**: estable v0.4 | **Última revisión**: <fecha>

## TL;DR

`createGameRuntime()` devuelve un handle con dos canales:

- **Commands** (web → juego): `runtime.executeCommand({ type, ...payload })`
- **Events** (juego → web): `const unsub = runtime.on(type, handler)`

Ambos son sincrónicos, fire-and-forget, y no requieren React.

## Quickstart

\`\`\`ts
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
\`\`\`

## Catálogo de comandos

| Type | Payload | Efecto |
|------|---------|--------|
| `scene:set` | `{ sceneId: string }` | Cambia la escena activa |
| `scene:respawn` | — | Reinicia player en spawn de la escena actual |
| `player:move` | `{ position: [x,y,z] }` | Teleporta player (sin pathfinding) |
| `player:stop` | — | Cancela movimiento en curso |
| `inventory:toggle` | — | Abre/cierra UI inventario |
| `inventory:pickup` | `{ itemId: string }` | Mete ítem al inventario |
| `inventory:drop` | `{ itemId: string, slotIndex: number }` | Suelta ítem en el mundo |
| `dialog:trigger` | `{ dialogKey: string }` | Muestra diálogo por clave |
| `dialog:dismiss` | — | Cierra diálogo activo |

Comandos sin executor real (Phase 4 inicial) loguean warning. Phase 5 los wirea.

## Catálogo de eventos

| Type | Payload | Cuándo |
|------|---------|--------|
| `scene:changed` | `{ sceneId, scene }` | Tras `scene:set` aplicado |
| `scene:respawnRequested` | `{ sceneId }` | Tras `scene:respawn` |
| `player:moved` | `{ position, action }` | Cada frame de movimiento (alta freq.) |
| `player:collided` | `{ reason, position }` | Boundary / stuck |
| `item:pickedUp` | `{ itemId, quantity }` | Tras pickup exitoso |
| `item:dropped` | `{ itemId, outcome, interactionId? }` | Tras drop |
| `dialog:triggered` | `{ text, dialogKey?, source }` | Diálogo mostrado |
| `dialog:dismissed` | `{ dialogKey? }` | Diálogo cerrado |

## Patrones de integración

### React (interno a la demo)

\`\`\`tsx
useEffect(() => {
  const rt = getGameRuntime();
  const unsub = rt?.on("scene:changed", handle);
  return () => unsub?.();
}, []);
\`\`\`

### HTML plano / Vue / Svelte / Electron preload

Ver ejemplo funcional: `apps/web-demo/app/example-bridge/`.

\`\`\`html
<script type="module">
  import { createGameRuntime } from "https://.../engine-bundle.js";
  const rt = createGameRuntime({ ... });
  document.querySelector("#btn-town").onclick = () =>
    rt.executeCommand({ type: "scene:set", sceneId: "town" });
  rt.on("dialog:triggered", (e) => showHtmlToast(e.text));
</script>
\`\`\`

### postMessage / iframe / WebView

\`\`\`ts
window.addEventListener("message", (msg) => {
  if (msg.data?.kind === "command") rt.executeCommand(msg.data.cmd);
});
rt.on("scene:changed", (e) =>
  parent.postMessage({ kind: "event", event: e }, "*")
);
\`\`\`

## Errores comunes

- **Listener no se desuscribe**: guardar el `unsubscribe` devuelto por `on()` y llamarlo al desmontar.
- **`runtime` undefined al inicio**: `createGameRuntime` debe llamarse antes de `getGameRuntime`. Si la composición es React, hacerlo en un `useEffect` con dependencies vacías y luego suscribirse en un segundo `useEffect`.
- **`scene:set` sin scene registrada**: warn + no-op. Registrar siempre las escenas en `config.scenes`.
- **Comandos masivos por frame**: `player:move` desde un slider o input continuo debería throttle-arse en el caller.

## Ver también

- ADR-0006: `docs/decisions/0006-command-event-architecture.md` (decisiones de diseño)
- API Public: `docs/architecture/02-public-api.md`
- Ejemplo: `apps/web-demo/app/example-bridge/`
```

### 2. Actualizar `docs/architecture/02-public-api.md`

Añadir sección "Commands & Events" linkando al nuevo archivo. No duplicar contenido.

### 3. Actualizar `docs/README.md`

Añadir entrada en sección Architecture:

```markdown
- [`architecture/05-bidirectional-communication.md`](architecture/05-bidirectional-communication.md) — Commands & Events API (web ↔ juego)
```

### 4. Actualizar `CLAUDE.md`

En la tabla "Documentos Clave", añadir fila:

```markdown
| Comunicar web ↔ juego | `docs/architecture/05-bidirectional-communication.md` |
```

Y actualizar la sección "API Pública" para mencionar `executeCommand` / `on` / `emit`.

## Success Criteria

- [ ] `docs/architecture/05-bidirectional-communication.md` existe (< 200 líneas)
- [ ] Catálogo completo: 9 comandos + 8 eventos tabulados
- [ ] Al menos 3 patrones de integración con código (React, HTML plano, postMessage)
- [ ] `docs/README.md` referencia el nuevo doc
- [ ] `docs/architecture/02-public-api.md` linka al nuevo doc
- [ ] `CLAUDE.md` actualizado con la nueva entrada de doc clave
- [ ] Links internos del nuevo doc (a ADR-0006, example-bridge, public-api) son válidos

## On Complete

1. Marca `[x]` en `../tracking.md` para `07-bidirectional-docs`
2. Commit:
   ```
   docs(phase-4): add bidirectional communication guide

   - [x] Marked: 07-bidirectional-docs

   See docs/phases/phase-4-bidirectional-web-game/tasks/07-bidirectional-docs.md
   ```

## References

- Task previa: 05 (firma del API), 06 (ejemplo a citar)
- Doc paralelo (estilo): `docs/architecture/04-platform-ports.md`
- ADR: `docs/decisions/0006-command-event-architecture.md`

## Notes

Si en Task 05 el contrato final difiere de lo planeado (ej. `off()` eliminado), ajustar el doc para reflejar la realidad, no el plan original.

No duplicar el catálogo de comandos/eventos en otros docs: la fuente única es este archivo.
