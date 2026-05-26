# Phase 2: Tracking

Marcar `[x]` cuando los Success Criteria del task estén validados.

## Progreso: 7/8 tareas ✅

## Week 1 — Audit + Setup ✅ COMPLETADA

- [x] [01-audit-core-agnosticism](tasks/01-audit-core-agnosticism.md) — verificar que core no importa React
  - ✅ 2 React violations documentadas en `audit-findings.md`
- [x] [02-setup-monorepo](tasks/02-setup-monorepo.md) — workspaces + estructura packages/apps
  - ✅ Monorepo operativo con npm workspaces
  - ✅ Dev server: localhost:3000 (359ms startup)
  - ✅ Build: Exitoso sin errores
  - ✅ Última sincronización: origin/main integrada con phase-2

## Week 2 — Engine-core base

- [x] [03-create-engine-core-base](tasks/03-create-engine-core-base.md) — package.json, tsconfig, types base, EventBus

## Week 3 — Extracción de módulos

- [x] [04-extract-pathfinding](tasks/04-extract-pathfinding.md) — findPath → engine-core
- [x] [05-extract-game-rules](tasks/05-extract-game-rules.md) — rules/* → engine-core
- [x] [06-extract-scene-store](tasks/06-extract-scene-store.md) — sceneStore → engine-core

## Week 4 — Integración + validación

- [x] [07-update-webdemo-imports](tasks/07-update-webdemo-imports.md) — apps/web-demo consume @pointclick/engine-core
- [ ] [08-validation-gate](tasks/08-validation-gate.md) — checks finales antes de cerrar fase

## Notas / Blockers

(Añadir aquí si una tarea se bloquea, con fecha y razón)
