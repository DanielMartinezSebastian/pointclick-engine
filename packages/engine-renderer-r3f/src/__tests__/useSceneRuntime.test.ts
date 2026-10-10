import { describe, it, expect } from "vitest";
import { resolveInitialSceneId } from "../hooks/useSceneRuntime";

const has = (...ids: string[]) => (id: string) => ids.includes(id);

describe("resolveInitialSceneId", () => {
  it("usa el id guardado si existe", () => {
    expect(
      resolveInitialSceneId({ savedId: "town", initialSceneId: "room", hasScene: has("town", "room") }),
    ).toBe("town");
  });
  it("cae a la inicial si el guardado no existe", () => {
    expect(
      resolveInitialSceneId({ savedId: "ghost", initialSceneId: "room", hasScene: has("room") }),
    ).toBe("room");
  });
  it("usa la inicial si no hay guardado", () => {
    expect(
      resolveInitialSceneId({ savedId: null, initialSceneId: "room", hasScene: has("room") }),
    ).toBe("room");
  });
  it("usa el guardado si no hay inicial y existe", () => {
    expect(
      resolveInitialSceneId({ savedId: "town", initialSceneId: undefined, hasScene: has("town") }),
    ).toBe("town");
  });
  it("devuelve null sin guardado ni inicial", () => {
    expect(
      resolveInitialSceneId({ savedId: null, initialSceneId: undefined, hasScene: has("town") }),
    ).toBeNull();
  });
  it("devuelve null si ni guardada ni inicial existen", () => {
    expect(
      resolveInitialSceneId({ savedId: "a", initialSceneId: "b", hasScene: has() }),
    ).toBeNull();
  });
});
