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
export type InputUnsubscribe = () => void;

/**
 * Input abstraction. Renderer-agnostic contract.
 *
 * The renderer is responsible for converting framework-specific events
 * (KeyboardEvent, PointerEvent) into these neutral shapes before pushing
 * them through the port.
 */
export interface InputPort {
  /** Subscribe to continuous direction input (keyboard, joystick). */
  onDirection(listener: DirectionListener): InputUnsubscribe;

  /** Subscribe to pointer/click events in world space. */
  onPointer(listener: PointerListener): InputUnsubscribe;

  /** Read current direction snapshot (for polling in game loop). */
  getDirection(): InputDirection;
}
