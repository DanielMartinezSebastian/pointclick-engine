import type { GameSceneGround, GameSceneInteraction, GameSceneWall } from "../../types";
export type MovementPoint = {
    x: number;
    z: number;
};
type MovementBounds = Pick<GameSceneGround, "minX" | "maxX" | "minZ" | "maxZ">;
type FindPathOptions = {
    start: MovementPoint;
    goal: MovementPoint;
    bounds: MovementBounds;
    walls: GameSceneWall[];
    interactions: GameSceneInteraction[];
    cellSize?: number;
    obstaclePadding?: number;
    segmentSampleStep?: number;
    maxIterations?: number;
};
export declare function findPath({ start, goal, bounds, walls, interactions, cellSize, obstaclePadding, segmentSampleStep, maxIterations, }: FindPathOptions): MovementPoint[] | null;
export {};
//# sourceMappingURL=findPath.d.ts.map