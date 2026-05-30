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
  sceneId?: string; // Tracks which scene this item belongs to for multi-scene management
};

export type ItemInteractionRule = {
  outcome: "place" | "consume" | "return";
  hitDialogKey?: DialogKey;
  missDialogKey?: DialogKey;
  placeCanPickup?: boolean;
  placeHasCollision?: boolean;
  placeCollisionHalfSize?: GameVec3;
  pickupSuccessDialogKey?: DialogKey;
  pickupBlockedDialogKey?: DialogKey;
};

export type ItemDefinition = {
  id: string;
  name: string;
  spriteUrl: string;
  descriptionDialogKey?: string;
  interactionRules: Record<string, ItemInteractionRule>;
  defaultRule: ItemInteractionRule;
};

// Inventory state
export type InventoryStackState = {
  id: string;
  name: string;
  spriteUrl: string;
  quantity: number;
};

export type InventorySlotsState = Array<InventoryStackState | null>;

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

// Scene Transitions
export interface BaseSceneTransition {
  id: string;
  targetSceneId: string;
  position: GameVec3;
  halfSize: GameVec3;
  rotationY?: number;
  /** Optional spawn position in target scene. If omitted, uses scene's playerSpawn. */
  spawnPosition?: GameVec3;
  /** Optional walk target position after spawning. If omitted, no walk animation. */
  targetPosition?: GameVec3;
  preTransitionDialogKey?: DialogKey;
  postTransitionDialogKey?: DialogKey;
}

export interface GameSceneTransitionOnCollision extends BaseSceneTransition {
  kind: "collision";
}

export interface GameSceneTransitionOnItemDrop extends BaseSceneTransition {
  kind: "item-drop";
  requiresItemId?: string;
  consumeItem?: boolean;
  hintDialogKeys?: { empty?: DialogKey; occupied?: DialogKey };
}

export interface GameSceneTransitionOnItemConsume extends BaseSceneTransition {
  kind: "item-consume";
  requiresItemId: string;
  preConsumptionDialogKey?: DialogKey;
}

export type GameSceneTransition =
  | GameSceneTransitionOnCollision
  | GameSceneTransitionOnItemDrop
  | GameSceneTransitionOnItemConsume;

export interface TransitionState {
  /** Source scene recorded when the transition was last triggered. */
  lastVisitedSceneId?: string;
  /** For item-drop transitions: item currently occupying the zone. */
  itemIdOccupying?: string;
  /** Whether this transition can be triggered. Default true. */
  isAvailable: boolean;
}

// Player walking state (for path-based movement)
export interface PlayerWalkingState {
  /** Target position to walk towards. */
  targetPosition: GameVec3;
  /** Path points to follow (calculated via pathfinding). */
  pathPoints: GameVec3[];
  /** Walk progress: 0 = start, 1 = complete. */
  progress: number;
  /** Whether walk is currently active. */
  isActive: boolean;
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
  /** Declarative scene exit/transition zones. */
  transitions?: GameSceneTransition[];
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
