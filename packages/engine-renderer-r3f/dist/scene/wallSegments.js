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
export function computeWallSegments(halfSize, openings = []) {
    const [halfX, halfY, halfZ] = halfSize;
    if (openings.length === 0) {
        return [{ position: [0, 0, 0], halfSize: [halfX, halfY, halfZ] }];
    }
    // ── X boundaries ────────────────────────────────────────────────────────────
    const xBounds = new Set([-halfX, halfX]);
    for (const op of openings) {
        xBounds.add(clamp(op.position[0] - op.halfSize[0], -halfX, halfX));
        xBounds.add(clamp(op.position[0] + op.halfSize[0], -halfX, halfX));
    }
    const xSorted = [...xBounds].sort((a, b) => a - b);
    const segments = [];
    for (let xi = 0; xi < xSorted.length - 1; xi++) {
        const x0 = xSorted[xi];
        const x1 = xSorted[xi + 1];
        if (x1 - x0 < 1e-4)
            continue;
        const cx = (x0 + x1) / 2;
        const hx = (x1 - x0) / 2;
        // Openings that fully span this X interval.
        const covering = openings.filter((op) => {
            const oLeft = op.position[0] - op.halfSize[0];
            const oRight = op.position[0] + op.halfSize[0];
            return oLeft <= x0 + 1e-4 && oRight >= x1 - 1e-4;
        });
        if (covering.length === 0) {
            segments.push({ position: [cx, 0, 0], halfSize: [hx, halfY, halfZ] });
            continue;
        }
        // ── Y boundaries within this X column ───────────────────────────────────
        const yBounds = new Set([-halfY, halfY]);
        for (const op of covering) {
            yBounds.add(clamp(op.position[1] - op.halfSize[1], -halfY, halfY));
            yBounds.add(clamp(op.position[1] + op.halfSize[1], -halfY, halfY));
        }
        const ySorted = [...yBounds].sort((a, b) => a - b);
        for (let yi = 0; yi < ySorted.length - 1; yi++) {
            const y0 = ySorted[yi];
            const y1 = ySorted[yi + 1];
            if (y1 - y0 < 1e-4)
                continue;
            const cy = (y0 + y1) / 2;
            const hy = (y1 - y0) / 2;
            // Hole if any covering opening fully spans this Y interval.
            const isHole = covering.some((op) => {
                const oBot = op.position[1] - op.halfSize[1];
                const oTop = op.position[1] + op.halfSize[1];
                return oBot <= y0 + 1e-4 && oTop >= y1 - 1e-4;
            });
            if (!isHole) {
                segments.push({ position: [cx, cy, 0], halfSize: [hx, hy, halfZ] });
            }
        }
    }
    return segments;
}
function clamp(v, min, max) {
    return Math.min(Math.max(v, min), max);
}
//# sourceMappingURL=wallSegments.js.map