import type { GameVec3, DialogKey, GameSceneTransitionOnCollision, GameSceneTransitionOnItemDrop, GameSceneTransitionOnItemConsume } from "../types";
export declare function sceneTransitionOnCollision(opts: {
    id: string;
    targetSceneId: string;
    position: GameVec3;
    halfSize: GameVec3;
    rotationY?: number;
    preTransitionDialogKey?: DialogKey;
    postTransitionDialogKey?: DialogKey;
}): GameSceneTransitionOnCollision;
export declare function sceneTransitionOnItemDrop(opts: {
    id: string;
    targetSceneId: string;
    position: GameVec3;
    halfSize: GameVec3;
    rotationY?: number;
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
    requiresItemId: string;
    preConsumptionDialogKey?: DialogKey;
    preTransitionDialogKey?: DialogKey;
    postTransitionDialogKey?: DialogKey;
}): GameSceneTransitionOnItemConsume;
//# sourceMappingURL=transitions.d.ts.map