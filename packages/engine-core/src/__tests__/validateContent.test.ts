import { afterEach, describe, expect, it, vi } from "vitest";
import { validateContent, type ContentIssue, type GameContent } from "../game/narrative/validateContent";
import { createGameRuntime } from "../game/runtime/createGameRuntime";
import type { GameItemConfig, GameSceneConfig } from "../game/runtime/types";
import type { DialogueDefinition } from "../game/narrative/dialogueTypes";
import type { Action, Branch } from "../game/narrative/actions";
import type { Condition } from "../game/narrative/conditions";

const rule = { outcome: "return" as const };
const item = (id: string, extra: Partial<GameItemConfig> = {}): GameItemConfig => ({
  id,
  name: id,
  spriteUrl: "",
  interactionRules: {},
  defaultRule: rule,
  ...extra,
});
const scene = (id: string, extra: Partial<GameSceneConfig> = {}): GameSceneConfig => ({
  id,
  label: id,
  background: "",
  playerSpawn: [0, 0, 0],
  ground: {} as GameSceneConfig["ground"],
  walls: [],
  interactions: [],
  ...extra,
});
const hotspot = (id: string, extra: Record<string, unknown> = {}) => ({
  id,
  label: id,
  position: [0, 0, 0] as [number, number, number],
  halfSize: [1, 1, 1] as [number, number, number],
  ...extra,
});
const dlg = (id: string, start: string, nodes: DialogueDefinition["nodes"]): DialogueDefinition => ({
  id,
  start,
  nodes,
});
const drop = (id: string) => ({
  id,
  kind: "drop-target" as const,
  position: [0, 0, 0] as [number, number, number],
  halfSize: [1, 1, 1] as [number, number, number],
  dialogKeys: { hit: "a", miss: "b" },
  label: id,
});
const run = (a: Action[]): Branch[] => [{ do: a }];

const find = (issues: ContentIssue[], code: string) => issues.filter((i) => i.code === code);
const codes = (c: GameContent) => validateContent(c).map((i) => i.code);

/** Contenido completo y coherente: no produce ninguna incidencia. */
function validContent(): GameContent {
  return {
    scenes: [
      scene("town", {
        interactions: [drop("slot")],
        hotspots: [
          hotspot("well", {
            visibleWhen: { not: { flag: "wellBroken" } },
            verbs: { look: run([{ say: "k.well" }]), use: [{ when: { hasItem: "key" }, do: [{ setFlag: "wellBroken" }, { changeScene: "cave" }] }] },
            useItem: { key: run([{ removeItem: "key" }, { giveItem: "coin" }]) },
            useItemDefault: run([{ call: "nope" }]),
          }),
        ],
        npcs: [{ id: "guard", name: "k.guard", characterId: "c", position: [0, 0, 0], dialogueId: "chat" }],
        initialItems: [{ item: { id: "p1", itemId: "key", interactionId: "slot", name: "", spriteUrl: "", worldPosition: [0, 0, 0], canPickup: true }, when: { flag: "wellBroken" } }],
        onEnter: [{ when: { not: { visited: "cave" } }, do: [{ setFlag: "intro" }, { startDialogue: "chat" }] }],
        transitions: [{ id: "t1", kind: "collision", targetSceneId: "cave", position: [0, 0, 0], halfSize: [1, 1, 1], when: { flag: "intro" }, blocked: [{ say: "k.no" }] }],
      }),
      scene("cave", { transitions: [{ id: "back", kind: "collision", targetSceneId: "town", position: [0, 0, 0], halfSize: [1, 1, 1] }] }),
    ],
    items: [item("key", { combine: { coin: run([{ giveItem: "key" }]) } }), item("coin")],
    dialogues: [
      dlg("chat", "a", [
        { id: "a", line: "k.hi", choices: [{ text: "k.c1", next: "b", when: { flag: "intro" } }, { text: "k.c2" }] },
        { id: "b", line: "k.b", do: [{ setFlag: "wellBroken" }], next: "c" },
        { id: "c", line: "k.bye" },
      ]),
    ],
    dialogKeys: new Set(["k.well", "k.guard", "k.no", "k.hi", "k.c1", "k.c2", "k.b", "k.bye", "well", "guard", "town", "cave"]),
    handlers: new Set(["nope"]),
  };
}

describe("validateContent", () => {
  it("un contenido valido no produce incidencias", () => {
    expect(validateContent(validContent())).toEqual([]);
  });

  it("es pura: no muta el contenido", () => {
    const c = validContent();
    const before = JSON.stringify([c.scenes, c.items, c.dialogues]);
    validateContent(c);
    expect(JSON.stringify([c.scenes, c.items, c.dialogues])).toBe(before);
  });

  it("contenido vacio no produce incidencias", () => {
    expect(validateContent({ scenes: [], items: [] })).toEqual([]);
  });

  describe("duplicados", () => {
    it("duplicate-id: escenas, items, dialogos", () => {
      const c = { scenes: [scene("a"), scene("a")], items: [item("i"), item("i")], dialogues: [dlg("d", "n", [{ id: "n", line: "x" }]), dlg("d", "n", [{ id: "n", line: "x" }])] };
      expect(find(validateContent(c), "duplicate-id")).toHaveLength(3);
    });
    it("duplicate-id: hotspot y NPC comparten espacio de ids", () => {
      const s = scene("a", { hotspots: [hotspot("x")], npcs: [{ id: "x", name: "n", characterId: "c", position: [0, 0, 0] }] });
      expect(find(validateContent({ scenes: [s], items: [] }), "duplicate-id")).toHaveLength(1);
    });
    it("duplicate-id: transiciones e interacciones", () => {
      const t = { id: "t", kind: "collision" as const, targetSceneId: "a", position: [0, 0, 0] as [number, number, number], halfSize: [1, 1, 1] as [number, number, number] };
      const s = scene("a", { transitions: [t, t], interactions: [drop("i"), drop("i")] });
      expect(find(validateContent({ scenes: [s], items: [] }), "duplicate-id")).toHaveLength(2);
    });
    it("duplicate-id: nodos de un dialogo", () => {
      const c = { scenes: [], items: [], dialogues: [dlg("d", "n", [{ id: "n", line: "x" }, { id: "n", line: "y" }])] };
      expect(codes(c)).toContain("duplicate-id");
    });
  });

  describe("referencias rotas", () => {
    const withAction = (a: Action): GameContent => ({
      scenes: [scene("a", { hotspots: [hotspot("h", { verbs: { look: run([a]) } })] })],
      items: [item("i")],
    });
    it("unknown-item: giveItem y removeItem", () => {
      expect(find(validateContent(withAction({ giveItem: "ghost" })), "unknown-item")).toHaveLength(1);
      expect(find(validateContent(withAction({ removeItem: "ghost" })), "unknown-item")).toHaveLength(1);
    });
    it("unknown-item: placeItem", () => {
      const a: Action = { placeItem: { id: "p", itemId: "ghost", interactionId: "", name: "", spriteUrl: "", worldPosition: [0, 0, 0], canPickup: true } };
      expect(codes(withAction(a))).toContain("unknown-item");
    });
    it("unknown-scene: changeScene", () => {
      const issues = validateContent(withAction({ changeScene: "nowhere" }));
      expect(find(issues, "unknown-scene")).toHaveLength(1);
      expect(find(issues, "unknown-scene")[0].severity).toBe("error");
    });
    it("unknown-dialogue: startDialogue", () => {
      expect(codes(withAction({ startDialogue: "ghost" }))).toContain("unknown-dialogue");
    });
    it("unknown-dialogue: dialogueId de un NPC", () => {
      const s = scene("a", { npcs: [{ id: "n", name: "n", characterId: "c", position: [0, 0, 0], dialogueId: "ghost" }] });
      const issue = find(validateContent({ scenes: [s], items: [] }), "unknown-dialogue")[0];
      expect(issue.where).toBe("scene:a > npc:n > dialogueId");
    });
    it("placeItem: el interactionId del item es una etiqueta libre y no se valida", () => {
      const a: Action = { placeItem: { id: "p", itemId: "i", interactionId: "ghost", name: "", spriteUrl: "", worldPosition: [0, 0, 0], canPickup: true } };
      expect(codes(withAction(a))).not.toContain("unknown-interaction");
    });
    it("unknown-interaction: condicion itemPlaced.at", () => {
      const c: Condition = { itemPlaced: "i", inScene: "a", at: "ghost" };
      const content: GameContent = { scenes: [scene("a", { hotspots: [hotspot("h", { visibleWhen: c })] })], items: [item("i")] };
      expect(codes(content)).toContain("unknown-interaction");
    });
    it("unknown-interaction: requiresInteractionId de una transicion", () => {
      const t = { id: "t", kind: "item-interaction" as const, requiresItemId: "i", requiresInteractionId: "ghost", targetSceneId: "a", position: [0, 0, 0] as [number, number, number], halfSize: [1, 1, 1] as [number, number, number] };
      expect(codes({ scenes: [scene("a", { transitions: [t] })], items: [item("i")] })).toContain("unknown-interaction");
    });
    it("initialItems: el interactionId del item es una etiqueta libre y no se valida", () => {
      const s = scene("a", { initialItems: [{ item: { id: "p", itemId: "i", interactionId: "ghost", name: "", spriteUrl: "", worldPosition: [0, 0, 0], canPickup: true } }] });
      expect(codes({ scenes: [s], items: [item("i")] })).not.toContain("unknown-interaction");
    });
    it("referencias en condiciones: hasItem, inScene, visited, anidadas", () => {
      const c: Condition = { all: [{ hasItem: "ghost" }, { any: [{ not: { inScene: "ghost" } }, { visited: "ghost" }] }] };
      const content: GameContent = { scenes: [scene("a", { hotspots: [hotspot("h", { visibleWhen: c })] })], items: [] };
      const issues = validateContent(content);
      expect(find(issues, "unknown-item")).toHaveLength(1);
      expect(find(issues, "unknown-scene")).toHaveLength(2);
    });
    it("unknown-item: claves de useItem y de combine, acceptsItemIds, requiresItemId", () => {
      const t = { id: "t", kind: "item-consume" as const, requiresItemId: "g4", targetSceneId: "a", position: [0, 0, 0] as [number, number, number], halfSize: [1, 1, 1] as [number, number, number] };
      const s = scene("a", {
        hotspots: [hotspot("h", { useItem: { g1: run([]) } })],
        interactions: [{ ...drop("d"), acceptsItemIds: ["g3"] }],
        transitions: [t],
      });
      const issues = validateContent({ scenes: [s], items: [item("i", { combine: { g2: run([]) } })] });
      expect(find(issues, "unknown-item")).toHaveLength(4);
    });
    it("unknown-scene: targetSceneId de una transicion", () => {
      const t = { id: "t", kind: "collision" as const, targetSceneId: "ghost", position: [0, 0, 0] as [number, number, number], halfSize: [1, 1, 1] as [number, number, number] };
      expect(find(validateContent({ scenes: [scene("a", { transitions: [t] })], items: [] }), "unknown-scene")[0].where).toBe("scene:a > transition:t > targetSceneId");
    });
    it("recorre when/blocked de transiciones, onEnter y combine", () => {
      const t = { id: "t", kind: "collision" as const, targetSceneId: "a", position: [0, 0, 0] as [number, number, number], halfSize: [1, 1, 1] as [number, number, number], when: { hasItem: "g1" }, blocked: [{ giveItem: "g2" }] };
      const s = scene("a", { transitions: [t], onEnter: run([{ giveItem: "g3" }]) });
      const issues = validateContent({ scenes: [s], items: [item("i", { combine: { i: run([{ giveItem: "g4" }]) } })] });
      expect(find(issues, "unknown-item")).toHaveLength(4);
    });
  });

  describe("forma desconocida", () => {
    it("unknown-verb", () => {
      const s = scene("a", { hotspots: [hotspot("h", { verbs: { shout: run([]) } })] });
      expect(codes({ scenes: [s], items: [] })).toContain("unknown-verb");
    });
    it("unknown-action", () => {
      const s = scene("a", { hotspots: [hotspot("h", { verbs: { look: [{ do: [{ explode: 1 }] }] } })] });
      const issue = find(validateContent({ scenes: [s], items: [] }), "unknown-action")[0];
      expect(issue.where).toBe("scene:a > hotspot:h > verbs.look[0].do[0]");
    });
    it("unknown-condition", () => {
      const s = scene("a", { hotspots: [hotspot("h", { visibleWhen: { wat: 1 } })] });
      expect(codes({ scenes: [s], items: [] })).toContain("unknown-condition");
    });
    it("unknown-branch", () => {
      const s = scene("a", { hotspots: [hotspot("h", { verbs: { look: [null] } })] });
      expect(codes({ scenes: [s], items: [] })).toContain("unknown-branch");
    });
  });

  describe("dialogos", () => {
    it("unknown-dialogue-start", () => {
      const c = { scenes: [], items: [], dialogues: [dlg("d", "ghost", [{ id: "n", line: "x" }])] };
      expect(codes(c)).toContain("unknown-dialogue-start");
    });
    it("unknown-dialogue-node: next de un nodo y de una opcion", () => {
      const d = dlg("d", "n", [{ id: "n", line: "x", next: "g1", choices: [{ text: "t", next: "g2" }] }]);
      const issues = validateContent({ scenes: [], items: [], dialogues: [d] });
      expect(find(issues, "unknown-dialogue-node").map((i) => i.where)).toEqual([
        "dialogue:d > node:n > next",
        "dialogue:d > node:n > choices[0].next",
      ]);
    });
    it("dialogue-dead-end: nodo vacio", () => {
      const d = dlg("d", "n", [{ id: "n", line: "x", next: "m" }, { id: "m" }]);
      expect(find(validateContent({ scenes: [], items: [], dialogues: [d] }), "dialogue-dead-end")[0].severity).toBe("error");
    });
    it("un nodo final con linea no es dead-end", () => {
      const d = dlg("d", "n", [{ id: "n", line: "x" }]);
      expect(codes({ scenes: [], items: [], dialogues: [d] })).not.toContain("dialogue-dead-end");
    });
    it("unreachable-dialogue-node (aviso)", () => {
      const d = dlg("d", "n", [{ id: "n", line: "x" }, { id: "orphan", line: "y" }]);
      const issue = find(validateContent({ scenes: [], items: [], dialogues: [d] }), "unreachable-dialogue-node")[0];
      expect(issue).toMatchObject({ severity: "warning", where: "dialogue:d > node:orphan" });
    });
    it("recorre when/do de las opciones", () => {
      const d = dlg("d", "n", [{ id: "n", choices: [{ text: "t", when: { hasItem: "g1" }, do: [{ giveItem: "g2" }] }] }]);
      expect(find(validateContent({ scenes: [], items: [], dialogues: [d] }), "unknown-item")).toHaveLength(2);
    });
  });

  describe("avisos", () => {
    it("unreachable-scene", () => {
      const issues = validateContent({ scenes: [scene("a"), scene("b")], items: [] });
      expect(find(issues, "unreachable-scene")).toEqual([expect.objectContaining({ severity: "warning", where: "scene:b" })]);
    });
    it("una escena alcanzable solo por un dialogo no se avisa", () => {
      const d = dlg("d", "n", [{ id: "n", do: [{ changeScene: "b" }] }]);
      expect(codes({ scenes: [scene("a"), scene("b")], items: [], dialogues: [d] })).not.toContain("unreachable-scene");
    });
    it("una sola escena no avisa", () => {
      expect(codes({ scenes: [scene("a")], items: [] })).not.toContain("unreachable-scene");
    });
    it("unused-item", () => {
      const issues = validateContent({ scenes: [scene("a")], items: [item("lonely")] });
      expect(find(issues, "unused-item")).toEqual([expect.objectContaining({ severity: "warning", where: "item:lonely" })]);
    });
    it("un item dado por un guion no es unused-item", () => {
      const s = scene("a", { onEnter: run([{ giveItem: "i" }]) });
      expect(codes({ scenes: [s], items: [item("i")] })).not.toContain("unused-item");
    });
    it("flag-never-set", () => {
      const s = scene("a", { hotspots: [hotspot("h", { visibleWhen: { flag: "x" } })] });
      expect(find(validateContent({ scenes: [s], items: [] }), "flag-never-set")).toEqual([expect.objectContaining({ severity: "warning" })]);
    });
    it("flag-never-read", () => {
      const s = scene("a", { onEnter: run([{ setFlag: "x" }]) });
      expect(find(validateContent({ scenes: [s], items: [] }), "flag-never-read")).toEqual([expect.objectContaining({ severity: "warning" })]);
    });
    it("un flag escrito y leido no avisa", () => {
      const s = scene("a", { onEnter: [{ when: { flag: "x" }, do: [{ setFlag: "x" }] }] });
      const c = codes({ scenes: [s], items: [] });
      expect(c).not.toContain("flag-never-set");
      expect(c).not.toContain("flag-never-read");
    });
    it("unknown-dialog-key solo si se pasa dialogKeys", () => {
      const s = scene("a", { onEnter: run([{ say: "k.missing" }]) });
      expect(codes({ scenes: [s], items: [] })).not.toContain("unknown-dialog-key");
      const issues = validateContent({ scenes: [s], items: [], dialogKeys: new Set(["a"]) });
      expect(find(issues, "unknown-dialog-key")[0]).toMatchObject({ severity: "warning", where: "scene:a > onEnter[0].do[0].say" });
    });
    it("unknown-dialog-key en line y text de dialogos, label de hotspots", () => {
      const d = dlg("d", "n", [{ id: "n", line: "k.l", choices: [{ text: "k.t" }] }]);
      const s = scene("a", { hotspots: [hotspot("h", { label: "k.label" })] });
      const issues = validateContent({ scenes: [s], items: [], dialogues: [d], dialogKeys: new Set() });
      expect(find(issues, "unknown-dialog-key")).toHaveLength(3);
    });
    it("unknown-handler solo si se pasa handlers", () => {
      const s = scene("a", { onEnter: run([{ call: "mystery" }]) });
      expect(codes({ scenes: [s], items: [] })).not.toContain("unknown-handler");
      const issues = validateContent({ scenes: [s], items: [], handlers: new Set(["other"]) });
      expect(find(issues, "unknown-handler")).toEqual([expect.objectContaining({ severity: "warning" })]);
    });
  });

  it("where permite localizar el dato", () => {
    const s = scene("town", { hotspots: [hotspot("well", { verbs: { use: [{ do: [{ say: "x" }, { setFlag: "a" }, { giveItem: "ghost" }] }] } })] });
    expect(find(validateContent({ scenes: [s], items: [] }), "unknown-item")[0].where).toBe("scene:town > hotspot:well > verbs.use[0].do[2].giveItem");
  });
});

describe("createGameRuntime validate", () => {
  afterEach(() => vi.restoreAllMocks());
  const broken = (): GameSceneConfig => scene("vsc", { onEnter: run([{ giveItem: "ghost" }, { changeScene: "ghost" }]) });

  it("por defecto no valida fuera de desarrollo (NODE_ENV=test)", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    createGameRuntime({ scenes: [broken()] }).dispose();
    expect(warn).not.toHaveBeenCalled();
  });

  it("validate: true avisa con un unico console.warn agrupado", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    createGameRuntime({ scenes: [broken()], validate: true }).dispose();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0][0])).toContain("unknown-item");
    expect(String(warn.mock.calls[0][0])).toContain("unknown-scene");
  });

  it("validate: 'throw' lanza si hay errores", () => {
    expect(() => createGameRuntime({ scenes: [broken()], validate: "throw" })).toThrow(/unknown-item/);
  });

  it("validate: 'throw' no lanza sin errores", () => {
    const rt = createGameRuntime({ scenes: [scene("ok")], validate: "throw" });
    rt.dispose();
  });

  it("validate: false no valida", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    createGameRuntime({ scenes: [broken()], validate: false }).dispose();
    expect(warn).not.toHaveBeenCalled();
  });

  it("en desarrollo valida por defecto", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubEnv("NODE_ENV", "development");
    try {
      createGameRuntime({ scenes: [broken()] }).dispose();
    } finally {
      vi.unstubAllEnvs();
    }
    expect(warn).toHaveBeenCalledTimes(1);
  });
});
