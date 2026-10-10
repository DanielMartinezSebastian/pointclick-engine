import { describe, expect, test } from "vitest";
import { decideWalkEvent } from "../hooks/walkEventTransition";

const END: [number, number, number] = [3, 0, 4];
const base = { reached: false, endPosition: END, abortedByCore: false } as const;

describe("decideWalkEvent", () => {
  test("sin caminata no emite nada (movimiento manual)", () => {
    expect(decideWalkEvent({ ...base, tracked: null, current: null })).toEqual({ event: null, tracked: null });
  });

  test("al empezar una caminata solo la sigue", () => {
    expect(decideWalkEvent({ ...base, tracked: null, current: "A" })).toEqual({ event: null, tracked: "A" });
  });

  test("a mitad de caminata no emite nada", () => {
    expect(decideWalkEvent({ ...base, tracked: "A", current: "A" })).toEqual({ event: null, tracked: "A" });
  });

  test("llegada: walkCompleted con la posición final y deja de seguir", () => {
    const r = decideWalkEvent({ ...base, tracked: "A", current: "A", reached: true });
    expect(r).toEqual({ event: { type: "player:walkCompleted", position: END }, tracked: null });
  });

  test("tras llegar no vuelve a emitir (ya no se sigue)", () => {
    expect(decideWalkEvent({ ...base, tracked: null, current: null, reached: true }).event).toBeNull();
  });

  test("interrupción por entrada del jugador (por defecto)", () => {
    const r = decideWalkEvent({ ...base, tracked: "A", current: null });
    expect(r).toEqual({ event: { type: "player:walkAborted", reason: "user-input" }, tracked: null });
  });

  test("interrupción por colisión", () => {
    const r = decideWalkEvent({ ...base, tracked: "A", current: null, interruption: "collision" });
    expect(r.event).toEqual({ type: "player:walkAborted", reason: "collision" });
  });

  test("player:stop (el core ya emitió walkAborted): no duplica", () => {
    const r = decideWalkEvent({ ...base, tracked: "A", current: null, abortedByCore: true });
    expect(r).toEqual({ event: null, tracked: null });
  });

  test("sustitución de ruta: walkAborted de la antigua y se sigue la nueva", () => {
    const r = decideWalkEvent({ ...base, tracked: "A", current: "B" });
    expect(r).toEqual({ event: { type: "player:walkAborted", reason: "user-input" }, tracked: "B" });
  });

  test("tras la sustitución, al llegar la nueva se emite walkCompleted", () => {
    const first = decideWalkEvent({ ...base, tracked: "A", current: "B" });
    const done = decideWalkEvent({ ...base, tracked: first.tracked, current: "B", reached: true });
    expect(done.event).toEqual({ type: "player:walkCompleted", position: END });
  });

  test("sustitución avisada ya por el core: no duplica y sigue la nueva", () => {
    const r = decideWalkEvent({ ...base, tracked: "A", current: "B", abortedByCore: true });
    expect(r).toEqual({ event: null, tracked: "B" });
  });
});
