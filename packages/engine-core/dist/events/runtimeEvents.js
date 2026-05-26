/**
 * Helper to safely dispatch a RuntimeEvent to a handler.
 * No-ops if handler is undefined (optional event listener pattern).
 */
export function emitRuntimeEvent(handler, event) {
    if (!handler)
        return;
    handler(event);
}
//# sourceMappingURL=runtimeEvents.js.map