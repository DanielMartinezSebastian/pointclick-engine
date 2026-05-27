# Phase 4: Bidirectional Web ↔ Game

**Objetivo**: Permitir comunicación bidireccional entre cualquier UI web y el motor de juego mediante un sistema de comandos (web → juego) y eventos (juego → web), expuestos en `createGameRuntime`.
**Duración estimada**: 3-4 semanas
**Estado**: `planning` (creado 2026-05-27)
**Owner**: Daniel Martínez Sebastián
**Progress**: 0/8 tareas

## Por qué

Tras Fase 3, `engine-core` define ports agnósticos y `engine-renderer-r3f` los implementa. La demo R3F funciona, pero la única forma de interactuar con el juego desde fuera es:

1. Renderizar `<GameViewport />` (React) y pasar `onRuntimeEvent` como callback opcional.
2. Llamar a `getGameActions()` (acopla al consumer al store interno).

Limitaciones actuales:

- No hay un canal estable de **comandos web → juego** (cambiar escena, recoger ítem, mover player) que no exponga el store.
- Los eventos del juego son un único callback opcional, no un bus al que múltiples suscriptores puedan engancharse.
- Imposible integrar el motor desde HTML/JS clásico, otro framework (Vue, Svelte) o un wrapper Electron sin acoplarlo a React.

Phase 4 cierra este gap: define un contrato `CommandHandler` + `EventBus` en core, lo expone en el handle de runtime y demuestra integración desde fuera de React.

## Resultado esperado

- ✅ `packages/engine-core/src/game/commands/` define el tipo `GameCommand` y `CommandHandler`
- ✅ `packages/engine-core/src/game/events/` define la taxonomía completa de eventos (`GameEvent`)
- ✅ `createGameRuntime()` devuelve un handle con `executeCommand`, `on`, `off`, `emit`
- ✅ Mutaciones de `sceneStore` emiten eventos a través del bus del runtime
- ✅ Ejemplo `apps/web-demo/app/example-bridge/` muestra comandos/eventos desde JS plano (sin componentes React adicionales)
- ✅ `docs/architecture/05-bidirectional-communication.md` documenta el contrato
- ✅ `grep` de `react|three` en `packages/engine-core/src/game/commands` y `events` devuelve nada
- ✅ Demo R3F sigue funcionando idéntica visualmente (backwards compatible)

## Tareas

Ver [`tracking.md`](tracking.md) para progreso.

| #  | Task | Estimación | Bloqueado por |
|----|------|-----------|--------------|
| 01 | [Design command/event architecture](tasks/01-design-command-event-architecture.md) | 2h | — |
| 02 | [Define event taxonomy in core](tasks/02-define-event-taxonomy.md) | 3h | 01 |
| 03 | [Implement CommandHandler in core](tasks/03-implement-command-handler.md) | 3h | 01 |
| 04 | [Wire events to state mutations](tasks/04-wire-events-to-state-mutations.md) | 3h | 02 |
| 05 | [Expose bidirectional API in runtime](tasks/05-expose-bidirectional-api.md) | 3h | 03, 04 |
| 06 | [HTML integration example](tasks/06-html-integration-example.md) | 3h | 05 |
| 07 | [Bidirectional docs](tasks/07-bidirectional-docs.md) | 2h | 05 |
| 08 | [Validation gate](tasks/08-validation-gate.md) | 1h | 06, 07 |

**Total**: ~20 horas de trabajo efectivo, distribuido en 3-4 semanas.

## Decisiones

- ADR-0006 (a crear en Task 01): Command/Event Architecture — sync vs async, naming, error handling, ownership del bus.

## Si una tarea se complica

Si una task estimada en 3h tarda >5h, crear sub-tasks (`NNa-`, `NNb-`) antes de seguir empujando.

## Riesgos

| Riesgo | Mitigación |
|--------|-----------|
| Breaking `publicApi.ts` (`onRuntimeEvent` callback usado por web-demo) | Mantener `onRuntimeEvent` como adapter sobre el bus en Task 05; no cambiar firma externa |
| Acoplar `executeCommand` al store interno | Task 03 define dispatcher agnóstico; mapeo a sceneStore vive en runtime, no en core |
| Performance al emitir eventos por cada mutación | EventBus síncrono ligero; benchmark en Task 08 si hay sospecha |
| Listeners con leak al desmontar React | `on()` devuelve unsubscribe; documentar uso desde `useEffect` |
| Comandos asincrónicos (load scene) sin promise | ADR-0006 decide si `executeCommand` retorna `void` o `Promise<void>` |

## Out of Scope (futuro)

- Publicación en npm — eso es Phase 5
- Limpiar `apps/web-demo` y separar demo content del runtime — eso es Phase 5
- Crear renderer alternativo (PixiJS, Canvas 2D) — futuro post-v1
- Networking / multiplayer — fuera del scope inicial
- Replay/recording de comandos — fuera del scope inicial

## Siguiente fase

Tras gate de validación: `phase-5-publish/` (limpieza demo + publicación npm).

## Referencias

- Roadmap general: [`../../ROADMAP_FRAMEWORK_AGNOSTIC_REFACTORING.md`](../../ROADMAP_FRAMEWORK_AGNOSTIC_REFACTORING.md) sección 4.3
- Contrato público actual: [`../../architecture/02-public-api.md`](../../architecture/02-public-api.md)
- Fase anterior: [`../phase-3-renderer-abstract/validation-report.md`](../phase-3-renderer-abstract/validation-report.md)
