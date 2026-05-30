import type { GameScene, GameVec3, GameSceneTransitionOnCollision, GameSceneTransition, PlacedSceneItem, InventoryStackState } from "../../types";
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
/**
 * Pure resolver: detect if a world-space click intersects a collision transition zone.
 * Returns the collision transition if the point [clickX, clickZ] is inside its bounds.
 */
export declare function resolveTransitionFromClickOnCollider(scene: GameScene, clickX: number, clickZ: number): {
    transition: GameSceneTransitionOnCollision;
    position: GameVec3;
} | null;
/**
 * Validates whether a transition can be triggered based on game state.
 *
 * Rules:
 * - collision: always allowed
 * - item-drop: allowed if no item required, OR item is NOT still placed in scene
 *   (if item is placed in scene, user must pick it up first before leaving)
 * - item-consume: always allowed (item status is handled via game progression)
 * - item-interaction: allowed if required item exists (in inventory or placed in scene)
 *
 * Key insight: if an item is placed in the scene (not taken), it blocks departure.
 * If the item is in inventory OR gone from the scene, departure is allowed.
 */
export declare function canTransitionBeTriggered(transition: GameSceneTransition, inventoryItems: (InventoryStackState | null)[], sceneItems: PlacedSceneItem[]): boolean;
//# sourceMappingURL=transitionRules.d.ts.map