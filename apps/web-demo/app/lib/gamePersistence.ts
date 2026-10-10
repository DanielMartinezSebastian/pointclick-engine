/**
 * gamePersistence – Punto único de acceso al almacenamiento de progreso del juego.
 *
 * Centraliza la persistencia de:
 * - Inventario (slots)
 * - Escena actual
 * - Estado de puertas
 * - Ítems colocados en la escena
 *
 * Todos los accesos pasan por `localStorageAdapter` para garantizar:
 * - Fallback seguro en SSR (typeof window !== "undefined")
 * - Desacoplamiento del localStorage nativo
 * - Punto único de cambio para migración futura
 */

import {
  getInventoryState,
  getPlacedItemsState,
  loadInventorySlotsState,
  loadPlacedItemsState,
  saveInventorySlotsState,
  savePlacedItemsState,
  useInventoryStateStore,
  usePlacedItemsStateStore,
  type InventorySlotsState,
  type PersistedPlacedItems,
} from "@pointclick-engine/engine-core";

import { localStorageAdapter } from "./platform-web";


// ============================================================================
// Claves de almacenamiento (constantes públicas)
// ============================================================================

export const GAME_STORAGE_KEYS = {
  inventorySlots: "inventory-slots",
  currentSceneId: "current-scene-id",
  doorStates: "door-states",
  placedItems: "placed-items-state",
} as const;

/** Escena que sembraba el antiguo flag `initialItemsCreated` de las partidas guardadas. */
export const LEGACY_SEEDED_SCENE_ID = "personalRoom";

// ============================================================================
// Persistencia de inventario e ítems colocados (formato y claves heredados)
// ============================================================================

/** Carga los slots del inventario. Devuelve null si faltan o son inválidos. */
export function loadInventorySlots(): InventorySlotsState | null {
  return loadInventorySlotsState(localStorageAdapter, GAME_STORAGE_KEYS.inventorySlots);
}

/** Guarda los slots del inventario (array JSON plano, como siempre). */
export function saveInventorySlots(slots: InventorySlotsState): void {
  saveInventorySlotsState(localStorageAdapter, slots, GAME_STORAGE_KEYS.inventorySlots);
}

/** Carga ítems colocados; traduce el flag antiguo `initialItemsCreated` a `personalRoom`. */
export function loadPlacedItems(): PersistedPlacedItems | null {
  return loadPlacedItemsState(localStorageAdapter, {
    key: GAME_STORAGE_KEYS.placedItems,
    legacySeededSceneId: LEGACY_SEEDED_SCENE_ID,
  });
}

/** Guarda ítems colocados como envoltorio zustand persist `{state:{...},version:0}`. */
export function savePlacedItems(data: PersistedPlacedItems): void {
  savePlacedItemsState(localStorageAdapter, data, GAME_STORAGE_KEYS.placedItems);
}

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
// Hidratación y guardado de los stores del core
// ============================================================================

let hydrated = false;

/**
 * Vuelca el progreso guardado en los stores del core. Idempotente. Se ejecuta al importar
 * este módulo en cliente (antes del primer render que lea los stores) y NO guarda nada:
 * el guardado solo se activa después, en `startGamePersistence`.
 */
export function hydrateGameState(): void {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  useInventoryStateStore
    .getState()
    .setSlots(loadInventorySlots() ?? createInitialInventorySlots());
  const placed = loadPlacedItems();
  if (placed) {
    const store = usePlacedItemsStateStore.getState();
    store.setItems(placed.items);
    store.setSeededSceneIds(placed.seededSceneIds);
  }
}

hydrateGameState();

let persistenceUsers = 0;
let unsubscribers: Array<() => void> = [];

function persistInventoryNow(): void {
  saveInventorySlots(getInventoryState().slots);
}

function persistPlacedItemsNow(): void {
  const { items, seededSceneIds } = getPlacedItemsState();
  savePlacedItems({ items, seededSceneIds });
}

/**
 * Activa el guardado automático de ambos stores (escribe el estado actual, ya hidratado,
 * y después cada cambio). Con contador de usos para StrictMode. Devuelve la función de baja.
 */
export function startGamePersistence(): () => void {
  hydrateGameState();
  if (persistenceUsers === 0) {
    persistInventoryNow();
    persistPlacedItemsNow();
    unsubscribers = [
      useInventoryStateStore.subscribe((state, prev) => {
        if (state.slots !== prev.slots) persistInventoryNow();
      }),
      usePlacedItemsStateStore.subscribe((state, prev) => {
        if (state.items !== prev.items || state.seededSceneIds !== prev.seededSceneIds) {
          persistPlacedItemsNow();
        }
      }),
    ];
  }
  persistenceUsers += 1;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    persistenceUsers -= 1;
    if (persistenceUsers === 0) {
      unsubscribers.forEach((off) => off());
      unsubscribers = [];
    }
  };
}

// ============================================================================
// Persistencia de escena actual
// ============================================================================

/**
 * Carga el ID de la escena actual. Se guarda como texto plano (sin JSON),
 * igual que antes de centralizar la persistencia.
 */
export function loadCurrentSceneId(): string | null {
  return localStorageAdapter.getItem(GAME_STORAGE_KEYS.currentSceneId) || null;
}

/** Guarda el ID de la escena actual como texto plano. */
export function saveCurrentSceneId(id: string): void {
  localStorageAdapter.setItem(GAME_STORAGE_KEYS.currentSceneId, id);
}

// ============================================================================
// Limpieza de progreso
// ============================================================================

/**
 * Borra solo el progreso de la partida actual.
 *
 * Elimina:
 * - Inventario (inventory-slots)
 * - Escena actual (current-scene-id)
 * - Estado de puertas (door-states)
 * - Ítems colocados (placed-items-state)
 *
 * Preserva:
 * - Idioma (i18n-locale)
 * - Ajustes de audio (audio-settings)
 *
 * Nunca usa localStorage.clear() para evitar borrar datos de otras apps
 * compartidas en el mismo origen.
 */
export function clearGameProgress(): void {
  // Borrar claves del juego, una por una
  localStorageAdapter.removeItem(GAME_STORAGE_KEYS.inventorySlots);
  localStorageAdapter.removeItem(GAME_STORAGE_KEYS.currentSceneId);
  localStorageAdapter.removeItem(GAME_STORAGE_KEYS.doorStates);
  localStorageAdapter.removeItem(GAME_STORAGE_KEYS.placedItems);

  // Las claves preservadas (i18n, audio) no se tocan
}
