# Phase 4: Tracking

Marcar `[x]` cuando los Success Criteria del task estén validados.

## Progreso: 0/8 tareas

## Week 1 — Diseño + taxonomía

- [ ] [01-design-command-event-architecture](tasks/01-design-command-event-architecture.md) — ADR-0006, shape de Command y Event
- [ ] [02-define-event-taxonomy](tasks/02-define-event-taxonomy.md) — `GameEvent` union completo en engine-core

## Week 2 — Implementación en core

- [ ] [03-implement-command-handler](tasks/03-implement-command-handler.md) — `CommandHandler` + `GameCommand` union en engine-core
- [ ] [04-wire-events-to-state-mutations](tasks/04-wire-events-to-state-mutations.md) — mutaciones de sceneStore emiten eventos

## Week 3 — Exposición pública

- [ ] [05-expose-bidirectional-api](tasks/05-expose-bidirectional-api.md) — `createGameRuntime` devuelve `executeCommand` / `on` / `emit`

## Week 4 — Ejemplo + docs + validación

- [ ] [06-html-integration-example](tasks/06-html-integration-example.md) — ejemplo bridge JS plano en web-demo
- [ ] [07-bidirectional-docs](tasks/07-bidirectional-docs.md) — `docs/architecture/05-bidirectional-communication.md`
- [ ] [08-validation-gate](tasks/08-validation-gate.md) — checks finales antes de cerrar fase

## Notas / Blockers

(Añadir aquí si una tarea se bloquea, con fecha y razón)
