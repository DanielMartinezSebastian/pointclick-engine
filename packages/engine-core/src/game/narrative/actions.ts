import type { GameVec3, PlacedSceneItem } from "../types";
import type { FlagValue } from "../state/worldStateStore";
import type { Condition } from "./conditions";

/**
 * Acciones: dato serializable que describe QUE pasa, en orden. El secuenciador
 * (sequencer.ts) las ejecuta despachando comandos existentes y esperando eventos.
 */
export type Action =
  | { say: string; speaker?: string } // clave de dialogo; espera al cierre
  | { setFlag: string; value?: FlagValue } // por defecto true
  | { giveItem: string }
  | { removeItem: string }
  | { placeItem: PlacedSceneItem }
  | { removePlacedItem: string }
  | { changeScene: string; spawnPosition?: GameVec3 }
  | { walkTo: GameVec3 } // espera al fin o al aborto de la caminata
  | { wait: number } // ms, via ClockPort
  | { playSfx: string }
  | { startDialogue: string } // tarea 07; espera al final
  | { lockInput: boolean }
  | { emit: string; payload?: unknown } // evento { type: "custom", name, payload }
  | { call: string; args?: unknown }; // manejador registrado por el host

export type Script = Action[];

/** Rama condicional: sin `when` se cumple siempre. */
export type Branch = { when?: Condition; do: Script };

export interface ScriptRun {
  /** Resuelve cuando el guion termina o se cancela (nunca rechaza). */
  done: Promise<"finished" | "cancelled">;
  /** Cancela el guion (en curso o en cola). Idempotente. */
  cancel(): void;
}

/** Constructores: devuelven objetos planos serializables. */
export const act = {
  say: (key: string, speaker?: string): Action =>
    speaker === undefined ? { say: key } : { say: key, speaker },
  setFlag: (name: string, value?: FlagValue): Action =>
    value === undefined ? { setFlag: name } : { setFlag: name, value },
  giveItem: (id: string): Action => ({ giveItem: id }),
  removeItem: (id: string): Action => ({ removeItem: id }),
  placeItem: (item: PlacedSceneItem): Action => ({ placeItem: item }),
  removePlacedItem: (id: string): Action => ({ removePlacedItem: id }),
  changeScene: (sceneId: string, spawnPosition?: GameVec3): Action =>
    spawnPosition === undefined ? { changeScene: sceneId } : { changeScene: sceneId, spawnPosition },
  walkTo: (position: GameVec3): Action => ({ walkTo: position }),
  wait: (ms: number): Action => ({ wait: ms }),
  playSfx: (url: string): Action => ({ playSfx: url }),
  lockInput: (locked: boolean): Action => ({ lockInput: locked }),
  emit: (name: string, payload?: unknown): Action =>
    payload === undefined ? { emit: name } : { emit: name, payload },
  call: (name: string, args?: unknown): Action =>
    args === undefined ? { call: name } : { call: name, args },
  startDialogue: (id: string): Action => ({ startDialogue: id }),
};

/** Rama con condicion: `branch(cond.flag("x"), act.say("a"), act.wait(10))`. */
export const branch = (when: Condition, ...actions: Action[]): Branch => ({ when, do: actions });

/** Rama por defecto (sin condicion); ponla la ultima. */
export const otherwise = (...actions: Action[]): Branch => ({ do: actions });
