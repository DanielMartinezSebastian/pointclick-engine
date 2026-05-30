# Phase 10 — Progress Tracking

**Phase**: 10 — Scene Entry Positions & Player Pathwalking  
**Started**: 2026-05-30  
**Status**: In Progress

---

## Tasks

- [ ] **10.1** — Core Types: Add `entryPosition` to Scene Transitions
  - File: `packages/engine-core/src/game/types/index.ts`
  - Commit: pending

- [ ] **10.2** — Core Validation: Position & Path Accessibility
  - File: `packages/engine-core/src/game/utils/validation.ts` (new)
  - Commit: pending

- [ ] **10.3** — Core State: PlayerWalkingState in sceneStore
  - File: `packages/engine-core/src/game/state/sceneStore.ts`
  - Commit: pending

- [ ] **10.4** — Core Commands: Add `player:walkTo` to GameCommand
  - File: `packages/engine-core/src/game/commands/types.ts`
  - Commit: pending

- [ ] **10.5** — Core Events: Walk Lifecycle Events
  - File: `packages/engine-core/src/game/events/types.ts`
  - Commit: pending

- [ ] **10.6** — Core Tests: Validation & Path-Finding
  - File: `packages/engine-core/src/__tests__/playerWalk.test.ts` (new)
  - Commit: pending

- [ ] **10.7** — R3F Hook: usePlayerWalkAnimation
  - File: `packages/engine-renderer-r3f/src/hooks/usePlayerWalkAnimation.ts` (new)
  - Commit: pending

- [ ] **10.8** — R3F Integration: SceneTransitions Auto-Walk
  - File: `packages/engine-renderer-r3f/src/scene/SceneTransitions.tsx`
  - Commit: pending

- [ ] **10.9** — R3F Tests: Animation & Cancellation
  - File: `packages/engine-renderer-r3f/src/__tests__/usePlayerWalkAnimation.test.tsx` (new)
  - Commit: pending

- [ ] **10.10** — Demo: Scene Definitions & UI Feedback
  - Files: `apps/web-demo/app/demo-content/scenes/scenes.ts` + components
  - Commit: pending

---

## Post-Phase Checklist

- [ ] All tests passing (`npm run test`)
- [ ] Type-check passing (`npm run type-check`)
- [ ] Build passing (`npm run build`)
- [ ] Demo visual test: entry positions working
- [ ] Demo visual test: walk animations smooth
- [ ] Demo visual test: manual input cancels walk
- [ ] Backward compatibility verified
- [ ] Phase 8-9 tests still passing
- [ ] Summary commit created

---

## Notes

- Execute tasks **in sequence** (1 → 2 → ... → 10)
- Each task: write code → test → commit
- If a task fails: debug, fix, re-run tests, then proceed
- Post-phase: full suite run + demo verification

---

## Timeline

| Date | Task | Status |
|------|------|--------|
| 2026-05-30 | Plan created, tracking started | ✅ |
| TBD | 10.1-10.6 (core) | ⏳ |
| TBD | 10.7-10.9 (r3f) | ⏳ |
| TBD | 10.10 (demo) | ⏳ |
| TBD | Tests + verification | ⏳ |
| TBD | Phase complete | ⏳ |
