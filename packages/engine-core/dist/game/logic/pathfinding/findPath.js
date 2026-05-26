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
];
export function findPath({ start, goal, bounds, walls, interactions, cellSize = DEFAULT_CELL_SIZE, obstaclePadding = DEFAULT_OBSTACLE_PADDING, segmentSampleStep = DEFAULT_SEGMENT_SAMPLE_STEP, maxIterations = DEFAULT_MAX_ITERATIONS, }) {
    const obstacles = [
        ...walls.map((wall) => toObstacle(wall.position[0], wall.position[2], wall.halfSize[0], wall.halfSize[2], wall.rotationY)),
        ...interactions
            .filter((interaction) => interaction.hasCollision)
            .map((interaction) => toObstacle(interaction.position[0], interaction.position[2], interaction.halfSize[0], interaction.halfSize[2], interaction.rotationY ?? 0)),
    ];
    if (isSegmentClear(start, goal, bounds, obstacles, obstaclePadding, segmentSampleStep)) {
        return [goal];
    }
    const width = Math.max(1, Math.floor((bounds.maxX - bounds.minX) / cellSize) + 1);
    const height = Math.max(1, Math.floor((bounds.maxZ - bounds.minZ) / cellSize) + 1);
    const blocked = new Array(width * height);
    for (let gridZ = 0; gridZ < height; gridZ += 1) {
        for (let gridX = 0; gridX < width; gridX += 1) {
            const point = gridToPoint(gridX, gridZ, bounds, cellSize);
            blocked[gridIndex(gridX, gridZ, width)] = isPointBlocked(point, bounds, obstacles, obstaclePadding);
        }
    }
    const startCell = findNearestOpenCell(pointToGrid(start, bounds, cellSize), width, height, blocked);
    const goalCell = findNearestOpenCell(pointToGrid(goal, bounds, cellSize), width, height, blocked);
    if (!startCell || !goalCell) {
        return null;
    }
    const startIndex = gridIndex(startCell.x, startCell.z, width);
    const goalIndex = gridIndex(goalCell.x, goalCell.z, width);
    const gScore = new Array(width * height).fill(Number.POSITIVE_INFINITY);
    const fScore = new Array(width * height).fill(Number.POSITIVE_INFINITY);
    const openSet = new Set([startIndex]);
    const cameFrom = new Map();
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
                ...gridPath.map((cell) => gridToPoint(cell.x, cell.z, bounds, cellSize)),
                goal,
            ];
            return smoothPath(rawPoints, bounds, obstacles, obstaclePadding, segmentSampleStep);
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
                const horizontalIndex = gridIndex(currentCell.x + offsetX, currentCell.z, width);
                const verticalIndex = gridIndex(currentCell.x, currentCell.z + offsetZ, width);
                if (blocked[horizontalIndex] || blocked[verticalIndex]) {
                    continue;
                }
            }
            const tentativeGScore = gScore[currentIndex] + Math.hypot(offsetX, offsetZ);
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
function toObstacle(x, z, halfX, halfZ, rotationY) {
    return {
        x,
        z,
        halfX,
        halfZ,
        rotationY: rotationY ?? 0,
    };
}
function pointToGrid(point, bounds, cellSize) {
    return {
        x: Math.round((point.x - bounds.minX) / cellSize),
        z: Math.round((point.z - bounds.minZ) / cellSize),
    };
}
function gridToPoint(gridX, gridZ, bounds, cellSize) {
    return {
        x: bounds.minX + gridX * cellSize,
        z: bounds.minZ + gridZ * cellSize,
    };
}
function gridIndex(gridX, gridZ, width) {
    return gridZ * width + gridX;
}
function indexToGrid(index, width) {
    return {
        x: index % width,
        z: Math.floor(index / width),
    };
}
function findLowestScore(openSet, fScore) {
    let bestIndex = null;
    let bestScore = Number.POSITIVE_INFINITY;
    for (const index of openSet) {
        if (fScore[index] < bestScore) {
            bestScore = fScore[index];
            bestIndex = index;
        }
    }
    return bestIndex;
}
function heuristic(a, b) {
    return Math.hypot(a.x - b.x, a.z - b.z);
}
function reconstructPath(cameFrom, currentIndex, width) {
    const path = [indexToGrid(currentIndex, width)];
    let cursor = currentIndex;
    while (cameFrom.has(cursor)) {
        cursor = cameFrom.get(cursor);
        path.push(indexToGrid(cursor, width));
    }
    path.reverse();
    return path.slice(1, -1);
}
function smoothPath(points, bounds, obstacles, obstaclePadding, segmentSampleStep) {
    if (points.length <= 2) {
        return [points[points.length - 1]];
    }
    const result = [];
    let anchorIndex = 0;
    while (anchorIndex < points.length - 1) {
        let nextIndex = points.length - 1;
        while (nextIndex > anchorIndex + 1) {
            if (isSegmentClear(points[anchorIndex], points[nextIndex], bounds, obstacles, obstaclePadding, segmentSampleStep)) {
                break;
            }
            nextIndex -= 1;
        }
        result.push(points[nextIndex]);
        anchorIndex = nextIndex;
    }
    return result;
}
function findNearestOpenCell(cell, width, height, blocked) {
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
function isSegmentClear(start, goal, bounds, obstacles, obstaclePadding, segmentSampleStep) {
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
function isPointBlocked(point, bounds, obstacles, obstaclePadding) {
    if (point.x < bounds.minX ||
        point.x > bounds.maxX ||
        point.z < bounds.minZ ||
        point.z > bounds.maxZ) {
        return true;
    }
    return obstacles.some((obstacle) => isPointInsideObstacle(point, obstacle, obstaclePadding));
}
function isPointInsideObstacle(point, obstacle, obstaclePadding) {
    const localX = point.x - obstacle.x;
    const localZ = point.z - obstacle.z;
    const cos = Math.cos(-obstacle.rotationY);
    const sin = Math.sin(-obstacle.rotationY);
    const rotatedX = localX * cos - localZ * sin;
    const rotatedZ = localX * sin + localZ * cos;
    return (Math.abs(rotatedX) <= obstacle.halfX + obstaclePadding &&
        Math.abs(rotatedZ) <= obstacle.halfZ + obstaclePadding);
}
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
function lerp(start, end, amount) {
    return start + (end - start) * amount;
}
//# sourceMappingURL=findPath.js.map