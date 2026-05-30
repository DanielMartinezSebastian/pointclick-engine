# Phase 10 — Scene Entry Positions & Player Pathwalking

**Status**: In Progress | **Owner**: Daniel Martínez Sebastián | **Version target**: v0.2.0

**Started**: 2026-05-30

---

## 🎯 Why

Players currently spawn at the scene's default `playerSpawn` coordinate when transitioning between scenes. But this breaks immersion:

- Entering a house should spawn the player *at the door*, not in the middle of the living room
- Leaving a dungeon via the north exit should position the player at the north gate of the town
- Future web integrations need the ability to command the player to walk from point A to B

Phase 10 promotes **scene entry positions** and **player pathwalking** to first-class features — both in core and renderer.

---

## 📋 What We're Building

### 1. **Scene Entry Positions** (core + renderer)

```typescript
// Define where player spawns when entering a scene
sceneTransitionOnCollision({
  id: "exit-to-town",
  targetSceneId: "town",
  entryPosition: [5, 0, 10],  // ← Player appears here, not playerSpawn
})
```

### 2. **Player Pathwalking System** (core + renderer)

```typescript
// Command: walk player from current position to target
emit({ 
  type: "player:walkTo", 
  position: [15, 0, 20]  // Destination
})

// Events:
// - player:walkStarted
// - player:walkCompleted (on success)
// - player:walkAborted (collision, user input, unreachable)
```

### 3. **Automatic Integration** (renderer)

When a scene transition triggers with `entryPosition`, the renderer automatically:
1. Changes scene (player appears at entryPosition)
2. Emits `player:walkTo` toward a logical destination (ej: closer to scene center)
3. Animation plays smoothly

---

## 🏗️ Architecture

### Core (engine-core)

- **Types**: `BaseSceneTransition.entryPosition?`, `player:walkTo` command, walk events
- **Validation**: `validateEntryPosition()`, `validateWalkPath()` — ensure positions are accessible
- **State**: `PlayerWalkingState` in sceneStore
- **Logic**: Pure functions for path validation (uses existing A* pathfinding)

### Renderer (engine-renderer-r3f)

- **Hook**: `usePlayerWalkAnimation()` — smooth interpolation via `useFrame`
- **Integration**: SceneTransitions auto-triggers walk on entry
- **Cancellation**: Manual input cancels walk, emits `player:walkAborted`
- **Collision**: Detects and aborts if path blocked during animation

### Demo (apps/web-demo)

- **Scenes**: Add `entryPosition` to existing transitions
- **UI**: Visual feedback (optional path debug, destination marker)
- **Test**: Verify smooth transitions with entry animations

---

## 📊 Task Breakdown (10 subtasks)

| Task | Scope | Files | Est. LOC | Status |
|------|-------|-------|---------|--------|
| 10.1 | Core types: add `entryPosition` to transitions | types/index.ts | +30 | ⏳ |
| 10.2 | Core validation: `validateEntryPosition`, `validateWalkPath` | game/utils/validation.ts | +120 | ⏳ |
| 10.3 | Core state: `PlayerWalkingState` in sceneStore | state/sceneStore.ts | +80 | ⏳ |
| 10.4 | Core commands: `player:walkTo` in GameCommand union | commands/types.ts | +20 | ⏳ |
| 10.5 | Core events: walk events (started, completed, aborted) | events/types.ts | +30 | ⏳ |
| 10.6 | Core tests: validation + path-finding | __tests__/playerWalk.test.ts | +250 | ⏳ |
| 10.7 | R3F hook: `usePlayerWalkAnimation` | src/hooks/usePlayerWalkAnimation.ts | +180 | ⏳ |
| 10.8 | R3F integration: SceneTransitions auto-walk on entry | src/scene/SceneTransitions.tsx | +80 | ⏳ |
| 10.9 | R3F tests: animation + cancellation | __tests__/usePlayerWalkAnimation.test.tsx | +150 | ⏳ |
| 10.10 | Demo: scene definitions + UI feedback | app/demo-content/, app/components/ | +80 | ⏳ |

**Total**: ~1000 LOC | **Est. time**: 3-4 hours (including tests + verification)

---

## ✅ Success Criteria

- [ ] All 10 tasks completed (tracked in `tracking.md`)
- [ ] `entryPosition` optional in transitions (backward compatible)
- [ ] `validateEntryPosition()` rejects invalid positions (in walls, outside ground)
- [ ] `validateWalkPath()` rejects unreachable destinations
- [ ] `player:walkTo` command works end-to-end
- [ ] Animation is smooth (60fps, no stuttering)
- [ ] User input during walk cancels it gracefully
- [ ] Collisions abort walk with event
- [ ] Scene transitions auto-walk when `entryPosition` configured
- [ ] At least 2 demo scenes use `entryPosition` with visible walk animation
- [ ] 100% tests passing (all suites)
- [ ] No breaking changes to Phase 8-9 code

---

## 📚 Docs & Resources

- `EVALUATION.md` — Full architectural analysis
- `PLAN.md` — Detailed step-by-step task plan
- `tracking.md` — Progress tracking checklist
- ADR coming: `docs/decisions/ADR-010-player-pathwalking.md`

---

## 🔄 Phases Dependency Chain

```
Phase 8 (Scene Transitions)  ✅ DONE
        ↓
Phase 9 (Placed Items Core) ✅ DONE
        ↓
Phase 10 (Entry Positions + Pathwalking) ← YOU ARE HERE
        ↓
Phase 11+ (Web ↔ Engine Sync)
```

---

## 📝 Changelog

| Date | Action |
|------|--------|
| 2026-05-30 | Phase 10 planning + evaluation started |
