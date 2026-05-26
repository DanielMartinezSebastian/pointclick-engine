export type WallToolMode = "manual" | "points";

export type DebugEditorMode = "walls" | "ground" | "items" | "targets";

export type PlacedSceneItem = {
  id: string;
  itemId: string;
  interactionId: string;
  name: string;
  spriteUrl: string;
  worldPosition: [number, number, number];
  canPickup: boolean;
  hasCollision?: boolean;
  collisionHalfSize?: [number, number, number];
  pickupSuccessDialogKey?: string;
  pickupBlockedDialogKey?: string;
};
