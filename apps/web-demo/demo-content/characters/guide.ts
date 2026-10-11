// El guia de `town`: reutiliza el sprite de David con otro id de personaje.
// Demo content: NOT part of the engine packages.
import type { CharacterDefinition } from "@pointclick-engine/engine-renderer-r3f";

import { DAVID } from "./david";

/** Personajes de los NPCs de la demo por `characterId` (prop `characters` del viewport). */
export const GUIDE: CharacterDefinition = { ...DAVID, id: "guide" };

export const DEMO_NPC_CHARACTERS: Record<string, CharacterDefinition> = {
  [GUIDE.id]: GUIDE,
};
