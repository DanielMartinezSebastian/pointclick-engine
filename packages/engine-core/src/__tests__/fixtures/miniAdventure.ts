import {
  act,
  branch,
  cond,
  dialogue,
  otherwise,
  type GameContent,
  type GameItemConfig,
  type GameSceneConfig,
  type GameSceneInteractionFull,
  type PlacedSceneItem,
} from "../../index";

/**
 * "El faro": mini-aventura escrita solo con datos.
 *
 *  Escenas : beach (inicial) -> cove -> lighthouse (final)
 *  NPCs    : fisherman (beach), keeper (cove)
 *  Items   : rusty-key, lens, lamp-frame, lamp, fish
 *
 *  Puzzles encadenados:
 *   1. Recoger y usar    : rusty-key (suelo de beach) abre `chest` (useItem + flag) y da `lens`.
 *   2. Conversacion      : mirar `map` pone `map.seen`; solo entonces el pescador ofrece (opcion
 *                          con `when` y `once`) el `lamp-frame`.
 *   3. Combinar          : lens + lamp-frame = lamp.
 *   4. Intercambio/final : entregar `lamp` al guardian pone `keeper.lit`, que abre la transicion
 *                          `to-lighthouse`; el `onEnter` del faro cierra el juego (`game.finished`).
 *
 *  Extras: transicion bloqueada con `blocked`, `onEnter` solo la primera vez (flag `intro.done`),
 *  `initialItems` con `when` (fish solo si ya se visito beach), `useItemDefault`, `call`.
 */

const interaction = (id: string): GameSceneInteractionFull => ({
  id,
  kind: "drop-target",
  position: [3, 0, 3],
  halfSize: [0.5, 0.5, 0.5],
  label: `${id}.label`,
  dialogKeys: { hit: `${id}.hit`, miss: `${id}.miss` },
});

const placed = (id: string, itemId: string, interactionId: string, sceneId: string): PlacedSceneItem => ({
  id,
  itemId,
  interactionId,
  name: `item.${itemId}`,
  spriteUrl: `/${itemId}.png`,
  worldPosition: [3, 0, 3],
  canPickup: true,
  sceneId,
});

const item = (id: string, extra: Partial<GameItemConfig> = {}): GameItemConfig => ({
  id,
  name: `item.${id}`,
  spriteUrl: `/${id}.png`,
  interactionRules: {},
  defaultRule: { outcome: "return" },
  ...extra,
});

const base = (id: string): Pick<
  GameSceneConfig,
  "id" | "label" | "background" | "playerSpawn" | "ground" | "walls"
> => ({
  id,
  label: `scene.${id}`,
  background: `/${id}.png`,
  playerSpawn: [0, 0, 0],
  ground: { minX: -8, maxX: 8, minZ: -8, maxZ: 8, y: 0 },
  walls: [],
});

const zone = [0.5, 1, 0.5] as [number, number, number];

const beach: GameSceneConfig = {
  ...base("beach"),
  interactions: [interaction("sand")],
  initialItems: [{ item: placed("key-on-sand", "rusty-key", "sand", "beach") }],
  // Solo la primera vez: el flag, no `visited` (al evaluarse la escena ya cuenta como visitada).
  onEnter: [branch(cond.not(cond.flag("intro.done")), act.say("beach.intro"), act.setFlag("intro.done"))],
  hotspots: [
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
  ],
  npcs: [
    {
      id: "fisherman",
      name: "fisherman.name",
      characterId: "fisherman",
      position: [3, 0, -2],
      dialogueId: "fisher-talk",
    },
  ],
  transitions: [
    {
      id: "to-cove",
      kind: "collision",
      targetSceneId: "cove",
      position: [7, 0, 0],
      halfSize: [0.5, 1, 2],
    },
  ],
};

const cove: GameSceneConfig = {
  ...base("cove"),
  interactions: [interaction("rocks")],
  // `when`: el pescado solo aparece si ya se paso por la playa.
  initialItems: [
    { item: placed("fish-on-rocks", "fish", "rocks", "cove"), when: cond.visited("beach") },
  ],
  hotspots: [],
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
  transitions: [
    {
      id: "to-beach",
      kind: "collision",
      targetSceneId: "beach",
      position: [-7, 0, 0],
      halfSize: [0.5, 1, 2],
    },
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
};

const lighthouse: GameSceneConfig = {
  ...base("lighthouse"),
  interactions: [],
  onEnter: [
    branch(
      cond.flag("keeper.lit"),
      act.say("lighthouse.ending"),
      act.call("credits", { ending: "good" }),
      act.setFlag("game.finished"),
    ),
  ],
  hotspots: [
    {
      id: "beacon",
      label: "beacon.label",
      position: [0, 0, 0],
      halfSize: zone,
      verbs: {
        look: [
          branch(cond.flag("game.finished"), act.say("beacon.on")),
          otherwise(act.say("beacon.off")),
        ],
      },
    },
  ],
};

const items: GameItemConfig[] = [
  item("rusty-key"),
  item("lens", {
    combine: {
      "lamp-frame": [
        otherwise(
          act.say("combine.lamp"),
          act.removeItem("lens"),
          act.removeItem("lamp-frame"),
          act.giveItem("lamp"),
        ),
      ],
    },
  }),
  item("lamp-frame"),
  item("lamp"),
  item("fish"),
];

const dialogues = [
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
  ),
  dialogue.define(
    "keeper-talk",
    "root",
    dialogue.node("root", {
      speaker: "keeper",
      line: "keeper.hello",
      choices: [dialogue.choice("ask.light", { do: [act.say("keeper.light", "keeper")], next: "root" }), dialogue.choice("bye")],
    }),
  ),
];

export const miniAdventure: GameContent = {
  scenes: [beach, cove, lighthouse],
  items,
  dialogues,
  handlers: new Set(["credits"]),
};
