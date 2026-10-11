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
- [ ] [13-renderer-hotspots](tasks/13-renderer-hotspots.md) — sonnet
- [x] [14-renderer-npcs](tasks/14-renderer-npcs.md) — sonnet
- [ ] [15-renderer-dialogue-ui](tasks/15-renderer-dialogue-ui.md) — sonnet

## Ola F

- [ ] [16-demo-migration](tasks/16-demo-migration.md) — sonnet
- [ ] [17-headless-walkthrough](tasks/17-headless-walkthrough.md) — sonnet

## Ola G

- [ ] [18-authoring-docs](tasks/18-authoring-docs.md) — haiku
- [ ] [19-validation-gate](tasks/19-validation-gate.md) — opus

## Gate final

- [ ] Gate técnico verde desde `dist/` limpio
- [ ] `coreAgnosticism.test.ts` verde
- [ ] Ningún export, comando ni evento de 0.5.0 cambia de forma
- [ ] Recorrido headless de la mini-aventura resuelto solo con comandos
- [ ] La demo no usa `canLeaveScene`, `onSceneEnter` ni `getInitialPlacedItems`
- [ ] `npm run smoke` verde, ampliado con NPC, diálogo con opciones, hotspot y combinación
- [ ] Una partida guardada con 0.5.0 carga con 0.6.0
- [ ] Guía de autoría publicada; CHANGELOG y versión 0.6.0
