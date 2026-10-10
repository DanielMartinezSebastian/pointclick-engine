# Task 17.05 — Core: acciones y secuenciador

**Effort**: 5h | **Modelo**: sonnet | **Blocks**: 06–09, 17 | **Blocked by**: 02, 04

**Archivos permitidos**: `packages/engine-core/src/game/narrative/{actions,sequencer,branches,index}.ts`, `game/state/inputLockStore.ts`, `state/index.ts`, `game/commands/types.ts`, `game/events/types.ts`, `game/runtime/{types,executors,createGameRuntime}.ts`, `src/__tests__/sequencer*.test.ts`.

## 🎯 Objetivo

El corazón de la fase: ejecutar una lista de acciones en orden, esperando lo que haya que esperar.

## API

```ts
export type Action =
  | { say: string; speaker?: string }                 // clave de diálogo; espera al cierre
  | { setFlag: string; value?: FlagValue }            // por defecto true
  | { giveItem: string }
  | { removeItem: string }
  | { placeItem: PlacedSceneItem }
  | { removePlacedItem: string }
  | { changeScene: string; spawnPosition?: GameVec3 }
  | { walkTo: GameVec3 }                              // espera al fin o al aborto de la caminata
  | { wait: number }                                  // ms, vía ClockPort
  | { playSfx: string }
  | { startDialogue: string }                         // tarea 07; espera al final
  | { lockInput: boolean }
  | { emit: string; payload?: unknown }               // evento "custom:<nombre>"
  | { call: string; args?: unknown };                 // manejador registrado por el host

export type Script = Action[];
export type Branch = { when?: Condition; do: Script };
/** Devuelve el guion de la primera rama que cumple, o null. */
export function pickBranch(branches: Branch[] | undefined, ctx: ConditionContext): Script | null;

export interface ScriptRun {
  done: Promise<"finished" | "cancelled">;
  cancel(): void;
}
// GameRuntime gana:
//   runScript(script: Script, opts?: { interrupt?: boolean }): ScriptRun
//   registerHandler(name: string, fn: (args: unknown) => void | Promise<void>): () => void
// Comandos: script:run, script:cancelAll
// Eventos: script:started, script:finished, input:lockChanged, custom:<nombre>
```

## 📝 Instructions

1. No dupliques lógica: el secuenciador despacha comandos existentes y escucha eventos del `bus`. `say` usa `dialog:trigger` y espera a `dialog:dismissed`; `walkTo` usa `player:walkTo`.
2. Un guion a la vez: `runScript` con otro en curso lo encola; con `{ interrupt: true }` cancela el actual. Cancelar deja el estado coherente (libera el bloqueo de entrada).
3. `call` sin manejador registrado: `console.warn` y continúa. Un manejador puede devolver una promesa.
4. `GameRuntimeConfig` gana `clock?: ClockPort` (por defecto `systemClock`).
5. El bloqueo de entrada vive en un store (`inputLocked`) que el renderer leerá en la tarea 13.
6. Tests (≥ 30) con `HeadlessClock`: cada acción, orden, esperas, cancelación a mitad, cola, `pickBranch`, `call` síncrono y asíncrono, guion vacío.

## ✅ Success Criteria

- [ ] Tests del core verdes sin temporizadores reales (ningún test espera tiempo de reloj).
- [ ] `coreAgnosticism.test.ts` verde. Ningún archivo nuevo por encima de 250 líneas.
- [ ] `GameRuntime`, `GameCommand` y `GameEvent` solo crecen.
