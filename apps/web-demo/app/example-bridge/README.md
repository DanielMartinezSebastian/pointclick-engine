# Example: Bridge HTML ↔ Game

Demuestra el contrato de Phase 4: comandos web → juego y eventos juego → web.

## Run

```bash
npm run dev
```

Abrir: `http://localhost:3000/example-bridge`

## Qué hace

- **Panel derecho**: botones HTML que disparan `executeCommand()` al runtime sin conocer
  React Three Fiber ni el store interno. Log que se rellena con eventos recibidos via `on()`.
- **Canvas izquierdo**: motor R3F estándar (igual que en `/`).

## Por qué importa

`HtmlBridgePanel.tsx` solo usa `getGameRuntime()` — la misma API que usarían:

- Un script `<script type="module">` en HTML plano
- Un componente Vue o Svelte
- Un `preload.js` de Electron
- Un iframe que recibe mensajes vía `postMessage`

La única razón por la que el panel está en TSX es para co-ubicarlo en la app Next.js de demo,
no por dependencia técnica con el runtime.

## Smoke test manual

| Acción | Esperado en log |
|--------|----------------|
| Click "scene:set → town" | `→ scene: town` |
| Click "scene:respawn" | `↺ respawn in: <sceneId>` |
| Mover player contra pared | `× collision (boundary)` |
| Click "player:move → [0,0,5]" | Personaje se teleporta |
| `player:stop` | warn en consola (not yet wired — Phase 5) |

## Comandos no cableados (Phase 5)

Los botones `player:stop`, `inventory:*` y `dialog:*` loguean un warning en consola y
no tienen efecto todavía. Se cablearán en Phase 5.

## Ver también

- [`docs/architecture/05-bidirectional-communication.md`](../../../docs/architecture/05-bidirectional-communication.md)
- [`docs/decisions/0006-command-event-architecture.md`](../../../docs/decisions/0006-command-event-architecture.md)
