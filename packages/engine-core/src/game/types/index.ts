// Core types for point-and-click game engine
// Framework-agnostic definitions

// Vector types
export type GameVec3 = [x: number, y: number, z: number];
export type GameVec2 = [x: number, y: number];

// Scene geometry
export interface GameSceneGround {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  y: number;
}

/**
 * An opening (door/window) in a wall.
 * Position and halfSize are relative to the wall's local coordinate space
 * (wall center = origin, axes aligned with wall before rotation).
 */
export interface GameSceneWallOpening {
  /** Unique identifier for this opening. */
  id: string;
  /** Center of the opening relative to the wall's local center. */
  position: GameVec3;
  /** Half-dimensions of the opening (width/2, height/2, depth/2). */
  halfSize: GameVec3;
}

export interface GameSceneWall {
  position: GameVec3;
  halfSize: GameVec3;
  rotationY: number;

  /**
   * Array of openings (doors/windows) in this wall.
   * Empty array or undefined = solid wall (backward compatible).
   */
  openings?: GameSceneWallOpening[];

  /**
   * URL to the wall's texture image.
   * Should point to /public/assets/wall-textures/* or similar.
   * Undefined = no texture (backward compatible).
   */
  textureUrl?: string;

  /**
   * World-space offset applied to the texture plane position.
   * Used for fine-grained alignment with the background image.
   * Defaults to [0, 0, 0].
   */
  texturePosition?: GameVec3;
}

export interface GameSceneInteraction {
  position: GameVec3;
  halfSize: GameVec3;
  rotationY?: number;
  hasCollision?: boolean;
}

// Items
export type PlacedSceneItem = {
  id: string;
  itemId: string;
  interactionId: string;
  name: string;
  spriteUrl: string;
  worldPosition: GameVec3;
  canPickup: boolean;
  hasCollision?: boolean;
  collisionHalfSize?: GameVec3;
  pickupSuccessDialogKey?: string;
  pickupBlockedDialogKey?: string;
};

// Dialog key (simple string alias)
export type DialogKey = string;

// Scene interaction dialog keys
export interface GameSceneInteractionDialogKeys {
  hit: DialogKey;
  miss: DialogKey;
}

// Scene interaction hint dialog keys
export interface GameSceneInteractionHintDialogKeys {
  empty: DialogKey;
  occupied: DialogKey;
}

// Enhanced Scene Interaction (with editor fields)
export interface GameSceneInteractionFull extends GameSceneInteraction {
  id: string;
  kind: "drop-target";
  hasCollision?: boolean;
  acceptsItemIds?: string[];
  dialogKeys: GameSceneInteractionDialogKeys;
  hintDialogKeys?: GameSceneInteractionHintDialogKeys;
  label: string;
}

// Scene (full scene with all interactions)
export interface GameScene {
  id: string;
  label: string;
  background: string;
  playerSpawn: GameVec3;
  ground: GameSceneGround;
  walls: GameSceneWall[];
  interactions: GameSceneInteractionFull[];
}

// Editor/Debug modes
export type WallToolMode = "manual" | "points";
export type DebugEditorMode = "walls" | "ground" | "items" | "targets";

// Runtime events
export type RuntimeMoveEvent = {
  type: "onMove";
  position: GameVec3;
  action: "idle" | "north" | "south" | "west" | "east";
};

export type RuntimeCollideEvent = {
  type: "onCollide";
  reason: "boundary" | "stuck";
  position: GameVec3;
};

export type RuntimeDropEvent = {
  type: "onDrop";
  outcome:
    | "place"
    | "consume"
    | "return"
    | "rule-miss"
    | "unknown-item"
    | "on-player"
    | "pickup-blocked"
    | "pickup-success";
  itemId: string;
  interactionId?: string;
};

export type RuntimeDialogEvent = {
  type: "onDialog";
  text: string;
  dialogKey?: string;
  source: "boundary" | "inventory" | "debug";
};

export type RuntimeEvent =
  | RuntimeMoveEvent
  | RuntimeCollideEvent
  | RuntimeDropEvent
  | RuntimeDialogEvent;

export type RuntimeEventHandler = (event: RuntimeEvent) => void;
