import type { InventoryRuleContext, RuntimeEventHandler } from "@pointclick-engine/engine-core";

import type { InventoryHandlerEnv } from "./inventoryRuntimeTypes";

export function buildEnv(
  injected: { getPhrase: (key: string) => string; itemContext: InventoryRuleContext },
  showSpeechBubble: InventoryHandlerEnv["showSpeechBubble"],
  onRuntimeEvent: RuntimeEventHandler | undefined,
  setDraggedStack: (value: null) => void,
): InventoryHandlerEnv {
  return {
    ctx: injected.itemContext,
    getPhrase: injected.getPhrase,
    showSpeechBubble,
    onRuntimeEvent,
    clearDrag: () => setDraggedStack(null),
  };
}

type RafHandle = number;

export function requestFrame(callback: () => void): RafHandle {
  if (typeof window === "undefined") return Number(globalThis.setTimeout(callback, 16));
  return window.requestAnimationFrame(callback);
}

export function cancelFrame(handle: RafHandle): void {
  if (typeof window === "undefined") {
    globalThis.clearTimeout(handle);
    return;
  }
  window.cancelAnimationFrame(handle);
}

