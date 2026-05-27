# Phase 3: Renderer Abstraction

**Objetivo**: Abstraer la implementación R3F detrás de interfaces agnósticas en `engine-core`, y mover el renderer R3F a su propio package `engine-renderer-r3f`.
**Duración estimada**: 4-5 semanas
**Estado**: `completed` (2026-05-27)
**Owner**: Daniel Martínez Sebastián
**Progress**: 8/8 tasks completadas ✅

## Por qué

Tras Fase 2, `engine-core` es agnóstico, pero el renderer R3F sigue acoplado a `apps/web-demo/`. Para soportar otros renderers en el futuro (PixiJS, Canvas 2D, native), necesitamos:

1. Definir **interfaces (ports)** en `engine-core` que describan lo que un renderer debe proveer (game loop, input, physics, viewport).
2. Mover la implementación R3F actual a `packages/engine-renderer-r3f/`.
3. Mantener `apps/web-demo/` como ejemplo de cómo componer engine-core + engine-renderer-r3f.

**Beneficio estratégico**: en Fase 4+ podríamos crear `engine-renderer-pixi` o `engine-renderer-canvas2d` sin tocar lógica de juego.

## Resultado esperado

- ✅ `packages/engine-core/` define `RendererPort`, `GameLoopPort`, `InputPort`, `PhysicsPort` (interfaces puras)
- ✅ `packages/engine-renderer-r3f/` existe, compila, implementa los ports usando R3F + Rapier
- ✅ `apps/web-demo/` consume `@pointclick-engine/engine-core` + `@pointclick-engine/engine-renderer-r3f`
- ✅ `grep -r "@react-three\|three" packages/engine-core/src/` devuelve nada
- ✅ Demo R3F sigue funcionando idéntica visualmente
- ✅ Tests de engine-core no requieren mocks de R3F

## Tareas

Ver [`tracking.md`](tracking.md) para progreso.

| # | Task | Estimación | Bloqueado por |
|---|------|-----------|--------------|
| 01 | [Design renderer ports](tasks/01-design-renderer-ports.md) | 2h | — |
| 02 | [Create renderer-r3f package](tasks/02-create-renderer-r3f-package.md) | 2h | 01 |
| 03 | [Extract runtime events to core](tasks/03-extract-runtime-events-to-core.md) | 2h | 01 |
| 04 | [Define game loop port](tasks/04-define-game-loop-port.md) | 3h | 02, 03 |
| 05 | [Define input port](tasks/05-define-input-port.md) | 3h | 02, 03 |
| 06 | [Move R3F render components](tasks/06-move-r3f-render-components.md) | 4h | 02, 04, 05 |
| 07 | [Update web-demo imports](tasks/07-update-webdemo-imports.md) | 2h | 06 |
| 08 | [Validation gate](tasks/08-validation-gate.md) | 1h | 07 |

**Total**: ~19 horas de trabajo efectivo, distribuido en 4-5 semanas.

## Decisiones

- (a definir en ADR-0005): Renderer Ports Design — qué interfaces, qué granularidad.

## Si una tarea se complica

Si una task estimada en 3h tarda >5h, crear sub-tasks (`04a-`, `04b-`) en lugar de seguir empujando.

## Riesgos

| Riesgo | Mitigación |
|--------|-----------|
| Interfaces mal diseñadas que limiten otros renderers | Task 01 dedicada a design antes de implementar |
| Performance regression al añadir abstracción | Benchmark FPS antes/después en Task 08 |
| Breaking publicApi.ts (consumer-facing) | Mantener facade en web-demo, no cambiar firmas externas |
| Físicas Rapier difíciles de abstraer | Aceptar physics como concern del renderer (no abstraer en Fase 3) |

## Out of Scope (futuro)

- Crear renderer alternativo (PixiJS, Canvas 2D) — eso es Fase 4+
- Bidireccionalidad web ↔ juego — eso es Fase 4
- Publicación en npm — eso es v1.0.0 final

## Siguiente fase

Tras gate de validación: `phase-4-bidirectional-web-game/` (aún sin crear).
