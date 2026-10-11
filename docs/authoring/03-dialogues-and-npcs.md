# 3. Diálogos con opciones y NPCs

No confundir: `dialog:*` (singular) es el **bocadillo de una frase**; `dialogue:*` es una **conversación** con varios turnos y opciones.

## Árbol de diálogo

Tipos reales (`packages/engine-core/src/game/narrative/dialogueTypes.ts`):

```ts
export interface DialogueChoice {
  /** Clave de i18n del texto de la opcion. */
  text: string;
  /** Opcion oculta si no se cumple. */
  when?: Condition;
  /** Desaparece tras elegirla (se recuerda con el flag `dlg.<dialogue>.<node>.<indice>`). */
  once?: boolean;
  do?: Script;
  next?: string;
}

export interface DialogueNode {
  id: string;
  /** Id de NPC o "player". */
  speaker?: string;
  /** Clave de i18n; sin linea, el nodo solo ejecuta `do`. */
  line?: string;
  /** Efectos al entrar en el nodo (se esperan antes de seguir). */
  do?: Script;
  /** Sin opciones visibles, avanza a `next`. */
  choices?: DialogueChoice[];
  /** Sin next ni opciones visibles, el dialogo termina. */
  next?: string;
}

export interface DialogueDefinition { id: string; start: string; nodes: DialogueNode[] }
```

Constructores: `dialogue.define(id, start, ...nodos)`, `dialogue.node(id, props)`, `dialogue.choice(text, props)`. Se registran en `dialogues` de `createGameRuntime`. La conversación termina con `dialogue:ended` (`reason`: `"finished" | "ended" | "cancelled"`).

Ejemplo del fixture (`miniAdventure.ts`, pescador de la playa):

```ts
import { act, cond, dialogue } from "@pointclick-engine/engine-core";

dialogue.define(
  "fisher-talk",
  "root",
  dialogue.node("root", {
    speaker: "fisherman",
    line: "fisher.hello",
    choices: [
      // 0: la pista solo si ya se miro el mapa; una sola vez.
      dialogue.choice("ask.frame", {
        when: cond.flag("map.seen"),
        once: true,
        do: [act.say("fisher.frame", "fisherman"), act.giveItem("lamp-frame")],
        next: "root",
      }),
      // 1: saludo, solo la primera vez.
      dialogue.choice("ask.weather", { once: true, do: [act.say("fisher.weather", "fisherman")], next: "root" }),
      // 2: despedida (sin next: termina la conversacion).
      dialogue.choice("bye"),
    ],
  }),
);
```

Reglas que se ven ahí:

- El **índice** de una opción es su posición original en `node.choices` (0, 1, 2), aunque otras estén ocultas. Es lo que usan `dialogue:choose` y `choose()` del playthrough.
- `when` oculta la opción; `once` la oculta tras elegirla (queda el flag `dlg.fisher-talk.root.0`).
- Una opción sin `next` termina la conversación.
- Al elegir, se cierra la línea, corre el `do` de la opción (espera cada acción, `say` incluido, ver [02](02-conditions-and-actions.md)) y luego se pasa a `next`.

Un caso real de la demo (`apps/web-demo/demo-content/dialogues/guide.ts`) usa `cond.hasItem("trophy")` en una opción y `act.giveItem("key-handle")` en otra con `once`.

## NPCs

Un NPC es un hotspot con sprite. Tipo real (`packages/engine-core/src/game/types/index.ts`):

```ts
export interface GameSceneNpc {
  id: string;
  /** Clave de i18n. */
  name: string;
  /** Id de un personaje registrado en el viewport (prop `characters`). */
  characterId: string;
  position: GameVec3;
  facing?: NpcFacing; // "north" | "south" | "west" | "east"
  visibleWhen?: Condition;
  hasCollision?: boolean;
  approach?: GameVec3;
  clickBox?: { halfSize: GameVec3; offset?: GameVec3 };
  /** Atajo: hablar inicia este diálogo. Equivale a `verbs.talk = [{ do: [{ startDialogue }] }]`. */
  dialogueId?: string;
  verbs?: Partial<Record<Verb, Branch[]>>;
  useItem?: Record<string, Branch[]>;
}
```

Del fixture (escena `cove`): un guardián con diálogo, que además acepta la lámpara y se deja mirar:

```ts
npcs: [
  {
    id: "keeper",
    name: "keeper.name",
    characterId: "keeper",
    position: [2, 0, 2],
    dialogueId: "keeper-talk",
    useItem: {
      lamp: [
        otherwise(
          act.say("keeper.thanks", "keeper"),
          act.removeItem("lamp"),
          act.setFlag("keeper.lit"),
        ),
      ],
    },
    verbs: { look: [otherwise(act.say("keeper.look"))] },
  },
],
```

- `dialogueId` es un atajo de `verbs.talk`; un `verbs.talk` explícito gana.
- `clickBox` ajusta la caja clicable (por defecto cubre un sprite de tamaño estándar, de los pies a la cabeza).
- `characterId` apunta a un `CharacterDefinition` que pasas en la prop `characters` de `GameViewport` (`Record<string, CharacterDefinition>`). La demo lo hace en `apps/web-demo/demo-content/characters/guide.ts` (`DEMO_NPC_CHARACTERS`).

### El `speaker` debe ser el `id` del NPC

Para que el bocadillo salga sobre el NPC, el `speaker` de la línea (`node.speaker`) o de `say` debe ser **exactamente el `id`** del NPC (`"fisherman"`, `"keeper"`). Si no coincide con un NPC visible, el bocadillo sale sobre el jugador (`resolveSpeakingNpcId`).

### Proyección a hotspot y `resolveScene`

`toRuntimeScene` añade cada NPC a `scene.hotspots` con `npcToHotspot`, para que `hotspot:interact` los encuentre. Un host que **sobrescriba `resolveScene`** con sus propias escenas debe proyectar él los NPC. Así lo hace la demo (`apps/web-demo/app/lib/engine/runtime/demoViewportOptions.ts`):

```ts
import { npcToHotspot, type GameScene } from "@pointclick-engine/engine-core";

function resolveDemoScene(id: string): GameScene | null {
  const scene = SCENES[id];
  if (!scene) return null;
  if (!scene.npcs?.length) return scene;
  return { ...scene, hotspots: [...(scene.hotspots ?? []), ...scene.npcs.map(npcToHotspot)] };
}
```

## Comandos, eventos y UI

| Comando | Efecto |
|---------|--------|
| `dialogue:start` `{ dialogueId }` | Abre la conversación (también la acción `startDialogue`) |
| `dialogue:choose` `{ index }` | Elige la opción con ese índice original |
| `dialogue:advance` | Cierra la línea abierta (sin opciones) y sigue al `next` |
| `dialogue:end` | Cierra la conversación |

Eventos: `dialogue:started`, `dialogue:nodeEntered`, `dialogue:choiceMade`, `dialogue:ended`.

El renderer pinta las opciones con `DialogueChoices` (flechas, Enter/Espacio y teclas 1-9) y la línea en el bocadillo del `speaker`. Sustitúyelo con la prop `dialogueChoices` de `GameViewport`; `useDialogue()` da `{ active, speaker, choices, choose, advance, end }` para una UI propia. Mientras hay conversación la entrada del jugador queda bloqueada.
