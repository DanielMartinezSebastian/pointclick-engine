import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import {
  act,
  cond,
  createGameRuntime,
  dialogue,
  getDialogueState,
  getInputLockState,
  getInventoryState,
  getWorldState,
  useDialogStore,
  useDialogueStore,
  type DialogueDefinition,
  type DialogueNode,
  type GameEvent,
  type GameRuntime,
} from "../index";
import { HeadlessClock } from "../ports/headlessClock";
import { flush, makeItem, makeScene, resetStores } from "./sequencerHarness";

let rt: GameRuntime;
let clock: HeadlessClock;
let events: GameEvent[];

function boot(defs: DialogueDefinition[]) {
  clock = new HeadlessClock();
  rt = createGameRuntime({
    scenes: [makeScene("dt-a")],
    items: [makeItem("dt-key")],
    dialogues: defs,
    clock,
    instantWalk: true,
  });
  rt.executeCommand({ type: "scene:set", sceneId: "dt-a" });
  events = [];
  for (const t of [
    "dialogue:started",
    "dialogue:nodeEntered",
    "dialogue:choiceMade",
    "dialogue:ended",
    "dialog:triggered",
    "dialog:dismissed",
    "input:lockChanged",
    "custom",
  ] as const)
    rt.on(t, (e) => events.push(e as GameEvent));
}

const def = (id: string, start: string, ...nodes: DialogueNode[]) =>
  dialogue.define(id, start, ...nodes);
const n = dialogue.node;
const c = dialogue.choice;

const start = async (id: string) => {
  rt.executeCommand({ type: "dialogue:start", dialogueId: id });
  await flush();
};
const choose = async (index: number) => {
  rt.executeCommand({ type: "dialogue:choose", index });
  await flush();
};
const dismiss = async () => {
  rt.executeCommand({ type: "dialog:dismiss" });
  await flush();
};
const ofType = (t: string) => events.filter((e) => e.type === t);
const ended = () => ofType("dialogue:ended") as Array<{ dialogueId: string; reason: string }>;
const nodesEntered = () =>
  ofType("dialogue:nodeEntered").map((e) => (e as { nodeId: string }).nodeId);
const customNames = () => ofType("custom").map((e) => (e as { name: string }).name);
const store = () => getDialogueState();
const idx = () => store().choices.map((x) => x.index);
const quiet = () => vi.spyOn(console, "warn").mockImplementation(() => {});

beforeEach(() => {
  resetStores();
  useDialogueStore.getState().clear();
});
afterEach(() => {
  rt?.dispose();
  resetStores();
  useDialogueStore.getState().clear();
  vi.restoreAllMocks();
});

describe("dialogos lineales", () => {
  const linear = def(
    "lin",
    "a",
    n("a", { line: "l.a", speaker: "npc", next: "b" }),
    n("b", { line: "l.b", next: "c" }),
    n("c", { line: "l.c" }),
  );

  it("recorre 3 nodos avanzando con dialog:dismiss y termina con finished", async () => {
    boot([linear]);
    await start("lin");
    expect(store().activeDialogueId).toBe("lin");
    expect(store().nodeId).toBe("a");
    expect(useDialogStore.getState().key).toBe("l.a");
    await dismiss();
    expect(store().nodeId).toBe("b");
    expect(useDialogStore.getState().key).toBe("l.b");
    await dismiss();
    expect(store().nodeId).toBe("c");
    await dismiss();
    expect(store().activeDialogueId).toBeNull();
    expect(nodesEntered()).toEqual(["a", "b", "c"]);
    expect(ended()).toEqual([{ type: "dialogue:ended", dialogueId: "lin", reason: "finished" }]);
  });

  it("emite started antes que nodeEntered y el speaker llega al bocadillo", async () => {
    boot([linear]);
    await start("lin");
    expect(events.map((e) => e.type).slice(0, 2)).toEqual([
      "dialogue:started",
      "input:lockChanged",
    ]);
    expect(nodesEntered()).toEqual(["a"]);
    expect(useDialogStore.getState().speaker).toBe("npc");
    expect(store().speaker).toBe("npc");
    expect(store().lineKey).toBe("l.a");
    const trig = ofType("dialog:triggered")[0] as { speaker?: string };
    expect(trig.speaker).toBe("npc");
  });

  it("fin por falta de next: el ultimo cierre termina el dialogo y deja el store limpio", async () => {
    boot([def("one", "x", n("x", { line: "l.x" }))]);
    await start("one");
    expect(store().activeDialogueId).toBe("one");
    await dismiss();
    expect(store()).toMatchObject({ activeDialogueId: null, nodeId: null, choices: [] });
  });

  it("dialogue:advance en nodo sin opciones equivale a cerrar el bocadillo", async () => {
    boot([linear]);
    await start("lin");
    rt.executeCommand({ type: "dialogue:advance" });
    await flush();
    expect(store().nodeId).toBe("b");
    expect(ofType("dialog:dismissed")).toHaveLength(1);
  });

  it("nodo solo-do: ejecuta efectos y encadena sin esperar al jugador", async () => {
    boot([
      def(
        "doonly",
        "a",
        n("a", { do: [act.setFlag("f1")], next: "b" }),
        n("b", { do: [act.emit("hecho")] }),
      ),
    ]);
    await start("doonly");
    expect(getWorldState().flags.f1).toBe(true);
    expect(customNames()).toEqual(["hecho"]);
    expect(ended()[0]!.reason).toBe("finished");
    expect(store().activeDialogueId).toBeNull();
  });
});

describe("opciones", () => {
  const branched = def(
    "br",
    "q",
    n("q", {
      line: "q.line",
      choices: [c("c.yes", { next: "yes" }), c("c.no", { next: "no" })],
    }),
    n("yes", { line: "yes.line" }),
    n("no", { line: "no.line" }),
  );

  it("ramificado: elige una opcion y sigue por su next", async () => {
    boot([branched]);
    await start("br");
    expect(store().choices).toEqual([
      { index: 0, textKey: "c.yes" },
      { index: 1, textKey: "c.no" },
    ]);
    await choose(1);
    expect(store().nodeId).toBe("no");
    expect(useDialogStore.getState().key).toBe("no.line");
    expect(ofType("dialogue:choiceMade")).toEqual([
      { type: "dialogue:choiceMade", dialogueId: "br", nodeId: "q", index: 1 },
    ]);
    await dismiss();
    expect(ended()[0]!.reason).toBe("finished");
  });

  it("con opciones pendientes NO avanza solo", async () => {
    boot([branched]);
    await start("br");
    await flush();
    expect(store().nodeId).toBe("q");
    expect(ended()).toHaveLength(0);
  });

  it("cerrar el bocadillo con opciones pendientes no avanza", async () => {
    boot([branched]);
    await start("br");
    await dismiss();
    expect(store().nodeId).toBe("q");
    expect(store().choices).toHaveLength(2);
    expect(ended()).toHaveLength(0);
    await choose(0);
    expect(store().nodeId).toBe("yes");
  });

  it("opcion con when: oculta si no se cumple, visible si se cumple", async () => {
    const d = def(
      "wh",
      "q",
      n("q", { choices: [c("c.a"), c("c.secret", { when: cond.flag("know") })] }),
    );
    boot([d]);
    await start("wh");
    expect(idx()).toEqual([0]);
    rt.executeCommand({ type: "dialogue:end" });
    await flush();
    getWorldState().setFlag("know", true);
    await start("wh");
    expect(idx()).toEqual([0, 1]);
  });

  it("el index es estable (posicion original) aunque se oculte una anterior", async () => {
    const d = def(
      "st",
      "q",
      n("q", {
        choices: [c("c.hidden", { when: cond.flag("nope") }), c("c.b", { next: "b" }), c("c.c")],
      }),
      n("b", { do: [act.emit("fue-b")] }),
    );
    boot([d]);
    await start("st");
    expect(store().choices).toEqual([
      { index: 1, textKey: "c.b" },
      { index: 2, textKey: "c.c" },
    ]);
    await choose(1);
    expect(customNames()).toEqual(["fue-b"]);
  });

  it("choose con indice oculto, inexistente o no numerico avisa y no hace nada", async () => {
    const warn = quiet();
    boot([def("iv", "q", n("q", { choices: [c("c.h", { when: cond.flag("nope") }), c("c.ok")] }))]);
    await start("iv");
    await choose(0);
    await choose(7);
    await choose(-1);
    await choose(Number.NaN);
    expect(warn).toHaveBeenCalledTimes(4);
    expect(store().nodeId).toBe("q");
    expect(ofType("dialogue:choiceMade")).toHaveLength(0);
    await choose(1);
    expect(ended()[0]!.reason).toBe("finished");
  });

  it("choose sin dialogo activo avisa y no hace nada", async () => {
    const warn = quiet();
    boot([]);
    await choose(0);
    expect(warn).toHaveBeenCalled();
    expect(events).toHaveLength(0);
  });

  it("choose en un nodo sin opciones (esperando cierre) se ignora", async () => {
    const warn = quiet();
    boot([def("nc", "a", n("a", { line: "l.a", next: "b" }), n("b", { line: "l.b" }))]);
    await start("nc");
    await choose(0);
    expect(warn).toHaveBeenCalled();
    expect(store().nodeId).toBe("a");
  });

  it("dialogue:advance en un nodo con opciones no hace nada", async () => {
    boot([branched]);
    await start("br");
    rt.executeCommand({ type: "dialogue:advance" });
    await flush();
    expect(store().nodeId).toBe("q");
    expect(ofType("dialog:dismissed")).toHaveLength(0);
    expect(useDialogStore.getState().visible).toBe(true);
  });

  it("dialogue:advance sin dialogo activo no hace nada", async () => {
    boot([]);
    rt.executeCommand({ type: "dialogue:advance" });
    await flush();
    expect(events).toHaveLength(0);
  });

  it("dialogue:advance cierra un say lanzado desde el do de una opcion", async () => {
    boot([
      def(
        "sd",
        "q",
        n("q", {
          line: "l.q",
          choices: [c("c.ask", { do: [act.say("l.answer"), act.emit("answered")], next: "q" })],
        }),
      ),
    ]);
    await start("sd");
    await choose(0);
    // El say del `do` esta en pantalla: el cierre del bocadillo llega como dialogue:advance.
    expect(customNames()).toEqual([]);
    rt.executeCommand({ type: "dialogue:advance" });
    await flush();
    expect(customNames()).toEqual(["answered"]);
    // De vuelta en el nodo, con su opcion ofrecida otra vez.
    expect(idx()).toEqual([0]);
  });

  it("opcion sin next termina el dialogo", async () => {
    boot([def("nn", "q", n("q", { choices: [c("c.bye")] }))]);
    await start("nn");
    await choose(0);
    expect(ended()[0]!.reason).toBe("finished");
    expect(store().activeDialogueId).toBeNull();
  });

  it("nodo cuyas opciones quedan todas ocultas se trata como nodo sin opciones", async () => {
    boot([
      def(
        "ah",
        "q",
        n("q", { line: "l.q", choices: [c("c.h", { when: cond.flag("nope") })], next: "z" }),
        n("z", { line: "l.z" }),
      ),
    ]);
    await start("ah");
    expect(store().choices).toEqual([]);
    await dismiss();
    expect(store().nodeId).toBe("z");
  });
});

describe("once", () => {
  const onceDef = def(
    "on",
    "q",
    n("q", {
      choices: [c("c.once", { once: true, next: "q" }), c("c.always", { next: "q" }), c("c.out")],
    }),
  );

  it("desaparece al volver al nodo y deja el flag reservado en el estado de mundo", async () => {
    boot([onceDef]);
    await start("on");
    expect(idx()).toEqual([0, 1, 2]);
    await choose(0);
    expect(getWorldState().flags["dlg.on.q.0"]).toBe(true);
    expect(store().nodeId).toBe("q");
    expect(idx()).toEqual([1, 2]);
    await choose(1);
    expect(idx()).toEqual([1, 2]);
  });

  it("sigue oculta en una conversacion posterior (el flag persiste)", async () => {
    boot([onceDef]);
    await start("on");
    await choose(0);
    await choose(2);
    expect(ended()).toHaveLength(1);
    await start("on");
    expect(idx()).toEqual([1, 2]);
  });

  it("la opcion sin once se puede repetir y no deja flag", async () => {
    boot([onceDef]);
    await start("on");
    await choose(1);
    await choose(1);
    expect(ofType("dialogue:choiceMade")).toHaveLength(2);
    expect(Object.keys(getWorldState().flags)).toEqual([]);
  });
});

describe("efectos (do)", () => {
  it("do de nodo y de opcion aplican flag e item", async () => {
    boot([
      def(
        "fx",
        "a",
        n("a", {
          do: [act.setFlag("nodo")],
          choices: [
            c("c.take", { do: [act.giveItem("dt-key"), act.setFlag("opcion")], next: "z" }),
          ],
        }),
        n("z", { line: "l.z" }),
      ),
    ]);
    await start("fx");
    expect(getWorldState().flags.nodo).toBe(true);
    expect(getWorldState().flags.opcion).toBeUndefined();
    await choose(0);
    expect(getWorldState().flags.opcion).toBe(true);
    expect(getInventoryState().slots.some((s) => s?.id === "dt-key")).toBe(true);
    expect(store().nodeId).toBe("z");
  });

  it("el do del nodo se ejecuta antes de evaluar las opciones", async () => {
    boot([
      def(
        "ord",
        "a",
        n("a", {
          do: [act.setFlag("abre")],
          choices: [c("c.cond", { when: cond.flag("abre") })],
        }),
      ),
    ]);
    await start("ord");
    expect(idx()).toEqual([0]);
  });

  it("el do de nodo con wait espera antes de mostrar la linea", async () => {
    boot([
      def(
        "wn",
        "a",
        n("a", { do: [act.wait(100)], line: "l.a", next: "b" }),
        n("b", { line: "l.b" }),
      ),
    ]);
    await start("wn");
    expect(useDialogStore.getState().visible).toBe(false);
    expect(store().nodeId).toBe("a");
    clock.advance(100);
    await flush();
    expect(useDialogStore.getState().key).toBe("l.a");
  });

  it("el do de opcion con wait retrasa el paso al siguiente nodo", async () => {
    boot([
      def(
        "wo",
        "q",
        n("q", { choices: [c("c.go", { do: [act.wait(50), act.emit("listo")], next: "z" })] }),
        n("z", { do: [act.emit("en-z")] }),
      ),
    ]);
    await start("wo");
    await choose(0);
    expect(customNames()).toEqual([]);
    expect(store().choices).toEqual([]);
    clock.advance(50);
    await flush();
    expect(customNames()).toEqual(["listo", "en-z"]);
  });

  it("un say dentro del do espera su cierre (sin interbloqueo con el guion contenedor)", async () => {
    boot([
      def("sy", "a", n("a", { do: [act.say("narra")], next: "b" }), n("b", { do: [act.emit("fin")] })),
    ]);
    await start("sy");
    expect(useDialogStore.getState().key).toBe("narra");
    expect(customNames()).toEqual([]);
    await dismiss();
    expect(customNames()).toEqual(["fin"]);
    expect(ended()[0]!.reason).toBe("finished");
  });
});

describe("fin forzado y comandos", () => {
  it("dialogue:end termina de inmediato con reason ended y oculta el bocadillo", async () => {
    boot([def("fe", "a", n("a", { line: "l.a", next: "b" }), n("b", { line: "l.b" }))]);
    await start("fe");
    expect(useDialogStore.getState().visible).toBe(true);
    rt.executeCommand({ type: "dialogue:end" });
    await flush();
    expect(ended()).toEqual([{ type: "dialogue:ended", dialogueId: "fe", reason: "ended" }]);
    expect(useDialogStore.getState().visible).toBe(false);
    expect(store().activeDialogueId).toBeNull();
    expect(nodesEntered()).toEqual(["a"]);
  });

  it("dialogue:end con opciones pendientes tambien termina", async () => {
    boot([def("fo", "q", n("q", { line: "l", choices: [c("c.a")] }))]);
    await start("fo");
    rt.executeCommand({ type: "dialogue:end" });
    await flush();
    expect(ended()[0]!.reason).toBe("ended");
    expect(store().choices).toEqual([]);
  });

  it("dialogue:end sin dialogo activo no hace nada", async () => {
    boot([]);
    rt.executeCommand({ type: "dialogue:end" });
    await flush();
    expect(events).toHaveLength(0);
  });

  it("un segundo dialogue:start con uno activo avisa y no hace nada", async () => {
    const warn = quiet();
    boot([def("d1", "a", n("a", { line: "l.1" })), def("d2", "a", n("a", { line: "l.2" }))]);
    await start("d1");
    await start("d2");
    expect(warn).toHaveBeenCalled();
    expect(store().activeDialogueId).toBe("d1");
    expect(ofType("dialogue:started")).toHaveLength(1);
    await dismiss();
    expect(ended().map((e) => e.dialogueId)).toEqual(["d1"]);
  });

  it("se puede iniciar otro dialogo despues de terminar el primero", async () => {
    boot([def("d1", "a", n("a")), def("d2", "a", n("a", { line: "l.2" }))]);
    await start("d1");
    await start("d2");
    expect(store().activeDialogueId).toBe("d2");
  });
});

describe("dentro de un guion", () => {
  it("la accion startDialogue espera al fin y el guion continua", async () => {
    boot([
      def("sc", "a", n("a", { line: "l.a", choices: [c("c.ok", { do: [act.emit("opcion")] })] })),
    ]);
    const run = rt.runScript([act.emit("antes"), act.startDialogue("sc"), act.emit("despues")]);
    await flush();
    expect(customNames()).toEqual(["antes"]);
    await choose(0);
    expect(customNames()).toEqual(["antes", "opcion", "despues"]);
    expect(await run.done).toBe("finished");
  });

  it("los do con wait funcionan dentro de un guion (no hay interbloqueo con la cola)", async () => {
    boot([def("sw", "a", n("a", { do: [act.wait(10), act.emit("do")] }))]);
    const run = rt.runScript([act.startDialogue("sw"), act.emit("fin")]);
    await flush();
    clock.advance(10);
    expect(await run.done).toBe("finished");
    expect(customNames()).toEqual(["do", "fin"]);
  });

  it("cancelar el guion a mitad cierra el dialogo con reason cancelled y limpia", async () => {
    boot([def("cx", "q", n("q", { line: "l.q", choices: [c("c.a")] }))]);
    const run = rt.runScript([act.startDialogue("cx"), act.emit("no-debe")]);
    await flush();
    expect(store().activeDialogueId).toBe("cx");
    rt.executeCommand({ type: "script:cancelAll" });
    await flush();
    expect(await run.done).toBe("cancelled");
    expect(ended()).toEqual([{ type: "dialogue:ended", dialogueId: "cx", reason: "cancelled" }]);
    expect(store().activeDialogueId).toBeNull();
    expect(useDialogStore.getState().visible).toBe(false);
    expect(customNames()).toEqual([]);
  });

  it("interrupt con otro guion cancela el dialogo en curso", async () => {
    boot([def("ix", "a", n("a", { line: "l.a" }))]);
    rt.runScript([act.startDialogue("ix")]);
    await flush();
    rt.runScript([act.emit("otro")], { interrupt: true });
    await flush();
    expect(ended()[0]!.reason).toBe("cancelled");
    expect(customNames()).toEqual(["otro"]);
  });

  it("cancelar durante el do de un nodo (wait) corta sin seguir", async () => {
    boot([
      def(
        "cw",
        "a",
        n("a", { do: [act.wait(100), act.emit("tarde")], next: "b" }),
        n("b", { do: [act.emit("b")] }),
      ),
    ]);
    rt.runScript([act.startDialogue("cw")]);
    await flush();
    rt.executeCommand({ type: "script:cancelAll" });
    clock.advance(100);
    await flush();
    expect(customNames()).toEqual([]);
    expect(ended()[0]!.reason).toBe("cancelled");
  });
});

describe("robustez", () => {
  it("dialogo no registrado: aviso y fin finished, sin lanzar", async () => {
    const warn = quiet();
    boot([]);
    await start("nada");
    expect(warn).toHaveBeenCalled();
    expect(ended()).toEqual([{ type: "dialogue:ended", dialogueId: "nada", reason: "finished" }]);
    expect(store().activeDialogueId).toBeNull();
    expect(getInputLockState().inputLocked).toBe(false);
  });

  it("start apuntando a un nodo inexistente: aviso y fin", async () => {
    const warn = quiet();
    boot([def("bad", "fantasma", n("a"))]);
    await start("bad");
    expect(warn).toHaveBeenCalled();
    expect(ended()[0]!.reason).toBe("finished");
  });

  it("next a un nodo inexistente: aviso y fin tras el nodo valido", async () => {
    const warn = quiet();
    boot([def("nx", "a", n("a", { line: "l.a", next: "fantasma" }))]);
    await start("nx");
    await dismiss();
    expect(warn).toHaveBeenCalled();
    expect(ended()[0]!.reason).toBe("finished");
    expect(store().activeDialogueId).toBeNull();
  });

  it("next de una opcion a un nodo inexistente: aviso y fin", async () => {
    const warn = quiet();
    boot([def("cn", "q", n("q", { choices: [c("c.a", { next: "fantasma" })] }))]);
    await start("cn");
    await choose(0);
    expect(warn).toHaveBeenCalled();
    expect(ended()[0]!.reason).toBe("finished");
  });

  it("bucle infinito de nodos sin linea: se corta con aviso", async () => {
    const warn = quiet();
    boot([def("loop", "a", n("a", { next: "b" }), n("b", { next: "a" }))]);
    await start("loop");
    await flush(5000); // 500 nodos encadenados = muchas microtareas
    expect(warn).toHaveBeenCalled();
    expect(nodesEntered().length).toBe(500);
    expect(ended()[0]!.reason).toBe("finished");
    expect(store().activeDialogueId).toBeNull();
  });

  it("un dialogo largo con entradas del jugador no dispara la proteccion", async () => {
    const nodes: DialogueNode[] = [];
    for (let i = 0; i < 600; i++) {
      nodes.push(n(`n${i}`, { line: "l", ...(i < 599 ? { next: `n${i + 1}` } : {}) }));
    }
    boot([def("long", "n0", ...nodes)]);
    await start("long");
    for (let i = 0; i < 599; i++) await dismiss();
    expect(store().nodeId).toBe("n599");
  });
});

describe("bloqueo de entrada", () => {
  it("activo durante el dialogo y liberado al final", async () => {
    boot([def("lk", "a", n("a", { line: "l.a" }))]);
    expect(getInputLockState().inputLocked).toBe(false);
    await start("lk");
    expect(getInputLockState().inputLocked).toBe(true);
    await dismiss();
    expect(getInputLockState().inputLocked).toBe(false);
    expect(ofType("input:lockChanged").map((e) => (e as { locked: boolean }).locked)).toEqual([
      true,
      false,
    ]);
  });

  it("liberado tambien con dialogue:end y al cancelar", async () => {
    boot([def("lk", "a", n("a", { line: "l.a" }))]);
    await start("lk");
    rt.executeCommand({ type: "dialogue:end" });
    await flush();
    expect(getInputLockState().inputLocked).toBe(false);
    rt.runScript([act.startDialogue("lk")]);
    await flush();
    expect(getInputLockState().inputLocked).toBe(true);
    rt.executeCommand({ type: "script:cancelAll" });
    await flush();
    expect(getInputLockState().inputLocked).toBe(false);
  });

  it("no libera un bloqueo que el guion habia puesto antes", async () => {
    boot([def("lk", "a", n("a", { line: "l.a" }))]);
    rt.runScript([act.lockInput(true), act.startDialogue("lk"), act.wait(5)]);
    await flush();
    await dismiss();
    expect(getInputLockState().inputLocked).toBe(true);
    clock.advance(5);
    await flush();
    expect(getInputLockState().inputLocked).toBe(false);
  });
});

describe("registro, dispose y constructores", () => {
  it("getDialogues devuelve los registrados por config", () => {
    const a = def("g1", "a", n("a"));
    const b = def("g2", "a", n("a"));
    boot([a, b]);
    expect(rt.getDialogues().g1).toBe(a);
    expect(rt.getDialogues().g2).toBe(b);
  });

  it("dispose con dialogo activo deja el store limpio y el bloqueo liberado", async () => {
    boot([def("dp", "q", n("q", { line: "l", choices: [c("c.a")] }))]);
    await start("dp");
    expect(store().activeDialogueId).toBe("dp");
    const seen: GameEvent[] = [];
    rt.on("dialogue:ended", (e) => seen.push(e));
    rt.dispose();
    expect(store().activeDialogueId).toBeNull();
    expect(store().choices).toEqual([]);
    expect(seen).toEqual([{ type: "dialogue:ended", dialogueId: "dp", reason: "cancelled" }]);
    await flush();
    expect(getInputLockState().inputLocked).toBe(false);
  });

  it("los constructores producen datos planos equivalentes", () => {
    expect(dialogue.define("x", "a", dialogue.node("a", { line: "l" }))).toEqual({
      id: "x",
      start: "a",
      nodes: [{ id: "a", line: "l" }],
    });
    expect(dialogue.choice("t", { once: true })).toEqual({ text: "t", once: true });
  });

  it("el bocadillo de una frase sigue funcionando fuera de un dialogo", async () => {
    boot([]);
    rt.executeCommand({ type: "dialog:trigger", dialogKey: "suelto" });
    expect(useDialogStore.getState().visible).toBe(true);
    await dismiss();
    expect(useDialogStore.getState().visible).toBe(false);
    expect(store().activeDialogueId).toBeNull();
  });
});
