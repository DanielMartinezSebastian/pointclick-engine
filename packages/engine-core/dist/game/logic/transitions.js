export function sceneTransitionOnCollision(opts) {
    return { kind: "collision", ...opts };
}
export function sceneTransitionOnItemDrop(opts) {
    return { kind: "item-drop", ...opts };
}
export function sceneTransitionOnItemConsume(opts) {
    return { kind: "item-consume", ...opts };
}
//# sourceMappingURL=transitions.js.map