import { describe, expect, it } from "vitest";

import { findPath } from "../src/game/logic/pathfinding/findPath";

describe("findPath", () => {
  const bounds = {
    minX: 0,
    maxX: 10,
    minZ: 0,
    maxZ: 10,
    y: 0,
  };

  it("devuelve ruta directa cuando no hay obstaculos", () => {
    const route = findPath({
      start: { x: 1, z: 1 },
      goal: { x: 9, z: 9 },
      bounds,
      walls: [],
      interactions: [],
      obstaclePadding: 0,
      cellSize: 1,
    });

    expect(route).toEqual([{ x: 9, z: 9 }]);
  });

  it("evita un muro central bloqueante", () => {
    const route = findPath({
      start: { x: 1, z: 5 },
      goal: { x: 9, z: 5 },
      bounds,
      walls: [
        {
          position: [5, 0, 5],
          halfSize: [0.8, 2, 2.2],
          rotationY: 0,
        },
      ],
      interactions: [],
      obstaclePadding: 0.1,
      cellSize: 1,
      segmentSampleStep: 0.2,
    });

    expect(route).not.toBeNull();
    expect(route!.length).toBeGreaterThan(1);
    expect(route![route!.length - 1]).toEqual({ x: 9, z: 5 });
    expect(route!.some((point) => point.z !== 5)).toBe(true);
  });

  it("retorna null cuando inicio y objetivo estan sellados", () => {
    const route = findPath({
      start: { x: 5, z: 5 },
      goal: { x: 8, z: 8 },
      bounds,
      walls: [
        {
          position: [5, 0, 5],
          halfSize: [6, 2, 6],
          rotationY: 0,
        },
      ],
      interactions: [
        {
          position: [8, 0, 8],
          halfSize: [1, 1, 1],
          hasCollision: true,
        },
      ],
      obstaclePadding: 0.5,
      cellSize: 1,
      maxIterations: 200,
    });

    expect(route).toBeNull();
  });
});
