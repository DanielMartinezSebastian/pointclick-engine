export type WallToolMode = "manual" | "points";

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
  sceneId?: string; // Optional: tracks which scene this item belongs to
};
