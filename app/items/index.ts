import type { ItemDefinition, ItemInteractionRule } from "./types";

export const ITEMS: Record<string, ItemDefinition> = {
  gameboy: {
    id: "gameboy",
    name: "Gameboy",
    spriteUrl: "/assets/gameboy/gameboy.png",
    interactionRules: {
      "personal-room-gameboy-drop-target": {
        outcome: "place",
        hitDialogKey: "item.gameboy.drop.personal-room-gameboy-drop-target.hit",
        missDialogKey:
          "item.gameboy.drop.personal-room-gameboy-drop-target.miss",
        placeCanPickup: true,
        placeHasCollision: true,
        placeCollisionHalfSize: [0.38, 0.38, 0.38],
        pickupSuccessDialogKey:
          "item.gameboy.pickup.personal-room-gameboy-drop-target.allowed",
        pickupBlockedDialogKey:
          "item.gameboy.pickup.personal-room-gameboy-drop-target.blocked",
      },
    },
    defaultRule: {
      outcome: "return",
      missDialogKey: "item.gameboy.drop.default.miss",
    },
  },
};

export function getItemDefinition(itemId: string): ItemDefinition | null {
  return ITEMS[itemId] ?? null;
}

export function resolveItemRule(
  itemId: string,
  interactionId: string,
): ItemInteractionRule | null {
  const item = getItemDefinition(itemId);
  if (!item) return null;
  return item.interactionRules[interactionId] ?? item.defaultRule;
}
