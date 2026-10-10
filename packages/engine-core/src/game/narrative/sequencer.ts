import type { ScriptHandler } from "../runtime/types";
import type { Action, Script, ScriptRun } from "./actions";
import {
  applyInputLock,
  createDefaultExecutors,
  type ActionContext,
  type ActionExecutor,
  type SequencerEnv,
} from "./actionExecutors";

type Result = "finished" | "cancelled";

interface Entry {
  id: number;
  script: Script;
  started: boolean;
  settled: boolean;
  cancelled: boolean;
  /** true si este guion dejo el bloqueo de entrada activo. */
  lockedByMe: boolean;
  /** Esperas pendientes de la accion en curso; cancelar las resuelve y limpia. */
  aborts: Set<() => void>;
  resolve: (result: Result) => void;
}

export type SequencerEnvInput = Omit<SequencerEnv, "getHandler">;

export interface Sequencer {
  /** Ejecuta un guion: uno a la vez, el resto en cola FIFO. */
  run(script: Script, opts?: { interrupt?: boolean }): ScriptRun;
  /** Cancela el guion en curso y vacia la cola. */
  cancelAll(): void;
  /**
   * Punto de extension: registra (o sustituye) el ejecutor de una clave de accion.
   * Devuelve la funcion que restaura el ejecutor anterior.
   */
  registerExecutor(key: string, executor: ActionExecutor): () => void;
  /** Manejadores de la accion `call`. Devuelve la funcion que lo quita. */
  registerHandler(name: string, fn: ScriptHandler): () => void;
  /** Cancela todo y deja de aceptar guiones. */
  dispose(): void;
}

export function createSequencer(input: SequencerEnvInput): Sequencer {
  const handlers = new Map<string, ScriptHandler>();
  const executors = createDefaultExecutors();
  const env: SequencerEnv = { ...input, getHandler: (name) => handlers.get(name) };
  const queue: Entry[] = [];
  const warnedShapes = new Set<string>();
  let current: Entry | null = null;
  let nextId = 1;
  let disposed = false;

  function settle(entry: Entry, result: Result): void {
    if (entry.settled) return;
    entry.settled = true;
    if (result === "cancelled") {
      entry.cancelled = true;
      for (const abort of [...entry.aborts]) abort();
    }
    if (entry.lockedByMe) {
      entry.lockedByMe = false;
      applyInputLock(env, false);
    }
    if (current === entry) current = null;
    if (entry.started) env.emit({ type: "script:finished", id: entry.id, result });
    entry.resolve(result);
    pump();
  }

  function makeContext(entry: Entry): ActionContext {
    return {
      env,
      isCancelled: () => entry.cancelled,
      setInputLock: (locked) => {
        if (entry.cancelled) return;
        entry.lockedByMe = locked;
        applyInputLock(env, locked);
      },
      wait: (arm) =>
        new Promise<void>((resolve) => {
          if (entry.cancelled) return resolve();
          let done = false;
          let cleanup: (() => void) | null = null;
          const finish = () => {
            if (done) return;
            done = true;
            entry.aborts.delete(finish);
            cleanup?.();
            resolve();
          };
          entry.aborts.add(finish);
          cleanup = arm(finish);
          if (done) cleanup();
        }),
    };
  }

  async function runAction(action: Action, ctx: ActionContext): Promise<void> {
    const shape =
      action !== null && typeof action === "object"
        ? Object.keys(action).find((k) => executors.has(k))
        : undefined;
    if (shape === undefined) {
      const label =
        action !== null && typeof action === "object" ? Object.keys(action).sort().join(",") : String(action);
      if (!warnedShapes.has(label)) {
        warnedShapes.add(label);
        console.warn("[sequencer] Accion con forma desconocida, se salta:", action);
      }
      return;
    }
    try {
      await executors.get(shape)!(action, ctx);
    } catch (error) {
      console.error(`[sequencer] la accion "${shape}" fallo, el guion continua:`, error);
    }
  }

  async function loop(entry: Entry): Promise<void> {
    const ctx = makeContext(entry);
    const script = Array.isArray(entry.script) ? entry.script : [];
    for (const action of script) {
      if (entry.cancelled) return;
      await runAction(action, ctx);
    }
    settle(entry, "finished");
  }

  function pump(): void {
    if (current || disposed) return;
    const next = queue.shift();
    if (!next) return;
    current = next;
    next.started = true;
    env.emit({ type: "script:started", id: next.id });
    void loop(next);
  }

  function cancelAll(): void {
    const pending = queue.splice(0);
    for (const entry of pending) settle(entry, "cancelled");
    if (current) settle(current, "cancelled");
  }

  function run(script: Script, opts?: { interrupt?: boolean }): ScriptRun {
    if (disposed) return { done: Promise.resolve("cancelled"), cancel: () => {} };
    let resolve!: (r: Result) => void;
    const done = new Promise<Result>((r) => (resolve = r));
    const entry: Entry = {
      id: nextId++,
      script,
      started: false,
      settled: false,
      cancelled: false,
      lockedByMe: false,
      aborts: new Set(),
      resolve,
    };
    // Interrumpir antes de encolar: el nuevo no se cancela a si mismo.
    if (opts?.interrupt) cancelAll();
    queue.push(entry);
    pump();
    return {
      done,
      cancel: () => {
        const i = queue.indexOf(entry);
        if (i >= 0) queue.splice(i, 1);
        settle(entry, "cancelled");
      },
    };
  }

  return {
    run,
    cancelAll,
    registerExecutor(key, executor) {
      const previous = executors.get(key);
      executors.set(key, executor);
      return () => {
        if (executors.get(key) !== executor) return;
        if (previous) executors.set(key, previous);
        else executors.delete(key);
      };
    },
    registerHandler(name, fn) {
      handlers.set(name, fn);
      return () => {
        if (handlers.get(name) === fn) handlers.delete(name);
      };
    },
    dispose() {
      cancelAll();
      disposed = true;
      handlers.clear();
    },
  };
}
