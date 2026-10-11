import { describe, expect, it } from "vitest";

import {
  ADVENTURE_CHARACTERS,
  ADVENTURE_CONTENT,
  ADVENTURE_DIALOG_KEYS,
  ADVENTURE_EN,
  ADVENTURE_ES,
  ADVENTURE_INITIAL_SCENE_ID,
} from "./index";

/** Todas las cadenas del contenido (recorrido recursivo de los datos). */
function collectStrings(value: unknown, out: Set<string>): void {
  if (typeof value === "string") out.add(value);
  else if (Array.isArray(value)) value.forEach((v) => collectStrings(v, out));
  else if (value && typeof value === "object") Object.values(value).forEach((v) => collectStrings(v, out));
}

describe("textos de la aventura", () => {
  it("es y en tienen exactamente las mismas claves", () => {
    expect(Object.keys(ADVENTURE_EN).sort()).toEqual(Object.keys(ADVENTURE_ES).sort());
    expect(ADVENTURE_DIALOG_KEYS.size).toBe(Object.keys(ADVENTURE_ES).length);
  });

  it("ninguna frase esta vacia", () => {
    for (const dictionary of [ADVENTURE_ES, ADVENTURE_EN]) {
      for (const [key, entry] of Object.entries(dictionary)) {
        expect(entry.phrases.length, key).toBeGreaterThan(0);
        for (const phrase of entry.phrases) expect(phrase.trim(), key).not.toBe("");
      }
    }
  });

  it("toda clave de texto se usa en el contenido (sin textos huerfanos)", () => {
    const used = new Set<string>();
    collectStrings(ADVENTURE_CONTENT.scenes, used);
    collectStrings(ADVENTURE_CONTENT.items, used);
    collectStrings(ADVENTURE_CONTENT.dialogues, used);
    const orphans = [...ADVENTURE_DIALOG_KEYS].filter((key) => !used.has(key));
    expect(orphans).toEqual([]);
  });
});

describe("contenido de la aventura", () => {
  it("la escena inicial es la primera y existe", () => {
    expect(ADVENTURE_CONTENT.scenes.some((s) => s.id === ADVENTURE_INITIAL_SCENE_ID)).toBe(true);
    expect(ADVENTURE_CONTENT.scenes[0]?.id).toBe(ADVENTURE_INITIAL_SCENE_ID);
  });

  it("los 5 escenarios y los 10 items del diseno estan", () => {
    expect(ADVENTURE_CONTENT.scenes.map((s) => s.id)).toEqual([
      "adv-room",
      "adv-town",
      "adv-backlog",
      "adv-engine",
      "adv-heap",
    ]);
    expect(ADVENTURE_CONTENT.items.map((i) => i.id).sort()).toEqual(
      [
        "break",
        "bucket",
        "coffee",
        "coffee-beans",
        "duck-beak",
        "empty-mug",
        "null-pointer",
        "semicolon",
        "sticky-note",
        "valid-pointer",
      ].sort(),
    );
  });

  it("todo NPC con sprite tiene personaje registrado; el Programador es solo voz", () => {
    const needed = new Set<string>();
    for (const scene of ADVENTURE_CONTENT.scenes) {
      for (const npc of scene.npcs ?? []) needed.add(npc.characterId);
    }
    expect([...needed].sort()).toEqual(["glitch", "helix", "programmer"]);
    expect(Object.keys(ADVENTURE_CHARACTERS).sort()).toEqual(["glitch", "helix"]);
  });

  it("el unico call es credits", () => {
    const calls = new Set<string>();
    const walk = (value: unknown): void => {
      if (Array.isArray(value)) value.forEach(walk);
      else if (value && typeof value === "object") {
        const record = value as Record<string, unknown>;
        if (typeof record.call === "string") calls.add(record.call);
        Object.values(record).forEach(walk);
      }
    };
    walk(ADVENTURE_CONTENT.scenes);
    walk(ADVENTURE_CONTENT.items);
    walk(ADVENTURE_CONTENT.dialogues);
    expect([...calls]).toEqual(["credits"]);
  });
});
