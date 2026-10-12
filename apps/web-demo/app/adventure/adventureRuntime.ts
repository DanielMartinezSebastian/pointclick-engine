// Composición del juego de /adventure: runtime, partida guardada propia y opciones del viewport.
//
// La partida NO comparte nada con `/`: todo `localStorage` pasa por un puerto con prefijo
// (`adventure:`), así que la instantánea vive en `adventure:pointclick-save` y el idioma en
// `adventure:i18n-locale`. No se importa `app/lib/gamePersistence.ts` (hidrata los stores con la
// partida de `/` al importarse) ni `app/store/audio.ts` (persiste en `audio-settings`).
import {
  clearSave,
  createAudioSettingsStore,
  getGameRuntime,
  getRandomPhrase,
  loadGame,
  registerDictionaries,
  resetGameState,
  toRuntimeScene,
  useDialogStore,
  useInventoryStateStore,
  usePlacedItemsStateStore,
  useSceneStore,
  useWorldStateStore,
  type AudioDefaultsConfig,
  type DialogUIAdapter,
  type GameRuntimeConfig,
  type GameScene,
  type GameSceneTransition,
  type GameSnapshot,
  type ItemDefinition,
} from "@pointclick-engine/engine-core";
import type { GameViewportControllerOptions } from "@pointclick-engine/engine-renderer-r3f";

import {
  ADVENTURE_CONTENT,
  ADVENTURE_HANDLERS,
  ADVENTURE_INITIAL_SCENE_ID,
  adventureDictionaries,
  ADVENTURE_DIALOG_KEYS,
} from "../../adventure-content";
import { localStorageAdapter, type StoragePort } from "../lib/platform-web";
import { webAudioAdapter } from "../lib/platform-web-audio";
import { adventureUiDictionaries } from "./uiTexts";

export const ADVENTURE_STORAGE_PREFIX = "adventure:";

/** Clave de idioma propia de la ruta (la de `/` es `i18n-locale`). */
export const ADVENTURE_LOCALE_KEY = `${ADVENTURE_STORAGE_PREFIX}i18n-locale`;

export const ADVENTURE_LOCALES = ["es", "en"];

/** Puerto de almacenamiento que antepone un prefijo a todas las claves. */
export function createPrefixedStorage(prefix: string, base: StoragePort = localStorageAdapter): StoragePort {
  return {
    getItem: (key) => base.getItem(prefix + key),
    setItem: (key, value) => base.setItem(prefix + key, value),
    removeItem: (key) => base.removeItem(prefix + key),
  };
}

export const adventureStorage = createPrefixedStorage(ADVENTURE_STORAGE_PREFIX);

/** Registra los diccionarios de la historia y de la interfaz (idempotente; el registro fusiona). */
let dictionariesRegistered = false;
export function registerAdventureDictionaries(): void {
  if (dictionariesRegistered) return;
  dictionariesRegistered = true;
  registerDictionaries(adventureDictionaries);
  registerDictionaries(adventureUiDictionaries);
}

/**
 * `say` resuelve el texto en las reglas del runtime, no en los diccionarios i18n: este adaptador
 * muestra el bocadillo con la frase del idioma activo para la clave.
 */
const ADVENTURE_DIALOG_ADAPTER: DialogUIAdapter = {
  show: (text, dialogKey, speaker) =>
    useDialogStore.getState().show(dialogKey ? getRandomPhrase(dialogKey) : text, dialogKey, speaker),
  hide: () => useDialogStore.getState().dismiss(),
};

/** Configuración de `createGameRuntime` de la aventura. */
export const ADVENTURE_RUNTIME_CONFIG: GameRuntimeConfig = {
  scenes: ADVENTURE_CONTENT.scenes,
  items: ADVENTURE_CONTENT.items,
  dialogues: ADVENTURE_CONTENT.dialogues ?? [],
  storage: adventureStorage,
  dialogAdapter: ADVENTURE_DIALOG_ADAPTER,
  dialogKeys: ADVENTURE_DIALOG_KEYS,
  handlerNames: ADVENTURE_HANDLERS,
};

// ---------------------------------------------------------------------------------------------
// Partida guardada: hidratación, guardado automático y reinicio
// ---------------------------------------------------------------------------------------------

let hydrated = false;
let loadedSnapshot: GameSnapshot | null = null;

/** Hay una partida guardada de la aventura (para ofrecer «continuar»). */
export function hasAdventureSave(): boolean {
  return loadGame(adventureStorage) !== null;
}

/**
 * Vuelca la partida guardada en los stores (inventario, ítems colocados, flags). La escena la
 * siembra `useSceneRuntime` con `loadSceneId`. Idempotente y SIN guardar nada.
 */
export function hydrateAdventure(): void {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  loadedSnapshot = loadGame(adventureStorage);
  const snapshot = loadedSnapshot;
  if (!snapshot) return;
  useInventoryStateStore.getState().setSlots(snapshot.inventory);
  const placed = usePlacedItemsStateStore.getState();
  placed.setItems(snapshot.placedItems);
  placed.setSeededSceneIds(snapshot.seededSceneIds);
  useWorldStateStore.getState().setAll({ flags: snapshot.flags, visitedSceneIds: snapshot.visitedSceneIds });
}

let persistenceUsers = 0;
let unsubscribers: Array<() => void> = [];
let suspended = false;
let saveScheduled = false;

function saveNow(): void {
  if (suspended) return;
  // Sin escena todavía no hay partida que guardar.
  if (!useSceneStore.getState().sceneId) return;
  getGameRuntime()?.executeCommand({ type: "game:save" });
}

/** Agrupa los cambios del mismo instante en un solo guardado. */
function scheduleSave(): void {
  if (saveScheduled || suspended) return;
  saveScheduled = true;
  queueMicrotask(() => {
    saveScheduled = false;
    saveNow();
  });
}

function stopSubscriptions(): void {
  unsubscribers.forEach((off) => off());
  unsubscribers = [];
}

/** Activa el guardado automático (con contador de usos para StrictMode). Devuelve la baja. */
export function startAdventurePersistence(): () => void {
  hydrateAdventure();
  if (persistenceUsers === 0 && !suspended) {
    scheduleSave();
    unsubscribers = [
      useInventoryStateStore.subscribe((state, prev) => {
        if (state.slots !== prev.slots) scheduleSave();
      }),
      usePlacedItemsStateStore.subscribe((state, prev) => {
        if (state.items !== prev.items || state.seededSceneIds !== prev.seededSceneIds) scheduleSave();
      }),
      useWorldStateStore.subscribe((state, prev) => {
        if (state.flags !== prev.flags || state.visitedSceneIds !== prev.visitedSceneIds) scheduleSave();
      }),
      useSceneStore.subscribe((state, prev) => {
        if (state.sceneId !== prev.sceneId) scheduleSave();
      }),
    ];
  }
  persistenceUsers += 1;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    persistenceUsers -= 1;
    if (persistenceUsers === 0) stopSubscriptions();
  };
}

/** Borra la partida de la aventura (solo sus claves con prefijo). Después hay que recargar. */
export function clearAdventureProgress(): void {
  suspended = true;
  stopSubscriptions();
  const runtime = getGameRuntime();
  if (runtime) runtime.executeCommand({ type: "game:reset" });
  else resetGameState();
  clearSave(adventureStorage);
}

// ---------------------------------------------------------------------------------------------
// Audio
// ---------------------------------------------------------------------------------------------

/** Ajustes de audio de la aventura: en memoria, sin persistir (la demo guarda los suyos en `audio-settings`). */
export const adventureAudioSettings = createAudioSettingsStore();

const ADVENTURE_AUDIO_DEFAULTS: AudioDefaultsConfig = {
  clickSoundUrl: "/assets/audio/sfx/click.ogg",
  pickupSoundUrl: "/assets/audio/sfx/pickup-default.ogg",
  dropSoundUrl: "/assets/audio/sfx/drop-default.ogg",
  transitionSoundUrl: "/assets/audio/sfx/transition-default.ogg",
};

const RUNTIME_SCENES: Record<string, GameScene> = Object.fromEntries(
  ADVENTURE_CONTENT.scenes.map((scene) => [scene.id, toRuntimeScene(scene)]),
);
const ITEM_DEFINITIONS: Record<string, ItemDefinition> = Object.fromEntries(
  // El audio solo lee los sonidos de recoger/soltar; las reglas del ítem las evalúa el core.
  ADVENTURE_CONTENT.items.map((item) => [
    item.id,
    { id: item.id, name: item.name, spriteUrl: item.spriteUrl, interactionRules: {}, defaultRule: { outcome: "return" } },
  ]),
);
const TRANSITIONS: Record<string, GameSceneTransition> = Object.fromEntries(
  Object.values(RUNTIME_SCENES).flatMap((scene) => (scene.transitions ?? []).map((t) => [t.id, t] as const)),
);

/** Opciones propias de la aventura para `useGameViewportController`. */
export const ADVENTURE_VIEWPORT_OPTIONS: GameViewportControllerOptions = {
  initialSceneId: ADVENTURE_INITIAL_SCENE_ID,
  storage: {
    loadSceneId: () => loadedSnapshot?.sceneId ?? null,
    // La escena se guarda con la instantánea (suscripción al sceneStore): nada que hacer aquí.
    saveSceneId: () => {},
  },
  getPhrase: (key) => getRandomPhrase(key),
  startPersistence: startAdventurePersistence,
  audio: {
    port: webAudioAdapter,
    defaults: ADVENTURE_AUDIO_DEFAULTS,
    scenes: RUNTIME_SCENES,
    items: ITEM_DEFINITIONS,
    transitions: TRANSITIONS,
    settingsStore: adventureAudioSettings,
  },
};
