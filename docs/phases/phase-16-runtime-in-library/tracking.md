# Phase 16 — Tracking

> Marca `[x]` solo con Success Criteria validados. El orquestador integra y valida entre olas.

## Previo

- [ ] Fase 15 cerrada (gate verde)
- [ ] [01-adr-and-issue](tasks/01-adr-and-issue.md) — opus

## Ola A — en paralelo

- [ ] [02-core-runtime-factory](tasks/02-core-runtime-factory.md) — sonnet
- [ ] [05-delete-render-duplicates](tasks/05-delete-render-duplicates.md) — haiku
- [ ] [08-storage-port-persistence](tasks/08-storage-port-persistence.md) — haiku

## Ola B — en paralelo

- [ ] [03-renderer-state-hooks-and-barrel](tasks/03-renderer-state-hooks-and-barrel.md) — sonnet
- [ ] [04-unify-scene-types](tasks/04-unify-scene-types.md) — sonnet
- [ ] [10-wire-player-stop](tasks/10-wire-player-stop.md) — haiku

## Ola C — en paralelo

- [ ] [06-unify-inventory-rules](tasks/06-unify-inventory-rules.md) — sonnet
- [ ] [07-declarative-audio-wiring](tasks/07-declarative-audio-wiring.md) — sonnet
- [ ] [09-generic-character-sprite](tasks/09-generic-character-sprite.md) — sonnet

## Ola D

- [ ] [11-functional-game-viewport](tasks/11-functional-game-viewport.md) — sonnet

## Ola E

- [ ] [12-rewrite-consumption-docs](tasks/12-rewrite-consumption-docs.md) — haiku
- [ ] [13-validation-gate](tasks/13-validation-gate.md) — opus

## Gate final

- [ ] Gate técnico verde (`build:packages`, `test`, `typecheck`, `lint`, `build`)
- [ ] `coreAgnosticism.test.ts` verde
- [ ] Contrato v1: todos los nombres siguen exportándose desde `publicApi.ts`
- [ ] `apps/web-demo/app/lib/engine/render/` y `app/lib/core/` no existen
- [ ] Ejemplo mínimo de consumo (solo imports de paquetes) arranca en navegador
- [ ] Smoke completo de la demo sin regresiones
- [ ] CHANGELOG y versión 0.5.0 en ambos paquetes
