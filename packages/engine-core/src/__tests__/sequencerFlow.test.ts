import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import {
  act,
  branch,
  cond,
  createGameRuntime,
  getConditionContext,
  getWorldState,
  otherwise,
  pickBranch,
  type Branch,
  type ConditionContext,
  type GameRuntime,
} from "../index";
import { HeadlessClock } from "../ports/headlessClock";
import {
  dismissDialog,
  flush,
  getInputLockState,
  makeScene,
  resetStores,
  setup,
  trackBusSubscriptions,
  type Harness,
} from "./sequencerHarness";

let h: Harness;
let rt: GameRuntime;
let clock: HeadlessClock;

function start(opts?: Parameters<typeof setup>[0]) {
  h = setup(opts);
  rt = h.rt;
  clock = h.clock;
}

const names = () => h.events.filter((e) => e.type === "custom").map((e) => (e as { name: string }).name);

beforeEach(resetStores);
afterEach(() => {
  h?.rt.dispose();
  resetStores();
  vi.restoreAllMocks();
});

describe("secuenciador: cola e interrupcion", () => {
  it("guion vacio termina y emite started/finished", async () => {
    start({ record: ["script:started", "script:finished"] });
    const run = rt.runScript([]);
    expect(await run.done).toBe("finished");
    expect(h.events).toEqual([
      { type: "script:started", id: 1 },
      { type: "script:finished", id: 1, result: "finished" },
    ]);
  });

  it("los ids son incrementales", async () => {
    start({ record: ["script:started"] });
    await rt.runScript([]).done;
    await rt.runScript([]).done;
    expect(h.events).toEqual([
      { type: "script:started", id: 1 },
      { type: "script:started", id: 2 },
    ]);
  });

  it("un segundo guion espera en cola (FIFO)", async () => {
    start({ record: ["custom", "script:started"] });
    const a = rt.runScript([act.wait(10), act.emit("a")]);
    const b = rt.runScript([act.emit("b")]);
    const c = rt.runScript([act.emit("c")]);
    await flush();
    expect(names()).toEqual([]);
    expect(h.events.filter((e) => e.type === "script:started")).toHaveLength(1);
    clock.advance(10);
    await flush();
    expect(names()).toEqual(["a", "b", "c"]);
    expect(await Promise.all([a.done, b.done, c.done])).toEqual(["finished", "finished", "finished"]);
  });

  it("interrupt cancela el actual y vacia la cola", async () => {
    start({ record: ["custom"] });
    const a = rt.runScript([act.wait(10), act.emit("a")]);
    const queued = rt.runScript([act.emit("queued")]);
    const urgent = rt.runScript([act.emit("urgent")], { interrupt: true });
    await flush();
    expect(await a.done).toBe("cancelled");
    expect(await queued.done).toBe("cancelled");
    expect(await urgent.done).toBe("finished");
    clock.advance(10);
    await flush();
    expect(names()).toEqual(["urgent"]);
  });

  it("interrupt sin nada en curso se comporta como un run normal", async () => {
    start();
    const run = rt.runScript([act.setFlag("x")], { interrupt: true });
    expect(await run.done).toBe("finished");
    expect(getWorldState().flags.x).toBe(true);
  });

  it("script:run despacha el guion; interrupt viaja en el comando", async () => {
    start({ record: ["custom"] });
    rt.executeCommand({ type: "script:run", script: [act.wait(5), act.emit("slow")] });
    rt.executeCommand({ type: "script:run", script: [act.emit("fast")], interrupt: true });
    await flush();
    clock.advance(5);
    await flush();
    expect(names()).toEqual(["fast"]);
  });
});

describe("secuenciador: cancelacion", () => {
  it("cancel() a mitad de say suelta la suscripcion y resuelve cancelled", async () => {
    start({ record: ["custom"] });
    const run = rt.runScript([act.say("k"), act.emit("after")]);
    await flush();
    run.cancel();
    expect(await run.done).toBe("cancelled");
    dismissDialog(rt);
    await flush();
    expect(names()).toEqual([]);
  });

  it("cancel() a mitad de wait cancela el temporizador", async () => {
    start({ record: ["custom"] });
    const run = rt.runScript([act.wait(50), act.emit("after")]);
    await flush();
    expect(clock.pending()).toBe(1);
    run.cancel();
    expect(clock.pending()).toBe(0);
    expect(await run.done).toBe("cancelled");
    clock.advance(100);
    await flush();
    expect(names()).toEqual([]);
  });

  it("cancel() a mitad de walkTo ignora el walkCompleted posterior", async () => {
    start({ instantWalk: false, record: ["custom"] });
    const run = rt.runScript([act.walkTo([3, 0, 3]), act.emit("after")]);
    await flush();
    run.cancel();
    expect(await run.done).toBe("cancelled");
    rt.emit({ type: "player:walkCompleted", position: [3, 0, 3] });
    await flush();
    expect(names()).toEqual([]);
  });

  it("cancel() es idempotente y no afecta a guiones ya terminados", async () => {
    start({ record: ["script:finished"] });
    const run = rt.runScript([]);
    await run.done;
    run.cancel();
    run.cancel();
    expect(h.events).toHaveLength(1);
    expect(await run.done).toBe("finished");
  });

  it("cancel() de un guion en cola lo saca de la cola sin ejecutarlo", async () => {
    start({ record: ["custom", "script:started", "script:finished"] });
    rt.runScript([act.wait(10)]);
    const queued = rt.runScript([act.emit("queued")]);
    queued.cancel();
    expect(await queued.done).toBe("cancelled");
    clock.advance(10);
    await flush();
    expect(names()).toEqual([]);
    // El cancelado en cola nunca arranco: no hay started/finished suyos.
    expect(h.events.filter((e) => e.type === "script:started")).toHaveLength(1);
  });

  it("script:cancelAll cancela el actual y la cola", async () => {
    start({ record: ["custom"] });
    const a = rt.runScript([act.wait(10), act.emit("a")]);
    const b = rt.runScript([act.emit("b")]);
    rt.executeCommand({ type: "script:cancelAll" });
    expect(await a.done).toBe("cancelled");
    expect(await b.done).toBe("cancelled");
    clock.advance(10);
    await flush();
    expect(names()).toEqual([]);
  });

  it("tras cancelAll se puede lanzar otro guion", async () => {
    start();
    rt.runScript([act.wait(10)]);
    rt.executeCommand({ type: "script:cancelAll" });
    const run = rt.runScript([act.setFlag("again")]);
    expect(await run.done).toBe("finished");
    expect(getWorldState().flags.again).toBe(true);
  });
});

describe("secuenciador: bloqueo de entrada", () => {
  it("se libera al terminar aunque el guion no lo libere", async () => {
    start({ record: ["input:lockChanged"] });
    const run = rt.runScript([act.lockInput(true), act.wait(5)]);
    await flush();
    expect(getInputLockState().inputLocked).toBe(true);
    clock.advance(5);
    await flush();
    expect(await run.done).toBe("finished");
    expect(getInputLockState().inputLocked).toBe(false);
    expect(h.events).toEqual([
      { type: "input:lockChanged", locked: true },
      { type: "input:lockChanged", locked: false },
    ]);
  });

  it("se libera al cancelar", async () => {
    start({ record: ["input:lockChanged"] });
    const run = rt.runScript([act.lockInput(true), act.say("k")]);
    await flush();
    expect(getInputLockState().inputLocked).toBe(true);
    run.cancel();
    expect(getInputLockState().inputLocked).toBe(false);
    expect(await run.done).toBe("cancelled");
    expect(h.events.at(-1)).toEqual({ type: "input:lockChanged", locked: false });
  });

  it("se libera al interrumpir con otro guion", async () => {
    start();
    rt.runScript([act.lockInput(true), act.wait(100)]);
    await flush();
    const next = rt.runScript([act.setFlag("x")], { interrupt: true });
    expect(await next.done).toBe("finished");
    expect(getInputLockState().inputLocked).toBe(false);
  });
});

describe("secuenciador: acciones desconocidas", () => {
  it("avisa una vez por forma, la salta y continua", async () => {
    start();
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const bad = { teleport: 1 } as never;
    const run = rt.runScript([bad, bad, { other: 2 } as never, act.setFlag("after")]);
    await flush();
    expect(warn).toHaveBeenCalledTimes(2);
    expect(getWorldState().flags.after).toBe(true);
    expect(await run.done).toBe("finished");
  });

  it("null, numeros y guion no-array no lanzan", async () => {
    start();
    vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(await rt.runScript([null as never, 5 as never, act.setFlag("ok")]).done).toBe("finished");
    expect(await rt.runScript(undefined as never).done).toBe("finished");
    expect(getWorldState().flags.ok).toBe(true);
  });
});

describe("pickBranch y constructores", () => {
  const ctx = (flags: Record<string, boolean> = {}): ConditionContext => ({
    flags,
    inventory: [],
    placedItems: [],
    sceneId: "s",
    visitedSceneIds: [],
  });

  it("devuelve la primera rama que cumple", () => {
    const branches: Branch[] = [
      branch(cond.flag("a"), act.emit("A")),
      branch(cond.flag("b"), act.emit("B")),
      otherwise(act.emit("D")),
    ];
    expect(pickBranch(branches, ctx({ b: true }))).toEqual([act.emit("B")]);
    expect(pickBranch(branches, ctx({ a: true, b: true }))).toEqual([act.emit("A")]);
    expect(pickBranch(branches, ctx())).toEqual([act.emit("D")]);
  });

  it("sin when se cumple siempre", () => {
    expect(pickBranch([{ do: [act.wait(1)] }], ctx())).toEqual([act.wait(1)]);
  });

  it("undefined, vacio o ninguna rama -> null", () => {
    expect(pickBranch(undefined, ctx())).toBeNull();
    expect(pickBranch([], ctx())).toBeNull();
    expect(pickBranch([branch(cond.flag("a"), act.wait(1))], ctx())).toBeNull();
  });

  it("funciona con getConditionContext y el resultado se puede ejecutar", async () => {
    start();
    getWorldState().setFlag("door", true);
    const script = pickBranch([branch(cond.flag("door"), act.setFlag("opened"))], getConditionContext());
    expect(script).not.toBeNull();
    expect(await rt.runScript(script!).done).toBe("finished");
    expect(getWorldState().flags.opened).toBe(true);
  });

  it("los constructores producen objetos planos serializables", () => {
    const script = [
      act.say("k", "Ana"),
      act.setFlag("f", 2),
      act.giveItem("i"),
      act.changeScene("s", [1, 0, 1]),
      act.emit("e", { x: 1 }),
      act.call("c", [1]),
      act.startDialogue("d"),
    ];
    expect(JSON.parse(JSON.stringify(script))).toEqual(script);
    expect(act.say("k")).toEqual({ say: "k" });
    expect(act.setFlag("f")).toEqual({ setFlag: "f" });
  });
});

describe("secuenciador: ciclo de vida del runtime", () => {
  it("dispose con un guion en curso lo cancela, libera el bloqueo y emite finished", async () => {
    start({ record: ["script:finished"] });
    const run = rt.runScript([act.lockInput(true), act.wait(100)]);
    const queued = rt.runScript([act.setFlag("never")]);
    await flush();
    rt.dispose();
    expect(await run.done).toBe("cancelled");
    expect(await queued.done).toBe("cancelled");
    expect(getInputLockState().inputLocked).toBe(false);
    expect(h.events).toEqual([{ type: "script:finished", id: 1, result: "cancelled" }]);
    expect(clock.pending()).toBe(0);
    clock.advance(100);
    await flush();
    expect(getWorldState().flags.never).toBeUndefined();
  });

  it("runScript tras dispose resuelve cancelled sin ejecutar", async () => {
    start();
    rt.dispose();
    expect(await rt.runScript([act.setFlag("x")]).done).toBe("cancelled");
    expect(getWorldState().flags.x).toBeUndefined();
  });

  it("dos runtimes consecutivos no dejan suscripciones", async () => {
    const tracker = trackBusSubscriptions();
    for (let i = 0; i < 2; i++) {
      const clk = new HeadlessClock();
      const r = createGameRuntime({ scenes: [makeScene("seq-a")], clock: clk, instantWalk: true });
      r.executeCommand({ type: "scene:set", sceneId: "seq-a" });
      const base = tracker.active();
      const s1 = r.runScript([act.say("k"), act.walkTo([2, 0, 2])]);
      await flush();
      expect(tracker.active()).toBeGreaterThan(base);
      s1.cancel();
      expect(tracker.active()).toBe(base);
      const s2 = r.runScript([act.walkTo([3, 0, 3]), act.wait(1)]);
      await flush();
      clk.advance(1);
      await flush();
      expect(await s2.done).toBe("finished");
      expect(tracker.active()).toBe(base);
      r.dispose();
    }
    expect(tracker.active()).toBe(0);
  });

  it("el guion del runtime anterior no se mezcla con el del siguiente", async () => {
    start();
    rt.runScript([act.say("old"), act.setFlag("old-after")]);
    await flush();
    rt.dispose();
    h = setup();
    rt = h.rt;
    const run = rt.runScript([act.setFlag("new")]);
    expect(await run.done).toBe("finished");
    dismissDialog(rt);
    await flush();
    expect(getWorldState().flags["old-after"]).toBeUndefined();
  });

  it("registerExecutor permite sustituir startDialogue sin tocar el bucle", async () => {
    start();
    // Punto de extension interno: se ejercita via createSequencer en el test de la tarea 07;
    // aqui se comprueba el contrato con un secuenciador independiente.
    const { createSequencer } = await import("../game/narrative/sequencer");
    const emitted: unknown[] = [];
    const seq = createSequencer({
      execute: () => {},
      emit: (e) => emitted.push(e),
      on: () => () => {},
      clock: new HeadlessClock(),
      instantWalk: true,
      getItem: () => undefined,
    });
    const seen: string[] = [];
    seq.registerExecutor("startDialogue", (a) => {
      seen.push((a as { startDialogue: string }).startDialogue);
    });
    expect(await seq.run([act.startDialogue("tree-1")]).done).toBe("finished");
    expect(seen).toEqual(["tree-1"]);
  });
});
