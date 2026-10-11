// Escenas de la aventura "No es un bug, es una feature".
//
// Geometria PROVISIONAL: suelo, spawn y muros se reutilizan de la escena de la demo que comparte
// fondo (sin sus puertas ni sus interacciones). Las posiciones de hotspots, NPCs, items y zonas
// de transicion son plausibles pero se afinan con capturas en la tarea 04.
//
//   adv-room (inicial) <-> adv-town <-> adv-backlog
//                              ^
//                              +-> adv-engine <-> adv-heap
import {
  act,
  branch,
  cond,
  otherwise,
  type GameSceneConfig,
  type GameSceneNpc,
  type GameSceneTransition,
  type PlacedSceneItem,
} from "@pointclick-engine/engine-core";

import { SCENES as DEMO_SCENES } from "../demo-content/scenes/scenes";
import { adventureItems } from "./items";
import { GLITCH_DIALOGUE_ID, GLITCH_FREE_DIALOGUE_ID, HELIX_DIALOGUE_ID } from "./dialogues";

export const ADVENTURE_INITIAL_SCENE_ID = "adv-room";

const zone = (x: number, y: number, z: number): [number, number, number] => [x, y, z];

/** Item colocado en el suelo de una escena (`interactionId` es una etiqueta libre). */
const floorItem = (
  id: string,
  itemId: string,
  sceneId: string,
  worldPosition: [number, number, number],
): PlacedSceneItem => ({
  id,
  itemId,
  interactionId: `${id}-pickup`,
  name: `item.${itemId}`,
  spriteUrl: `/assets/adventure/items/${itemId}.png`,
  worldPosition,
  canPickup: true,
  sceneId,
});

/**
 * El Programador: un NPC sin verbos en un punto alto de la escena, fuera del alcance del click
 * (caja de click minima). Sus lineas llevan `speaker: "programmer"` y el bocadillo sale ahi.
 */
const programmer = (position: [number, number, number]): GameSceneNpc => ({
  id: "programmer",
  name: "npc.programmer.name",
  characterId: "programmer",
  position,
  clickBox: { halfSize: [0.05, 0.05, 0.05] },
});

/**
 * `GameSceneNpc` no tiene `useItemDefault` (solo los hotspots): para dar una respuesta propia a
 * cualquier item sin regla se rellena `useItem` con una rama de relleno por cada item restante.
 */
const npcItemRules = (
  rules: NonNullable<GameSceneNpc["useItem"]>,
  fallbackKey: string,
): NonNullable<GameSceneNpc["useItem"]> => ({
  ...Object.fromEntries(
    adventureItems
      .filter((item) => !(item.id in rules))
      .map((item) => [item.id, [otherwise(act.say(fallbackKey))]]),
  ),
  ...rules,
});

const collision = (
  id: string,
  targetSceneId: string,
  position: [number, number, number],
  halfSize: [number, number, number],
  spawnPosition?: [number, number, number],
  gate: Pick<GameSceneTransition, "when" | "blocked"> = {},
): GameSceneTransition => ({
  id,
  kind: "collision",
  targetSceneId,
  position,
  halfSize,
  ...(spawnPosition ? { spawnPosition } : {}),
  ...gate,
});

// ---------------------------------------------------------------------------------------------
// adv-room: tutorial. La puerta no tiene transicion hasta que se repara (puzzle 1).
// ---------------------------------------------------------------------------------------------
const room: GameSceneConfig = {
  id: "adv-room",
  label: "scene.adv-room",
  background: "/assets/background/personalRoom.png",
  playerSpawn: [0, -1.1, 13.44],
  ground: { minX: -16.9, maxX: 16.8, minZ: 2.9, maxZ: 71, y: -2.15 },
  music: {
    trackUrl: "/assets/audio/music/personal-room-loop.mp3",
    persistAcrossScenes: false,
    volume: 0.55,
    fadeMs: 1000,
  },
  walls: DEMO_SCENES.personalRoom.walls,
  interactions: [],
  // Solo la primera vez: el flag, no `visited`.
  onEnter: [
    branch(
      cond.not(cond.flag("intro.done")),
      act.setFlag("intro.done"),
      act.say("intro.1", "programmer"),
      act.say("intro.2", "programmer"),
    ),
  ],
  initialItems: [{ item: floorItem("duck-beak-floor", "duck-beak", "adv-room", [-3, -1.3, 22]) }],
  hotspots: [
    {
      id: "computer",
      label: "hotspot.computer",
      position: [-10.6, 3.0, 10],
      halfSize: zone(1.2, 1.0, 0.8),
      verbs: {
        // Tres estados: leer el log; dar el pergamino (tras la pista del glitch); relleno.
        look: [
          branch(cond.not(cond.flag("log.read")), act.setFlag("log.read"), act.say("computer.log")),
          branch(
            cond.all(cond.flag("hint.postit"), cond.not(cond.flag("note.given"))),
            act.setFlag("note.given"),
            act.giveItem("sticky-note"),
            act.say("computer.note"),
          ),
          otherwise(act.say("computer.idle")),
        ],
        use: [otherwise(act.say("computer.use"))],
      },
      useItem: {
        semicolon: [
          branch(cond.flag("door.fixed"), act.say("computer.alreadyFixed")),
          otherwise(
            act.removeItem("semicolon"),
            act.setFlag("door.fixed"),
            act.say("computer.fixed"),
          ),
        ],
      },
      useItemDefault: [otherwise(act.say("computer.nothing"))],
    },
    {
      id: "bed",
      label: "hotspot.bed",
      position: [8, -0.5, 28],
      halfSize: zone(2, 1, 1.5),
      verbs: {
        look: [
          branch(cond.flag("semicolon.found"), act.say("bed.empty")),
          otherwise(
            act.setFlag("semicolon.found"),
            act.giveItem("semicolon"),
            act.say("bed.look"),
          ),
        ],
      },
      useItemDefault: [otherwise(act.say("bed.nothing"))],
    },
  ],
  npcs: [programmer([0, 4, 15])],
  transitions: [
    // La puerta: sin `door.fixed` no lleva a ninguna parte.
    collision("room-to-town", "adv-town", [-1.9, -1, 2.5], [1.9, 2.5, 2], [3, -2.1, 26], {
      when: cond.flag("door.fixed"),
      blocked: [act.say("door.blocked")],
    }),
  ],
};

// ---------------------------------------------------------------------------------------------
// adv-town: nudo. El glitch en bucle bloquea el paso al motor (puzzles 2, 3 y 5).
// ---------------------------------------------------------------------------------------------
const town: GameSceneConfig = {
  id: "adv-town",
  label: "scene.adv-town",
  background: "/assets/background/town.jpg",
  playerSpawn: [3.08, 1.05, 13.44],
  ground: { minX: -12, maxX: 17, minZ: -15, maxZ: 30, y: -3.25 },
  music: { trackUrl: "/assets/audio/music/town-loop.mp3", volume: 0.6, fadeMs: 800 },
  walls: [],
  interactions: [],
  initialItems: [{ item: floorItem("empty-mug-floor", "empty-mug", "adv-town", [-5, -2.4, 20]) }],
  hotspots: [
    {
      id: "mine-door",
      label: "hotspot.mine-door",
      position: [2, -1, -9],
      halfSize: zone(1.5, 2, 1),
      verbs: {
        look: [
          branch(cond.flag("backlog.open"), act.say("mine.open")),
          otherwise(act.say("mine.locked")),
        ],
        use: [
          branch(cond.flag("backlog.open"), act.say("mine.open")),
          otherwise(act.say("mine.locked")),
        ],
      },
      useItem: {
        // El pergamino no se consume: la mina queda abierta por flag.
        "sticky-note": [
          branch(cond.flag("backlog.open"), act.say("mine.already")),
          otherwise(act.setFlag("backlog.open"), act.say("mine.unlock")),
        ],
      },
      useItemDefault: [otherwise(act.say("mine.nothing"))],
    },
  ],
  npcs: [
    // El glitch en bucle, junto al paso al motor. Se oculta al liberarlo; en su lugar aparece
    // `glitch-free`, apartado (el `speaker` debe ser el id del NPC visible).
    {
      id: "glitch",
      name: "npc.glitch.name",
      characterId: "glitch",
      position: [11, -2.1, 4],
      facing: "south",
      visibleWhen: cond.not(cond.flag("glitch.fixed")),
      dialogueId: GLITCH_DIALOGUE_ID,
      verbs: { look: [otherwise(act.say("glitch.look"))] },
      useItem: npcItemRules({
        // Depuracion con pato de goma: explicarle el problema suelta la pista.
        "duck-beak": [
          branch(cond.flag("hint.postit"), act.say("glitch.duck.again", "glitch")),
          otherwise(
            act.setFlag("hint.postit"),
            act.say("glitch.duck.david"),
            act.say("glitch.duck.reveal", "glitch"),
          ),
        ],
        // Sale del bucle. El cambio de estado va DESPUES del `say`: al fijar `glitch.fixed` el
        // glitch se oculta y la frase saldria sobre David. Si se cancela el guion durante el
        // `say`, nada ha cambiado y el jugador puede repetirlo.
        break: [
          otherwise(
            act.say("glitch.freed", "glitch"),
            act.removeItem("break"),
            act.setFlag("glitch.fixed"),
          ),
        ],
      }, "glitch.nothing"),
    },
    {
      id: "glitch-free",
      name: "npc.glitch.name",
      characterId: "glitch",
      position: [6, -2.1, 10],
      facing: "south",
      visibleWhen: cond.flag("glitch.fixed"),
      dialogueId: GLITCH_FREE_DIALOGUE_ID,
    },
    programmer([0, 3, 15]),
  ],
  transitions: [
    collision("town-to-room", "adv-room", [3, -2.1, 28.5], [3, 2, 1.5], [-1.9, -1.1, 8]),
    collision("town-to-backlog", "adv-backlog", [2, -1, -12.5], [3, 4, 1.5], undefined, {
      when: cond.flag("backlog.open"),
      blocked: [act.say("mine.locked")],
    }),
    collision("town-to-engine", "adv-engine", [15, -1, 2], [1.5, 3, 3], [0, -1.1, 66], {
      when: cond.flag("glitch.fixed"),
      blocked: [act.say("glitch.welcome", "glitch"), act.say("glitch.blocked.david")],
    }),
  ],
};

// ---------------------------------------------------------------------------------------------
// adv-backlog: Helix y el material que nadie mira (puzzle 4).
// ---------------------------------------------------------------------------------------------
const backlog: GameSceneConfig = {
  id: "adv-backlog",
  label: "scene.adv-backlog",
  background: "/assets/background/mazmorra.jpg",
  playerSpawn: [0, -1.1, 13.44],
  ground: { minX: -14.4, maxX: 15.8, minZ: -20.6, maxZ: 60.6, y: -3.15 },
  music: { trackUrl: "/assets/audio/music/dungeon-loop.mp3", volume: 0.5, fadeMs: 1200 },
  // Los muros de la mazmorra, con la puerta ya abierta (aqui no hay puerta interactiva).
  walls: DEMO_SCENES.dungeon.walls.map((wall) => ({
    ...wall,
    textureUrl: "/assets/walldoor/dungeon_wall_door_open.png",
  })),
  interactions: [],
  initialItems: [
    { item: floorItem("coffee-beans-floor", "coffee-beans", "adv-backlog", [-6, -2.4, 25]) },
    { item: floorItem("bucket-floor", "bucket", "adv-backlog", [6, -2.4, 22]) },
  ],
  npcs: [
    {
      id: "helix",
      name: "npc.helix.name",
      characterId: "helix",
      position: [4, -2.1, 10],
      facing: "south",
      visibleWhen: cond.not(cond.flag("helix.home")),
      dialogueId: HELIX_DIALOGUE_ID,
      verbs: { look: [otherwise(act.say("helix.look"))] },
      useItem: npcItemRules({
        // Devolverle su puntero: da el `break` y se va. El `break` se entrega antes de la
        // frase; el flag que oculta a Helix va DESPUES (si no, la frase saldria sobre David).
        "valid-pointer": [
          otherwise(
            act.removeItem("valid-pointer"),
            act.giveItem("break"),
            act.say("helix.home", "helix"),
            act.setFlag("helix.home"),
          ),
        ],
      }, "helix.nothing"),
    },
    programmer([0, 3, 15]),
  ],
  transitions: [
    // Salida al pueblo por el norte, como en la mazmorra de la demo.
    collision("backlog-to-town", "adv-town", [0, -2.2, -9], [1, 1, 1], [2, -2.1, -6]),
  ],
};

// ---------------------------------------------------------------------------------------------
// adv-engine: la sala de maquinas. Consola de build e interfono (puzzles 6 y 8).
// ---------------------------------------------------------------------------------------------
const engine: GameSceneConfig = {
  id: "adv-engine",
  label: "scene.adv-engine",
  background: "/assets/background/sciFiLab.jpg",
  playerSpawn: [0, -1.1, 13.44],
  ground: { minX: -17, maxX: 16.8, minZ: -7.6, maxZ: 69.7, y: -2.05 },
  walls: [],
  interactions: [],
  hotspots: [
    {
      id: "console",
      label: "hotspot.console",
      position: [0, -0.5, 5],
      halfSize: zone(2, 1.5, 1),
      verbs: {
        look: [otherwise(act.say("console.look"))],
        use: [
          // Ya compilado (esta rama lee `game.finished`).
          branch(cond.flag("game.finished"), act.say("console.done")),
          // Los dos errores resueltos: compila. El flag va primero; el `call` al final, para que
          // los creditos salgan tras el ultimo bocadillo.
          branch(
            cond.all(cond.flag("programmer.awake"), cond.flag("leak.fixed")),
            act.setFlag("game.finished"),
            act.say("console.compiling"),
            act.say("console.ok"),
            act.say("ending.programmer", "programmer"),
            act.call("credits"),
          ),
          branch(cond.flag("programmer.awake"), act.say("console.fail.heap")),
          branch(cond.flag("leak.fixed"), act.say("console.fail.sleep")),
          // Ningun error resuelto: los lista. No cambia estado (se puede repetir sin efecto).
          otherwise(act.say("console.fail")),
        ],
      },
      useItemDefault: [otherwise(act.say("console.nothing"))],
    },
    {
      id: "intercom",
      label: "hotspot.intercom",
      position: [-8, 0, 6],
      halfSize: zone(1, 1, 1),
      verbs: {
        look: [otherwise(act.say("intercom.look"))],
        use: [
          branch(cond.flag("programmer.awake"), act.say("intercom.already")),
          otherwise(act.say("intercom.use")),
        ],
      },
      useItem: {
        coffee: [
          branch(cond.flag("programmer.awake"), act.say("intercom.already")),
          otherwise(
            act.removeItem("coffee"),
            act.setFlag("programmer.awake"),
            act.say("intercom.coffee", "programmer"),
          ),
        ],
      },
      useItemDefault: [otherwise(act.say("intercom.nothing"))],
    },
  ],
  npcs: [programmer([0, 3, 15])],
  transitions: [
    collision("engine-to-town", "adv-town", [0, -1, 69], [4, 2.5, 1.5], [12, -2.1, 4]),
    collision("engine-to-heap", "adv-heap", [14, -1, 30], [1.5, 3, 4], [-12, -1.1, 30]),
  ],
};

// ---------------------------------------------------------------------------------------------
// adv-heap: la fuga de memoria (puzzle 7).
// ---------------------------------------------------------------------------------------------
const heap: GameSceneConfig = {
  id: "adv-heap",
  label: "scene.adv-heap",
  background: "/assets/background/volcanico.jpg",
  playerSpawn: [0, -1.1, 13.44],
  ground: { minX: -17, maxX: 16.8, minZ: -7.6, maxZ: 69.7, y: -2.05 },
  walls: [],
  interactions: [],
  hotspots: [
    {
      id: "leak",
      label: "hotspot.leak",
      position: [0, 0, 15],
      halfSize: zone(2, 2, 1.5),
      verbs: {
        look: [otherwise(act.say("leak.look"))],
        use: [
          branch(cond.flag("leak.fixed"), act.say("leak.already")),
          otherwise(act.say("leak.use")),
        ],
      },
      useItem: {
        bucket: [
          branch(cond.flag("leak.fixed"), act.say("leak.already")),
          otherwise(
            act.removeItem("bucket"),
            act.setFlag("leak.fixed"),
            act.say("leak.bucket.david"),
            act.say("leak.bucket.programmer", "programmer"),
          ),
        ],
      },
      useItemDefault: [otherwise(act.say("leak.nothing"))],
    },
  ],
  npcs: [programmer([0, 3, 25])],
  transitions: [collision("heap-to-engine", "adv-engine", [-14, -1, 30], [1.5, 3, 4], [12, -1.1, 30])],
};

export const adventureScenes: GameSceneConfig[] = [room, town, backlog, engine, heap];
