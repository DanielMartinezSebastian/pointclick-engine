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

import type { InventorySlotsState } from "@pointclick-engine/engine-core";

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

// ============================================================================
// Persistencia de inventario
// ============================================================================

/**
 * Carga los slots del inventario desde localStorage.
 * Devuelve null si no existen, están vacíos, o fallan al parsear.
 */
export function loadInventorySlots(): InventorySlotsState | null {
  const saved = localStorageAdapter.getItem(GAME_STORAGE_KEYS.inventorySlots);
  if (!saved) return null;

  try {
    const parsed = JSON.parse(saved);
    // Validación básica: debe ser un array
    if (!Array.isArray(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Guarda los slots del inventario en localStorage.
 * Mantiene el mismo formato JSON que la versión anterior (compatibilidad).
 */
export function saveInventorySlots(slots: InventorySlotsState): void {
  localStorageAdapter.setItem(
    GAME_STORAGE_KEYS.inventorySlots,
    JSON.stringify(slots),
  );
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
