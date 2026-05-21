# Architecture Review: r3f Point-and-Click Library Direction

Date: 2026-05-21
Status: Draft for team review

Execution tracking:

- PR roadmap checklist: [PR_ROADMAP_CHECKLIST.md](./PR_ROADMAP_CHECKLIST.md)

## 1. Goal and product direction

The repository should evolve from a single demo into a reusable library for building modern, responsive point-and-click games with native web interoperability.

Target outcomes:

- Reusable gameplay modules decoupled from demo-specific content.
- Engine-level APIs that can be consumed by multiple apps/scenes.
- Stable contracts for scenes, items, interactions, input, and dialogs.
- Clear extension points for web features (DOM overlays, URLs, storage, clipboard, network, analytics, service workers, etc.).

## 2. Current architecture snapshot

Observed structure:

- App shell: `app/page.tsx` renders a single game root component.
- Main runtime orchestration: `app/components/GameTouchCanvas.tsx`.
- Domain data mixed with app concerns:
  - Scenes in `app/scenes/scenes.ts`
  - Items in `app/items/index.ts`
  - Dialog catalog in `app/dialogs/index.ts`
- State management:
  - Scene state in `app/store/sceneStore.ts`
  - Mobile input state in `app/store/mobileInputStore.ts`
- Movement and pathfinding utilities under `app/components/movement/*`.

## 3. Main architecture findings

### F1. Over-centralized runtime component

`GameTouchCanvas.tsx` currently combines many responsibilities:

- Rendering setup (Canvas/camera/lights/background)
- Physics setup and player runtime loop
- Input orchestration (keyboard, joystick, click-to-move)
- Inventory and drag/drop flow
- Scene target handling and item placement/pickup
- Debug tooling and in-editor mutation UX
- Dialog speech behavior

Risk:

- High coupling and difficult incremental changes.
- Regressions likely when touching unrelated features.
- Hard to extract library-quality APIs.

### F2. Domain logic mixed with view-layer state

Key gameplay rules are executed directly inside React component callbacks (item outcomes, placement and pickup behavior, boundary speech, etc.).

Risk:

- Business rules are not independently testable.
- Rules are tightly coupled to UI event timing and local component state.

### F3. Demo content and engine concerns are intertwined

Static scene/item/dialog definitions coexist with runtime engine behavior in the same app tree.

Risk:

- Hard to publish a generic package while keeping demo content separate.
- Every new game/content set pushes changes into core runtime files.

### F4. Store contracts are broad and mutable-in-practice

`sceneStore` contains both runtime state and editor actions. This is practical for debug, but it blurs boundaries between engine runtime, editor tooling, and content authoring workflows.

Risk:

- Store growth becomes unbounded.
- Difficult to reason about invariants and ownership of state transitions.

### F5. Missing explicit boundary for platform interoperability

The long-term vision requires first-class web interoperability, but there is no dedicated abstraction layer yet.

Risk:

- Platform-specific integrations (URL state, local persistence, clipboard, APIs, PWA features) will be added ad hoc and increase coupling.

## 4. Target architecture (library-first)

Proposed layered model:

1. Core Domain (framework-agnostic)
- Scene graph contracts
- Item/interactions rules engine
- Navigation/pathfinding service interfaces
- Dialog resolution contracts

2. Runtime Engine (r3f/rapier adapters)
- Rendering adapter
- Physics adapter
- Input adapter
- Runtime event bus

3. Web Integration Layer
- Persistence adapters (localStorage/IndexedDB/remote)
- URL/router integration
- Clipboard/drag-drop/web APIs
- Telemetry hooks

4. UI Composition Layer
- Reusable React components/hooks for HUD, inventory, speech bubble, editor panels
- Demo app that consumes public APIs

## 5. Suggested module boundaries

Suggested top-level structure:

- `app/lib/core/`
  - `contracts/` (types and interfaces)
  - `rules/` (item interaction outcomes, dialog resolution)
  - `navigation/` (pathfinding and movement intents)
- `app/lib/engine/`
  - `runtime/` (game loop orchestration)
  - `rendering/` (camera/background/sprite bindings)
  - `physics/` (collider adapters)
  - `input/` (keyboard/touch/click adapters)
- `app/lib/platform-web/`
  - `storage/`, `routing/`, `clipboard/`, `network/`
- `app/lib/ui/`
  - composable components and hooks (inventory, speech, selectors)
- `app/demo/`
  - current scene/item/dialog content and demo wiring

## 6. Public API direction (for the future package)

Minimal API target:

- `createGameRuntime(config)`
- `registerScene(sceneDefinition)`
- `registerItem(itemDefinition)`
- `registerRule(ruleDefinition)`
- `useGameState(selector)`
- `useGameActions()`
- `GameViewport` (r3f canvas integration)

Design principles:

- Declarative content registration.
- Strongly typed IDs and contracts.
- Extensible adapters rather than hardcoded implementations.

## 7. Migration plan (incremental)

Phase 1 (short, low risk)

- Extract pure gameplay rule functions from `GameTouchCanvas.tsx` into `app/lib/core/rules/`.
- Keep behavior unchanged; only move logic behind small adapter functions.
- Add unit tests for extracted pure logic.

Phase 2 (medium)

- Introduce a `runtime controller` hook to reduce orchestration load in `GameTouchCanvas.tsx`.
- Separate `debug/editor` concerns into independent modules/hooks.

Phase 3 (medium/high)

- Move static demo content into a dedicated `app/demo/content/*` area.
- Normalize scene and item schemas for package-level contracts.

Phase 4 (high)

- Publish internal package boundaries and rewire demo app to consume them.
- Add platform adapter interfaces and at least one concrete web adapter set.

## 8. Non-functional priorities

- Testability: pure rule engine and deterministic navigation tests.
- Performance: avoid broad Zustand subscriptions in hot render loops.
- Observability: standard runtime events (`onMove`, `onCollide`, `onDrop`, `onDialog`).
- Content pipeline: clear separation between authored data and runtime state.

## 9. Immediate next tasks

1. Create `app/lib/core/rules/inventoryRules.ts` and move drop/pickup decision logic.
2. Add tests for placement/consume/return outcomes and inventory edge cases.
3. Create `app/lib/engine/runtime/useGameRuntimeController.ts` and move input+movement orchestration there.
4. Keep `GameTouchCanvas.tsx` as composition-only shell over extracted modules.

## 10. Review questions

1. Should debug editor tooling ship in the future library package, or remain demo-only?
2. Is multiplayer/network synchronization in near-term scope (affects event/store model)?
3. Should dialogs be part of core domain rules or optional plugin at UI/platform layer?
4. Which web interoperability capabilities are required in v1 (URL state, storage sync, PWA, cloud save)?
