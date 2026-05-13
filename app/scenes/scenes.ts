export type SceneWall = {
  position: [number, number, number];
  /** Rotation around Y axis in radians */
  rotationY?: number;
  /** Half-extents for CuboidCollider: [halfWidth, halfHeight, halfDepth] */
  halfSize: [number, number, number];
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
  },
  personalRoom: {
    id: "personalRoom",
    label: "Personal Room",
    background: "/assets/background/personalRoom.png",
    playerSpawn: [0, -1.1, 13.44],
    ground: {
      minX: -17,
      maxX: 16.8,
      minZ: -7.6,
      maxZ: 69.7,
      y: -2.05,
    },
    walls: [],
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
  },
};

export const DEFAULT_SCENE_ID = "town";
