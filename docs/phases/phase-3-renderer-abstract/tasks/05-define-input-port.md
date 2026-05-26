# Task 05: Define InputPort + web adapters

**Phase**: 3 | **Estimate**: 3h | **Owner**: —

## Context

Hoy el renderer R3F lee keyboard/mouse/touch en hooks específicos (`useKeyboardMovementInput`, `useClickToMoveController`, `mobileInputStore`). El core no puede saber sobre `KeyboardEvent` o `PointerEvent`. Definimos `InputPort` en core y adapters web en renderer.

## Prerequisites

- [ ] Task 02 done (renderer-r3f scaffold)
- [ ] Task 04 done (patrón ports establecido)

## Action

### 1. Definir InputPort en core

`packages/engine-core/src/ports/input.ts`:

```ts
/** Direction vector from input (e.g. keyboard arrows, joystick). */
export interface InputDirection {
  horizontal: number; // -1..1
  vertical: number;   // -1..1
}

/** Pointer/click event in world coordinates (already converted by renderer). */
export interface InputPointerEvent {
  worldX: number;
  worldZ: number;
  button: "primary" | "secondary";
}

export type DirectionListener = (dir: InputDirection) => void;
export type PointerListener = (event: InputPointerEvent) => void;
export type Unsubscribe = () => void;

/**
 * Input abstraction. Renderer-agnostic contract.
 *
 * The renderer is responsible for converting framework-specific events
 * (KeyboardEvent, PointerEvent) into these neutral shapes before pushing
 * them through the port.
 */
export interface InputPort {
  /** Subscribe to continuous direction input (keyboard, joystick). */
  onDirection(listener: DirectionListener): Unsubscribe;

  /** Subscribe to pointer/click events in world space. */
  onPointer(listener: PointerListener): Unsubscribe;

  /** Read current direction snapshot (for polling in game loop). */
  getDirection(): InputDirection;
}
```

### 2. Headless implementation para tests

`packages/engine-core/src/ports/headlessInput.ts`:

```ts
import type {
  DirectionListener,
  InputDirection,
  InputPort,
  PointerListener,
  Unsubscribe,
  InputPointerEvent,
} from "./input";

/**
 * Headless InputPort for tests. Call `pushDirection` and `pushPointer`
 * to simulate input.
 */
export class HeadlessInput implements InputPort {
  private direction: InputDirection = { horizontal: 0, vertical: 0 };
  private dirListeners = new Set<DirectionListener>();
  private ptrListeners = new Set<PointerListener>();

  onDirection(l: DirectionListener): Unsubscribe {
    this.dirListeners.add(l);
    return () => this.dirListeners.delete(l);
  }

  onPointer(l: PointerListener): Unsubscribe {
    this.ptrListeners.add(l);
    return () => this.ptrListeners.delete(l);
  }

  getDirection(): InputDirection {
    return this.direction;
  }

  pushDirection(dir: InputDirection): void {
    this.direction = dir;
    for (const l of this.dirListeners) l(dir);
  }

  pushPointer(event: InputPointerEvent): void {
    for (const l of this.ptrListeners) l(event);
  }
}
```

### 3. Test HeadlessInput

`packages/engine-core/__tests__/input.test.ts`:

```ts
import { describe, it, expect, vi } from "vitest";
import { HeadlessInput } from "../src/ports/headlessInput";

describe("HeadlessInput", () => {
  it("notifies direction listeners on pushDirection", () => {
    const input = new HeadlessInput();
    const cb = vi.fn();
    input.onDirection(cb);
    input.pushDirection({ horizontal: 1, vertical: 0 });
    expect(cb).toHaveBeenCalledWith({ horizontal: 1, vertical: 0 });
    expect(input.getDirection()).toEqual({ horizontal: 1, vertical: 0 });
  });

  it("notifies pointer listeners on pushPointer", () => {
    const input = new HeadlessInput();
    const cb = vi.fn();
    input.onPointer(cb);
    input.pushPointer({ worldX: 1, worldZ: 2, button: "primary" });
    expect(cb).toHaveBeenCalledWith({ worldX: 1, worldZ: 2, button: "primary" });
  });
});
```

### 4. Adapter web (keyboard)

`packages/engine-renderer-r3f/src/adapters/keyboardInput.ts`:

```ts
import type { InputDirection, InputPort, DirectionListener, PointerListener, Unsubscribe, InputPointerEvent } from "@pointclick/engine-core";

/**
 * Web keyboard adapter. Listens to WASD/arrow keys and produces InputDirection.
 *
 * Mount with `attach(window)` and `detach()` on cleanup.
 */
export class WebKeyboardInput implements InputPort {
  private direction: InputDirection = { horizontal: 0, vertical: 0 };
  private keys = new Set<string>();
  private dirListeners = new Set<DirectionListener>();
  private ptrListeners = new Set<PointerListener>();

  private onKeyDown = (e: KeyboardEvent) => {
    this.keys.add(e.key.toLowerCase());
    this.updateDirection();
  };
  private onKeyUp = (e: KeyboardEvent) => {
    this.keys.delete(e.key.toLowerCase());
    this.updateDirection();
  };

  attach(target: Window | HTMLElement): void {
    target.addEventListener("keydown", this.onKeyDown as EventListener);
    target.addEventListener("keyup", this.onKeyUp as EventListener);
  }

  detach(target: Window | HTMLElement): void {
    target.removeEventListener("keydown", this.onKeyDown as EventListener);
    target.removeEventListener("keyup", this.onKeyUp as EventListener);
  }

  onDirection(l: DirectionListener): Unsubscribe {
    this.dirListeners.add(l);
    return () => this.dirListeners.delete(l);
  }

  onPointer(l: PointerListener): Unsubscribe {
    this.ptrListeners.add(l);
    return () => this.ptrListeners.delete(l);
  }

  getDirection(): InputDirection {
    return this.direction;
  }

  pushPointer(event: InputPointerEvent): void {
    for (const l of this.ptrListeners) l(event);
  }

  private updateDirection(): void {
    const h =
      (this.keys.has("a") || this.keys.has("arrowleft") ? -1 : 0) +
      (this.keys.has("d") || this.keys.has("arrowright") ? 1 : 0);
    const v =
      (this.keys.has("w") || this.keys.has("arrowup") ? -1 : 0) +
      (this.keys.has("s") || this.keys.has("arrowdown") ? 1 : 0);
    this.direction = { horizontal: h, vertical: v };
    for (const l of this.dirListeners) l(this.direction);
  }
}
```

### 5. Exportar adapter

En `packages/engine-renderer-r3f/src/index.ts`:

```ts
export { WebKeyboardInput } from "./adapters/keyboardInput";
```

### 6. Build + test

```bash
npm run build
npm test -w packages/engine-core
```

## Success Criteria

- [ ] `packages/engine-core/src/ports/input.ts` define `InputPort`
- [ ] `HeadlessInput` testeable sin DOM
- [ ] `WebKeyboardInput` en renderer-r3f attachable a `window`
- [ ] Tests pasan: 4+ tests para HeadlessInput
- [ ] `npm run build` clean
- [ ] `grep "KeyboardEvent\|window\." packages/engine-core/src/ports/` devuelve nada

## On Complete

1. Marca `[x]` en `../tracking.md` para `05-define-input-port`
2. Commit:
   ```
   feat(ports): define InputPort with web keyboard adapter

   Core defines InputPort (direction + pointer). HeadlessInput for tests.
   WebKeyboardInput adapter in renderer-r3f wraps DOM keyboard events.

   - [x] Marked: 05-define-input-port

   See docs/phases/phase-3-renderer-abstract/tasks/05-define-input-port.md
   ```

## References

- Task 04 (GameLoopPort) — mismo patrón

## Notes

Touch input (mobileInputStore) y mouse pointer adapters se pueden añadir incrementalmente. Mínimo viable en esta task: keyboard. Touch puede ir en sub-task `05a-` si urge.
