# Phase 9: Placed Items as Agnostic Core Types

**Status**: Phases A-C ✅ Complete | Phases D-E ⏸ Deferred by Design

**Owner**: Daniel Martínez Sebastián  
**Started**: 2026-05-29

---

## Objective

Refactor placed items logic (item placement, sceneId tracking, pickup/drop mechanics) from demo-specific implementation to agnostic core, making it reusable across any renderer without reimplementation.

## Background

Previous phases built a foundation:
- Phase 2: Core extraction (generic, no React/R3F)
- Phase 3: Renderer abstraction (R3F adapter)
- Phase 4: Bidirectional API (command/event bus)
- Phase 8: Scene transitions (collision-based + item-drop-based)

Phase 9 completes placed items migration, establishing the pattern for how stateful game mechanics move from demo → core without coupling.

---

## Implementation Plan: 5 Phases

### Phase A: Unify Types ✅ COMPLETE

**What**: Consolidate duplicated `PlacedSceneItem` definitions across the codebase.

**Changes**:
- `packages/engine-core/src/game/types/index.ts`
  - Added `sceneId?: string` to `PlacedSceneItem` for multi-scene tracking
  - Moved `ItemDefinition` and `ItemInteractionRule` from inventoryRules.ts
  - Added `InventoryStackState` and `InventorySlotsState` type exports
  
- `packages/engine-core/src/game/logic/rules/inventoryRules.ts`
  - Removed duplicate type definitions
  - Imported all types from core `types/index.ts`
  - Replaces `PlacedItemState` with `PlacedSceneItem` throughout

- Demo layer
  - `apps/web-demo/app/lib/engine/types/gameRuntime.ts` — removed duplicate, re-exports from core
  - `apps/web-demo/app/store/placedItemsStore.ts` — imports PlacedSceneItem from core
  - `apps/web-demo/app/lib/engine/runtime/useInventoryRuntimeController.ts` — imports PlacedSceneItem from core

**Result**: Single source of truth for item placement types. No behavioral changes.

---

### Phase B: Fix Hardcoded Dialog Keys ✅ COMPLETE

**What**: Remove item-specific constants from core, make dialog key generation dynamic.

**Problem**: Core `inventoryRules.ts` contained:
```ts
const DEFAULT_PICKUP_ALLOWED_DIALOG_KEY = "item.gameboy.pickup.personal-room-gameboy-drop-target.allowed";
const DEFAULT_PICKUP_BLOCKED_DIALOG_KEY = "item.gameboy.pickup.personal-room-gameboy-drop-target.blocked";
```
This hardcoded "gameboy" into the engine, breaking agnosticity.

**Changes**:
- `packages/engine-core/src/game/logic/rules/inventoryRules.ts`
  - Removed hardcoded dialog key constants
  - Implemented dynamic function:
    ```ts
    function getDefaultPickupDialogKey(itemId: string, type: "allowed" | "blocked"): DialogKey {
      return `item.${itemId}.pickup.${type}` as DialogKey;
    }
    ```
  - Updated `resolvePickupPlacedItemDecision()` to use dynamic keys

**Result**: Core is now item-agnostic. Dialog keys follow the pattern `item.${itemId}.pickup.${type}`, configurable by demo content.

---

### Phase C: Add Agnostic Stores to Core ✅ COMPLETE

**What**: Create framework-agnostic stores for inventory and placed items state in core.

**Changes**:
- `packages/engine-core/src/game/state/inventorySlotsStore.ts` (NEW)
  - Agnostic store factory: `createInventorySlotsStore()`
  - Public interface:
    ```ts
    export type InventorySlotsStore = {
      getSlots: () => InventorySlotsState;
      setSlots: (slots: InventorySlotsState) => void;
      reset: () => void;
    };
    ```
  - No Zustand dependency, pure functions

- `packages/engine-core/src/game/state/placedItemsStore.ts` (NEW)
  - Agnostic store factory: `createPlacedItemsStore()`
  - Public interface includes `addItem()`, `removeItem()`, granular operations
  - Same pattern: no framework coupling

- `packages/engine-core/src/game/state/index.ts`
  - Exports both store factories for public use

**Result**: Game runtime can instantiate these stores without Zustand, React, or any framework. Demo can wrap them in Zustand for React integration.

---

## Phase D: Implement Executors in publicApi ⏸ DEFERRED

### Why Deferred?

Inventory commands (`inventory:pickup`, `inventory:drop`) require **UI context** that is architecturally unavailable at the executor level:

#### `inventory:pickup` Problem
- Command has: `{ type: "inventory:pickup"; itemId: string }`
- Command executor needs: which interaction was clicked, what was the click target
- UI context lives in: R3F event handler → component click handler
- **Verdict**: Executor cannot know which interaction was clicked. Must stay in component.

#### `inventory:drop` Problem
- Command has: `{ type: "inventory:drop"; itemId: string; slotIndex: number }`
- Command executor needs: which drop target was dragged to, drag start/end coordinates
- UI context lives in: React drag handler → PlacedSceneItems render layer
- **Verdict**: Executor cannot know drop zone coordinates. Must stay in component.

### Current Design

Executors in `apps/web-demo/app/lib/engine/publicApi.ts` (lines 365–375) remain deferred with clarified messages:

```ts
commands.register("inventory:pickup", (cmd) =>
  console.warn(
    `[runtime] executor deferred to v0.2.0: ${cmd.type} — requires UI context (which interaction was clicked). See docs/phases/phase-9-placed-items-agnóstic/README.md#phase-d`,
  ),
);

commands.register("inventory:drop", (cmd) =>
  console.warn(
    `[runtime] executor deferred to v0.2.0: ${cmd.type} — requires UI context (drag coordinates, target interaction). See docs/phases/phase-9-placed-items-agnóstic/README.md#phase-d`,
  ),
);
```

### Correct Pattern

These operations belong in the component layer, where UI events provide necessary context:

```
User Click
    ↓
useInventoryRuntimeController.handlePickupPlacedItem(interaction)
    ↓
[Has UI context: which interaction, what was clicked]
    ↓
Resolve decision with core logic (resolvePickupPlacedItemDecision)
    ↓
Update stores + emit runtime event
```

This is already working correctly in `useInventoryRuntimeController.ts`.

---

## Phase E: Refactor useInventoryRuntimeController ⏸ DEFERRED

### Why Deferred?

Current design is sound and integrates well with R3F:

1. **Proximity Hint Controller**: Uses R3F frame loop to check distance to interactions
2. **Double-rAF Timing**: Ensures speech bubble renders after first frame scales sprites correctly
3. **Inventory Slot Updates**: React `useState` integrates cleanly with React Suspense and lifecycle
4. **Placed Items Sync**: Current `useEffect` mirrors local state to Zustand store for debug overlay

Migrating to core stores now would:
- Require rewriting R3F frame loop integration
- Add complexity to async store synchronization
- Risk breaking working animation/timing logic

### Future Approach (Phase 10+)

Incremental migration:
1. Create a wrapper store in demo that bridges Zustand + core stores
2. Gradually move logic pieces to core without disrupting R3F integration
3. Decouple hook from frame timing once transitions/animations are understood

---

## What Works Now

### ✅ Item Pickup/Drop Mechanics
- Trophy spawns in personalRoom
- Warning dialog if leaving without trophy
- Drop on pedestal triggers return to personalRoom
- Inventory state management working
- Dialog keys are agnostic

### ✅ Core Types
- `PlacedSceneItem` is single source of truth
- Item definitions not hardcoded in core
- Dialog key generation is dynamic

### ✅ Agnostic Stores Exist
- Core exports `createInventorySlotsStore()` and `createPlacedItemsStore()`
- Demo can use or wrap these stores as needed
- Path clear for future renderer implementations

---

## Files Modified

**Core Package**:
- `packages/engine-core/src/game/types/index.ts` — Type consolidation
- `packages/engine-core/src/game/logic/rules/inventoryRules.ts` — Dynamic dialog keys
- `packages/engine-core/src/game/state/inventorySlotsStore.ts` (NEW)
- `packages/engine-core/src/game/state/placedItemsStore.ts` (NEW)
- `packages/engine-core/src/game/state/index.ts` — Store exports

**Demo Layer**:
- `apps/web-demo/app/lib/core/rules/inventoryRules.ts` — Import from core
- `apps/web-demo/app/lib/engine/types/gameRuntime.ts` — Re-export from core
- `apps/web-demo/app/store/placedItemsStore.ts` — Import from core
- `apps/web-demo/app/lib/engine/runtime/useInventoryRuntimeController.ts` — Import from core
- `apps/web-demo/app/lib/engine/publicApi.ts` — Clarified deferred messages

---

## Commits

```
8cf47d1 docs: clarify deferred executors require UI context for inventory commands
6c5d081 refactor: unify placed items types and add agnostic inventory stores (phases A-C)
```

---

## Next Steps

### Immediate (Phase 10)
- Test placed items with new item types (not just trophy/gameboy)
- Verify core stores work with other renderer implementations
- Document store usage patterns for external games

### Medium Term (Phase 11+)
- Incremental migration of useInventoryRuntimeController to core stores
- Move PlacedSceneItems component to engine-renderer-r3f package
- Implement additional item interaction types (equip, consume, etc.)

---

## References

- Architecture: `docs/architecture/01-layers.md`
- Core API: `docs/architecture/02-public-api.md`
- Bidirectional Communication: `docs/architecture/05-bidirectional-communication.md`
- Previous Phase (Transitions): `docs/phases/phase-8-scene-transitions/README.md`
