import type { GameVec3, DialogKey, GameSceneTransitionOnCollision, GameSceneTransitionOnItemDrop, GameSceneTransitionOnItemConsume, GameSceneTransitionOnItemInteraction } from "../types";
export declare function sceneTransitionOnCollision(opts: {
    id: string;
    targetSceneId: string;
    position: GameVec3;
    halfSize: GameVec3;
    rotationY?: number;
    spawnPosition?: GameVec3;
    targetPosition?: GameVec3;
    preTransitionDialogKey?: DialogKey;
    postTransitionDialogKey?: DialogKey;
}): GameSceneTransitionOnCollision;
export declare function sceneTransitionOnItemDrop(opts: {
    id: string;
    targetSceneId: string;
    position: GameVec3;
    halfSize: GameVec3;
    rotationY?: number;
    spawnPosition?: GameVec3;
    targetPosition?: GameVec3;
    requiresItemId?: string;
    consumeItem?: boolean;
    hintDialogKeys?: {
        empty?: DialogKey;
        occupied?: DialogKey;
    };
    preTransitionDialogKey?: DialogKey;
    postTransitionDialogKey?: DialogKey;
}): GameSceneTransitionOnItemDrop;
export declare function sceneTransitionOnItemConsume(opts: {
    id: string;
    targetSceneId: string;
    position: GameVec3;
    halfSize: GameVec3;
    rotationY?: number;
    spawnPosition?: GameVec3;
    targetPosition?: GameVec3;
    requiresItemId: string;
    preConsumptionDialogKey?: DialogKey;
    preTransitionDialogKey?: DialogKey;
    postTransitionDialogKey?: DialogKey;
}): GameSceneTransitionOnItemConsume;
export declare function sceneTransitionOnItemInteraction(opts: {
    id: string;
    targetSceneId: string;
    position: GameVec3;
    halfSize: GameVec3;
    rotationY?: number;
    spawnPosition?: GameVec3;
    targetPosition?: GameVec3;
    requiresItemId: string;
    requiresInteractionId?: string;
    preTransitionDialogKey?: DialogKey;
    postTransitionDialogKey?: DialogKey;
}): GameSceneTransitionOnItemInteraction;
//# sourceMappingURL=transitions.d.ts.map