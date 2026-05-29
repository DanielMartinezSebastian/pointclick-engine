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
//# sourceMappingURL=transitionRules.js.map