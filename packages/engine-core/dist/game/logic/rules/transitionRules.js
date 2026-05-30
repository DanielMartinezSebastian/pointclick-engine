/**
 * Pure resolver: given an item:dropped event and the current scene,
 * returns the matching item-drop transition (if any).
 * No side effects — caller is responsible for emitting events.
 */
export function resolveTransitionFromItemDrop(scene, event) {
    if (!scene.transitions)
        return null;
    return (scene.transitions.find((t) => t.kind === "item-drop" &&
        t.id === event.interactionId &&
        (!t.requiresItemId || t.requiresItemId === event.itemId)) ?? null);
}
/**
 * Pure resolver: given an item interaction event and the current scene,
 * returns the matching item-interaction transition (if any).
 * Used when clicking a placed item to check if it triggers a transition.
 */
export function resolveTransitionFromItemInteraction(scene, itemId, interactionId) {
    if (!scene.transitions)
        return null;
    return (scene.transitions.find((t) => t.kind === "item-interaction" &&
        t.requiresItemId === itemId &&
        (!t.requiresInteractionId || t.requiresInteractionId === interactionId)) ?? null);
}
/**
 * Pure resolver: detect if a world-space click intersects a collision transition zone.
 * Returns the collision transition if the point [clickX, clickZ] is inside its bounds.
 */
export function resolveTransitionFromClickOnCollider(scene, clickX, clickZ) {
    if (!scene.transitions)
        return null;
    const found = scene.transitions.find((t) => t.kind === "collision" &&
        Math.abs(clickX - t.position[0]) <= t.halfSize[0] &&
        Math.abs(clickZ - t.position[2]) <= t.halfSize[2]);
    if (!found)
        return null;
    return {
        transition: found,
        position: found.position,
    };
}
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
export function canTransitionBeTriggered(transition, inventoryItems, sceneItems) {
    if (transition.kind === "collision") {
        return true;
    }
    if (transition.kind === "item-drop") {
        if (!transition.requiresItemId)
            return true;
        // Block if the required item is still placed in this scene (not taken)
        const itemStillInScene = sceneItems.some((item) => item.itemId === transition.requiresItemId);
        return !itemStillInScene;
    }
    if (transition.kind === "item-consume") {
        // Consumption transitions don't block — the item state is managed elsewhere
        return true;
    }
    if (transition.kind === "item-interaction") {
        const requiredItemInInventory = inventoryItems.some((stack) => stack?.id === transition.requiresItemId);
        const requiredItemInScene = sceneItems.some((item) => item.itemId === transition.requiresItemId);
        // Item must be available (in inventory or placed in scene) to interact with it
        return requiredItemInInventory || requiredItemInScene;
    }
    return false;
}
//# sourceMappingURL=transitionRules.js.map