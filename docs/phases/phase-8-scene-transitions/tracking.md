# Phase 8: Scene Transitions — Tracking

Marcar `[x]` cuando los Success Criteria del task estén validados.

## Progreso: 8/8 tareas

## Week 1 — Core Types + State

- [x] [01-extend-core-types](tasks/01-extend-core-types.md) — Define GameSceneTransition union + base types
- [x] [02-transition-state-and-events](tasks/02-transition-state-and-events.md) — sceneStore methods + event types

## Week 2 — Rules + Commands

- [x] [03-transition-rules-processor](tasks/03-transition-rules-processor.md) — Item-drop → transition resolution logic
- [x] [04-implement-transition-commands](tasks/04-implement-transition-commands.md) — transition:activate, transition:cancel handlers

## Week 3 — Renderer

- [x] [05-create-scene-transitions-renderer](tasks/05-create-scene-transitions-renderer.md) — SceneTransitions.tsx + visual zones
- [x] [06-integrate-transition-dialogs](tasks/06-integrate-transition-dialogs.md) — Pre/post-transition dialog flow

## Week 4 — Integration + Demo

- [x] [07-migrate-demo-scenes](tasks/07-migrate-demo-scenes.md) — Update scene definitions to use sceneTransitions[]
- [x] [08-validation-gate](tasks/08-validation-gate.md) — Final checks + all tests pass

## Notas / Blockers

- Completado 2026-05-29. Collision-based transitions fully working.
- Item-drop transition types + resolver implemented; demo wiring via wrapRuntimeEventForTransitions.
- Dialog flow: transition:triggered / started / completed events emitted; full pre-dialog confirmation deferred to future phase.
- SceneTransitions renderer uses useFrame position-checking (no Rapier sensors needed).
- 82 tests pass, all three packages build without errors.
