import { describe, it, expect } from "vitest";
import { createSequencer, type Sequencer } from "../game/narrative";
import type { GameEvent } from "../game/events/types";
import { HeadlessClock } from "../ports/headlessClock";
import { flush } from "./sequencerHarness";

function make(): { seq: Sequencer; clock: HeadlessClock; events: GameEvent[]; log: string[] } {
  const clock = new HeadlessClock();
  const events: GameEvent[] = [];
  const log: string[] = [];
  const seq = createSequencer({
    execute: () => {},
    emit: (e) => events.push(e),
    on: () => () => {},
    clock,
    instantWalk: true,
    getItem: () => undefined,
  });
  seq.registerHandler("log", (a) => {
    log.push(String(a));
  });
  return { seq, clock, events, log };
}

const log = (s: string) => ({ call: "log", args: s });

describe("ActionContext.runInline", () => {
  it("ejecuta el sub-guion en orden dentro de la accion", async () => {
    const { seq, log: out } = make();
    seq.registerExecutor("startDialogue", async (_a, ctx) => {
      out.push("antes");
      await ctx.runInline([log("a"), log("b")]);
      out.push("despues");
    });
    const run = seq.run([log("0"), { startDialogue: "x" }, log("z")]);
    expect(await run.done).toBe("finished");
    expect(out).toEqual(["0", "antes", "a", "b", "despues", "z"]);
  });

  it("no emite script:started/finished extra ni usa la cola (sin interbloqueo)", async () => {
    const { seq, events } = make();
    seq.registerExecutor("startDialogue", (_a, ctx) => ctx.runInline([{ emit: "dentro" }]));
    const run = seq.run([{ startDialogue: "x" }]);
    await run.done;
    const types = events.map((e) => e.type);
    expect(types.filter((t) => t === "script:started")).toHaveLength(1);
    expect(types.filter((t) => t === "script:finished")).toHaveLength(1);
    expect(types).toContain("custom");
  });

  it("espera las acciones asincronas del sub-guion", async () => {
    const { seq, clock, log: out } = make();
    seq.registerExecutor("startDialogue", async (_a, ctx) => {
      await ctx.runInline([{ wait: 50 }, log("tras-espera")]);
      out.push("fin");
    });
    const run = seq.run([{ startDialogue: "x" }]);
    await flush();
    expect(out).toEqual([]);
    clock.advance(50);
    await run.done;
    expect(out).toEqual(["tras-espera", "fin"]);
  });

  it("la cancelacion a mitad corta el sub-guion y el guion", async () => {
    const { seq, clock, log: out } = make();
    let inlineReturned = false;
    seq.registerExecutor("startDialogue", async (_a, ctx) => {
      await ctx.runInline([log("1"), { wait: 100 }, log("2")]);
      inlineReturned = true;
    });
    const run = seq.run([{ startDialogue: "x" }, log("3")]);
    await flush();
    run.cancel();
    clock.advance(100);
    expect(await run.done).toBe("cancelled");
    await flush();
    expect(inlineReturned).toBe(true);
    expect(out).toEqual(["1"]);
  });

  it("un script no valido se trata como vacio", async () => {
    const { seq } = make();
    seq.registerExecutor("startDialogue", (_a, ctx) =>
      ctx.runInline(undefined as unknown as never[]),
    );
    expect(await seq.run([{ startDialogue: "x" }]).done).toBe("finished");
  });
});
