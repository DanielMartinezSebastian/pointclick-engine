# Phase 9 Task Tracking

## Overview
Refactor placed items logic to core (types, dialog keys, stores). Phases D-E deferred by architectural design.

---

## Phase A: Unify Types

- [x] Add `sceneId?: string` to `PlacedSceneItem` in core types
- [x] Move `ItemDefinition` to `packages/engine-core/src/game/types/index.ts`
- [x] Move `ItemInteractionRule` to core types
- [x] Move `InventoryStackState` and `InventorySlotsState` to core types
- [x] Update `inventoryRules.ts` (core) to import from types
- [x] Update `inventoryRules.ts` (demo) to import from core
- [x] Update `gameRuntime.ts` to re-export from core (remove duplicate)
- [x] Update `placedItemsStore.ts` to import from core
- [x] Update `useInventoryRuntimeController.ts` to import from core

**Status**: ✅ COMPLETE | Commit: `6c5d081`

---

## Phase B: Fix Hardcoded Dialog Keys

- [x] Remove `DEFAULT_PICKUP_ALLOWED_DIALOG_KEY` constant from core
- [x] Remove `DEFAULT_PICKUP_BLOCKED_DIALOG_KEY` constant from core
- [x] Implement `getDefaultPickupDialogKey(itemId, type)` function in core
- [x] Update `resolvePickupPlacedItemDecision()` to use dynamic keys
- [x] Test that pickup dialogs work with trophy (non-gameboy item)

**Status**: ✅ COMPLETE | Commit: `6c5d081`

---

## Phase C: Add Agnostic Stores to Core

- [x] Create `createInventorySlotsStore()` factory in core
- [x] Create `createPlacedItemsStore()` factory in core
- [x] Define `InventorySlotsStore` public interface
- [x] Define `PlacedItemsStore` public interface with add/remove operations
- [x] Export from `packages/engine-core/src/game/state/index.ts`
- [x] Ensure stores are framework-agnostic (no Zustand/React imports)
- [x] Verify barrel exports chain correctly to `@pointclick-engine/engine-core`

**Status**: ✅ COMPLETE | Commit: `6c5d081`

---

## Phase D: Implement Executors in publicApi

- [x] Identify architectural constraint: commands lack UI context
- [x] Document why `inventory:pickup` must stay deferred
- [x] Document why `inventory:drop` must stay deferred
- [x] Update executor warning messages with clarified rationale
- [x] Add reference to phase documentation

**Status**: ⏸ DEFERRED BY DESIGN | Commit: `8cf47d1`

**Rationale**: Command executors don't have access to UI context (which interaction was clicked, drag coordinates). These operations must remain in component layer where UI events provide context. Current design with `useInventoryRuntimeController` is correct.

---

## Phase E: Refactor useInventoryRuntimeController

- [x] Analyze current hook design vs. core stores
- [x] Identify R3F integration dependencies (frame loop, timing)
- [x] Document why migration should be deferred
- [x] Plan incremental migration path for Phase 10+

**Status**: ⏸ DEFERRED BY DESIGN | Tracked in memory

**Rationale**: Current React `useState` approach integrates well with R3F (proximity hints, double-rAF timing, Suspense). Migrating now would break working animations. Incremental migration in Phase 10 is safer.

---

## Documentation

- [x] Create `docs/phases/phase-9-placed-items-agnóstic/README.md`
- [x] Document Phases A-C completion
- [x] Explain architectural constraints for D-E deferral
- [x] Add references to related phases and architecture docs
- [x] Create `tracking.md` (this file)

**Status**: ✅ COMPLETE

---

## Verification Checklist

- [x] Types compile without errors
- [x] Core exports are correctly chained
- [x] Demo imports from core (not local duplicates)
- [x] Dialog keys are generated dynamically (tested with trophy)
- [x] Placed items spawn, pickup, and drop mechanics work
- [x] Scene transitions with placed items work
- [x] Trophy warning dialog on exit without item works

**Status**: ✅ ALL PASS

---

## Summary

**Completed**: Phase A, B, C fully implement agnostic types, dialog key generation, and store factories.

**Deferred**: Phase D (commands lack UI context), Phase E (R3F integration needs preservation).

**Result**: Core is now ready for any renderer to implement inventory mechanics without reimplementation. Demo continues working as before with improved internal architecture.

**Next**: Phase 10 can incremental migrate hook to core stores without breaking current R3F integration.
