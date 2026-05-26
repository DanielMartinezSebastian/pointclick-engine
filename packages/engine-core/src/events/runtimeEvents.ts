import type { RuntimeEvent, RuntimeEventHandler } from "../game/types";

/**
 * Helper to safely dispatch a RuntimeEvent to a handler.
 * No-ops if handler is undefined (optional event listener pattern).
 */
export function emitRuntimeEvent(
  handler: RuntimeEventHandler | undefined,
  event: RuntimeEvent,
): void {
  if (!handler) return;
  handler(event);
}
