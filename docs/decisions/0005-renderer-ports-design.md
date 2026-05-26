# ADR-0005: Renderer Ports Design

**Status**: Accepted
**Date**: 2026-05-27
**Phase**: 3 (Renderer Abstraction)

## Context

After Phase 2, `engine-core` is fully framework-agnostic. However, the R3F renderer still lives
directly in `apps/web-demo/`, preventing reuse of the engine with other renderers (PixiJS,
Canvas 2D, native). Phase 3 defines **port interfaces** in `engine-core` so any renderer can
implement them, and moves the R3F implementation to `packages/engine-renderer-r3f`.

Key coupling points identified in `apps/web-demo/app/lib/engine/`:

- **Game loop**: `useFrame` calls in `GameTouchSpriteRuntime.tsx`, `DavidSprite.tsx`
- **Input**: `useKeyboardMovementInput`, `useMobileInputStore`, click events on 3D ground mesh
- **Viewport**: `Canvas`, `OrthographicCamera`, `CameraFitHeight` in `GameTouchCanvas.tsx`
- **Physics**: Rapier `RigidBody`, `CuboidCollider` — deep integration with render cycle

## Decision

Define **3 ports** in `engine-core/src/ports/`:

### GameLoopPort

```ts
interface GameLoopPort {
  subscribe(callback: (deltaSeconds: number) => void): () => void;
  pause?(): void;
  resume?(): void;
}
```

R3F adapter: `useR3FGameLoop()` hook that wraps `useFrame`.
Headless impl: `HeadlessGameLoop` with `.step(delta)` for tests.

### InputPort

```ts
interface InputPort {
  onDirection(listener: (dir: { horizontal: number; vertical: number }) => void): () => void;
  onPointer(listener: (event: { worldX: number; worldZ: number; button: "primary" | "secondary" }) => void): () => void;
  getDirection(): { horizontal: number; vertical: number };
}
```

Web adapter: `WebKeyboardInput` that attaches to DOM keyboard events.
Headless impl: `HeadlessInput` with `.pushDirection()` / `.pushPointer()` for tests.

### ViewportPort

```ts
interface ViewportPort {
  getWidth(): number;
  getHeight(): number;
  worldToScreen(worldX: number, worldY: number, worldZ: number): { x: number; y: number };
}
```

Minimal interface for UI overlays that need world→screen mapping. Not implemented in Phase 3.

## Physics Decision

**Rapier is NOT abstracted in Phase 3.** Physics (Rapier colliders, RigidBodies) remains
the renderer's concern. Abstracting physics would require a `PhysicsPort` complex enough to
represent the full collision API — deferred to Phase 4+.

## Consequences

**Positive:**
- Core remains fully testable without R3F mocks — `HeadlessGameLoop` and `HeadlessInput` enable unit tests.
- Future renderers only need to implement the 3 ports, not touch game logic.
- Clear boundary: `engine-core` owns the contracts, `engine-renderer-r3f` owns the implementations.

**Negative:**
- `GameTouchSpriteRuntime` still has complex R3F logic. Fully abstracting it would require more ports.
- `ViewportPort` is defined but not wired in Phase 3 (just the interface, no R3F adapter yet).

## Alternatives Considered

1. **Single `RendererPort`**: One large interface combining loop + input + viewport. Rejected because
   consumers often only need one capability; composition is simpler than inheritance.

2. **RxJS Observables for input**: Too heavy a dependency for core. Plain callbacks are simpler and
   sufficient for the current scope.

3. **Abstract physics**: Rapier's API surface is too large and tied to the render loop to abstract
   cleanly in this phase. Left for Phase 4+.

## References

- ADR-0002: `docs/decisions/0002-useframe-for-loop.md` (original useFrame decision)
- Architecture: `docs/architecture/01-layers.md`
