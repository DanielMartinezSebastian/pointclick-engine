import { useDialogStore } from "@pointclick-engine/engine-core";
import type {
  DialogUIAdapter,
  GameRuntimeConfig,
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
import { demoDictionaries } from "../../../../demo-content/dialogs";
import { localStorageAdapter } from "../../platform-web";
import { webAudioAdapter } from "../../platform-web-audio";
import { audioSettingsStore } from "../../../store/audio";
import {
  loadCurrentSceneId,
  saveCurrentSceneId,
  startGamePersistence,
} from "../../gamePersistence";
import { DEMO_AUDIO_DEFAULTS } from "./useDemoAudio";

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
  // Los diccionarios de la demo se registran en su getRandomPhrase.
  getPhrase: (key) => getRandomPhrase(key),
  filterPlacedItems: filterDemoPlacedItems,
  // Guardado automatico de la partida (ya hidratada al importar gamePersistence).
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

/**
 * `dialog:trigger` (y por tanto `say`, `onEnter`, `blocked`...) resuelve el texto en las reglas
 * del runtime, no en los diccionarios i18n de la demo. Este adaptador muestra el bocadillo con
 * la frase del diccionario del idioma activo para la clave.
 */
const DEMO_DIALOG_ADAPTER: DialogUIAdapter = {
  show: (text, dialogKey, speaker) =>
    useDialogStore.getState().show(dialogKey ? getRandomPhrase(dialogKey) : text, dialogKey, speaker),
  hide: () => useDialogStore.getState().dismiss(),
};

/** Claves de dialogo de la demo (en cualquier idioma), para que `validateContent` las compruebe. */
const DEMO_DIALOG_KEYS: ReadonlySet<string> = new Set(
  Object.values(demoDictionaries).flatMap((dictionary) => Object.keys(dictionary)),
);

/**
 * Configuracion de `createGameRuntime` de la demo (la comparten `/`, `/debug` y
 * `/example-bridge`): contenido, almacenamiento de la partida y puerto de dialogo.
 */
export const DEMO_RUNTIME_CONFIG: GameRuntimeConfig = {
  scenes: Object.values(SCENES),
  items: Object.values(ITEMS),
  storage: localStorageAdapter,
  dialogAdapter: DEMO_DIALOG_ADAPTER,
  dialogKeys: DEMO_DIALOG_KEYS,
};
