import { act, otherwise } from "@pointclick-engine/engine-core";

import type { ItemDefinition, ItemInteractionRule } from "./types";

export type { ItemDefinition, ItemInteractionRule };

export const ITEMS: Record<string, ItemDefinition> = {
  gameboy: {
    id: "gameboy",
    name: "Gameboy",
    spriteUrl: "/assets/gameboy/gameboy.png",
    descriptionDialogKey: "item.gameboy.description",
    pickupSoundUrl: "/assets/audio/sfx/pickup-gameboy.ogg",
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
  trophy: {
    id: "trophy",
    name: "Trophy",
    spriteUrl: "/assets/trophy/trophy.png",
    descriptionDialogKey: "item.trophy.description",
    interactionRules: {
      "town-trophy-pedestal": {
        outcome: "place",
        hitDialogKey: "item.trophy.drop.town-trophy-pedestal.hit",
        missDialogKey: "item.trophy.drop.town-trophy-pedestal.miss",
        placeCanPickup: true,
        placeHasCollision: true,
        placeCollisionHalfSize: [0.38, 0.38, 0.38],
        pickupSuccessDialogKey:
          "item.trophy.pickup.town-trophy-pedestal.allowed",
        pickupBlockedDialogKey:
          "item.trophy.pickup.town-trophy-pedestal.blocked",
      },
    },
    defaultRule: {
      outcome: "return",
      missDialogKey: "item.trophy.drop.default.miss",
    },
  },
  // --- Combinacion de prueba: mango + paleton dan una llave de bronce (reutilizan el sprite de la llave) ---
  // Mango: lo entrega el guia de `town` al hablar con el (opcion `once` del dialogo).
  "key-handle": {
    id: "key-handle",
    name: "Mango roto",
    spriteUrl: "/assets/key/gold-key.png",
    descriptionDialogKey: "item.key-handle.description",
    interactionRules: {},
    defaultRule: { outcome: "return", missDialogKey: "item.key-part.drop.default.miss" },
    // Se combina con el paleton (esta regla vale en ambos sentidos).
    combine: {
      "key-bit": [
        otherwise(
          // `say` espera a que se cierre el bocadillo: el resultado va antes que la frase.
          act.removeItem("key-handle"),
          act.removeItem("key-bit"),
          act.giveItem("bronze-key"),
          act.say("combine.key.done"),
        ),
      ],
    },
  },
  // Paleton: esta en el suelo de `town` (initialItems).
  "key-bit": {
    id: "key-bit",
    name: "Paletón roto",
    spriteUrl: "/assets/key/gold-key.png",
    descriptionDialogKey: "item.key-bit.description",
    interactionRules: {},
    defaultRule: { outcome: "return", missDialogKey: "item.key-part.drop.default.miss" },
  },
  // Resultado de la combinacion.
  "bronze-key": {
    id: "bronze-key",
    name: "Llave de bronce",
    spriteUrl: "/assets/key/gold-key.png",
    descriptionDialogKey: "item.bronze-key.description",
    interactionRules: {},
    defaultRule: { outcome: "return", missDialogKey: "item.key-part.drop.default.miss" },
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
