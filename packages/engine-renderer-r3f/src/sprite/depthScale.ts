import { MathUtils } from "three";

import { DEFAULT_CHARACTER_SIZE } from "./character";

/** Z del mundo donde el sprite tiene el tamano minimo / maximo del personaje. */
export const DEPTH_FAR_Z = -16;
export const DEPTH_NEAR_Z = 8;

/**
 * Escala del sprite segun la profundidad (`z`). Es la formula del jugador: un NPC
 * con el mismo `size` y la misma `z` tiene exactamente el mismo tamano.
 */
export function spriteScaleAtDepth(
  z: number,
  size: readonly [number, number] = DEFAULT_CHARACTER_SIZE,
): number {
  const depthFactor = MathUtils.clamp(MathUtils.inverseLerp(DEPTH_FAR_Z, DEPTH_NEAR_Z, z), 0, 1);
  return MathUtils.lerp(size[0], size[1], depthFactor);
}
