# Phase 8 — Scene Transitions: Plan Summary

**Completion Date**: 2026-05-28 | **Status**: Planned (Ready to Execute)

---

## 🎯 What We're Building

A **unified scene transition system** that promotes transitions from demo-only logic to first-class engine primitives. Players can navigate between scenes via:

1. **Collision-based exits**: Walk into an invisible zone → scene changes
2. **Item-drop transitions**: Place a key/object on a zone → scene unlocks
3. **Item-consume transitions**: Use an item → scene changes (future variant)

All transitions support **pre/post dialogs**, **item consumption**, **state management**, and **event emission** — automatically wired by the engine.

---

## 📊 Why This Matters

### Current Problem
- Scene transitions are **scattered across components** (GameTouchCanvas, custom hooks)
- Every new game has to **reimplement the transition pipeline**
- **Item-based transitions** require manual rule chains
- **Dialog timing** and **state coordination** are error-prone

### Solution
- Transitions become **declarative scene data** (like walls, interactions)
- Engine handles **all state, events, rendering, dialog flow**
- Next game can copy/paste a scene definition and **just works**
- Follows the **Phase 7 pattern** (doors as first-class primitives)

---

## 🏗️ Architecture at a Glance

### Three Transition Kinds (Polymorphic Type)

```typescript
sceneTransitionOnCollision({
  id: "exit-to-town",
  targetSceneId: "town",
  position: [0, 1.05, -14],
  halfSize: [2, 2.5, 0.5],
  preTransitionDialogKey: "confirm-exit",  // Optional dialog
})

sceneTransitionOnItemDrop({
  id: "unlock-room",
  targetSceneId: "secret-room",
  position: [5, 0, 5],
  halfSize: [1, 1, 1],
  requiresItemId: "key",
  consumeItem: true,
  hintDialogKeys: { empty: "locked", occupied: "ready" }  // Hints when placing item
})

sceneTransitionOnItemConsume({
  id: "teleport",
  targetSceneId: "other-realm",
  requiresItemId: "scroll",
  preConsumptionDialogKey: "teleport-confirm"
})
```

### Layers

| Layer | What It Does |
|-------|---|
| **Core (engine-core)** | Types, state store, rules processor, events, commands |
| **Renderer (R3F)** | Renders collision zones + drop zones, dispatches commands |
| **Demo (web-demo)** | Dialog UI, scene fade effects, scene definitions |

### Key Flows

**Collision → Scene Change:**
```
Player walks into exit zone
  → SceneTransitions renderer detects collision
    → Dispatches transition:activate command
      → Show pre-transition dialog (if configured)
        → On proceed: setScene(targetSceneId)
          → Show post-transition dialog in new scene (if configured)
```

**Item Drop → Transition:**
```
User drops key on drop zone
  → SceneInteractions emits item:dropped event
    → transitionRules processor matches to transition
      → Updates state: itemIdOccupying = "key"
        → Emits transition:triggered
          → (continues like collision flow above)
```

---

## 📋 Effort Breakdown

| Sub-Phase | Tasks | Days | LOC Δ | Risk |
|---|---|---|---|---|
| **Core Types** | 1 | 1 | +250 | 🟢 Low |
| **State + Events** | 1 | 1 | +200 | 🟢 Low |
| **Rules Processor** | 1 | 2 | +150 | 🟡 Medium |
| **Commands** | 1 | 1.5 | +200 | 🟡 Medium |
| **Renderer** | 1 | 2 | +350 | 🟡 Medium |
| **Dialog UI** | 1 | 1.5 | +150 | 🟡 Medium |
| **Demo Migration** | 1 | 1.5 | +100 / -50 | 🟢 Low |
| **Validation** | 1 | 0.5 | +0 | 🟢 Low |
| **Tests** | all | — | +200 | 🟢 Low |
| **Total** | **8** | **~11 days** | **~1400 net** | 🟡 Medium |

---

## 🎯 Success Criteria (Phase-Wide)

- [ ] All three transition kinds (collision, item-drop, item-consume) work
- [ ] Transitions fire correct events (`transition:triggered`, `transition:started`, `transition:completed`)
- [ ] Item-drop transitions consume items when configured
- [ ] Pre/post-transition dialogs display and handle user choices
- [ ] Renderer shows visual feedback (zones, item occupancy)
- [ ] Demo scenes migrated to use `sceneTransitions[]`
- [ ] 100% test pass rate
- [ ] Core doesn't import React/R3F
- [ ] Backward compatible: scenes without transitions still work

---

## 📁 File Structure

```
docs/
├── architecture/08-scene-transitions.md          (NEW)
├── phases/phase-8-scene-transitions/
│   ├── README.md                                 (Design + rationale)
│   ├── PLAN_SUMMARY.md                           (This file)
│   ├── tracking.md                               (8/8 tasks)
│   └── tasks/
│       ├── _template.md
│       ├── 01-extend-core-types.md               (Core types)
│       ├── 02-transition-state-and-events.md     (Store + events)
│       ├── 03-transition-rules-processor.md      (Item-drop matching)
│       ├── 04-implement-transition-commands.md   (Dialog + scene change)
│       ├── 05-create-scene-transitions-renderer.md (Zones + collision)
│       ├── 06-integrate-transition-dialogs.md    (UI dialogs)
│       ├── 07-migrate-demo-scenes.md             (Use new types)
│       └── 08-validation-gate.md                 (Final checks)

packages/engine-core/src/
├── game/types/
│   └── index.ts (GameSceneTransition union + helpers)
├── game/state/
│   └── sceneStore.ts (transitionStates + methods)
├── game/events/
│   └── types.ts (transition:* events)
├── game/commands/
│   └── types.ts (transition:* commands)
└── game/logic/
    └── rules/transitionRules.ts (item-drop → transition)

packages/engine-renderer-r3f/src/scene/
├── SceneTransitions.tsx          (Render zones + dispatch commands)
└── SceneTransitions.utils.ts     (Helpers)

apps/web-demo/
├── app/demo-content/scenes/scenes.ts     (Add transitions[] to Scene)
├── app/components/TransitionDialog.tsx   (Pre/post dialogs)
└── app/lib/engine/runtime/
    └── useTransitionSystem.ts            (Coordinate flow)
```

---

## ❓ Open Design Decisions

These are captured in the phase README for discussion during execution:

1. **Fade transitions**: Auto-fade on scene change vs. leave to renderer?
2. **Collision overlap**: What if transition zone overlaps a wall?
3. **Dialog conflicts**: If both drop-target and transition occupy same space, precedence?
4. **Item persistence**: When leaving scene with item in transition zone, transfer state or reset?
5. **Multi-target**: Can one transition go to different scenes based on conditions?
6. **Animation**: Should transition include walk-to-exit animation?

---

## 🔗 Dependencies & Sequence

```
Task 01 (Core types)
  ↓
Task 02 (State + events) ← Task 01
  ↓
Task 03 (Rules) ← Task 01, Task 02
  ↓
Task 04 (Commands) ← Task 02, Task 03
  ↓
Task 05 (Renderer) ← Task 01, Task 04
  ↓
Task 06 (Dialogs) ← Task 04, Task 05
  ↓
Task 07 (Demo) ← Task 05, Task 06
  ↓
Task 08 (Validation) ← Task 07
```

All tasks can be parallelized by layer **after Task 02** (state is shared dependency).

---

## 🚀 Recommended Execution

### Week 1: Foundation (Tasks 01–02)
- Define types + helpers
- Add state + events to store
- Write unit tests

### Week 2: Logic + Renderer (Tasks 03–05)
- Rules processor (item-drop matching)
- Command handlers (dialog + scene change)
- Renderer component (zones + collision)

### Week 3: Integration (Tasks 06–08)
- Dialog UI integration
- Demo migration
- Validation + ship

---

## 📚 Related Documentation

- **Phase 7 (Doors)**: `docs/phases/phase-7-walls-first-class/README.md` — Similar promotion of primitives
- **Architecture**: `docs/architecture/08-scene-transitions.md` — Technical deep-dive
- **Workflow**: `docs/workflow/commit-convention.md` — How to commit
- **Current State**: This plan replaces ad-hoc transition logic with engine-level support

---

## ✅ Next Steps

1. **User Review**: Approve this plan (or iterate on open questions)
2. **Task Execution**: Start with Task 01 (`01-extend-core-types.md`)
3. **Daily Commits**: One atomic commit per task
4. **Tests First**: Write tests alongside implementation
5. **Integration**: Each task should not break the demo

---

**Plan Status**: ✅ **READY TO EXECUTE**

All tasks are self-contained (~50 lines each) and can be delegated to subagents or executed sequentially. The architecture respects CLAUDE.md rules (core is agnóstic, renderer is R3F-specific, demo uses both).
