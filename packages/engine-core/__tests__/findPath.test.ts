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

  it("atraviesa un muro con opening suficientemente grande (Phase 6)", () => {
    // Horizontal E-W wall at z=5 blocks N-S movement.
    // Central opening (halfZ wider than wall_halfZ + padding) allows direct traversal.
    // Opening halfZ (0.5) - padding (0.1) = 0.4 > wall halfZ (0.2) + padding (0.1) = 0.3
    // → opening covers the full wall thickness → direct segment is clear.
    const route = findPath({
      start: { x: 5, z: 2 },
      goal: { x: 5, z: 8 },
      bounds,
      walls: [
        {
          position: [5, 0, 5],
          halfSize: [2.5, 2, 0.2], // wide E-W wall, thin in N-S direction
          rotationY: 0,
          openings: [
            {
              id: "door-1",
              position: [0, 0, 0], // centered in wall
              halfSize: [0.8, 2, 0.5], // opening wider than wall thickness + padding
            },
          ],
        },
      ],
      interactions: [],
      obstaclePadding: 0.1,
      cellSize: 0.5,
      segmentSampleStep: 0.1,
    });

    expect(route).not.toBeNull();
    expect(route![route!.length - 1]).toEqual({ x: 5, z: 8 });
  });

  it("mismo muro sin opening bloquea el camino directo (Phase 6)", () => {
    // Same E-W wall, but NO opening → direct path is blocked.
    // Wall spans x=[2.4, 7.6] so agent can go around the ends.
    const route = findPath({
      start: { x: 5, z: 2 },
      goal: { x: 5, z: 8 },
      bounds,
      walls: [
        {
          position: [5, 0, 5],
          halfSize: [2.5, 2, 0.2],
          rotationY: 0,
          // No opening → solid wall
        },
      ],
      interactions: [],
      obstaclePadding: 0.1,
      cellSize: 0.5,
      segmentSampleStep: 0.1,
    });

    // Some path exists (wall doesn't seal the full bounds)
    expect(route).not.toBeNull();
    // Path must detour around the wall — no point should cross z≈5 near x=5
    const goesThrough = route!.some(
      (p) => Math.abs(p.x - 5) <= 0.3 && Math.abs(p.z - 5) <= 0.3,
    );
    expect(goesThrough).toBe(false);
  });

  it("muro sin openings sigue siendo solido (backward compatible, Phase 6)", () => {
    // Existing wall config (no new fields) — behavior unchanged
    const routeAround = findPath({
      start: { x: 1, z: 5 },
      goal: { x: 9, z: 5 },
      bounds,
      walls: [
        {
          position: [5, 0, 5],
          halfSize: [0.8, 2, 2.2],
          rotationY: 0,
          // No openings → solid wall (backward compat)
        },
      ],
      interactions: [],
      obstaclePadding: 0.1,
      cellSize: 1,
      segmentSampleStep: 0.2,
    });

    expect(routeAround).not.toBeNull();
    expect(routeAround!.some((point) => point.z !== 5)).toBe(true);
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
