/**
 * gamePersistence – Punto único de acceso al guardado del progreso de la demo.
 *
 * Toda la partida vive en UNA instantánea (`GameSnapshot`, clave `pointclick-save`)
 * que escribe el comando `game:save` del core. Lo propio de la demo, las puertas, va en
 * `snapshot.extra`:
 *
 *   extra = { doors: { "<doorId>": true | false, ... } }
 *
 * Las partidas con el formato de 0.5.0 (cuatro claves sueltas: `inventory-slots`,
 * `current-scene-id`, `placed-items-state`, `door-states`) se migran al arrancar con
 * `migrateLegacySave` y las claves antiguas se borran.
 *
 * Todos los accesos pasan por `localStorageAdapter` (fallback seguro en SSR).
 */

import {
  clearSave,
  getGameRuntime,
  loadGame,
  migrateLegacySave,
  resetGameState,
  saveGame,
  SAVE_STORAGE_KEY,
  useInventoryStateStore,
  usePlacedItemsStateStore,
  useSceneStore,
  useWorldStateStore,
  type GameSnapshot,
  type InventorySlotsState,
} from "@pointclick-engine/engine-core";

import { DEFAULT_SCENE_ID } from "../../demo-content/scenes/scenes";
import { useDoorStore } from "../store/doorStore";
import { localStorageAdapter } from "./platform-web";

// ============================================================================
// Claves antiguas (formato 0.5.0): solo se leen para migrar y se borran
// ============================================================================

export const LEGACY_GAME_STORAGE_KEYS = {
  inventorySlots: "inventory-slots",
  currentSceneId: "current-scene-id",
  doorStates: "door-states",
  placedItems: "placed-items-state",
} as const;

const LEGACY_KEYS: string[] = Object.values(LEGACY_GAME_STORAGE_KEYS);

/** Escena que sembraba el antiguo flag `initialItemsCreated` de las partidas guardadas. */
export const LEGACY_SEEDED_SCENE_ID = "personalRoom";

/** Inventario de una partida nueva: gameboy y llave dorada (para probar la puerta de la mazmorra). */
export function createInitialInventorySlots(): InventorySlotsState {
  return Array.from({ length: 9 }, (_, index) => {
    if (index === 0) {
      return {
        id: "gameboy",
        name: "Gameboy",
        spriteUrl: "/assets/gameboy/gameboy.png",
        quantity: 1,
      };
    }
    if (index === 1) {
      return {
        id: "gold-key",
        name: "Llave dorada",
        spriteUrl: "/assets/key/gold-key.png",
        quantity: 1,
      };
    }
    return null;
  });
}

// ============================================================================
// Puertas: el estado vive en `extra`, no en su propia clave
// ============================================================================

const DOORS_EXTRA_KEY = "doors";

type DoorStates = Record<string, boolean>;

function isDoorStates(value: unknown): value is DoorStates {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.values(value).every((v) => typeof v === "boolean")
  );
}

function readDoors(snapshot: GameSnapshot | null): DoorStates {
  const doors = snapshot?.extra?.[DOORS_EXTRA_KEY];
  return isDoorStates(doors) ? { ...doors } : {};
}

// ============================================================================
// Lectura: instantánea nueva o migración de las claves antiguas
// ============================================================================

function removeLegacyKeys(): void {
  for (const key of LEGACY_KEYS) localStorageAdapter.removeItem(key);
}

/** Migra las claves de 0.5.0 a la instantánea nueva, la escribe y borra las antiguas. */
function migrateLegacy(): GameSnapshot | null {
  const hadInventory = localStorageAdapter.getItem(LEGACY_GAME_STORAGE_KEYS.inventorySlots) !== null;
  const snapshot = migrateLegacySave(localStorageAdapter, {
    legacySeededSceneId: LEGACY_SEEDED_SCENE_ID,
    defaultSceneId: DEFAULT_SCENE_ID,
    extraKeys: [LEGACY_GAME_STORAGE_KEYS.doorStates],
  });
  if (!snapshot) return null;

  // Sin inventario guardado, la partida antigua arrancaba con el inventario inicial.
  if (!hadInventory) snapshot.inventory = createInitialInventorySlots();

  // `door-states` era un envoltorio zustand `{ state: { doorOpenStates }, version }`.
  const legacyDoors = snapshot.extra?.[LEGACY_GAME_STORAGE_KEYS.doorStates] as
    | { state?: { doorOpenStates?: unknown } }
    | undefined;
  delete snapshot.extra?.[LEGACY_GAME_STORAGE_KEYS.doorStates];
  const doors = legacyDoors?.state?.doorOpenStates;
  snapshot.extra = isDoorStates(doors) ? { [DOORS_EXTRA_KEY]: doors } : {};

  localStorageAdapter.setItem(SAVE_STORAGE_KEY, JSON.stringify(snapshot));
  removeLegacyKeys();
  return snapshot;
}

function readSavedGame(): GameSnapshot | null {
  return loadGame(localStorageAdapter) ?? migrateLegacy();
}

// ============================================================================
// Hidratación de los stores
// ============================================================================

let hydrated = false;
let loadedSnapshot: GameSnapshot | null = null;

/**
 * Vuelca la partida guardada en los stores (inventario, ítems colocados, flags, puertas).
 * Idempotente. Se ejecuta al importar este módulo en cliente (antes del primer render que
 * lea los stores) y NO guarda nada: el guardado solo se activa en `startGamePersistence`.
 *
 * La escena NO se aplica aquí: la siembra `useSceneRuntime` con `loadCurrentSceneId` (con la
 * escena completa de la demo y el aviso `scene:changed` al audio). Tampoco se restaura la
 * posición del jugador: como siempre, al cargar aparece en el spawn de la escena.
 */
export function hydrateGameState(): void {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  loadedSnapshot = readSavedGame();
  const snapshot = loadedSnapshot;

  useInventoryStateStore.getState().setSlots(snapshot?.inventory ?? createInitialInventorySlots());
  if (snapshot) {
    const placed = usePlacedItemsStateStore.getState();
    placed.setItems(snapshot.placedItems);
    placed.setSeededSceneIds(snapshot.seededSceneIds);
    useWorldStateStore.getState().setAll({
      flags: snapshot.flags,
      visitedSceneIds: snapshot.visitedSceneIds,
    });
  }
  useDoorStore.setState({ doorOpenStates: readDoors(snapshot) });
}

hydrateGameState();

// ============================================================================
// Guardado automático
// ============================================================================

let persistenceUsers = 0;
let unsubscribers: Array<() => void> = [];
let suspended = false;
let saveScheduled = false;

function saveNow(): void {
  if (suspended) return;
  // Sin escena todavía no hay partida que guardar.
  if (!useSceneStore.getState().sceneId) return;
  const extra = { [DOORS_EXTRA_KEY]: { ...useDoorStore.getState().doorOpenStates } };
  const runtime = getGameRuntime();
  if (runtime) runtime.executeCommand({ type: "game:save", extra });
  else saveGame(localStorageAdapter, { extra });
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

/**
 * Activa el guardado automático (escribe el estado actual, ya hidratado, y después cada
 * cambio de inventario, ítems colocados, flags/escenas visitadas, escena o puertas).
 * Con contador de usos para StrictMode. Devuelve la función de baja.
 */
export function startGamePersistence(): () => void {
  hydrateGameState();
  if (persistenceUsers === 0 && !suspended) {
    scheduleSave();
    unsubscribers = [
      useInventoryStateStore.subscribe((state, prev) => {
        if (state.slots !== prev.slots) scheduleSave();
      }),
      usePlacedItemsStateStore.subscribe((state, prev) => {
        if (state.items !== prev.items || state.seededSceneIds !== prev.seededSceneIds) {
          scheduleSave();
        }
      }),
      useWorldStateStore.subscribe((state, prev) => {
        if (state.flags !== prev.flags || state.visitedSceneIds !== prev.visitedSceneIds) {
          scheduleSave();
        }
      }),
      useSceneStore.subscribe((state, prev) => {
        if (state.sceneId !== prev.sceneId) scheduleSave();
      }),
      useDoorStore.subscribe((state, prev) => {
        if (state.doorOpenStates !== prev.doorOpenStates) scheduleSave();
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

// ============================================================================
// Escena actual (puerto del renderer)
// ============================================================================

/** Escena de la partida guardada (para que el renderer la siembre al montar). */
export function loadCurrentSceneId(): string | null {
  return loadedSnapshot?.sceneId ?? null;
}

/** La escena se guarda con la instantánea (suscripción al `sceneStore`): nada que hacer aquí. */
export function saveCurrentSceneId(): void {}

// ============================================================================
// Limpieza de progreso
// ============================================================================

/**
 * Borra solo el progreso de la partida actual: `game:reset` (vacía los stores y borra
 * la instantánea con `clearSave`) y las claves antiguas por si quedaran. Antes se corta
 * el guardado automático para que el vaciado de los stores no reescriba la partida.
 *
 * Preserva idioma (`i18n-locale`), ajustes de audio (`audio-settings`) y cualquier clave
 * ajena. Nunca usa `localStorage.clear()`.
 */
export function clearGameProgress(): void {
  suspended = true;
  stopSubscriptions();
  const runtime = getGameRuntime();
  if (runtime) runtime.executeCommand({ type: "game:reset" });
  else resetGameState();
  // Idempotente: cubre un runtime creado sin `storage`.
  clearSave(localStorageAdapter);
  useDoorStore.setState({ doorOpenStates: {} });
  removeLegacyKeys();
}
