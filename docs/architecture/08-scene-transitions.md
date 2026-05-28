# Scene Transitions — Engine Primitives

**Status**: Planned (Phase 8) | **Scope**: engine-core + engine-renderer-r3f | **Version**: v0.3.0+

---

## Overview

Scene transitions move from **demo-specific logic** to **engine first-class primitives**. Like Phase 7 (walls + doors), this phase extracts:

- **What triggers a transition**: Collision, item drop, item consumption
- **How it behaves**: Dialog flow, state updates, event emissions
- **What it renders**: Zones, visual feedback, item occupancy

into declarative, reusable components that any game can use without reimplementation.

---

## Motivation

### Current State (Pre-Phase 8)

```typescript
// apps/web-demo/app/components/GameTouchCanvas.tsx
if (playerCollider.touches(exitZone)) {
  showDialogIfNeeded();
  setScene("town");  // Hard-coded destination
}
```

- Exit zones are implicit (no named data structure)
- Transition logic is scattered across components
- Item-based transitions require custom rules per game
- Dialog timing + state management are entangled

### Post-Phase 8

```typescript
// Scene definition (declarative)
transitions: [
  sceneTransitionOnCollision({
    id: "exit-to-town",
    targetSceneId: "town",
    position: [0, 1.05, -14],
    halfSize: [2, 2.5, 0.5],
    preTransitionDialogKey: "scene.exit.confirm",
  }),
  sceneTransitionOnItemDrop({
    id: "unlock-secret-room",
    targetSceneId: "secret-room",
    requiresItemId: "key",
    position: [5, 0, 5],
    halfSize: [1, 1, 1],
    consumeItem: true,
  }),
];
```

- Transitions are **first-class scene primitives**
- State, events, and rendering are **automatic**
- Reusable across games **without modification**
- Dialog flow, item consumption, and scene switching are **coordinated by the engine**

---

## Architecture

### Layer Distribution

```
┌──────────────────────────────────────────┐
│ Demo (apps/web-demo)                     │  Uses transitions[]
│ • TransitionDialog component              │  • Routes dialogs to UI
│ • useTransitionSystem hook               │  • Coordinates scene fade
├──────────────────────────────────────────┤
│ Renderer (engine-renderer-r3f)           │  Renders zones + dispatches commands
│ • SceneTransitions.tsx                   │  • Invisible colliders (collision)
│ • Drop zone visuals                      │  • Visual zones (item-drop)
│ • Dispatch transition:activate commands  │
├──────────────────────────────────────────┤
│ Core (engine-core)                       │  State + rules + events
│ • GameSceneTransition types              │  • 3 discriminated union kinds
│ • transitionRules processor              │  • Item-drop → transition logic
│ • transitionStates store + commands      │  • Emit transition:* events
│ • sceneTransitionOnX helpers             │
└──────────────────────────────────────────┘
```

### Data Flow: Collision-Based Transition

```
User walks into exit zone
  ↓
SceneTransitions (renderer) detects collision
  ↓
Dispatches `transition:activate` command
  ↓
CommandHandler checks `preTransitionDialogKey`
  ↓
If dialog configured:
  • Show TransitionDialog with proceed/cancel
  • Wait for user choice
If no dialog:
  • Skip to next step
  ↓
On proceed:
  • sceneStore.setScene(targetSceneId)
  • Emit `transition:started`
  ↓
New scene loads
  ↓
If postTransitionDialogKey:
  • Show post-transition dialog (informational, no choice)
  ↓
Emit `transition:completed`
```

### Data Flow: Item-Drop Transition

```
User drags item onto drop zone
  ↓
SceneInteractions (renderer) handles drop
  ↓
Emits `item:dropped` event
  ↓
processTransitionRules (in rules processor) intercepts
  ↓
If interactionId matches a transition of kind "item-drop":
  ↓
Update transitionStates[id].itemIdOccupying = itemId
  ↓
If consumeItem: true:
  • Remove item from inventory
  ↓
Emit `transition:triggered` event
  ↓
(Flow continues like collision-based, starting with dialog check)
```

---

## Interaction with Existing Systems

### Item Rules + Transitions

When an item rule fires with outcome="place" or "consume" on a drop-target whose ID matches a transition of kind "item-drop":

- `transitionRules` processor intercepts the `item:dropped` event
- Matches by `interactionId`
- Updates state + emits `transition:triggered`
- Commander proceeds with dialog flow

**Key**: Transitions with kind="item-drop" can **coexist as drop-targets in the scene's `interactions[]`** array. The engine treats them as both interactive zones AND transition triggers.

### Dialog System Integration

Pre-transition dialogs are shown as confirmation dialogs (proceed/cancel).
Post-transition dialogs are shown as informational (auto-close or single button).

Dialog keys reference the scene's existing dialog system (same as item drop/pickup dialogs).

### Pathfinding

No direct impact. Transitions are **not obstacles** (player can walk through them). Item occupancy in drop-zones does not block pathfinding.

---

## Event Model

```typescript
// Emitted when transition conditions are met (item placed, collision detected)
{ type: "transition:triggered"; transitionId: string; targetSceneId: string }

// Emitted when user confirms dialog (or if no dialog, immediately)
{ type: "transition:started"; transitionId: string }

// Emitted after target scene fully loads
{ type: "transition:completed"; fromSceneId: string; toSceneId: string }

// Emitted if user cancels pre-transition dialog
{ type: "transition:cancelled"; transitionId: string }
```

---

## State Model

```typescript
transitionStates: Record<transitionId, {
  lastVisitedSceneId?: string;    // Breadcrumb
  itemIdOccupying?: string;        // For item-drop transitions
  isAvailable: boolean;            // Can be triggered (default true)
}>;
```

---

## Testing Strategy

### Core Tests

- **Types**: Union discrimination, helper functions
- **State**: CRUD on `transitionStates`
- **Rules**: Item-drop → transition resolution
- **Commands**: Dialog flow, state updates

### Renderer Tests

- **Collision detection**: Zones render + detect player
- **Visual feedback**: Drop zones show item occupancy
- **Command dispatch**: Correct event on collision/click

### Integration Tests

- **End-to-end**: Player collides → dialog → scene change
- **Item-drop flow**: Place item → transition fires → item consumed
- **Dialog cancellation**: Cancel dialog → state reverts

### Manual Testing (Demo)

- Scene transitions in demo work (town ↔ dungeon)
- Pre/post dialogs display correctly
- No performance regressions

---

## Migration Path

### Phase 8 Execution Order

1. **Task 01**: Core types (foundation)
2. **Task 02**: State + events (store extensions)
3. **Task 03**: Rules processor (connects item drops to transitions)
4. **Task 04**: Commands (dialog + scene change logic)
5. **Task 05**: Renderer (visual zones + collision)
6. **Task 06**: Dialog UI (pre/post transition dialogs)
7. **Task 07**: Demo migration (use new types)
8. **Task 08**: Validation (all tests pass)

### Demo Migration Details

**Before** (current):
- Manual exit zone checks in GameTouchCanvas
- Hardcoded scene IDs
- Ad-hoc dialogs

**After** (Phase 8):
- Declarative `transitions[]` in scene definitions
- Engine-handled state + events
- Dialog keys from existing system
- Single `SceneTransitions` renderer component

---

## Future Directions (Out of Scope)

- **Phase 9**: Animated transitions (walk-to-exit, fade blend)
- **Phase 10**: Multi-target transitions (conditional routing)
- **Phase 11**: Persistent state across scenes (item left in scene A visible in scene B)
- **Phase 12**: Breadcrumb UI (scene navigation history)

---

## Backward Compatibility

- Scenes **without** `transitions[]` still work (undefined checks)
- Existing `interactions[]` (drop-targets) unaffected
- Public API (`sceneTransitionOnX` helpers) is new, no breaking changes

---

## References

- `docs/architecture/01-layers.md` — Layering principles
- `docs/architecture/03-rules-core-vs-render.md` — Core vs. renderer
- `docs/phases/phase-7-walls-first-class/README.md` — Template for primitives
- `docs/phases/phase-8-scene-transitions/README.md` — Phase plan
