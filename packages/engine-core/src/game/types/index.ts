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

export interface GameSceneWall {
  position: GameVec3;
  halfSize: GameVec3;
  rotationY: number;
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
