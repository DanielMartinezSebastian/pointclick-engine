// Personajes de los NPCs de la aventura por `characterId` (prop `characters` del viewport).
//
// - `glitch`: la copia de David (mismos nombres de frame que `sprites/david`).
// - `helix`: reutiliza la definicion de la demo.
// - `programmer`: SIN sprite a proposito (solo voz). Un NPC con `characterId` sin registrar avisa
//   una vez por consola y no pinta sprite, pero su bocadillo si se pinta: ver NpcSprite.tsx.
import { buildFrameUrls, type CharacterDefinition } from "@pointclick-engine/engine-renderer-r3f";

import { HELIX } from "../demo-content/characters/helix";

const ROOT = "/assets/sprites/david-glitch";

export const GLITCH: CharacterDefinition = {
  id: "glitch",
  clips: {
    idle: { frames: [`${ROOT}/david_idle.png`], fps: 1, loop: true },
    north: { frames: buildFrameUrls(ROOT, "david-walk-north", 9).reverse(), fps: 16, loop: true },
    south: { frames: buildFrameUrls(ROOT, "david-walk-south", 8, 3), fps: 16, loop: true },
    west: { frames: buildFrameUrls(ROOT, "david-walk-west", 9).reverse(), fps: 16, loop: true, mirror: true },
    east: { frames: buildFrameUrls(ROOT, "david-walk-west", 9).reverse(), fps: 16, loop: true },
  },
  speaking: { frames: buildFrameUrls(ROOT, "david_speaking", 8), fps: 8, loop: true },
  size: [1.4, 2.94],
};

export const ADVENTURE_CHARACTERS: Record<string, CharacterDefinition> = {
  [GLITCH.id]: GLITCH,
  [HELIX.id]: HELIX,
};
