# 1. Escenas, transiciones, hotspots y verbos

Una escena es un objeto `GameSceneConfig` (`packages/engine-core/src/game/runtime/types.ts`). Esta guía cubre lo que añade la 0.6.0: `hotspots`, `npcs` (ver [03](03-dialogues-and-npcs.md)), `initialItems` y `onEnter` (ver [02](02-conditions-and-actions.md) y [04](04-items-and-combining.md)) y las condiciones de las transiciones.

## Hotspots

Un hotspot es una caja clicable con reglas por **verbo**. Tipos reales (`packages/engine-core/src/game/types/index.ts`):

```ts
export type Verb = "look" | "use" | "talk";

export interface GameSceneHotspot {
  id: string;
  /** Clave de i18n. */
  label: string;
  position: GameVec3;
  halfSize: GameVec3;
  rotationY?: number;
  visibleWhen?: Condition;
  hasCollision?: boolean;
  /** Punto al que camina el jugador antes de actuar. Sin el, actua desde donde esta. */
  approach?: GameVec3;
  verbs?: Partial<Record<Verb, Branch[]>>;
  /** Ramas por itemId al usar un item del inventario sobre el hotspot. */
  useItem?: Record<string, Branch[]>;
  /** Ramas para un item sin regla propia en `useItem`. */
  useItemDefault?: Branch[];
}
```

- Cada verbo (y cada `useItem[itemId]`) es una lista de **ramas** `{ when?, do }`: gana la primera cuyo `when` se cumple (sin `when` se cumple siempre). Ver [02](02-conditions-and-actions.md).
- Un verbo sin rama aplicable no aparece en el menú. Orden de preferencia del verbo por defecto: `talk`, `use`, `look` (`getDefaultVerb`, `packages/engine-core/src/game/narrative/hotspots.ts`).
- Si solo hay un verbo aplicable, el click lo ejecuta; si hay varios, el renderer muestra `VerbMenu`.
- `approach`: el jugador camina ahí antes del guion (se antepone un `walkTo`).
- `visibleWhen`: oculta el hotspot mientras no se cumpla.
- Soltar un ítem del inventario sobre el hotspot equivale al verbo `useItem` (`hotspot:interact` con `verb: "useItem"`).

Si no hay regla aplicable, el comando emite `hotspot:noAction` (`reason`: `"not-found" | "hidden" | "missing-item" | "no-rule"`) y el renderer dice la frase `engine.hotspot.noAction`.

## Ejemplo: el cofre y el mapa de "El faro"

Copiado de `packages/engine-core/src/__tests__/fixtures/miniAdventure.ts` (escena `beach`):

```ts
import { act, branch, cond, otherwise, type GameSceneConfig } from "@pointclick-engine/engine-core";

const zone = [0.5, 1, 0.5] as [number, number, number];

const hotspots: GameSceneConfig["hotspots"] = [
  {
    id: "chest",
    label: "chest.label",
    position: [-3, 0, 2],
    halfSize: zone,
    approach: [-2, 0, 2],
    verbs: {
      look: [otherwise(act.say("chest.look"))],
      use: [
        branch(cond.flag("chest.open"), act.say("chest.empty")),
        otherwise(act.say("chest.locked")),
      ],
    },
    useItem: {
      "rusty-key": [
        branch(cond.flag("chest.open"), act.say("chest.alreadyOpen")),
        otherwise(
          act.say("chest.unlock"),
          act.removeItem("rusty-key"),
          act.setFlag("chest.open"),
          act.giveItem("lens"),
        ),
      ],
    },
    useItemDefault: [otherwise(act.say("chest.nothing"))],
  },
  {
    id: "map",
    label: "map.label",
    position: [0, 0, -3],
    halfSize: zone,
    verbs: { look: [otherwise(act.say("map.look"), act.setFlag("map.seen"))] },
  },
];
```

Lee: mirar el cofre siempre da la misma frase; usarlo dice "cerrado" hasta que `chest.open`; la llave lo abre una vez; cualquier otro ítem cae en `useItemDefault`.

## Transiciones con condición

Todas las transiciones (`collision`, `item-drop`...) aceptan dos campos nuevos (`BaseSceneTransition`, mismo archivo de tipos):

```ts
  /**
   * Condicion para que la transicion ocurra (todos los tipos). Sin ella, siempre ocurre.
   * Si no se cumple no hay cambio de escena y, si existe, corre `blocked`.
   */
  when?: Condition;
  /** Guion que corre al intentar la transicion sin cumplir `when`. */
  blocked?: Script;
```

Del fixture (escena `cove`):

```ts
transitions: [
  {
    id: "to-lighthouse",
    kind: "collision",
    targetSceneId: "lighthouse",
    position: [0, 0, 7],
    halfSize: [2, 1, 0.5],
    when: cond.flag("keeper.lit"),
    blocked: [act.say("lighthouse.locked")],
  },
],
```

El renderer aplica `when`/`blocked` con `evaluateTransitionGate` antes de cambiar de escena. El callback `canLeaveScene` de 0.5.0 sigue existiendo como vía avanzada y se evalúa **después**: solo si `when` deja pasar puede además vetar.

## Elementos de escena declarativos

| Campo | Qué es | Guía |
|-------|--------|------|
| `hotspots` | cajas con verbos | esta |
| `npcs` | personajes con los que hablar | [03](03-dialogues-and-npcs.md) |
| `initialItems` | ítems sembrados una vez por escena, con `when` opcional | [04](04-items-and-combining.md) |
| `onEnter` | ramas que corren en cada entrada | [02](02-conditions-and-actions.md) |

Los hotspots y NPC se conservan al registrar la escena (`registerScene` / `scenes` de `createGameRuntime`).
