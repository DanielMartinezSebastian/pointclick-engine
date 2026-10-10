import type {
  GameSceneTransition,
  PlacedSceneItem,
} from "@pointclick-engine/engine-core";
import type {
  GameViewportControllerOptions,
  SceneProgressStorage,
} from "@pointclick-engine/engine-renderer-r3f";

import { SCENES, DEFAULT_SCENE_ID } from "../../../../demo-content/scenes/scenes";
import { ITEMS } from "../../../../demo-content/items";
import { getRandomPhrase } from "../../../../demo-content/dialogs/getRandomPhrase";
import { webAudioAdapter } from "../../platform-web-audio";
import { audioSettingsStore } from "../../../store/audio";
import {
  loadCurrentSceneId,
  saveCurrentSceneId,
  startGamePersistence,
} from "../../gamePersistence";
import { DEMO_AUDIO_DEFAULTS } from "./useDemoAudio";
import {
  canLeaveSceneDemo,
  getDemoInitialPlacedItems,
  onDemoSceneEnter,
} from "./demoSceneRules";

const SCENE_STORAGE: SceneProgressStorage = {
  loadSceneId: loadCurrentSceneId,
  saveSceneId: saveCurrentSceneId,
};

// Transiciones de la demo por id (para el sonido declarativo `triggerSoundUrl`).
const DEMO_TRANSITIONS: Record<string, GameSceneTransition> = Object.fromEntries(
  Object.values(SCENES).flatMap((sc) => (sc.transitions ?? []).map((t) => [t.id, t] as const)),
);

/** En la demo, los items sin `sceneId` (partidas antiguas) cuentan como de personalRoom. */
const filterDemoPlacedItems = (item: PlacedSceneItem, sceneId: string): boolean =>
  item.sceneId === sceneId || (item.sceneId === undefined && sceneId === "personalRoom");

/** Opciones propias de la demo para `useGameViewportController` (datos y callbacks de su juego). */
export const DEMO_VIEWPORT_OPTIONS: GameViewportControllerOptions = {
  initialSceneId: DEFAULT_SCENE_ID,
  storage: SCENE_STORAGE,
  // La demo mantiene en el store su escena completa (SCENES), no la proyeccion del registro del core.
  resolveScene: (id) => SCENES[id] ?? null,
  canLeaveScene: canLeaveSceneDemo,
  // Los diccionarios de la demo se registran en su getRandomPhrase.
  getPhrase: (key) => getRandomPhrase(key),
  getInitialPlacedItems: getDemoInitialPlacedItems,
  onSceneEnter: onDemoSceneEnter,
  filterPlacedItems: filterDemoPlacedItems,
  // Guardado automatico de inventario e items colocados (ya hidratados al importar gamePersistence).
  startPersistence: startGamePersistence,
  audio: {
    port: webAudioAdapter,
    defaults: DEMO_AUDIO_DEFAULTS,
    scenes: SCENES,
    items: ITEMS,
    transitions: DEMO_TRANSITIONS,
    settingsStore: audioSettingsStore,
  },
};
