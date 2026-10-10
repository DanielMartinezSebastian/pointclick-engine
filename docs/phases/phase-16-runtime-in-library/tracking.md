# Phase 16 — Tracking

> Marca `[x]` solo con Success Criteria validados. El orquestador integra y valida entre olas.

## Previo

- [x] Fase 15 cerrada (gate verde)
- [x] [01-adr-and-issue](tasks/01-adr-and-issue.md) — opus

## Ola A — en paralelo

- [x] [02-core-runtime-factory](tasks/02-core-runtime-factory.md) — sonnet
- [x] [05-delete-render-duplicates](tasks/05-delete-render-duplicates.md) — haiku
- [x] [08-storage-port-persistence](tasks/08-storage-port-persistence.md) — haiku

## Ola B — en paralelo

- [x] [03-renderer-state-hooks-and-barrel](tasks/03-renderer-state-hooks-and-barrel.md) — sonnet
- [x] [04-unify-scene-types](tasks/04-unify-scene-types.md) — sonnet
- [x] [10-wire-player-stop](tasks/10-wire-player-stop.md) — haiku

## Ola C — en paralelo

- [x] [06-unify-inventory-rules](tasks/06-unify-inventory-rules.md) — sonnet
- [x] [07-declarative-audio-wiring](tasks/07-declarative-audio-wiring.md) — sonnet — _completada vía 07b_
- [x] [07b-enable-declarative-audio](tasks/07b-enable-declarative-audio.md) — sonnet — _opción A; pendiente de prueba de sonido del owner_
- [x] [09-generic-character-sprite](tasks/09-generic-character-sprite.md) — sonnet

> Smoke tras olas A–C verificado a mano por el owner (2026-10-10): caminar y hablar, colocar/recoger gameboy, devolución fuera de diana, verja con llave, transiciones, música y SFX.

## Ola D

- [x] [11-functional-game-viewport](tasks/11-functional-game-viewport.md) — sonnet — _hecha en 9 pasos ([11-steps](tasks/11-steps.md)); validada con `npm run smoke` (40/40 y 5/5)_

## Ola E

- [ ] [12-rewrite-consumption-docs](tasks/12-rewrite-consumption-docs.md) — haiku
- [ ] [13-validation-gate](tasks/13-validation-gate.md) — opus

## Gate final

- [ ] Gate técnico verde (`build:packages`, `test`, `typecheck`, `lint`, `build`)
- [ ] `coreAgnosticism.test.ts` verde
- [ ] Contrato v1: todos los nombres siguen exportándose desde `publicApi.ts`
- [x] `apps/web-demo/app/lib/engine/render/` y `app/lib/core/` no existen
- [x] Ejemplo mínimo de consumo (solo imports de paquetes) arranca en navegador — _`/example-minimal`, smoke 5/5_
- [ ] Smoke completo de la demo sin regresiones
- [ ] CHANGELOG y versión 0.5.0 en ambos paquetes
