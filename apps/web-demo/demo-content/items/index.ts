import type { ItemDefinition, ItemInteractionRule } from "./types";

export type { ItemDefinition, ItemInteractionRule };

export const ITEMS: Record<string, ItemDefinition> = {
  gameboy: {
    id: "gameboy",
    name: "Gameboy",
    spriteUrl: "/assets/gameboy/gameboy.png",
    descriptionDialogKey: "item.gameboy.description",
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
  // Gold key — opens the dungeon gate door. Demonstrates the engine's
  // declarative item-rule pipeline: when dragged onto the
  // `dungeon-gate-door` drop-target, the rule's outcome="consume" removes
  // it from the inventory and emits `item:dropped` with that outcome. The
  // `SceneDoors` system listens for that event and flips the door open.
  "gold-key": {
    id: "gold-key",
    name: "Llave dorada",
    spriteUrl: "/assets/key/gold-key.png",
    descriptionDialogKey: "item.gold-key.description",
    interactionRules: {
      "dungeon-gate-door": {
        outcome: "consume",
        hitDialogKey: "item.gold-key.drop.dungeon-gate-door.hit",
        missDialogKey: "item.gold-key.drop.dungeon-gate-door.miss",
      },
    },
    defaultRule: {
      outcome: "return",
      missDialogKey: "item.gold-key.drop.default.miss",
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
