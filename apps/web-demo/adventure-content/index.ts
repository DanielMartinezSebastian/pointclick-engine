// Contenido de la aventura "No es un bug, es una feature" (Fase 18).
// Todo es dato: lo resuelve el test headless `adventure.playthrough.test.ts` y lo monta la ruta
// `/adventure`. Contenido de la aventura, NO del motor.
import type { GameContent } from "@pointclick-engine/engine-core";

import { adventureDialogues } from "./dialogues";
import { adventureItems } from "./items";
import { adventureScenes } from "./scenes";
import { ADVENTURE_DIALOG_KEYS, adventureDictionaries } from "./texts";

export { ADVENTURE_CHARACTERS, GLITCH } from "./characters";
export { ADVENTURE_INITIAL_SCENE_ID, adventureScenes } from "./scenes";
export { adventureItems } from "./items";
export { adventureDialogues } from "./dialogues";
export { ADVENTURE_DIALOG_KEYS, adventureDictionaries } from "./texts";

/** Nombres de los manejadores `call` que el host debe registrar. */
export const ADVENTURE_HANDLERS: ReadonlySet<string> = new Set(["credits"]);

/** Diccionarios por idioma (`es`, `en`). */
export const ADVENTURE_ES = adventureDictionaries.es;
export const ADVENTURE_EN = adventureDictionaries.en;

/** Escenas, items, dialogos, claves de texto y manejadores, tal como los recibe `validateContent`. */
export const ADVENTURE_CONTENT: GameContent = {
  scenes: adventureScenes,
  items: adventureItems,
  dialogues: adventureDialogues,
  dialogKeys: ADVENTURE_DIALOG_KEYS,
  handlers: ADVENTURE_HANDLERS,
};

