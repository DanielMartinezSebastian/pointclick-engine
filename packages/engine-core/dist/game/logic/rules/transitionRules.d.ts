import type { GameScene } from "../../types";
import type { GameSceneTransitionOnItemDrop } from "../../types";
import type { GameEvent } from "../../events/types";
/**
 * Pure resolver: given an item:dropped event and the current scene,
 * returns the matching item-drop transition (if any).
 * No side effects — caller is responsible for emitting events.
 */
export declare function resolveTransitionFromItemDrop(scene: GameScene, event: Extract<GameEvent, {
    type: "item:dropped";
}>): GameSceneTransitionOnItemDrop | null;
//# sourceMappingURL=transitionRules.d.ts.map