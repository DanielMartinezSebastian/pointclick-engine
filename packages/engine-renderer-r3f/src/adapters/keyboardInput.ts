import type {
  InputDirection,
  InputPort,
  DirectionListener,
  PointerListener,
  InputUnsubscribe,
  InputPointerEvent,
} from "@pointclick/engine-core";

/**
 * Web keyboard adapter. Listens to WASD/arrow keys and produces InputDirection.
 *
 * Usage:
 *   const kb = new WebKeyboardInput();
 *   kb.attach(window);
 *   // later:
 *   kb.detach(window);
 */
export class WebKeyboardInput implements InputPort {
  private direction: InputDirection = { horizontal: 0, vertical: 0 };
  private keys = new Set<string>();
  private dirListeners = new Set<DirectionListener>();
  private ptrListeners = new Set<PointerListener>();

  private readonly onKeyDown = (e: KeyboardEvent) => {
    this.keys.add(e.key.toLowerCase());
    this.updateDirection();
  };

  private readonly onKeyUp = (e: KeyboardEvent) => {
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

  onDirection(l: DirectionListener): InputUnsubscribe {
    this.dirListeners.add(l);
    return () => this.dirListeners.delete(l);
  }

  onPointer(l: PointerListener): InputUnsubscribe {
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
