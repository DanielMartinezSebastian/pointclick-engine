export function sceneTransitionOnCollision(opts) {
    return { kind: "collision", ...opts };
}
export function sceneTransitionOnItemDrop(opts) {
    return { kind: "item-drop", ...opts };
}
export function sceneTransitionOnItemConsume(opts) {
    return { kind: "item-consume", ...opts };
}
export function sceneTransitionOnItemInteraction(opts) {
    return { kind: "item-interaction", ...opts };
}
//# sourceMappingURL=transitions.js.map