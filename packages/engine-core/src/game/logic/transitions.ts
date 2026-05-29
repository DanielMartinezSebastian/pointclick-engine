import type {
  GameVec3,
  DialogKey,
  GameSceneTransitionOnCollision,
  GameSceneTransitionOnItemDrop,
  GameSceneTransitionOnItemConsume,
} from "../types";

export function sceneTransitionOnCollision(opts: {
  id: string;
  targetSceneId: string;
  position: GameVec3;
  halfSize: GameVec3;
  rotationY?: number;
  preTransitionDialogKey?: DialogKey;
  postTransitionDialogKey?: DialogKey;
}): GameSceneTransitionOnCollision {
  return { kind: "collision", ...opts };
}

export function sceneTransitionOnItemDrop(opts: {
  id: string;
  targetSceneId: string;
  position: GameVec3;
  halfSize: GameVec3;
  rotationY?: number;
  requiresItemId?: string;
  consumeItem?: boolean;
  hintDialogKeys?: { empty?: DialogKey; occupied?: DialogKey };
  preTransitionDialogKey?: DialogKey;
  postTransitionDialogKey?: DialogKey;
}): GameSceneTransitionOnItemDrop {
  return { kind: "item-drop", ...opts };
}

export function sceneTransitionOnItemConsume(opts: {
  id: string;
  targetSceneId: string;
  position: GameVec3;
  halfSize: GameVec3;
  rotationY?: number;
  requiresItemId: string;
  preConsumptionDialogKey?: DialogKey;
  preTransitionDialogKey?: DialogKey;
  postTransitionDialogKey?: DialogKey;
}): GameSceneTransitionOnItemConsume {
  return { kind: "item-consume", ...opts };
}
