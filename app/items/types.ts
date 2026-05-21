import type { DialogKey } from "../dialogs/types";

export type ItemDropOutcome = "consume" | "place" | "return";

export type ItemInteractionRule = {
  outcome: ItemDropOutcome;
  hitDialogKey?: DialogKey;
  missDialogKey?: DialogKey;
  placeCanPickup?: boolean;
  placeHasCollision?: boolean;
  placeCollisionHalfSize?: [number, number, number];
  pickupSuccessDialogKey?: DialogKey;
  pickupBlockedDialogKey?: DialogKey;
};

export type ItemDefinition = {
  id: string;
  name: string;
  spriteUrl: string;
  interactionRules: Record<string, ItemInteractionRule>;
  defaultRule: ItemInteractionRule;
};
