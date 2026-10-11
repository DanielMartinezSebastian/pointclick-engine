import { afterEach, describe, expect, it, vi } from "vitest";
import { validateContent, type GameSnapshot } from "@pointclick-engine/engine-core";
import { createPlaythrough, type Playthrough } from "@pointclick-engine/engine-core/testing";

import { ADVENTURE_CONTENT, ADVENTURE_INITIAL_SCENE_ID } from "./index";

let pt: Playthrough | null = null;
let credits: unknown[] = [];

/** Partida nueva de la aventura con `credits` registrado y los bocadillos anotados. */
function start(snapshot?: GameSnapshot) {
  const said: string[] = [];
  const p = createPlaythrough(ADVENTURE_CONTENT, {
    initialSceneId: ADVENTURE_INITIAL_SCENE_ID,
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

/** Lo observable de una partida que un intento equivocado no debe alterar. */
const observable = (p: Playthrough) => {
  const { sceneId, inventory, flags } = p.state();
  return { sceneId, inventory: [...inventory].sort(), flags };
};

// --- tramos del camino principal --------------------------------------------------------------

/** Puzzle 1: ordenador, cama, punto y coma; sale al pueblo. */
async function puzzle1(p: Playthrough) {
  await p.pickUp("duck-beak-floor");
  await p.look("computer");
  await p.look("bed");
  await p.useItemOn("semicolon", "computer");
  await p.goThrough("room-to-town");
}

/** Puzzles 2 y 3: pico sobre el glitch, pergamino del ordenador, puerta de la mina; entra al backlog. */
async function puzzles2and3(p: Playthrough) {
  await p.pickUp("empty-mug-floor");
  await p.useItemOn("duck-beak", "glitch");
  await p.goThrough("town-to-room");
  await p.look("computer");
  await p.goThrough("room-to-town");
  await p.useItemOn("sticky-note", "mine-door");
  await p.goThrough("town-to-backlog");
}

/** Puzzle 4: recoger, hablar con Helix, combinar y devolverle el puntero; vuelve al pueblo. */
async function puzzle4(p: Playthrough) {
  await p.pickUp("coffee-beans-floor");
  await p.pickUp("bucket-floor");
  await p.talk("helix");
  await p.choose(0);
  await p.choose(2);
  await p.combine("null-pointer", "sticky-note");
  await p.useItemOn("valid-pointer", "helix");
  await p.goThrough("backlog-to-town");
}

/** Puzzle 5 y la taza con el saco: libera al glitch; deja el cafe hecho. Acaba en el pueblo. */
async function puzzle5(p: Playthrough) {
  await p.useItemOn("break", "glitch");
  await p.combine("empty-mug", "coffee-beans");
}

/** Puzzle 6: llega al motor y despierta al Programador con el cafe. */
async function puzzle6(p: Playthrough) {
  await p.useItemOn("coffee", "intercom");
}

/** Puzzle 7: va al heap, pone el cubo y vuelve al motor. */
async function puzzle7(p: Playthrough) {
  await p.goThrough("engine-to-heap");
  await p.useItemOn("bucket", "leak");
  await p.goThrough("heap-to-engine");
}

async function untilTownFixed(p: Playthrough) {
  await p.settle();
  await puzzle1(p);
  await puzzles2and3(p);
  await puzzle4(p);
  await puzzle5(p);
}

describe("aventura: contenido", () => {
  it("validateContent: 0 errores y 0 avisos", () => {
    const issues = validateContent(ADVENTURE_CONTENT);
    expect(issues).toEqual([]);
  });

  it("empieza en la habitacion", () => {
    expect(ADVENTURE_CONTENT.scenes[0]?.id).toBe(ADVENTURE_INITIAL_SCENE_ID);
    expect(ADVENTURE_INITIAL_SCENE_ID).toBe("adv-room");
  });
});

describe("aventura: recorrido completo", () => {
  it("se resuelve de intro.done a game.finished sin tiempo real", async () => {
    const t0 = performance.now();
    const { p, said } = start();
    await p.settle();
    expect(p.state().sceneId).toBe("adv-room");
    expect(said).toEqual(["intro.1", "intro.2"]);
    expect(p.state().flags["intro.done"]).toBe(true);

    // 1. Ordenador, cama y punto y coma: la puerta lleva al pueblo.
    await p.pickUp("duck-beak-floor");
    expect(p.state().inventory).toEqual(["duck-beak"]);
    await p.look("computer");
    expect(said.at(-1)).toBe("computer.log");
    await p.look("bed");
    expect(p.state().inventory).toEqual(["duck-beak", "semicolon"]);
    await p.useItemOn("semicolon", "computer");
    expect(p.state().flags["door.fixed"]).toBe(true);
    expect(p.state().inventory).toEqual(["duck-beak"]);
    await p.goThrough("room-to-town");
    expect(p.state().sceneId).toBe("adv-town");

    // 2. El glitch esta en bucle; el pico de pato suelta la pista.
    await p.talk("glitch");
    await p.choose(0);
    await p.choose(1); // "¿Puedes parar?" -> glitch.nobreak, y vuelve al saludo
    expect(p.state().dialogueActive).toBe(true);
    await p.choose(2);
    expect(p.state().dialogueActive).toBe(false);
    await p.pickUp("empty-mug-floor");
    await p.useItemOn("duck-beak", "glitch");
    expect(p.state().flags["hint.postit"]).toBe(true);
    expect(said.slice(-2)).toEqual(["glitch.duck.david", "glitch.duck.reveal"]);

    // 3. De vuelta al ordenador aparece el pergamino; abre la mina sin consumirse.
    await p.goThrough("town-to-room");
    await p.look("computer");
    expect(p.state().inventory).toContain("sticky-note");
    await p.look("computer");
    expect(said.at(-1)).toBe("computer.idle");
    expect(p.state().inventory.filter((i) => i === "sticky-note")).toHaveLength(1);
    await p.goThrough("room-to-town");
    await p.use("mine-door");
    expect(said.at(-1)).toBe("mine.locked");
    await p.useItemOn("sticky-note", "mine-door");
    expect(p.state().flags["backlog.open"]).toBe(true);
    expect(p.state().inventory).toContain("sticky-note");
    await p.goThrough("town-to-backlog");
    expect(p.state().sceneId).toBe("adv-backlog");

    // 4. Helix: puntero nulo -> valido -> break.
    await p.pickUp("coffee-beans-floor");
    await p.pickUp("bucket-floor");
    await p.talk("helix");
    await p.choose(0);
    expect(p.state().inventory).toContain("null-pointer");
    await p.choose(2);
    await p.combine("null-pointer", "sticky-note");
    expect(p.state().inventory).toContain("valid-pointer");
    expect(p.state().inventory).not.toContain("null-pointer");
    expect(p.state().inventory).not.toContain("sticky-note");
    await p.useItemOn("valid-pointer", "helix");
    expect(p.state().flags["helix.home"]).toBe(true);
    expect(p.state().inventory).toContain("break");
    expect(p.state().inventory).not.toContain("valid-pointer");
    await expect(p.talk("helix")).resolves.toBeUndefined(); // oculto: sin efecto
    expect(p.state().dialogueActive).toBe(false);

    // 5. El break libera al glitch; se abre el paso al motor.
    await p.goThrough("backlog-to-town");
    expect(p.state().sceneId).toBe("adv-town");
    await p.useItemOn("break", "glitch");
    expect(p.state().flags["glitch.fixed"]).toBe(true);
    expect(p.state().inventory).not.toContain("break");
    await p.talk("glitch-free");
    await p.combine("empty-mug", "coffee-beans");
    expect(p.state().inventory.sort()).toEqual(["bucket", "coffee", "duck-beak"]);
    await p.goThrough("town-to-engine");
    expect(p.state().sceneId).toBe("adv-engine");

    // 6. Primer uso de la consola: dos errores. Cafe en el interfono.
    await p.use("console");
    expect(said.at(-1)).toBe("console.fail");
    await puzzle6(p);
    expect(p.state().flags["programmer.awake"]).toBe(true);
    expect(p.state().inventory).not.toContain("coffee");
    await p.use("console");
    expect(said.at(-1)).toBe("console.fail.heap");

    // 7. El cubo bajo la fuga.
    await puzzle7(p);
    expect(p.state().flags["leak.fixed"]).toBe(true);
    expect(p.state().inventory).toEqual(["duck-beak"]);
    expect(said).toContain("leak.bucket.david");

    // 8. Compila.
    expect(credits).toEqual([]);
    await p.use("console");
    expect(p.state().flags["game.finished"]).toBe(true);
    expect(said.slice(-3)).toEqual(["console.compiling", "console.ok", "ending.programmer"]);
    expect(credits).toHaveLength(1);
    await p.use("console");
    expect(said.at(-1)).toBe("console.done");
    expect(credits).toHaveLength(1);

    const elapsed = performance.now() - t0;
    console.log(`[adventure playthrough] recorrido completo: ${elapsed.toFixed(1)} ms`);
    expect(elapsed).toBeLessThan(3000);
  });

  it("6 antes que 7 y 7 antes que 6 acaban igual", async () => {
    for (const order of ["6-7", "7-6"] as const) {
      const { p, said } = start();
      await untilTownFixed(p);
      await p.goThrough("town-to-engine");
      if (order === "6-7") {
        await puzzle6(p);
        await puzzle7(p);
      } else {
        await puzzle7(p);
        // Con solo la fuga resuelta, la consola dice que falta el Programador.
        await p.use("console");
        expect(said.at(-1)).toBe("console.fail.sleep");
        expect(p.state().flags["game.finished"]).toBeUndefined();
        await puzzle6(p);
      }
      await p.use("console");
      expect(p.state().flags["game.finished"]).toBe(true);
      expect(credits).toHaveLength(1);
      p.dispose();
      credits = [];
    }
  });
});

describe("aventura: intentos fuera de orden", () => {
  it("la puerta de la habitacion no lleva a ninguna parte hasta reparar el ordenador", async () => {
    const { p, said } = start();
    await p.settle();
    const before = observable(p);
    await p.goThrough("room-to-town");
    expect(said.at(-1)).toBe("door.blocked");
    // Items que no se tienen no hacen nada.
    await p.useItemOn("semicolon", "computer");
    expect(observable(p)).toEqual(before);
    // Mirar el ordenador sin la pista no da el pergamino.
    await p.look("computer");
    await p.look("computer");
    expect(p.state().inventory).toEqual([]);
    expect(said.at(-1)).toBe("computer.idle");
  });

  it("en el pueblo, ni la mina ni el motor se abren antes de tiempo", async () => {
    const { p, said } = start();
    await p.settle();
    await puzzle1(p);
    const before = observable(p);

    await p.goThrough("town-to-backlog");
    expect(said.at(-1)).toBe("mine.locked");
    await p.goThrough("town-to-engine");
    expect(said.slice(-2)).toEqual(["glitch.welcome", "glitch.blocked.david"]);
    await p.use("mine-door");
    await p.useItemOn("duck-beak", "mine-door");
    expect(said.at(-1)).toBe("mine.nothing");
    await p.useItemOn("sticky-note", "mine-door"); // no se tiene
    await p.useItemOn("break", "glitch"); // no se tiene
    expect(observable(p)).toEqual(before);

    // Un item equivocado sobre el glitch tiene respuesta propia y no cambia nada.
    await p.useItemOn("duck-beak", "glitch");
    expect(p.state().flags["hint.postit"]).toBe(true);
    const afterHint = observable(p);
    await p.useItemOn("duck-beak", "glitch");
    expect(said.at(-1)).toBe("glitch.duck.again");
    expect(observable(p)).toEqual(afterHint);
  });

  it("el pergamino solo aparece tras la pista del glitch y solo una vez", async () => {
    const { p } = start();
    await p.settle();
    await puzzle1(p);
    await p.goThrough("town-to-room");
    await p.look("computer");
    await p.look("computer");
    expect(p.state().inventory).toEqual(["duck-beak"]);
    expect(p.state().flags["note.given"]).toBeUndefined();
  });

  it("Helix: cada intento equivocado tiene respuesta y no cambia el estado", async () => {
    const { p, said } = start();
    await p.settle();
    await puzzle1(p);
    await puzzles2and3(p);
    await p.pickUp("coffee-beans-floor");
    const before = observable(p);
    await p.useItemOn("duck-beak", "helix");
    expect(said.at(-1)).toBe("helix.nothing");
    await p.useItemOn("sticky-note", "helix");
    await p.useItemOn("valid-pointer", "helix"); // no se tiene
    expect(observable(p)).toEqual(before);
    // El puntero nulo solo se da una vez.
    await p.talk("helix");
    await p.choose(0);
    await expect(p.choose(0)).rejects.toThrow(/no disponible/);
    await p.choose(2);
    const holding = p.state().inventory.filter((i) => i === "null-pointer");
    expect(holding).toHaveLength(1);
    // Combinar el pergamino con otra cosa no produce nada.
    await p.combine("sticky-note", "duck-beak");
    expect(p.state().inventory).toContain("sticky-note");
  });

  it("el motor y el heap: consola y fuga sin sus requisitos no cambian nada", async () => {
    const { p, said } = start();
    await untilTownFixed(p);
    await p.goThrough("town-to-engine");
    const before = observable(p);
    await p.use("console");
    expect(said.at(-1)).toBe("console.fail");
    await p.useItemOn("bucket", "intercom");
    expect(said.at(-1)).toBe("intercom.nothing");
    await p.useItemOn("bucket", "console");
    expect(said.at(-1)).toBe("console.nothing");
    await p.use("intercom");
    expect(said.at(-1)).toBe("intercom.use");
    expect(observable(p)).toEqual(before);

    await p.goThrough("engine-to-heap");
    await p.use("leak");
    expect(said.at(-1)).toBe("leak.use");
    await p.useItemOn("coffee", "leak");
    expect(said.at(-1)).toBe("leak.nothing");
    expect(observable(p)).toEqual({ ...before, sceneId: "adv-heap" });
  });

  it("el cafe y el cubo no se pueden gastar dos veces", async () => {
    const { p, said } = start();
    await untilTownFixed(p);
    await p.goThrough("town-to-engine");
    await puzzle6(p);
    await p.useItemOn("coffee", "intercom"); // ya no se tiene
    await puzzle7(p);
    await p.goThrough("engine-to-heap");
    await p.use("leak");
    expect(said.at(-1)).toBe("leak.already");
  });
});

describe("aventura: guardar y retomar", () => {
  it("una partida nueva desde la instantanea a mitad termina el juego", async () => {
    const first = start();
    await first.p.settle();
    await puzzle1(first.p);
    await puzzles2and3(first.p);
    await puzzle4(first.p);
    const snapshot = first.p.save();
    expect(snapshot.sceneId).toBe("adv-town");
    first.p.dispose();

    const { p, said } = start(snapshot);
    await p.settle();
    expect(said).toEqual([]); // restaurar no repite ningun onEnter
    expect(p.state().sceneId).toBe("adv-town");
    expect(p.state().inventory).toContain("break");
    expect(p.state().flags["helix.home"]).toBe(true);

    await puzzle5(p);
    await p.goThrough("town-to-engine");
    await puzzle6(p);
    await puzzle7(p);
    await p.use("console");
    expect(p.state().flags["game.finished"]).toBe(true);
    expect(credits).toHaveLength(1);
  });

  it("dos partidas seguidas en el mismo proceso no se contaminan", async () => {
    const a = start();
    await a.p.settle();
    await a.p.pickUp("duck-beak-floor");
    a.p.dispose();
    const { p, said } = start();
    await p.settle();
    expect(p.state()).toMatchObject({ sceneId: "adv-room", inventory: [] });
    expect(said).toEqual(["intro.1", "intro.2"]);
  });
});
