import { afterEach, describe, expect, it, vi } from "vitest";
import { validateContent, type GameSnapshot } from "../index";
import { createPlaythrough, type Playthrough } from "../testing";
import { miniAdventure } from "./fixtures/miniAdventure";

let pt: Playthrough | null = null;
let credits: unknown[] = [];

/** Nueva partida del fixture con el manejador `credits` registrado y los bocadillos anotados. */
function start(snapshot?: GameSnapshot) {
  const said: string[] = [];
  const p = createPlaythrough(miniAdventure, {
    handlers: { credits: (args) => void credits.push(args) },
    onRuntime: (rt) =>
      void rt.on("dialog:triggered", (e) => {
        if (e.dialogKey) said.push(e.dialogKey);
      }),
    ...(snapshot ? { snapshot } : {}),
  });
  pt = p;
  return { p, said };
}

afterEach(() => {
  pt?.dispose();
  pt = null;
  credits = [];
  vi.restoreAllMocks();
});

/** Resuelve los puzzles 1 a 3 (llave, cofre, mapa, pescador, combinar). */
async function untilLamp(p: Playthrough) {
  await p.pickUp("key-on-sand");
  await p.useItemOn("rusty-key", "chest");
  await p.look("map");
  await p.talk("fisherman");
  await p.choose(0);
  await p.choose(2);
  await p.combine("lens", "lamp-frame");
}

describe("mini-adventure: contenido", () => {
  it("validateContent no da errores ni avisos", () => {
    expect(validateContent(miniAdventure)).toEqual([]);
  });

  it("un contenido roto lanza al crear la partida", () => {
    const broken = { ...miniAdventure, items: miniAdventure.items.slice(1) };
    expect(() => createPlaythrough(broken)).toThrow(/validateContent/);
  });
});

describe("mini-adventure: recorrido completo", () => {
  it("se resuelve de principio a fin sin renderer", async () => {
    const t0 = performance.now();
    const { p, said } = start();
    await p.settle();
    expect(p.state().sceneId).toBe("beach");
    expect(said).toEqual(["beach.intro"]);
    expect(p.state().flags["intro.done"]).toBe(true);

    // Puzzle 1: recoger y usar.
    await p.pickUp("key-on-sand");
    expect(p.state().inventory).toEqual(["rusty-key"]);
    await p.useItemOn("rusty-key", "chest");
    expect(p.state().inventory).toEqual(["lens"]);
    expect(p.state().flags["chest.open"]).toBe(true);

    // Puzzle 2: conversacion condicionada por haber mirado el mapa.
    await p.look("map");
    expect(p.state().flags["map.seen"]).toBe(true);
    await p.talk("fisherman");
    expect(p.state().dialogueActive).toBe(true);
    await p.choose(0);
    expect(p.state().inventory).toEqual(["lens", "lamp-frame"]);
    expect(p.state().dialogueActive).toBe(true);
    await p.choose(2);
    expect(p.state().dialogueActive).toBe(false);

    // Puzzle 3: combinar.
    await p.combine("lens", "lamp-frame");
    expect(p.state().inventory).toEqual(["lamp"]);

    // Cambio de escena: siembra con `when` y pickUp en otra escena.
    await p.goThrough("to-cove");
    expect(p.state().sceneId).toBe("cove");
    await p.pickUp("fish-on-rocks");
    expect(p.state().inventory).toEqual(["lamp", "fish"]);

    // Puzzle 4: intercambio con el guardian y transicion final.
    await p.useItemOn("lamp", "keeper");
    expect(p.state().inventory).toEqual(["fish"]);
    expect(p.state().flags["keeper.lit"]).toBe(true);
    await p.goThrough("to-lighthouse");
    expect(p.state().sceneId).toBe("lighthouse");
    expect(p.state().flags["game.finished"]).toBe(true);
    expect(credits).toEqual([{ ending: "good" }]);
    expect(said).toContain("lighthouse.ending");
    await p.look("beacon");
    expect(said.at(-1)).toBe("beacon.on");

    const elapsed = performance.now() - t0;
    console.log(`[playthrough] recorrido completo: ${elapsed.toFixed(1)} ms`);
    expect(elapsed).toBeLessThan(1000);
  });

  it("el onEnter con flag solo se dispara la primera vez", async () => {
    const { p, said } = start();
    await p.settle();
    await p.goThrough("to-cove");
    await p.goThrough("to-beach");
    expect(p.state().sceneId).toBe("beach");
    expect(said.filter((k) => k === "beach.intro")).toHaveLength(1);
  });

  it("la opcion once desaparece tras elegirla y la siembra no se repite", async () => {
    const { p } = start();
    await p.settle();
    await p.talk("fisherman");
    expect(p.state().dialogueActive).toBe(true);
    await p.choose(1); // saludo, once
    await expect(p.choose(1)).rejects.toThrow(/no disponible/);
    await p.choose(2);
    // La llave sigue en la arena una sola vez aunque se reentre en la escena.
    await p.goThrough("to-cove");
    await p.goThrough("to-beach");
    await p.pickUp("key-on-sand");
    expect(p.state().inventory).toEqual(["rusty-key"]);
    await p.pickUp("key-on-sand");
    expect(p.state().inventory).toEqual(["rusty-key"]);
  });
});

describe("mini-adventure: orden equivocado", () => {
  it("usar la llave sin tenerla no abre el cofre", async () => {
    const { p } = start();
    await p.settle();
    await p.useItemOn("rusty-key", "chest");
    expect(p.state().flags["chest.open"]).toBeUndefined();
    expect(p.state().inventory).toEqual([]);
  });

  it("el cofre cerrado solo dice que esta cerrado; un item cualquiera no lo abre", async () => {
    const { p, said } = start();
    await p.settle();
    await p.use("chest");
    expect(said.at(-1)).toBe("chest.locked");
    await p.goThrough("to-cove");
    await p.pickUp("fish-on-rocks");
    await p.goThrough("to-beach");
    await p.useItemOn("fish", "chest");
    expect(said.at(-1)).toBe("chest.nothing");
    expect(p.state().flags["chest.open"]).toBeUndefined();
  });

  it("el pescador no ofrece la pista antes de mirar el mapa", async () => {
    const { p } = start();
    await p.settle();
    await p.talk("fisherman");
    await expect(p.choose(0)).rejects.toThrow(/no disponible/);
    await p.choose(2);
    expect(p.state().inventory).toEqual([]);
    // Tras mirar el mapa, la misma opcion ya aparece.
    await p.look("map");
    await p.talk("fisherman");
    await p.choose(0);
    expect(p.state().inventory).toEqual(["lamp-frame"]);
  });

  it("combinar sin los dos items, o items sin regla, no produce nada", async () => {
    const { p } = start();
    await p.settle();
    await p.combine("lens", "lamp-frame");
    expect(p.state().inventory).toEqual([]);
    await p.pickUp("key-on-sand");
    await p.goThrough("to-cove");
    await p.pickUp("fish-on-rocks");
    await p.combine("rusty-key", "fish");
    expect(p.state().inventory).toEqual(["rusty-key", "fish"]);
  });

  it("la transicion final esta bloqueada sin el guardian y corre `blocked`", async () => {
    const { p, said } = start();
    await p.settle();
    await p.goThrough("to-cove");
    await p.goThrough("to-lighthouse");
    expect(p.state().sceneId).toBe("cove");
    expect(said.at(-1)).toBe("lighthouse.locked");
    expect(p.state().flags["game.finished"]).toBeUndefined();
    // Dar al guardian otra cosa que la lampara no abre el paso.
    await p.pickUp("fish-on-rocks");
    await p.useItemOn("fish", "keeper");
    await p.goThrough("to-lighthouse");
    expect(p.state().sceneId).toBe("cove");
    expect(credits).toEqual([]);
  });

  it("no se puede recoger un item de otra escena ni cruzar una transicion inexistente", async () => {
    const { p } = start();
    await p.settle();
    await p.goThrough("to-cove");
    await p.pickUp("key-on-sand");
    expect(p.state().inventory).toEqual([]);
    await expect(p.goThrough("nope")).rejects.toThrow(/no tiene la transicion/);
  });
});

describe("mini-adventure: guardar y retomar", () => {
  it("una partida nueva desde la instantanea a mitad termina el juego", async () => {
    const first = start();
    await first.p.settle();
    await untilLamp(first.p);
    await first.p.goThrough("to-cove");
    const snapshot = first.p.save();
    expect(snapshot.sceneId).toBe("cove");
    first.p.dispose();

    const { p, said } = start(snapshot);
    // Restaurar no vuelve a correr ningun onEnter.
    await p.settle();
    expect(said).toEqual([]);
    expect(p.state()).toMatchObject({ sceneId: "cove", inventory: ["lamp"], dialogueActive: false });
    expect(p.state().flags["map.seen"]).toBe(true);

    await p.useItemOn("lamp", "keeper");
    await p.goThrough("to-lighthouse");
    expect(p.state().flags["game.finished"]).toBe(true);
    expect(credits).toEqual([{ ending: "good" }]);
  });

  it("dos partidas seguidas en el mismo proceso no se contaminan", async () => {
    const a = start();
    await a.p.settle();
    await a.p.pickUp("key-on-sand");
    a.p.dispose();
    const { p, said } = start();
    await p.settle();
    expect(p.state()).toMatchObject({ sceneId: "beach", inventory: [] });
    expect(said).toEqual(["beach.intro"]);
    await p.pickUp("key-on-sand");
    expect(p.state().inventory).toEqual(["rusty-key"]);
  });
});

describe("settle", () => {
  it("lanza un error claro si un guion no termina nunca", async () => {
    const p = createPlaythrough(miniAdventure, {
      handlers: { credits: () => new Promise<void>(() => {}) },
    });
    pt = p;
    p.runtime.runScript([{ call: "credits" }]);
    await expect(p.settle()).rejects.toThrow(/no converge/);
  });
});
