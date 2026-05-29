import type { GameScene } from "../../types";
import type { GameSceneTransitionOnItemDrop } from "../../types";
import type { GameEvent } from "../../events/types";

/**
 * Pure resolver: given an item:dropped event and the current scene,
 * returns the matching item-drop transition (if any).
 * No side effects — caller is responsible for emitting events.
 */
export function resolveTransitionFromItemDrop(
  scene: GameScene,
  event: Extract<GameEvent, { type: "item:dropped" }>,
): GameSceneTransitionOnItemDrop | null {
  if (!scene.transitions) return null;

  return (
    scene.transitions.find(
      (t): t is GameSceneTransitionOnItemDrop =>
        t.kind === "item-drop" &&
        t.id === event.interactionId &&
        (!t.requiresItemId || t.requiresItemId === event.itemId),
    ) ?? null
  );
}
