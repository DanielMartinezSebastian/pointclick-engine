# Phase 2: Core Extraction

**Objetivo**: Extraer lógica agnóstica a `packages/engine-core/` independiente, sin React/R3F/Next.js.
**Duración estimada**: 4 semanas
**Estado**: ✅ **COMPLETADA**
**Owner**: Daniel Martínez Sebastián
**Progress**: ✅ 8/8 tasks completadas

## Por qué

La librería `engine-core` debe ser publicable en npm sin arrastrar Next.js/React/R3F. Hoy todo está mezclado en `app/`. Esta fase saca lo agnóstico a `packages/engine-core/` y deja la demo R3F en `apps/web-demo/`.

## Resultado esperado

- ✅ `packages/engine-core/` existe, compila, tests pasan sin mocks de React
- ✅ `apps/web-demo/` consume `@pointclick-engine/engine-core` en lugar de paths relativos
- ✅ `grep -r "import.*react" packages/engine-core/src/` devuelve nada
- ✅ Demo R3F sigue funcionando idéntica visualmente
- ✅ Monorepo con npm workspaces operativo

## Tareas

Ver [`tracking.md`](tracking.md) para progreso.

| # | Task | Estimación | Bloqueado por |
|---|------|-----------|--------------|
| 01 | [Audit core agnosticism](tasks/01-audit-core-agnosticism.md) | 1h | — |
| 02 | [Setup monorepo structure](tasks/02-setup-monorepo.md) | 2h | 01 |
| 03 | [Create engine-core base](tasks/03-create-engine-core-base.md) | 3h | 02 |
| 04 | [Extract pathfinding](tasks/04-extract-pathfinding.md) | 2h | 03 |
| 05 | [Extract game rules](tasks/05-extract-game-rules.md) | 3h | 03 |
| 06 | [Extract sceneStore](tasks/06-extract-scene-store.md) | 2h | 03 |
| 07 | [Update web-demo imports](tasks/07-update-webdemo-imports.md) | 2h | 04, 05, 06 |
| 08 | [Validation gate](tasks/08-validation-gate.md) | 1h | 07 |

**Total**: ~16 horas de trabajo efectivo, distribuido en 4 semanas.

## Decisiones

- ADR-0003: [Monorepo con demo dentro](../../decisions/0003-monorepo-with-demo.md)

## Si una tarea se complica

Si una task estimada en 2h tarda >4h, crear sub-tasks (`04a-`, `04b-`) en lugar de seguir empujando.

## Riesgos

| Riesgo | Mitigación |
|--------|-----------|
| Contaminación React oculta en core | Task 01 audita antes de mover |
| Imports rotos en web-demo | Task 07 dedicada, validar `npm run dev` |
| Breaking en publicApi | Mantener `publicApi.ts` como facade, no cambiar firmas |

## Siguiente fase

Tras gate de validación: [`phase-3-renderer-abstract/`](../phase-3-renderer-abstract/) (aún sin crear).
