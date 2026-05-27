import type { GameSceneWallOpening, GameVec3 } from "@pointclick-engine/engine-core";
export type WallSegment = {
    /** Position in wall-local space (relative to wall center). */
    position: [number, number, number];
    /** Half-dimensions of this segment. */
    halfSize: [number, number, number];
};
/**
 * Decomposes a wall into the minimal set of non-overlapping rectangular
 * segments that cover the solid area, subtracting all openings (doors/windows).
 *
 * All coordinates are wall-local (wall center = origin).
 *
 * Algorithm:
 *   1. Collect X boundaries from all openings.
 *   2. For each X column:
 *      a. If no opening covers it → full-height solid segment.
 *      b. Otherwise collect Y boundaries from covering openings
 *         and emit only the non-hole Y intervals.
 *
 * Callers use the segments to:
 *   - Create one CuboidCollider per segment → physics has real holes.
 *   - Render one mesh per segment → wireframe shows actual geometry.
 */
export declare function computeWallSegments(halfSize: GameVec3, openings?: GameSceneWallOpening[]): WallSegment[];
//# sourceMappingURL=wallSegments.d.ts.map