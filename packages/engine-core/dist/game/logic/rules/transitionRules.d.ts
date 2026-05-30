import type { GameScene } from "../../types";
import type { GameSceneTransitionOnItemDrop, GameSceneTransitionOnItemInteraction } from "../../types";
import type { GameEvent } from "../../events/types";
/**
 * Pure resolver: given an item:dropped event and the current scene,
 * returns the matching item-drop transition (if any).
 * No side effects — caller is responsible for emitting events.
 */
export declare function resolveTransitionFromItemDrop(scene: GameScene, event: Extract<GameEvent, {
    type: "item:dropped";
}>): GameSceneTransitionOnItemDrop | null;
/**
 * Pure resolver: given an item interaction event and the current scene,
 * returns the matching item-interaction transition (if any).
 * Used when clicking a placed item to check if it triggers a transition.
 */
export declare function resolveTransitionFromItemInteraction(scene: GameScene, itemId: string, interactionId: string): GameSceneTransitionOnItemInteraction | null;
//# sourceMappingURL=transitionRules.d.ts.map