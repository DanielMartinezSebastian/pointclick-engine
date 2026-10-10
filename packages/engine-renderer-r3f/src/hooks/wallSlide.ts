export type SlideBlock = { x: boolean; z: boolean };

export const NO_SLIDE_BLOCK: SlideBlock = { x: false, z: false };

type Point = { x: number; z: number };

/**
 * Wall-slide detection: compares the velocity set last frame against the
 * displacement the physics actually produced. An axis that barely moved
 * relative to what was expected is blocked by a rigid body.
 *
 * Physics runs at a fixed timestep, so a render frame can arrive with no
 * physics step in between (high refresh-rate displays, uneven frame times).
 * The body then has not moved at all, which says nothing about walls: in that
 * case the previous result is kept instead of reporting both axes as blocked.
 */
export function detectSlideBlock(
  previousPosition: Point | null,
  position: Point,
  previousVelocity: { vx: number; vz: number },
  delta: number,
  previous: SlideBlock,
): SlideBlock {
  const { vx, vz } = previousVelocity;
  if (!previousPosition || (Math.abs(vx) <= 0.3 && Math.abs(vz) <= 0.3)) {
    return NO_SLIDE_BLOCK;
  }
  const adx = position.x - previousPosition.x;
  const adz = position.z - previousPosition.z;
  if (adx === 0 && adz === 0) return previous;
  // Expected displacement (approximated with the current delta: consecutive
  // frame durations are close enough for this heuristic).
  const edx = vx * delta;
  const edz = vz * delta;
  return {
    x: Math.abs(edx) > 0.002 && Math.abs(adx) < Math.abs(edx) * 0.25,
    z: Math.abs(edz) > 0.002 && Math.abs(adz) < Math.abs(edz) * 0.25,
  };
}
