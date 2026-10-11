import { describe, expect, it } from "vitest";
import { validateContent } from "@pointclick-engine/engine-core";

import { DEMO_RUNTIME_CONFIG } from "../app/lib/engine/runtime/demoViewportOptions";

describe("contenido de la demo", () => {
  it("pasa validateContent sin errores", () => {
    const issues = validateContent({
      scenes: DEMO_RUNTIME_CONFIG.scenes ?? [],
      items: DEMO_RUNTIME_CONFIG.items ?? [],
      ...(DEMO_RUNTIME_CONFIG.dialogues ? { dialogues: DEMO_RUNTIME_CONFIG.dialogues } : {}),
      ...(DEMO_RUNTIME_CONFIG.dialogKeys ? { dialogKeys: DEMO_RUNTIME_CONFIG.dialogKeys } : {}),
    });
    const errors = issues.filter((i) => i.severity === "error");
    expect(errors).toEqual([]);
  });
});
