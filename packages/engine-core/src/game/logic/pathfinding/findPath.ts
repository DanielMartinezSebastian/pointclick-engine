import type {
  GameSceneGround,
  GameSceneInteraction,
  GameSceneWall,
} from "../../types";

export type MovementPoint = {
  x: number;
  z: number;
};

type MovementBounds = Pick<
  GameSceneGround,
  "minX" | "maxX" | "minZ" | "maxZ"
>;

type MovementObstacle = {
  x: number;
  z: number;
  halfX: number;
  halfZ: number;
  rotationY: number;
};

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

const DEFAULT_CELL_SIZE = 0.9;
const DEFAULT_OBSTACLE_PADDING = 0.72;
const DEFAULT_SEGMENT_SAMPLE_STEP = 0.35;
const DEFAULT_MAX_ITERATIONS = 5000;
const NEIGHBOR_OFFSETS = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
] as const;

export function findPath({
  start,
  goal,
  bounds,
  walls,
  interactions,
  cellSize = DEFAULT_CELL_SIZE,
  obstaclePadding = DEFAULT_OBSTACLE_PADDING,
  segmentSampleStep = DEFAULT_SEGMENT_SAMPLE_STEP,
  maxIterations = DEFAULT_MAX_ITERATIONS,
}: FindPathOptions): MovementPoint[] | null {
  const obstacles = [
    ...walls.map((wall) =>
      toObstacle(
        wall.position[0],
        wall.position[2],
        wall.halfSize[0],
        wall.halfSize[2],
        wall.rotationY,
      ),
    ),
    ...interactions
      .filter((interaction) => interaction.hasCollision)
      .map((interaction) =>
        toObstacle(
          interaction.position[0],
          interaction.position[2],
          interaction.halfSize[0],
          interaction.halfSize[2],
          interaction.rotationY ?? 0,
        ),
      ),
  ];

  if (
    isSegmentClear(
      start,
      goal,
      bounds,
      obstacles,
      obstaclePadding,
      segmentSampleStep,
    )
  ) {
    return [goal];
  }

  const width = Math.max(
    1,
    Math.floor((bounds.maxX - bounds.minX) / cellSize) + 1,
  );
  const height = Math.max(
    1,
    Math.floor((bounds.maxZ - bounds.minZ) / cellSize) + 1,
  );

  const blocked = new Array<boolean>(width * height);
  for (let gridZ = 0; gridZ < height; gridZ += 1) {
    for (let gridX = 0; gridX < width; gridX += 1) {
      const point = gridToPoint(gridX, gridZ, bounds, cellSize);
      blocked[gridIndex(gridX, gridZ, width)] = isPointBlocked(
        point,
        bounds,
        obstacles,
        obstaclePadding,
      );
    }
  }

  const startCell = findNearestOpenCell(
    pointToGrid(start, bounds, cellSize),
    width,
    height,
    blocked,
  );
  const goalCell = findNearestOpenCell(
    pointToGrid(goal, bounds, cellSize),
    width,
    height,
    blocked,
  );

  if (!startCell || !goalCell) {
    return null;
  }

  const startIndex = gridIndex(startCell.x, startCell.z, width);
  const goalIndex = gridIndex(goalCell.x, goalCell.z, width);
  const gScore = new Array<number>(width * height).fill(
    Number.POSITIVE_INFINITY,
  );
  const fScore = new Array<number>(width * height).fill(
    Number.POSITIVE_INFINITY,
  );
  const openSet = new Set<number>([startIndex]);
  const cameFrom = new Map<number, number>();

  gScore[startIndex] = 0;
  fScore[startIndex] = heuristic(startCell, goalCell);

  let iterations = 0;
  while (openSet.size > 0 && iterations < maxIterations) {
    iterations += 1;
    const currentIndex = findLowestScore(openSet, fScore);
    if (currentIndex == null) {
      break;
    }

    if (currentIndex === goalIndex) {
      const gridPath = reconstructPath(cameFrom, currentIndex, width);
      const rawPoints = [
        start,
        ...gridPath.map((cell) =>
          gridToPoint(cell.x, cell.z, bounds, cellSize),
        ),
        goal,
      ];
      return smoothPath(
        rawPoints,
        bounds,
        obstacles,
        obstaclePadding,
        segmentSampleStep,
      );
    }

    openSet.delete(currentIndex);
    const currentCell = indexToGrid(currentIndex, width);

    for (const [offsetX, offsetZ] of NEIGHBOR_OFFSETS) {
      const nextX = currentCell.x + offsetX;
      const nextZ = currentCell.z + offsetZ;
      if (nextX < 0 || nextX >= width || nextZ < 0 || nextZ >= height) {
        continue;
      }

      const neighborIndex = gridIndex(nextX, nextZ, width);
      if (blocked[neighborIndex]) {
        continue;
      }

      if (offsetX !== 0 && offsetZ !== 0) {
        const horizontalIndex = gridIndex(
          currentCell.x + offsetX,
          currentCell.z,
          width,
        );
        const verticalIndex = gridIndex(
          currentCell.x,
          currentCell.z + offsetZ,
          width,
        );
        if (blocked[horizontalIndex] || blocked[verticalIndex]) {
          continue;
        }
      }

      const tentativeGScore =
        gScore[currentIndex] + Math.hypot(offsetX, offsetZ);
      if (tentativeGScore >= gScore[neighborIndex]) {
        continue;
      }

      cameFrom.set(neighborIndex, currentIndex);
      gScore[neighborIndex] = tentativeGScore;
      fScore[neighborIndex] =
        tentativeGScore + heuristic({ x: nextX, z: nextZ }, goalCell);
      openSet.add(neighborIndex);
    }
  }

  return null;
}

function toObstacle(
  x: number,
  z: number,
  halfX: number,
  halfZ: number,
  rotationY: number | undefined,
): MovementObstacle {
  return {
    x,
    z,
    halfX,
    halfZ,
    rotationY: rotationY ?? 0,
  };
}

function pointToGrid(
  point: MovementPoint,
  bounds: MovementBounds,
  cellSize: number,
) {
  return {
    x: Math.round((point.x - bounds.minX) / cellSize),
    z: Math.round((point.z - bounds.minZ) / cellSize),
  };
}

function gridToPoint(
  gridX: number,
  gridZ: number,
  bounds: MovementBounds,
  cellSize: number,
): MovementPoint {
  return {
    x: bounds.minX + gridX * cellSize,
    z: bounds.minZ + gridZ * cellSize,
  };
}

function gridIndex(gridX: number, gridZ: number, width: number) {
  return gridZ * width + gridX;
}

function indexToGrid(index: number, width: number) {
  return {
    x: index % width,
    z: Math.floor(index / width),
  };
}

function findLowestScore(openSet: Set<number>, fScore: number[]) {
  let bestIndex: number | null = null;
  let bestScore = Number.POSITIVE_INFINITY;

  for (const index of openSet) {
    if (fScore[index] < bestScore) {
      bestScore = fScore[index];
      bestIndex = index;
    }
  }

  return bestIndex;
}

function heuristic(a: MovementPoint, b: MovementPoint) {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

function reconstructPath(
  cameFrom: Map<number, number>,
  currentIndex: number,
  width: number,
) {
  const path = [indexToGrid(currentIndex, width)];
  let cursor = currentIndex;

  while (cameFrom.has(cursor)) {
    cursor = cameFrom.get(cursor)!;
    path.push(indexToGrid(cursor, width));
  }

  path.reverse();
  return path.slice(1, -1);
}

function smoothPath(
  points: MovementPoint[],
  bounds: MovementBounds,
  obstacles: MovementObstacle[],
  obstaclePadding: number,
  segmentSampleStep: number,
) {
  if (points.length <= 2) {
    return [points[points.length - 1]];
  }

  const result: MovementPoint[] = [];
  let anchorIndex = 0;

  while (anchorIndex < points.length - 1) {
    let nextIndex = points.length - 1;
    while (nextIndex > anchorIndex + 1) {
      if (
        isSegmentClear(
          points[anchorIndex],
          points[nextIndex],
          bounds,
          obstacles,
          obstaclePadding,
          segmentSampleStep,
        )
      ) {
        break;
      }
      nextIndex -= 1;
    }

    result.push(points[nextIndex]);
    anchorIndex = nextIndex;
  }

  return result;
}

function findNearestOpenCell(
  cell: { x: number; z: number },
  width: number,
  height: number,
  blocked: boolean[],
) {
  const clampedX = clamp(cell.x, 0, width - 1);
  const clampedZ = clamp(cell.z, 0, height - 1);
  const startIndex = gridIndex(clampedX, clampedZ, width);
  if (!blocked[startIndex]) {
    return { x: clampedX, z: clampedZ };
  }

  const maxRadius = Math.max(width, height);
  for (let radius = 1; radius < maxRadius; radius += 1) {
    for (let offsetZ = -radius; offsetZ <= radius; offsetZ += 1) {
      for (let offsetX = -radius; offsetX <= radius; offsetX += 1) {
        if (Math.max(Math.abs(offsetX), Math.abs(offsetZ)) !== radius) {
          continue;
        }

        const nextX = clampedX + offsetX;
        const nextZ = clampedZ + offsetZ;
        if (nextX < 0 || nextX >= width || nextZ < 0 || nextZ >= height) {
          continue;
        }

        if (!blocked[gridIndex(nextX, nextZ, width)]) {
          return { x: nextX, z: nextZ };
        }
      }
    }
  }

  return null;
}

function isSegmentClear(
  start: MovementPoint,
  goal: MovementPoint,
  bounds: MovementBounds,
  obstacles: MovementObstacle[],
  obstaclePadding: number,
  segmentSampleStep: number,
) {
  const distance = Math.hypot(goal.x - start.x, goal.z - start.z);
  const samples = Math.max(1, Math.ceil(distance / segmentSampleStep));

  for (let index = 0; index <= samples; index += 1) {
    const t = index / samples;
    const point = {
      x: lerp(start.x, goal.x, t),
      z: lerp(start.z, goal.z, t),
    };

    if (isPointBlocked(point, bounds, obstacles, obstaclePadding)) {
      return false;
    }
  }

  return true;
}

function isPointBlocked(
  point: MovementPoint,
  bounds: MovementBounds,
  obstacles: MovementObstacle[],
  obstaclePadding: number,
) {
  if (
    point.x < bounds.minX ||
    point.x > bounds.maxX ||
    point.z < bounds.minZ ||
    point.z > bounds.maxZ
  ) {
    return true;
  }

  return obstacles.some((obstacle) =>
    isPointInsideObstacle(point, obstacle, obstaclePadding),
  );
}

function isPointInsideObstacle(
  point: MovementPoint,
  obstacle: MovementObstacle,
  obstaclePadding: number,
) {
  const localX = point.x - obstacle.x;
  const localZ = point.z - obstacle.z;
  const cos = Math.cos(-obstacle.rotationY);
  const sin = Math.sin(-obstacle.rotationY);
  const rotatedX = localX * cos - localZ * sin;
  const rotatedZ = localX * sin + localZ * cos;

  return (
    Math.abs(rotatedX) <= obstacle.halfX + obstaclePadding &&
    Math.abs(rotatedZ) <= obstacle.halfZ + obstaclePadding
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function lerp(start: number, end: number, amount: number) {
  return start + (end - start) * amount;
}
