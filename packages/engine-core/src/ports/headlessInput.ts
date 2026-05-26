import type {
  DirectionListener,
  InputDirection,
  InputPort,
  InputPointerEvent,
  InputUnsubscribe,
  PointerListener,
} from "./input";

/**
 * Headless InputPort for tests. Call `pushDirection` and `pushPointer`
 * to simulate input. No DOM dependency.
 */
export class HeadlessInput implements InputPort {
  private direction: InputDirection = { horizontal: 0, vertical: 0 };
  private dirListeners = new Set<DirectionListener>();
  private ptrListeners = new Set<PointerListener>();

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

  /** Simulate a direction input event. */
  pushDirection(dir: InputDirection): void {
    this.direction = dir;
    for (const l of this.dirListeners) l(dir);
  }

  /** Simulate a pointer/click event. */
  pushPointer(event: InputPointerEvent): void {
    for (const l of this.ptrListeners) l(event);
  }
}
