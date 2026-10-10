# Phase 16 — Runtime in Library

**Objetivo**: que el juego se pueda montar importando solo los paquetes; la demo pasa de orquestadora a consumidora.
**Duración estimada**: 1.5–2 semanas
**Estado**: planning (bloqueada por Fase 15 y por el issue de ADR-0009)
**Owner**: Daniel Martínez Sebastián
**Version target**: v0.5.0 (lockstep, solo adiciones)

---

## Por qué

Ver [ADR-0009](../../decisions/0009-runtime-lives-in-packages.md). En corto: el runtime está en `apps/web-demo/app/lib/engine/publicApi.ts`, la guía de consumo documenta exports que los paquetes no tienen, `scene:set` pierde `transitions` y `music`, y la demo mantiene copias de código del renderer y del core.

## Resultado esperado

1. Un consumidor externo puede escribir esto y obtener un juego jugable:
   ```tsx
   import { createGameRuntime } from "@pointclick-engine/engine-core";
   import { GameViewport } from "@pointclick-engine/engine-renderer-r3f";
   ```
2. `apps/web-demo/app/lib/engine/publicApi.ts` es un barrel de re-export; el contrato v1 no cambia.
3. `grep -rln "demo-content" apps/web-demo/app` solo devuelve `page.tsx` y rutas de ejemplo (el punto de composición).
4. `apps/web-demo/app/lib/engine/render/` y `app/lib/core/` no existen.
5. Un test headless en core registra dos escenas con transición y música, ejecuta `scene:set` y `transition:activate`, y verifica que no se pierde ningún campo.

## Tareas, orden y reparto

| # | Tarea | Modelo | Depende de |
|---|---|---|---|
| 01 | [ADR-0009 + issue](tasks/01-adr-and-issue.md) | opus | — |
| 02 | [Core: `createGameRuntime` agnóstico](tasks/02-core-runtime-factory.md) | sonnet | 01 |
| 03 | [Renderer: hooks de estado y barrel en la demo](tasks/03-renderer-state-hooks-and-barrel.md) | sonnet | 02 |
| 04 | [Unificar tipos de escena](tasks/04-unify-scene-types.md) | sonnet | 02 |
| 05 | [Borrar copias de render en la demo](tasks/05-delete-render-duplicates.md) | haiku | — |
| 06 | [Unificar `inventoryRules`](tasks/06-unify-inventory-rules.md) | sonnet | 04 |
| 07 | [Audio declarativo](tasks/07-declarative-audio-wiring.md) | sonnet | 15.02, 03 |
| 08 | [Persistencia vía `StoragePort`](tasks/08-storage-port-persistence.md) | haiku | — |
| 09 | [`CharacterSprite` configurable](tasks/09-generic-character-sprite.md) | sonnet | 05 |
| 10 | [Comando `player:stop`](tasks/10-wire-player-stop.md) | haiku | 02 |
| 11 | [`GameViewport` funcional](tasks/11-functional-game-viewport.md) | sonnet | 03, 06, 07, 09 |
| 12 | [Reescribir docs de consumo](tasks/12-rewrite-consumption-docs.md) | haiku | 11 |
| 13 | [Gate de validación y release 0.5.0](tasks/13-validation-gate.md) | opus | todas |

Olas: **A** = 02, 05, 08 en paralelo · **B** = 03, 04, 10 · **C** = 06, 07, 09 · **D** = 11 · **E** = 12, 13. El orquestador integra y valida entre olas.

## Principios

- Regla de Oro intacta: el test `coreAgnosticism.test.ts` (15.05) debe seguir verde.
- Ningún nombre del contrato v1 se renombra ni se elimina.
- Mover antes de mejorar: cada tarea traslada comportamiento existente; los cambios funcionales se listan explícitamente en la tarea.
- Cada tarea lista sus archivos permitidos; las de una misma ola son disjuntas.

## Fuera de alcance

- Puertas como primitiva del motor → Fase 7.
- Flags, condiciones, hotspots con verbos, NPCs, diálogos con opciones, guardado → fase narrativa (por planificar, tras esta).
- Trocear `GameTouchSpriteRuntime.tsx` (886 líneas) → se evalúa al cerrar la tarea 11.
- Multijugador → Fase 14, después de la fase narrativa.
