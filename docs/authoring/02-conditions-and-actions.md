# 2. Flags, condiciones y acciones

El estado de mundo son **flags** con nombre (`boolean | number | string`, `FlagValue` en `packages/engine-core/src/game/state/worldStateStore.ts`) y la lista de escenas visitadas. Las condiciones lo leen sin efectos; las acciones lo cambian y mueven el juego.

## Condiciones

Tipo real (`packages/engine-core/src/game/narrative/conditions.ts`):

```ts
export type Condition =
  | { flag: string; equals?: FlagValue; gte?: number; lte?: number } // sin operador: "es verdadero"
  | { hasItem: string; atLeast?: number }
  | { itemPlaced: string; inScene?: string; at?: string } // at = interactionId
  | { inScene: string }
  | { visited: string }
  | { all: Condition[] }
  | { any: Condition[] }
  | { not: Condition };
```

- `flag` sin operador es verdadero para `true`, un número distinto de 0 o un texto no vacío. Un flag nunca puesto es falso.
- Una condición `undefined` cuenta como verdadera. Una forma desconocida se evalúa a `false` (con un `console.warn`).
- Constructores `cond`: `cond.flag("x")`, `cond.flag("n", { gte: 3 })`, `cond.hasItem`, `cond.itemPlaced`, `cond.inScene`, `cond.visited`, `cond.all(...)`, `cond.any(...)`, `cond.not(c)`. Devuelven objetos planos.

## Acciones y guiones

Tipo real (`packages/engine-core/src/game/narrative/actions.ts`):

```ts
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
export type Branch = { when?: Condition; do: Script };
```

Un **guion** es una lista de acciones que se ejecutan **en orden**, una a la vez. Constructores `act.*` (uno por acción) y, para ramas, `branch(when, ...acciones)` y `otherwise(...acciones)` (rama sin condición, siempre la última).

Un guion lo ejecuta el secuenciador: cola FIFO, cancelable, con `ClockPort` inyectado. Desde fuera: `runtime.runScript(script, { interrupt? })` o el comando `script:run` (`interrupt` cancela el actual y vacía la cola); `script:cancelAll` los cancela todos. Eventos: `script:started`, `script:finished` (`result: "finished" | "cancelled"`).

### Ramas: gana la primera

`pickBranch` recorre las ramas en orden y corre la primera cuyo `when` se cumple. Por eso `otherwise(...)` va al final:

```ts
use: [
  branch(cond.flag("chest.open"), act.say("chest.empty")),
  otherwise(act.say("chest.locked")),
],
```

## Dos reglas de orden que muerden

**`say` espera a que se cierre el bocadillo** (unos segundos): el guion no sigue hasta el evento `dialog:dismissed`. Los cambios de estado que deban quedar hechos cuanto antes (`giveItem`, `removeItem`, `setFlag`...) van **antes** del `say`. Así lo hace la demo en `demo-content/items/index.ts`:

```ts
combine: {
  "key-bit": [
    otherwise(
      // `say` espera a que se cierre el bocadillo: el resultado va antes que la frase.
      act.removeItem("key-handle"),
      act.removeItem("key-bit"),
      act.giveItem("bronze-key"),
      act.say("combine.key.done"),
    ),
  ],
},
```

**`onEnter` "solo la primera vez" se hace con un flag, no con `visited`.** Cuando se evalúa `onEnter`, la escena ya cuenta como visitada: `not(visited(...))` nunca se cumpliría. Del fixture (escena `beach`):

```ts
// Solo la primera vez: el flag, no `visited` (al evaluarse la escena ya cuenta como visitada).
onEnter: [branch(cond.not(cond.flag("intro.done")), act.say("beach.intro"), act.setFlag("intro.done"))],
```

`onEnter` corre en **cada** entrada a la escena; sin flag, repite (la demo lo usa así para su bienvenida: `onEnter: [otherwise(act.say("personalRoomWelcome"))]`).

## Cuándo usar `call`

`call` invoca un manejador con nombre que registra el host: es la vía de escape para lo que el vocabulario no cubre (créditos, analíticas, abrir una pantalla). Si el mismo `call` se repite en varios juegos, es candidato a acción nueva. Del fixture, escena `lighthouse`:

```ts
onEnter: [
  branch(
    cond.flag("keeper.lit"),
    act.say("lighthouse.ending"),
    act.call("credits", { ending: "good" }),
    act.setFlag("game.finished"),
  ),
],
```

El host lo registra con `runtime.registerHandler("credits", (args) => ...)` (devuelve la función que lo quita). Para que `validateContent` avise de un `call` sin manejador, pasa sus nombres en `handlerNames` de la config del runtime (en `GameContent` el campo se llama `handlers`). Un `call` sin manejador avisa por consola y el guion continúa; si el manejador devuelve una promesa, el guion la espera.

## Quién aplica las reglas declarativas

`initialItems`, `onEnter` y `transition.when`/`blocked` los aplica el **renderer** con funciones puras del core (`resolveInitialItems`, `resolveEnterScript`, `evaluateTransitionGate`). En headless los aplica `createPlaythrough` ([05](05-saving-and-testing.md)). Los callbacks de 0.5.0 (`canLeaveScene`, `onSceneEnter`, `getInitialPlacedItems`) siguen funcionando, se evalúan **después** de los declarativos y son vía avanzada.
