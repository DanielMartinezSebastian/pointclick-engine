# Phase 8 — Scene Transitions as First-Class Engine Primitives

**Status**: Planned | **Owner**: TBD | **Version target**: v0.3.0

---

## 🎯 Why

Currently, scene transitions are **fragmented across layers**:

- **engine-core** has `setScene()` command but no concept of *triggers* or *conditions*.
- **engine-renderer-r3f** renders exit zones but treats them as simple colliders with no intrinsic meaning.
- **apps/web-demo** owns *everything* about transitions:
  - The exit zone definition + position
  - When a transition fires (collision only, or via item interaction)
  - Optional dialogs before/after
  - Optional item requirements or consumption
  - Fade effects, loading states

That works for one app, but every new game built on the engine has to reimplement the transition pipeline by hand.

**Phase 8 promotes scene transitions to first-class primitives** that ship with the engine — declarative data + automatic runtime behaviour + ready-made R3F rendering. The next consumer writes:

```typescript
sceneTransitions: [
  sceneTransitionOnCollision({
    id: "exit-to-town",
    targetSceneId: "town",
    position: [10, 0, 15],
    halfSize: [1.5, 2, 1],
    exitDialogKey?: "level.exit-warning",
  }),
  sceneTransitionOnItemDrop({
    id: "unlock-personal-room",
    targetSceneId: "personal-room",
    position: [3.27, -1.65, 19.71],
    halfSize: [0.95, 0.55, 0.95],
    requiresItemId: "gameboy",
    consumeItem: false,
    hintDialogKeys: { empty: "transition.personal-room.empty" },
  }),
];
```

and have **state**, **events**, **collisions**, **item consumption**, **dialogs**, and **scene switching** wired up automatically.

---

## 📋 Design

### 1. Polymorphic Scene Transition Type (engine-core)

```typescript
export type GameSceneTransition =
  | GameSceneTransitionOnCollision
  | GameSceneTransitionOnItemDrop
  | GameSceneTransitionOnItemConsume;

interface BaseSceneTransition {
  id: string;
  /** Target scene to navigate to when triggered. */
  targetSceneId: string;
  /** World-space center position of the trigger zone. */
  position: GameVec3;
  /** Half-extents of the trigger collider. */
  halfSize: GameVec3;
  /** Optional Y rotation. Default 0. */
  rotationY?: number;
  /** Optional dialog shown before transition (with choice: proceed/cancel). */
  preTransitionDialogKey?: DialogKey;
  /** Optional dialog shown after arriving in the target scene. */
  postTransitionDialogKey?: DialogKey;
}

/** Triggered when player collider touches this zone. */
interface GameSceneTransitionOnCollision extends BaseSceneTransition {
  kind: "collision";
}

/** Triggered when a specific item is dropped on this zone. */
interface GameSceneTransitionOnItemDrop extends BaseSceneTransition {
  kind: "item-drop";
  /** Item ID that triggers the transition. If undefined, any item works. */
  requiresItemId?: string;
  /** If true, consume (remove) the item after transition. */
  consumeItem?: boolean;
  /** Hint dialogs by zone state (empty/occupied). */
  hintDialogKeys?: { empty?: DialogKey; occupied?: DialogKey };
}

/** Triggered when a specific item is consumed (e.g., used as key). */
interface GameSceneTransitionOnItemConsume extends BaseSceneTransition {
  kind: "item-consume";
  /** Item ID that must be consumed to trigger transition. */
  requiresItemId: string;
  /** Dialog shown before consuming (with choice: proceed/cancel). */
  preConsumptionDialogKey?: DialogKey;
}
```

### 2. State + Events + Commands (engine-core)

```typescript
// New state in sceneStore:
transitionStates: Record<transitionId, {
  lastVisitedSceneId?: string;
  itemIdOccupying?: string;  // For item-drop transitions
  isAvailable: boolean;      // Can this transition be triggered?
}>;

setTransitionAvailable(id: string, available: boolean): void;
setTransitionItemOccupying(id: string, itemId: string | undefined): void;

// New events:
| { type: "transition:triggered"; transitionId: string; targetSceneId: string }
| { type: "transition:started"; transitionId: string }  // Pre-transition dialog closed, actually moving
| { type: "transition:completed"; sceneId: string }

// New commands:
| { type: "transition:activate"; transitionId: string }
| { type: "transition:cancel"; transitionId: string }
```

### 3. Automatic Item-Drop → Transition Resolution (engine-core)

When an item interaction rule fires with outcome="drop" AND the `interactionId` (the transition zone's id) matches a `GameSceneTransitionOnItemDrop`:

- Store the item ID in `transitionStates[id].itemIdOccupying`
- Emit `transition:triggered` if transition is available
- If `consumeItem: true`, remove the item from inventory
- If `preTransitionDialogKey` is set, show it and wait for confirmation
- On proceed, emit `scene:willChange`, then `scene:changed`, then `transition:completed`

### 4. Renderer (engine-renderer-r3f)

**New component: `SceneTransitions`**

For each transition in the scene:

- **collision** → invisible CuboidCollider. Collision with player triggers `transition:activate` command.
- **item-drop** → visual drop zone (similar to current drop-targets but styled for exits). Subscribe to `transitionStates[id].itemIdOccupying`. Show hint dialogs based on state.
- **item-consume** → invisible CuboidCollider or visible interactive zone. On click, dispatch `transition:activate`.

Optional: **visual exit portals** (billboards, glowing effects) for the collision-based transitions.

### 5. Ergonomic Helpers (engine-core)

```typescript
export function sceneTransitionOnCollision(opts: {
  id: string;
  targetSceneId: string;
  position: GameVec3;
  halfSize: GameVec3;
  rotationY?: number;
  preTransitionDialogKey?: DialogKey;
  postTransitionDialogKey?: DialogKey;
}): GameSceneTransitionOnCollision;

export function sceneTransitionOnItemDrop(opts: {
  id: string;
  targetSceneId: string;
  position: GameVec3;
  halfSize: GameVec3;
  requiresItemId?: string;
  consumeItem?: boolean;
  hintDialogKeys?: { empty?: DialogKey; occupied?: DialogKey };
  // ... other base fields
}): GameSceneTransitionOnItemDrop;

export function sceneTransitionOnItemConsume(opts: {
  id: string;
  targetSceneId: string;
  requiresItemId: string;
  position?: GameVec3;
  halfSize?: GameVec3;
  preConsumptionDialogKey?: DialogKey;
  // ... other base fields
}): GameSceneTransitionOnItemConsume;
```

### 6. Demo Migration

Once shipped in core, the demo:

- Removes ad-hoc exit zone logic from `GameTouchCanvas`
- Removes custom exit-zone rendering
- Updates scene definitions to use `sceneTransitions[]` array instead of manual handling
- Rewrites old exit zones using the helpers above
- Inherits transitions + item-drop + dialog flow automatically from the engine

---

## 📍 File Distribution

### Core (`packages/engine-core`)

```
src/game/types/index.ts
  └─ ADD: GameSceneTransition (union of 3 kinds)
     Base interface + discriminated union types
     ADD: DialogKey references

src/game/state/sceneStore.ts
  └─ ADD: transitionStates: Record<id, state>
     ADD: setTransitionAvailable()
     ADD: setTransitionItemOccupying()

src/game/events/types.ts
  └─ ADD: transition:triggered, transition:started, transition:completed

src/game/commands/types.ts
  └─ ADD: transition:activate, transition:cancel

src/game/logic/rules/transitionRules.ts
  └─ NEW: Rule processor for item-drop → transition resolution
          Listen for item:dropped events, match interactionId to transitions
          Emit transition:triggered on match

src/index.ts (public API)
  └─ EXPORT: sceneTransitionOnCollision, sceneTransitionOnItemDrop, etc.
     EXPORT: GameSceneTransition types
```

### Renderer (`packages/engine-renderer-r3f`)

```
src/scene/SceneTransitions.tsx
  └─ NEW: Main component
     Render collision zones + item-drop zones + item-consume zones
     Subscribe to transitionStates for visual feedback
     Dispatch transition:activate on collision or click

src/scene/SceneTransitions.utils.ts
  └─ NEW: Helpers for position, hint dialogs, visual feedback
```

### Demo (`apps/web-demo`)

```
app/demo-content/scenes/scenes.ts
  └─ UPDATE: Add sceneTransitions[] array to Scene type
     UPDATE: Existing scenes with transitions

app/lib/engine/runtime/useTransitionSystem.ts
  └─ NEW: Listen to transition:triggered, show dialogs, coordinate scene changes

app/components/TransitionDialog.tsx
  └─ NEW: Modal for pre-transition confirmation dialogs
```

---

## 🏛️ Test Coverage

```
__tests__/transitionRules.test.ts
  └─ Item-drop → transition:triggered matching
     Consume vs. place behavior
     Dialog flow

__tests__/sceneStore.test.ts (extend)
  └─ transitionStates CRUD operations
```

---

## 🔄 Effort Estimate

| Sub-phase | Files | LOC delta | Risk |
|---|---|---|---|
| 8.1 Types + helpers in core | types, index | +250 / -0 | low |
| 8.2 State + events + commands | sceneStore, events, commands | +200 / -0 | low |
| 8.3 Transition rules processor | transitionRules | +150 | medium |
| 8.4 Renderer zones + portals | SceneTransitions.tsx | +350 / -0 | medium |
| 8.5 Demo scene definitions | scenes.ts, useTransitionSystem | +100 / -50 | low |
| 8.6 Integration + dialogs | TransitionDialog, useTransitionSystem | +150 / -0 | medium |
| Tests | transitionRules.test.ts, extend sceneStore.test.ts | +200 | low |
| **Total** | | **~1400 net** | |

---

## 🎯 Success Criteria

- [ ] `GameSceneTransition` types defined and exported from core
- [ ] All three transition kinds (collision, item-drop, item-consume) work
- [ ] Transitions fire events (`transition:triggered`, `transition:started`, `transition:completed`)
- [ ] Item-drop transitions consume items when configured
- [ ] Pre/post-transition dialogs show correctly
- [ ] Renderer shows visual feedback (collision zones, drop zones, item occupancy)
- [ ] Pathfinding respects item occupancy in drop-transition zones
- [ ] Demo scenes migrated to use `sceneTransitions[]`
- [ ] 100% tests passing
- [ ] Backward compatible: scenes without transitions still work

---

## ❓ Open Questions

1. **Fade transitions**: Should the engine auto-fade on scene change, or leave that to the renderer?
2. **Collision avoidance**: If a transition zone overlaps a wall, does the player get stuck? Should we check collision-free zones in validation?
3. **Dialog hierarchy**: If both a drop-target and a transition zone occupy the same space, which dialog takes precedence?
4. **Item persistence**: When moving scenes with an item occupying a transition zone, do we transfer that item state to the new scene, or reset it?
5. **Multi-target transitions**: Can one trigger zone transition to *different* scenes based on conditions (e.g., has key → dungeon, no key → locked-room dialog)?
6. **Animation**: Should the transition include a walk-to-the-exit animation before the scene change?

---

## 📚 Out of Scope (Phase 9+)

- Animated transitions (walk-to-exit + fade blend)
- Mid-transition cutscenes (camera pan, NPC dialogue overlay)
- Persistent cross-scene state (items left in one scene appearing in another)
- Nested scenes / layer management
- Breadcrumb UI (which scenes have I been to)

---

## 📖 References

- `docs/architecture/01-layers.md` — layering principles
- `docs/phases/phase-7-walls-first-class/README.md` — template for promoting primitives
- `docs/workflow/commit-convention.md` — commit messages

---

## 📝 Changelog

| Fecha | Acción |
|-------|--------|
| 2026-05-28 | Phase 8 planning (scene transitions as first-class primitives) |
