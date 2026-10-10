import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import {
  act,
  getDialogState,
  getGameState,
  getInventoryState,
  getPlacedItemsState,
  getWorldState,
  type GameRuntime,
  type PlacedSceneItem,
} from "../index";
import { dismissDialog, flush, getInputLockState, resetStores, setup, type Harness } from "./sequencerHarness";
import type { HeadlessClock } from "../ports/headlessClock";

let h: Harness;
let rt: GameRuntime;
let clock: HeadlessClock;

function start(opts?: Parameters<typeof setup>[0]) {
  h = setup(opts);
  rt = h.rt;
  clock = h.clock;
}

beforeEach(resetStores);
afterEach(() => {
  h?.rt.dispose();
  resetStores();
  vi.restoreAllMocks();
});

const placed: PlacedSceneItem = {
  id: "p1",
  itemId: "seq-key",
  interactionId: "table",
  name: "Key",
  spriteUrl: "/k.png",
  worldPosition: [0, 0, 0],
  canPickup: true,
  sceneId: "seq-a",
};

describe("secuenciador: acciones", () => {
  it("setFlag pone true por defecto", async () => {
    start();
    const run = rt.runScript([act.setFlag("seen")]);
    await flush();
    expect(getWorldState().flags.seen).toBe(true);
    expect(await run.done).toBe("finished");
  });

  it("setFlag con valor explicito", async () => {
    start();
    rt.runScript([act.setFlag("n", 3), act.setFlag("s", "x")]);
    await flush();
    expect(getWorldState().flags).toEqual({ n: 3, s: "x" });
  });

  it("changeScene sin spawn usa el de la escena", async () => {
    start();
    rt.runScript([act.changeScene("seq-b")]);
    await flush();
    expect(getGameState().sceneId).toBe("seq-b");
    expect(getGameState().playerPosition).toEqual([-1, 0, -1]);
  });

  it("changeScene con spawnPosition", async () => {
    start();
    rt.runScript([act.changeScene("seq-b", [2, 0, 2])]);
    await flush();
    expect(getGameState().playerPosition).toEqual([2, 0, 2]);
  });

  it("giveItem toma nombre y sprite del registro y emite item:pickedUp", async () => {
    start({ record: ["item:pickedUp"] });
    rt.runScript([act.giveItem("seq-key")]);
    await flush();
    expect(getInventoryState().slots[0]).toMatchObject({ id: "seq-key", name: "Name seq-key", spriteUrl: "/seq-key.png" });
    expect(h.events).toEqual([{ type: "item:pickedUp", itemId: "seq-key", quantity: 1 }]);
  });

  it("giveItem de un item no registrado avisa y continua", async () => {
    start();
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const run = rt.runScript([act.giveItem("nope"), act.setFlag("after")]);
    await flush();
    expect(warn).toHaveBeenCalled();
    expect(getWorldState().flags.after).toBe(true);
    expect(await run.done).toBe("finished");
  });

  it("giveItem con inventario lleno avisa, emite inventory:full y continua", async () => {
    start({ record: ["inventory:full", "item:pickedUp"] });
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    getInventoryState().setSlotCount(1);
    getInventoryState().addItem({ id: "other", name: "O", spriteUrl: "/o.png" });
    const run = rt.runScript([act.giveItem("seq-key"), act.setFlag("after")]);
    await flush();
    expect(warn).toHaveBeenCalled();
    expect(h.events).toEqual([{ type: "inventory:full", itemId: "seq-key" }]);
    expect(getWorldState().flags.after).toBe(true);
    expect(await run.done).toBe("finished");
  });

  it("removeItem quita una unidad y emite item:removed", async () => {
    start({ record: ["item:removed"] });
    getInventoryState().addItem({ id: "seq-coin", name: "C", spriteUrl: "/c.png" });
    getInventoryState().addItem({ id: "seq-coin", name: "C", spriteUrl: "/c.png" });
    rt.runScript([act.removeItem("seq-coin")]);
    await flush();
    expect(getInventoryState().slots[0]?.quantity).toBe(1);
    expect(h.events).toEqual([{ type: "item:removed", itemId: "seq-coin" }]);
  });

  it("removeItem de algo que no hay avisa y no emite", async () => {
    start({ record: ["item:removed"] });
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    rt.runScript([act.removeItem("seq-coin")]);
    await flush();
    expect(warn).toHaveBeenCalled();
    expect(h.events).toEqual([]);
  });

  it("placeItem y removePlacedItem usan el store de items colocados", async () => {
    start();
    rt.runScript([act.placeItem(placed)]);
    await flush();
    expect(getPlacedItemsState().items).toEqual([placed]);
    rt.runScript([act.removePlacedItem("p1")]);
    await flush();
    expect(getPlacedItemsState().items).toEqual([]);
  });

  it("playSfx despacha audio:playSfx", async () => {
    start();
    const spy = vi.spyOn(rt, "executeCommand").mockImplementation(() => {});
    rt.runScript([act.playSfx("/s.mp3")]);
    await flush();
    expect(spy).toHaveBeenCalledWith({ type: "audio:playSfx", soundUrl: "/s.mp3" });
  });

  it("emit emite un evento custom con name y payload", async () => {
    start({ record: ["custom"] });
    rt.runScript([act.emit("boom", { n: 1 }), act.emit("plain")]);
    await flush();
    expect(h.events).toEqual([
      { type: "custom", name: "boom", payload: { n: 1 } },
      { type: "custom", name: "plain" },
    ]);
  });

  it("lockInput escribe el store y emite input:lockChanged solo al cambiar", async () => {
    start({ record: ["input:lockChanged"] });
    rt.runScript([act.lockInput(true), act.lockInput(true), act.lockInput(false), act.lockInput(false)]);
    await flush();
    expect(h.events).toEqual([
      { type: "input:lockChanged", locked: true },
      { type: "input:lockChanged", locked: false },
    ]);
    expect(getInputLockState().inputLocked).toBe(false);
  });

  it("startDialogue sin ejecutor avisa y continua", async () => {
    start();
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const run = rt.runScript([act.startDialogue("d1"), act.setFlag("after")]);
    await flush();
    expect(warn).toHaveBeenCalled();
    expect(getWorldState().flags.after).toBe(true);
    expect(await run.done).toBe("finished");
  });
});

describe("secuenciador: orden y esperas", () => {
  it("ejecuta en orden estricto", async () => {
    start({ record: ["custom"] });
    rt.runScript([act.emit("a"), act.wait(10), act.emit("b"), act.emit("c")]);
    await flush();
    expect(h.events.map((e) => (e as { name: string }).name)).toEqual(["a"]);
    clock.advance(10);
    await flush();
    expect(h.events.map((e) => (e as { name: string }).name)).toEqual(["a", "b", "c"]);
  });

  it("say muestra el texto, pasa el speaker y espera a dialog:dismissed", async () => {
    start({ record: ["dialog:triggered"] });
    const run = rt.runScript([act.say("k1", "Ana"), act.setFlag("after")]);
    await flush();
    expect(getDialogState()).toMatchObject({ visible: true, key: "k1", text: "k1", speaker: "Ana" });
    expect(h.events[0]).toMatchObject({ type: "dialog:triggered", dialogKey: "k1", speaker: "Ana" });
    expect(getWorldState().flags.after).toBeUndefined();
    dismissDialog(rt);
    await flush();
    expect(getWorldState().flags.after).toBe(true);
    expect(await run.done).toBe("finished");
  });

  it("say sin speaker no anade el campo al evento", async () => {
    start({ record: ["dialog:triggered"] });
    rt.runScript([act.say("k2")]);
    await flush();
    expect("speaker" in h.events[0]!).toBe(false);
    expect(getDialogState().speaker).toBeUndefined();
  });

  it("wait espera al reloj", async () => {
    start();
    const run = rt.runScript([act.wait(100), act.setFlag("after")]);
    await flush();
    clock.advance(99);
    await flush();
    expect(getWorldState().flags.after).toBeUndefined();
    clock.advance(1);
    await flush();
    expect(getWorldState().flags.after).toBe(true);
    expect(await run.done).toBe("finished");
  });

  it("wait 0 se resuelve con advance(0)", async () => {
    start();
    const run = rt.runScript([act.wait(0), act.setFlag("after")]);
    await flush();
    clock.advance(0);
    await flush();
    expect(getWorldState().flags.after).toBe(true);
    expect(await run.done).toBe("finished");
  });

  it("walkTo con instantWalk mueve al jugador y emite walkCompleted", async () => {
    start({ record: ["player:walkCompleted"] });
    const run = rt.runScript([act.walkTo([3, 0, 3]), act.setFlag("after")]);
    await flush();
    expect(getGameState().playerPosition).toEqual([3, 0, 3]);
    expect(h.events).toEqual([{ type: "player:walkCompleted", position: [3, 0, 3] }]);
    expect(getWorldState().flags.after).toBe(true);
    expect(await run.done).toBe("finished");
  });

  it("walkTo sin instantWalk espera a player:walkCompleted", async () => {
    start({ instantWalk: false });
    const run = rt.runScript([act.walkTo([3, 0, 3]), act.setFlag("after")]);
    await flush();
    expect(getWorldState().flags.after).toBeUndefined();
    rt.emit({ type: "player:walkCompleted", position: [3, 0, 3] });
    await flush();
    expect(getWorldState().flags.after).toBe(true);
    expect(await run.done).toBe("finished");
  });

  it("walkTo sin instantWalk: player:walkAborted termina la accion y el guion continua", async () => {
    start({ instantWalk: false });
    const run = rt.runScript([act.walkTo([3, 0, 3]), act.setFlag("after")]);
    await flush();
    rt.emit({ type: "player:walkAborted", reason: "user-input" });
    await flush();
    expect(getWorldState().flags.after).toBe(true);
    expect(await run.done).toBe("finished");
  });

  it("walkTo a destino inalcanzable aborta y el guion continua (instantWalk)", async () => {
    start({ record: ["player:walkAborted", "player:walkCompleted"] });
    rt.executeCommand({ type: "scene:set", sceneId: "seq-blocked" });
    const run = rt.runScript([act.walkTo([3, 0, 3]), act.setFlag("after")]);
    await flush();
    expect(h.events).toEqual([{ type: "player:walkAborted", reason: "unreachable" }]);
    expect(getGameState().playerPosition).toEqual([1, 0, 1]);
    expect(getWorldState().flags.after).toBe(true);
    expect(await run.done).toBe("finished");
  });
});

describe("secuenciador: call", () => {
  it("manejador sincrono con args", async () => {
    start();
    const fn = vi.fn();
    rt.registerHandler("h", fn);
    const run = rt.runScript([act.call("h", { a: 1 }), act.setFlag("after")]);
    await flush();
    expect(fn).toHaveBeenCalledWith({ a: 1 });
    expect(getWorldState().flags.after).toBe(true);
    expect(await run.done).toBe("finished");
  });

  it("manejador asincrono: se espera a la promesa", async () => {
    start();
    let release!: () => void;
    rt.registerHandler("slow", () => new Promise<void>((r) => (release = r)));
    rt.runScript([act.call("slow"), act.setFlag("after")]);
    await flush();
    expect(getWorldState().flags.after).toBeUndefined();
    release();
    await flush();
    expect(getWorldState().flags.after).toBe(true);
  });

  it("sin manejador: warn y continua", async () => {
    start();
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const run = rt.runScript([act.call("ghost"), act.setFlag("after")]);
    await flush();
    expect(warn).toHaveBeenCalled();
    expect(getWorldState().flags.after).toBe(true);
    expect(await run.done).toBe("finished");
  });

  it("manejador que lanza: error y continua", async () => {
    start();
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    rt.registerHandler("bad", () => {
      throw new Error("x");
    });
    const run = rt.runScript([act.call("bad"), act.setFlag("after")]);
    await flush();
    expect(error).toHaveBeenCalled();
    expect(getWorldState().flags.after).toBe(true);
    expect(await run.done).toBe("finished");
  });

  it("manejador que rechaza: error y continua", async () => {
    start();
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    rt.registerHandler("rej", () => Promise.reject(new Error("x")));
    const run = rt.runScript([act.call("rej"), act.setFlag("after")]);
    await flush();
    expect(error).toHaveBeenCalled();
    expect(getWorldState().flags.after).toBe(true);
    expect(await run.done).toBe("finished");
  });

  it("registerHandler devuelve la funcion que lo quita", async () => {
    start();
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const fn = vi.fn();
    const off = rt.registerHandler("h", fn);
    off();
    rt.runScript([act.call("h")]);
    await flush();
    expect(fn).not.toHaveBeenCalled();
  });
});
