import type { DialogKey } from "../dialogs/types";
import type { GameSceneTransition } from "@pointclick-engine/engine-core";
import {
  sceneTransitionOnCollision,
  sceneTransitionOnItemDrop,
} from "@pointclick-engine/engine-core";

export type SceneWallOpening = {
  id: string;
  /** Position in wall-local space relative to wall center */
  position: [number, number, number];
  /** Half-extents of the opening: [halfWidth, halfHeight, halfDepth] */
  halfSize: [number, number, number];
};

export type SceneWall = {
  position: [number, number, number];
  /** Rotation around Y axis in radians */
  rotationY?: number;
  /** Half-extents for CuboidCollider: [halfWidth, halfHeight, halfDepth] */
  halfSize: [number, number, number];
  /** Openings (doors/windows) cut into this wall */
  openings?: SceneWallOpening[];
  /** Optional texture URL for wall billboard */
  textureUrl?: string;
  /** Optional texture position offset [x, y, z] */
  texturePosition?: [number, number, number];
};

export type SceneInteractionDialogKeys = {
  hit: DialogKey;
  miss: DialogKey;
};

export type SceneInteractionHintDialogKeys = {
  /** Dialog cuando el personaje se acerca o inspecciona el target vacío (sin ítem colocado). */
  empty: DialogKey;
  /** Dialog cuando el personaje se acerca o inspecciona el target con un ítem colocado. */
  occupied: DialogKey;
};

export type SceneInteraction = {
  id: string;
  kind: "drop-target";
  /** World-space center position [x, y, z] */
  position: [number, number, number];
  /** Rotation around Y axis in radians */
  rotationY?: number;
  /** Half-extents for CuboidCollider: [halfWidth, halfHeight, halfDepth] */
  halfSize: [number, number, number];
  /** If true, character collides and cannot pass through this interaction */
  hasCollision?: boolean;
  /**
   * Suppress the default drop-target visual (cylinder + box). Use when
   * another renderer (e.g. SceneDoors) already shows the interactable
   * surface. The pick volume + drop logic remain active.
   */
  invisible?: boolean;
  /** Item ids accepted by this interaction. If omitted, any item can be accepted. */
  acceptsItemIds?: string[];
  dialogKeys: SceneInteractionDialogKeys;
  /**
   * Diálogos de pista por proximidad/inspección.
   * Si está presente se muestran cuando el personaje se acerca mucho
   * o hace click sobre el target sin arrastrar un ítem.
   */
  hintDialogKeys?: SceneInteractionHintDialogKeys;
  label: string;
};

export type SceneGround = {
  /** Límite izquierdo (X negativo) */
  minX: number;
  /** Límite derecho (X positivo) */
  maxX: number;
  /** Límite trasero/lejano (Z negativo) */
  minZ: number;
  /** Límite frontal/cercano (Z positivo) */
  maxZ: number;
  /** Y position of the ground plane */
  y: number;
};

/**
 * Door — interactive opening with two visual states driven by two full-wall
 * textures (one with the door painted in, one with the door cut out).
 *
 * When `closed`, the matching wall's `textureUrl` is swapped to the closed
 * variant, a CuboidCollider blocks the wall's opening, and the wall's
 * `openings[]` entry matching `openingId` is removed so pathfinding treats
 * the wall as solid.
 *
 * When `open`, the texture, the collider and the opening are restored.
 *
 * The texture swap (vs. an overlay sprite) avoids the depthTest=false
 * sandwich problem where a sprite of the door would paint on top of the
 * character — both textures live on the same SceneWallPlane.
 */
export type SceneDoor = {
  id: string;
  /** Index into `scene.walls` of the wall this door belongs to. */
  wallIndex: number;
  /** Id of the opening entry in `wall.openings[]` to enable/disable. */
  openingId: string;
  /** Wall texture displayed when the door is open (with the hole carved in). */
  openTextureUrl: string;
  /** Wall texture displayed when the door is closed (door painted in). */
  closedTextureUrl: string;
  /**
   * World-space center of the closed-state collider AND the invisible click
   * area used to toggle the door. Match this to the visible doorway in the
   * wall texture so clicks land naturally.
   */
  position: [number, number, number];
  /** Half-extents of the click area / closed-state collider. */
  halfSize: [number, number, number];
  /** Optional Y rotation in radians (match wall rotation). */
  rotationY?: number;
  /** If true, the door starts open. Default false. */
  openByDefault?: boolean;
  /**
   * When the door is open, suppress its hint dialogs (proximity + inspect).
   * Default false (open door = no hint, the user is done). Set to true if
   * the open state still has something useful to say.
   */
  showHintWhenOpen?: boolean;
};

export type Scene = {
  id: string;
  label: string;
  background: string;
  playerSpawn: [number, number, number];
  ground: SceneGround;
  walls: SceneWall[];
  interactions: SceneInteraction[];
  /** Optional interactive doors. */
  doors?: SceneDoor[];
  /** Declarative scene transitions (collision/item-drop/item-consume). */
  transitions?: GameSceneTransition[];
};

export const SCENES: Record<string, Scene> = {
  town: {
    id: "town",
    label: "Town",
    background: "/assets/background/town.jpg",
    playerSpawn: [3.08, 1.05, 13.44],
    ground: {
      minX: -12,
      maxX: 17,
      minZ: -15,
      maxZ: 30,
      y: -3.25,
    },
    walls: [],
    interactions: [
      {
        id: "town-trophy-pedestal",
        kind: "drop-target",
        label: "Peana del Trofeo",
        position: [8.5, -1.65, 20.0],
        halfSize: [0.95, 0.55, 0.95],
        hasCollision: false,
        acceptsItemIds: ["trophy"],
        dialogKeys: {
          hit: "inventoryDropHit",
          miss: "inventoryDropMiss",
        },
        hintDialogKeys: {
          empty: "interaction.trophy-pedestal.empty",
          occupied: "interaction.trophy-pedestal.occupied",
        },
      },
    ],
    transitions: [
      sceneTransitionOnCollision({
        id: "town-to-dungeon",
        targetSceneId: "dungeon",
        position: [2, -1, -12],
        halfSize: [6, 4, 2],
      }),
      sceneTransitionOnItemDrop({
        id: "town-trophy-pedestal",
        targetSceneId: "personalRoom",
        position: [8.5, -1.65, 20.0],
        halfSize: [0.95, 0.55, 0.95],
        requiresItemId: "trophy",
        consumeItem: false,
      }),
    ],
  },
  dungeon: {
    id: "dungeon",
    label: "Dungeon",
    background: "/assets/background/mazmorra.jpg",
    playerSpawn: [0, -1.1, 13.44],
    ground: {
      minX: -14.4,
      maxX: 15.8,
      minZ: -20.6,
      maxZ: 60.6,
      y: -3.15,
    },
    walls: [
      {
        // Dungeon gate wall — spans the corridor at Z=3, blocks passage north→south.
        // Snapped to the ground (editor invariant): wall base sits exactly on
        // ground.y = -3.15. With halfY=4.4 the center is at -3.15 + 4.4 = +1.25
        // and the top reaches world Y=+5.65 — a tall arch.
        // halfZ=1.65 keeps the wall ~3.3m deep so the player visibly tunnels
        // through it instead of just brushing past a plane.
        position: [0, 1.25, 3],
        halfSize: [3, 4.4, 1.650227616485946],
        rotationY: 0,
        // Initial texture matches the door's default "closed" state. The
        // SceneDoors system will swap to the open texture if/when the door
        // opens (and back when it closes).
        textureUrl: "/assets/walldoor/dungeon_wall_door.png",
        openings: [
          {
            id: "dungeon-gate-door",
            // ── Door sized to fit the character through ───────────────────────
            // Player collider is DYNAMIC: its halfY tracks the sprite's scale
            // (SPRITE_MIN_SCALE=1.4 ↔ SPRITE_MAX_SCALE=2.94) so it matches the
            // visible silhouette. The opening must clear the worst case, which
            // is when the sprite is at its biggest (the player closer to the
            // camera, depthFactor → 1):
            //   player_top_world(max) = spawnY(-1.1) + 2*2.94 - 0.95 = +3.83
            //
            // Y (height) — wall_center_Y = +1.25, wall halfY = 4.4:
            //   bottom_local = -0.6 - 3.8 = -4.4    (= -halfY → flush ground)
            //   top_local    = -0.6 + 3.8 = +3.2    (world Y = +4.45)
            //   → 0.62 of headroom above the tallest sprite.
            //   Remaining lintel above the opening = +4.45..+5.65 (1.2m tall).
            //
            // X (width) — wall halfX = 3:
            //   halfX=1.75 → 3.5m wide. After pathfinding's obstaclePadding
            //   (0.72) the navigable half-width is 1.03, which fits ~3 grid
            //   cells (cellSize=0.9). One-cell-wide openings make A* fail
            //   from far away because diagonal moves through the gap are
            //   blocked by adjacent cells; three cells give A* room to plan.
            //
            // Z (depth) — wall halfZ = 1.65. The opening's halfZ MUST cover
            // the wall thickness PLUS the pathfinder's obstaclePadding (0.72
            // by default), otherwise grid cells near the wall's front/back
            // faces fall inside the wall but outside the opening and get
            // marked as blocked → no path through. 1.65 + 0.72 + 0.13 margin
            // = 2.5 leaves room for the agent to plan a route through.
            position: [0, -0.6, 0],
            halfSize: [1.75, 3.8, 2.5],
          },
        ],
      },
    ],
    transitions: [
      {
        id: "transition-1780039416187",
        kind: "collision",
        position: [0, -2.2, -9],
        halfSize: [1, 1, 1],
        targetSceneId: "town",
      },
    ],
    interactions: [
      {
        // Drop-target that lives in the same world-space as the dungeon door.
        // Lets the engine's declarative inventory rules drive door unlocks:
        //   - drag gold-key onto here  →  ItemRule outcome="consume"
        //                              →  item:dropped event fires
        //                              →  SceneDoors listens and opens the door
        //   - any other item (or no item) gets the default rule's "return".
        // `hasCollision: false` so the target volume itself is not a wall and
        // pathfinding can route through it; the closed door's collider does
        // the actual blocking until the door opens.
        id: "dungeon-gate-door",
        kind: "drop-target",
        position: [0, -1.15, 3],
        halfSize: [1.5, 2, 1.65],
        hasCollision: false,
        invisible: true,
        acceptsItemIds: ["gold-key"],
        dialogKeys: {
          hit: "item.gold-key.drop.dungeon-gate-door.hit",
          miss: "item.gold-key.drop.dungeon-gate-door.miss",
        },
        // Hint shown via useProximityHintController when the player walks
        // up to the door, and on click via handleInteractionInspect.
        hintDialogKeys: {
          empty: "interaction.dungeon-gate-door.empty",
          occupied: "interaction.dungeon-gate-door.occupied",
        },
        label: "Puerta de la mazmorra",
      },
    ],
    doors: [
      {
        id: "dungeon-gate-door",
        wallIndex: 0,
        openingId: "dungeon-gate-door",
        // Texture swap pattern — closed and open versions are full wall textures
        // baked at authoring time. Avoids depthTest=false sprite stacking
        // problems where a door sprite would draw over the character.
        openTextureUrl: "/assets/walldoor/dungeon_wall_door_open.png",
        closedTextureUrl: "/assets/walldoor/dungeon_wall_door.png",
        // Click area + closed-state collider. Width matches the opening
        // (halfX=1.5 → 3m), height 4m starting from the floor, depth equal
        // to the wall's halfZ so the closed door blocks the whole tunnel.
        position: [0, -1.15, 3],
        halfSize: [1.5, 2, 1.65],
        rotationY: 0,
      },
    ],
  },
  volcano: {
    id: "volcano",
    label: "Volcano",
    background: "/assets/background/volcanico.jpg",
    playerSpawn: [0, -1.1, 13.44],
    ground: {
      minX: -17,
      maxX: 16.8,
      minZ: -7.6,
      maxZ: 69.7,
      y: -2.05,
    },
    walls: [],
    interactions: [],
  },
  personalRoom: {
    id: "personalRoom",
    label: "Personal Room",
    background: "/assets/background/personalRoom.png",
    playerSpawn: [0, -1.1, 13.44],
    ground: {
      minX: -16.9,
      maxX: 16.8,
      minZ: 2.9,
      maxZ: 71,
      y: -2.15,
    },
    walls: [
      {
        position: [2.830357142857149, -0.1499999999999999, 2.730245406547893],
        rotationY: -0.0071708760592677605,
        halfSize: [1.9196922136228656, 2, 3.25],
      },
      {
        position: [5.446428571428572, -0.1499999999999999, 4.463765756959228],
        rotationY: 0.01926967431455731,
        halfSize: [0.7144183492165584, 2, 0.25],
      },
      {
        position: [7.232142857142858, -0.1499999999999999, 9.534627450726136],
        rotationY: -1.3631154201876534,
        halfSize: [5.196286702670595, 2, 0.25],
      },
      {
        position: [8.330357142857142, -0.1499999999999999, 15.445617547843916],
        rotationY: -1.538393677236328,
        halfSize: [0.8267966484216037, 2, 0.25],
      },
      {
        position: [8.205357142857142, -0.1499999999999999, 17.28615253298894],
        rotationY: -1.7193582549907012,
        halfSize: [1.0254679106406617, 2, 0.25],
      },
      {
        position: [8.214285714285714, -0.1499999999999999, 18.826192010355186],
        rotationY: -1.274193715137604,
        halfSize: [0.549877558285058, 2, 0.25],
      },
      {
        position: [8.776785714285715, -0.1499999999999999, 19.239373333551008],
        rotationY: 0.27343750350584456,
        halfSize: [0.41728869287375336, 2, 0.25],
      },
      {
        position: [9.25892857142857, -0.1499999999999999, 19.953050164525607],
        rotationY: -1.4738591227597666,
        halfSize: [0.8302604975304805, 2, 0.25],
      },
      {
        position: [9.642857142857142, -0.1499999999999999, 21.455527703419506],
        rotationY: -1.1487794308716912,
        halfSize: [0.7411389614021351, 2, 0.25],
      },
      {
        position: [10.357142857142858, -0.1499999999999999, 21.417965764947162],
        rotationY: 1.0485934493294642,
        halfSize: [0.8234202108035373, 2, 0.25],
      },
      {
        position: [10.973214285714286, -0.1499999999999999, 19.50230690285744],
        rotationY: 1.4015813630179996,
        halfSize: [1.2193983595388684, 2, 0.25],
      },
      {
        position: [11.857142857142854, -0.1499999999999999, 18.503957057791094],
        rotationY: 1.2202071255803169,
        halfSize: [0.5199324221341752, 2, 0.25],
      },
      {
        position: [12.616071428571429, -0.1499999999999999, 17.173466717571895],
        rotationY: 0.13818596030360128,
        halfSize: [1.090754758720428, 2, 0.25],
      },
      {
        position: [13.821428571428571, -0.1499999999999999, 15.78367499409504],
        rotationY: 1.470292557627663,
        halfSize: [1.2458307479511985, 2, 0.25],
      },
      {
        position: [14.13392857142857, -0.1499999999999999, 12.29041471616673],
        rotationY: 1.487791562858048,
        halfSize: [2.261502475895506, 2, 0.25],
      },
      {
        position: [14.678571428571429, -0.1499999999999999, 9.961574530881187],
        rotationY: 0.20732437622955813,
        halfSize: [0.36495837748346754, 2, 0.25],
      },
      {
        position: [-11.312499999999998, -0.1499999999999999, 8.205788866886982],
        rotationY: -1.0596435082430542,
        halfSize: [2.4275167104295474, 2, 0.25],
      },
      {
        position: [-7.580357142857152, -0.1499999999999999, 7.442160939164886],
        rotationY: 0.6933596001568646,
        halfSize: [3.4210037104866, 2, 0.25],
      },
      {
        position: [-5.30357142857143, -0.1499999999999999, 3.554260335104874],
        rotationY: 0.5536898637028902,
        halfSize: [0.4247267304702619, 2, 1.35],
      },
      {
        position: [-14.049999999999999, -0.1499999999999999, 9.623517084630064],
        rotationY: -1.9201626521419506,
        halfSize: [3.7978106162299308, 2, 0.25],
      },
      {
        position: [
          -15.349999999999998, -0.1499999999999999, 15.145122040065141,
        ],
        rotationY: -1.5707963267948966,
        halfSize: [1.9532208005620664, 2, 0.25],
      },
    ],
    transitions: [
      {
        id: "transition-1780039538724",
        kind: "collision",
        position: [-1.9, -1, 2.5],
        halfSize: [1.9, 2.5, 2],
        targetSceneId: "dungeon",
      },
    ],
    interactions: [
      {
        id: "personal-room-gameboy-drop-target",
        kind: "drop-target",
        label: "Soporte del Gameboy",
        position: [3.27, -1.65, 19.71],
        halfSize: [0.95, 0.55, 0.95],
        hasCollision: true,
        acceptsItemIds: ["gameboy"],
        dialogKeys: {
          hit: "inventoryDropHit",
          miss: "inventoryDropMiss",
        },
        hintDialogKeys: {
          empty: "interaction.gameboy-base.empty",
          occupied: "interaction.gameboy-base.occupied",
        },
      },
    ],
  },
  lavaAnimated: {
    id: "lavaAnimated",
    label: "Lava Animated",
    background: "/assets/background/lava-animated.gif",
    playerSpawn: [0, -1.1, 13.44],
    ground: {
      minX: -17,
      maxX: 16.8,
      minZ: -7.6,
      maxZ: 69.7,
      y: -2.05,
    },
    walls: [],
    interactions: [],
  },
};

export const DEFAULT_SCENE_ID = "personalRoom";
