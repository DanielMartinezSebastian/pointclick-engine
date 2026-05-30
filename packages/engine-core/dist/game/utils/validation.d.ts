import type { GameScene, GameVec3 } from "../types";
/**
 * Validates that an entry position is within valid scene bounds and not blocked by walls.
 * Used to verify entry positions in scene transitions are accessible.
 */
export declare function validateEntryPosition(position: GameVec3, scene: GameScene): {
    valid: boolean;
    reason?: string;
};
/**
 * Validates that a walk path from source to destination is reachable.
 * Uses A* pathfinding to check connectivity.
 * Returns the calculated path if reachable.
 */
export declare function validateWalkPath(from: GameVec3, to: GameVec3, scene: GameScene): {
    reachable: boolean;
    path?: GameVec3[];
};
//# sourceMappingURL=validation.d.ts.map