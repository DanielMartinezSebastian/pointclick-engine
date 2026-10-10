import { describe, it, expect, vi } from "vitest";
import { decideLeaveScene, resolveUsedTransition } from "../hooks/transitionRules";

const t = { transitionId: "t1", fromSceneId: "a", targetSceneId: "b" };

describe("decideLeaveScene", () => {
  it("permite salir sin regla", () => {
    expect(decideLeaveScene(undefined, t)).toEqual({ allowed: true });
  });
  it("permite salir si la regla devuelve true", () => {
    expect(decideLeaveScene(() => true, t)).toEqual({ allowed: true });
  });
  it("bloquea con texto y clave", () => {
    expect(decideLeaveScene(() => ({ text: "no", dialogKey: "k" }), t)).toEqual({
      allowed: false,
      text: "no",
      dialogKey: "k",
    });
  });
  it("bloquea sin clave", () => {
    expect(decideLeaveScene(() => ({ text: "no" }), t)).toEqual({
      allowed: false,
      text: "no",
      dialogKey: undefined,
    });
  });
  it("pasa la transicion a la regla", () => {
    const rule = vi.fn(() => true as const);
    decideLeaveScene(rule, t);
    expect(rule).toHaveBeenCalledWith(t);
  });
});

describe("resolveUsedTransition", () => {
  const scene = {
    transitions: [
      { id: "x", spawnPosition: [1, 0, 2], targetPosition: [3, 0, 4] },
      { id: "y" },
    ],
  } as never;
  it("devuelve spawn y destino de caminata", () => {
    expect(resolveUsedTransition(scene, "x")).toEqual({
      spawnPosition: [1, 0, 2],
      walkTarget: [3, 0, 4],
    });
  });
  it("transicion sin datos opcionales", () => {
    expect(resolveUsedTransition(scene, "y")).toEqual({
      spawnPosition: undefined,
      walkTarget: undefined,
    });
  });
  it("transicion inexistente o escena sin transiciones", () => {
    expect(resolveUsedTransition(scene, "z").walkTarget).toBeUndefined();
    expect(resolveUsedTransition({} as never, "x").spawnPosition).toBeUndefined();
  });
});
