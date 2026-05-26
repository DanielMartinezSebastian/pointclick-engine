# Task 04: Define GameLoopPort + R3F adapter

**Phase**: 3 | **Estimate**: 3h | **Owner**: —

## Context

El renderer R3F invoca `useFrame((state, delta) => ...)` en muchos sitios para correr lógica cada frame (movement, physics sync, animations). El core no puede importar `useFrame`. Definimos `GameLoopPort` en core como contrato, y un adapter R3F que lo implementa con `useFrame`.

## Prerequisites

- [ ] Task 02 done (renderer-r3f package existe)
- [ ] Task 03 done (events ya en core)
- [ ] ADR-0005 definido (de Task 01)

## Action

### 1. Definir `GameLoopPort` en engine-core

`packages/engine-core/src/ports/gameLoop.ts`:

```ts
/** Callback invoked each frame with delta time in seconds. */
export type GameLoopCallback = (deltaSeconds: number) => void;

/** Function returned by subscribe to remove the callback. */
export type Unsubscribe = () => void;

/**
 * Game loop abstraction. Renderer-agnostic contract.
 *
 * Implementations:
 * - R3F: wrap `useFrame((state, delta) => callback(delta))`
 * - Canvas2D: requestAnimationFrame loop
 * - Headless: setTimeout for tests
 */
export interface GameLoopPort {
  /** Subscribe a callback to be called each frame. Returns unsubscribe fn. */
  subscribe(callback: GameLoopCallback): Unsubscribe;

  /** Optional: pause/resume the loop. Some impls may noop. */
  pause?(): void;
  resume?(): void;
}
```

### 2. Definir testing helper

`packages/engine-core/src/ports/headlessGameLoop.ts`:

```ts
import type { GameLoopCallback, GameLoopPort, Unsubscribe } from "./gameLoop";

/**
 * Headless GameLoop for tests: tick manually via `step(delta)`.
 */
export class HeadlessGameLoop implements GameLoopPort {
  private callbacks = new Set<GameLoopCallback>();

  subscribe(callback: GameLoopCallback): Unsubscribe {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  step(deltaSeconds: number): void {
    for (const cb of this.callbacks) cb(deltaSeconds);
  }
}
```

### 3. Test del HeadlessGameLoop

`packages/engine-core/__tests__/gameLoop.test.ts`:

```ts
import { describe, it, expect, vi } from "vitest";
import { HeadlessGameLoop } from "../src/ports/headlessGameLoop";

describe("HeadlessGameLoop", () => {
  it("invokes subscribed callbacks on step", () => {
    const loop = new HeadlessGameLoop();
    const cb = vi.fn();
    loop.subscribe(cb);
    loop.step(0.016);
    expect(cb).toHaveBeenCalledWith(0.016);
  });

  it("unsubscribe removes callback", () => {
    const loop = new HeadlessGameLoop();
    const cb = vi.fn();
    const unsub = loop.subscribe(cb);
    unsub();
    loop.step(0.016);
    expect(cb).not.toHaveBeenCalled();
  });
});
```

### 4. Implementar adapter R3F

`packages/engine-renderer-r3f/src/adapters/gameLoopR3F.ts`:

```ts
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import type { GameLoopCallback, GameLoopPort, Unsubscribe } from "@pointclick/engine-core";

/**
 * R3F adapter that exposes a GameLoopPort. Must be used inside a Canvas tree.
 *
 * Usage:
 *   const loop = useR3FGameLoop();
 *   useEffect(() => loop.subscribe(delta => ...), [loop]);
 */
export function useR3FGameLoop(): GameLoopPort {
  const callbacksRef = useRef(new Set<GameLoopCallback>());

  useFrame((_state, delta) => {
    for (const cb of callbacksRef.current) cb(delta);
  });

  // Stable port reference
  const portRef = useRef<GameLoopPort>({
    subscribe(callback: GameLoopCallback): Unsubscribe {
      callbacksRef.current.add(callback);
      return () => {
        callbacksRef.current.delete(callback);
      };
    },
  });

  return portRef.current;
}
```

### 5. Exportar desde renderer

`packages/engine-renderer-r3f/src/index.ts`:

```ts
export { useR3FGameLoop } from "./adapters/gameLoopR3F";
```

### 6. Build + test

```bash
npm run build
npm test -w packages/engine-core
```

## Success Criteria

- [ ] `packages/engine-core/src/ports/gameLoop.ts` define `GameLoopPort` interface
- [ ] `HeadlessGameLoop` class testeable sin React
- [ ] `packages/engine-renderer-r3f/src/adapters/gameLoopR3F.ts` implementa adapter R3F
- [ ] `useR3FGameLoop()` exportado desde `@pointclick/engine-renderer-r3f`
- [ ] Tests de `HeadlessGameLoop` pasan
- [ ] `npm run build` clean en ambos packages
- [ ] `grep "react\|three" packages/engine-core/src/ports/gameLoop.ts` devuelve nada

## On Complete

1. Marca `[x]` en `../tracking.md` para `04-define-game-loop-port`
2. Commit:
   ```
   feat(ports): define GameLoopPort with R3F adapter

   Core defines the GameLoopPort interface and a HeadlessGameLoop for
   tests. R3F adapter (useR3FGameLoop) wraps useFrame.

   - [x] Marked: 04-define-game-loop-port

   See docs/phases/phase-3-renderer-abstract/tasks/04-define-game-loop-port.md
   ```

## References

- ADR-0005: `docs/decisions/0005-renderer-ports-design.md` (de Task 01)
- ADR-0002: `docs/decisions/0002-useframe-for-loop.md`

## Notes

No reemplazar los `useFrame` existentes en web-demo todavía. Eso lo hace Task 06. Aquí solo creamos las piezas.
