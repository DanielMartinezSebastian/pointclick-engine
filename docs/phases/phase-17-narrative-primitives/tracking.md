# Phase 17 — Tracking

> Marca `[x]` solo con Success Criteria validados. Tras cada tarea: gate técnico y `npm run smoke`.

## Previo

- [x] [01-adr-approval](tasks/01-adr-approval.md) — opus

## Ola A — en paralelo

- [x] [02-clock-port](tasks/02-clock-port.md) — haiku
- [x] [03-world-state](tasks/03-world-state.md) — sonnet
- [x] [11-legacy-outcomes](tasks/11-legacy-outcomes.md) — haiku

## Ola B — en paralelo

- [x] [04-conditions](tasks/04-conditions.md) — sonnet
- [x] [10-save-load](tasks/10-save-load.md) — sonnet

## Ola C

- [x] [05-actions-and-sequencer](tasks/05-actions-and-sequencer.md) — sonnet
- [x] [05b-renderer-walk-completed](tasks/05b-renderer-walk-completed.md) — sonnet — _añadida al integrar la 05: nadie emitía `player:walkCompleted`_

## Ola D — en secuencia (las cuatro amplían los mismos archivos de tipos y executors)

- [x] [06-hotspots](tasks/06-hotspots.md) — sonnet
- [x] [07-dialogue-trees](tasks/07-dialogue-trees.md) — sonnet
- [x] [08-item-combine](tasks/08-item-combine.md) — haiku
- [x] [09-declarative-scene-rules](tasks/09-declarative-scene-rules.md) — sonnet

## Ola E — en paralelo

- [x] [12-content-validator](tasks/12-content-validator.md) — sonnet
- [x] [13-renderer-hotspots](tasks/13-renderer-hotspots.md) — sonnet
- [x] [14-renderer-npcs](tasks/14-renderer-npcs.md) — sonnet
- [x] [15-renderer-dialogue-ui](tasks/15-renderer-dialogue-ui.md) — sonnet

## Ola F

- [x] [16-demo-migration](tasks/16-demo-migration.md) — sonnet
- [x] [17-headless-walkthrough](tasks/17-headless-walkthrough.md) — sonnet

## Ola G

- [x] [18-authoring-docs](tasks/18-authoring-docs.md) — haiku
- [x] [19-validation-gate](tasks/19-validation-gate.md) — opus

## Gate final (ejecutado el 2026-10-11)

- [x] Gate técnico verde desde `dist/` limpio — build de paquetes, tests (core 718, renderer 159, demo 47), typecheck, lint (0 errores) y `next build`
- [x] `coreAgnosticism.test.ts` verde; `grep "demo-content|apps/web-demo" packages/*/src` vacío
- [x] Ningún export, comando ni evento de 0.5.0 cambia de forma — exports: core 176 → 259, renderer 94 → 130, ninguno perdido; `GameCommand` y `GameEvent` de 0.5.0 asignables a los actuales (comprobación de tipos); `/example-minimal` de 0.5.0 sin tocar compila y pasa sus 5 comprobaciones
- [x] Recorrido headless de la mini-aventura resuelto solo con comandos (14 tests; recorrido completo en ~13 ms)
- [x] La demo no usa `canLeaveScene`, `onSceneEnter` ni `getInitialPlacedItems` (grep vacío)
- [x] `npm run smoke` verde, ampliado con NPC, diálogo con opciones, hotspot y combinación — 69/69 y 8/8
- [x] Una partida guardada con 0.5.0 carga con 0.6.0 — comprobación del smoke con las cuatro claves antiguas inyectadas: escena, inventario, ítem colocado y puertas intactos, y sin resembrar el trofeo
- [x] Consumo real: `npm pack` de ambos paquetes instalado en un proyecto Next.js fuera del monorepo; build y smoke del ejemplo 8/8
- [x] Guía de autoría publicada (`docs/authoring/`); CHANGELOG y versión 0.6.0

Pendiente del owner: push de la rama, publicar 0.6.0 en npm.
