import { describe, expect, it } from "vitest";
import { clampVelocityToRemaining } from "../hooks/useClickToMoveController";
import { detectSlideBlock, NO_SLIDE_BLOCK } from "../hooks/wallSlide";

const DT = 1 / 60;

describe("detectSlideBlock", () => {
  it("sin posición previa no bloquea", () => {
    expect(detectSlideBlock(null, { x: 0, z: 0 }, { vx: 7, vz: 0 }, DT, NO_SLIDE_BLOCK)).toEqual(NO_SLIDE_BLOCK);
  });

  it("sin velocidad previa no bloquea", () => {
    expect(
      detectSlideBlock({ x: 0, z: 0 }, { x: 0, z: 0 }, { vx: 0, vz: 0 }, DT, { x: true, z: true }),
    ).toEqual(NO_SLIDE_BLOCK);
  });

  it("movimiento libre no bloquea", () => {
    expect(
      detectSlideBlock({ x: 0, z: 0 }, { x: 7 * DT, z: 0 }, { vx: 7, vz: 0 }, DT, NO_SLIDE_BLOCK),
    ).toEqual({ x: false, z: false });
  });

  it("en diagonal contra un muro bloquea solo el eje frenado", () => {
    expect(
      detectSlideBlock({ x: 0, z: 0 }, { x: 0.001, z: 7 * DT }, { vx: 7, vz: 7 }, DT, NO_SLIDE_BLOCK),
    ).toEqual({ x: true, z: false });
  });

  it("un frame sin paso de física conserva el resultado anterior", () => {
    const still = { x: 1, z: 2 };
    expect(detectSlideBlock(still, { ...still }, { vx: 7, vz: 0 }, DT, NO_SLIDE_BLOCK)).toEqual(NO_SLIDE_BLOCK);
    const blockedX = { x: true, z: false };
    expect(detectSlideBlock(still, { ...still }, { vx: 7, vz: 7 }, DT, blockedX)).toEqual(blockedX);
  });
});

describe("clampVelocityToRemaining", () => {
  it("lejos del destino no cambia la velocidad", () => {
    expect(clampVelocityToRemaining({ x: 7, z: -21 }, { x: 5, z: -5 }, DT)).toEqual({ x: 7, z: -21 });
  });

  it("cerca del destino limita cada eje para no pasarse en un frame largo", () => {
    const v = clampVelocityToRemaining({ x: 7, z: -21 }, { x: 0.07, z: -0.2 }, 0.07);
    expect(v.x).toBeCloseTo(1);
    expect(v.z).toBeCloseTo(-2.857, 2);
  });

  it("con delta 0 no toca la velocidad", () => {
    expect(clampVelocityToRemaining({ x: 7, z: 0 }, { x: 0.01, z: 0 }, 0)).toEqual({ x: 7, z: 0 });
  });
});
