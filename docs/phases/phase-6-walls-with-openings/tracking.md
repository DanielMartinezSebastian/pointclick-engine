# Phase 6: Tracking

Marcar `[x]` cuando los Success Criteria del task estén validados.

## Progreso: 8/8 tareas ✅

## Week 1 — Core + Pathfinding

- [x] [01-extend-core-types](tasks/01-extend-core-types.md) — Add GameSceneWallOpening interface
- [x] [02-update-pathfinding](tasks/02-update-pathfinding.md) — isPointInWallOpening + isSegmentClear update

## Week 2 — Renderer

- [x] [03-create-scene-wall-plane](tasks/03-create-scene-wall-plane.md) — SceneWallPlane.tsx camera-following component
- [x] [04-integrate-wall-plane](tasks/04-integrate-wall-plane.md) — Integrate into game loop

## Week 3 — Editor UI

- [x] [05-extend-wall-editor-panel](tasks/05-extend-wall-editor-panel.md) — Add openings CRUD + texture UI
- [x] [06-extend-scene-editor-store](tasks/06-extend-scene-editor-store.md) — Store methods for CRUD

## Week 4 — Integration + Validation

- [x] [07-integration-testing-and-docs](tasks/07-integration-testing-and-docs.md) — E2E tests + user guide
- [x] [08-validation-gate](tasks/08-validation-gate.md) — Final checks before close

## Validation Summary (2026-05-27)

- ✅ 65/65 tests pass (`npm test` in engine-core)
- ✅ engine-core builds without TS errors
- ✅ engine-renderer-r3f builds without TS errors
- ✅ apps/web-demo builds without TS errors
- ✅ Core does not import React/R3F
- ✅ `GameSceneWall.openings[]` is optional (backward compatible)

## Notas / Blockers

- Completed: 2026-05-27 in single session
- 2026-05-27 (follow-up): Fixed critical pathfinding bug — `opening.halfZ - obstaclePadding`
  was going negative for thin walls (halfZ≈0.30, padding=0.72). Fix: only X dimension
  gets padding subtracted (horizontal clearance); Z (wall depth) uses full halfZ.
- 2026-05-27 (follow-up): Updated app's `SceneWalls.tsx` to use `computeWallSegments`
  (was still using single-collider, no opening support).
- 2026-05-27 (follow-up): Added `SceneWallOpening` type to `scenes.ts`; added dungeon
  gate wall with door opening at Z=3 for debugging.
