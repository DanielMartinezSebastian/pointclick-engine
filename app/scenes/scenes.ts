import type { DialogKey } from "../dialogs/types";

export type SceneWall = {
  position: [number, number, number];
  /** Rotation around Y axis in radians */
  rotationY?: number;
  /** Half-extents for CuboidCollider: [halfWidth, halfHeight, halfDepth] */
  halfSize: [number, number, number];
};

export type SceneInteractionDialogKeys = {
  hit: DialogKey;
  miss: DialogKey;
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
  /** Item ids accepted by this interaction. If omitted, any item can be accepted. */
  acceptsItemIds?: string[];
  dialogKeys: SceneInteractionDialogKeys;
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

export type Scene = {
  id: string;
  label: string;
  background: string;
  playerSpawn: [number, number, number];
  ground: SceneGround;
  walls: SceneWall[];
  interactions: SceneInteraction[];
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
    walls: [
      {
        position: [-11, -0.1, 13.56],
        halfSize: [1.15, 2, 8],
      },
      {
        position: [-4.42, 0, 4],
        rotationY: -2.9329,
        halfSize: [5.8, 3, 2],
      },
    ],
    interactions: [],
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
    walls: [],
    interactions: [],
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
    interactions: [
      {
        id: "personal-room-gameboy-drop-target",
        kind: "drop-target",
        label: "Soporte del Gameboy",
        position: [-3.83, -1.4, 11.01],
        halfSize: [0.95, 0.55, 0.95],
        hasCollision: true,
        acceptsItemIds: ["gameboy"],
        dialogKeys: {
          hit: "inventoryDropHit",
          miss: "inventoryDropMiss",
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
