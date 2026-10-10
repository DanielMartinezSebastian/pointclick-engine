import type { InventorySlotsState, PlacedSceneItem } from "../types";

/** Puerto mínimo de almacenamiento clave/valor (localStorage-like, sin depender de él). */
export interface KeyValueStoragePort {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem?(key: string): void;
}

/** Clave que usa hoy la demo para los slots. */
export const INVENTORY_SLOTS_STORAGE_KEY = "inventory-slots";
/** Clave que usa hoy la demo (zustand persist) para los ítems colocados. */
export const PLACED_ITEMS_STORAGE_KEY = "placed-items-state";

function parseJson(raw: string | null): unknown {
  if (!raw) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

/**
 * Lee slots. Formato: array JSON plano, p. ej.
 * `[{"id":"gameboy","name":"Gameboy","spriteUrl":"/a.png","quantity":1},null,null]`.
 * Devuelve null si falta, es JSON inválido o no es un array. Nunca lanza.
 */
export function loadInventorySlotsState(
  storage: KeyValueStoragePort,
  key: string = INVENTORY_SLOTS_STORAGE_KEY,
): InventorySlotsState | null {
  try {
    const parsed = parseJson(storage.getItem(key));
    return Array.isArray(parsed) ? (parsed as InventorySlotsState) : null;
  } catch {
    return null;
  }
}

/** Guarda slots como array JSON plano (mismo formato que lee `loadInventorySlotsState`). */
export function saveInventorySlotsState(
  storage: KeyValueStoragePort,
  slots: InventorySlotsState,
  key: string = INVENTORY_SLOTS_STORAGE_KEY,
): void {
  storage.setItem(key, JSON.stringify(slots));
}

export type PersistedPlacedItems = {
  items: PlacedSceneItem[];
  seededSceneIds: string[];
};

/**
 * Lee ítems colocados. Formato: envoltorio de zustand `persist`:
 * `{"state":{"items":[...],"initialItemsCreated":true},"version":0}`
 * (también acepta `"seededSceneIds":["scene"]` dentro de `state`, que es lo que escribe `save`).
 *
 * Traducción del flag antiguo `initialItemsCreated: true`: no sabía a qué escena
 * correspondía, así que quien llama la indica en `legacySeededSceneId` (la demo: la
 * escena que sembraba, "personalRoom"). Con flag true y sin `legacySeededSceneId` no se
 * marca ninguna escena (conservador: podría resembrarse). Si existe `seededSceneIds`
 * como array, tiene prioridad y el flag se ignora.
 *
 * Devuelve null si falta, JSON inválido, o sin `state.items` como array. Nunca lanza.
 */
export function loadPlacedItemsState(
  storage: KeyValueStoragePort,
  options: { key?: string; legacySeededSceneId?: string } = {},
): PersistedPlacedItems | null {
  try {
    const parsed = parseJson(storage.getItem(options.key ?? PLACED_ITEMS_STORAGE_KEY));
    if (!parsed || typeof parsed !== "object") return null;
    const state = (parsed as { state?: unknown }).state;
    if (!state || typeof state !== "object") return null;
    const { items, seededSceneIds, initialItemsCreated } = state as Record<string, unknown>;
    if (!Array.isArray(items)) return null;

    let seeded: string[] = [];
    if (Array.isArray(seededSceneIds)) {
      seeded = seededSceneIds.filter((s): s is string => typeof s === "string");
    } else if (initialItemsCreated === true && options.legacySeededSceneId) {
      seeded = [options.legacySeededSceneId];
    }
    return { items: items as PlacedSceneItem[], seededSceneIds: seeded };
  } catch {
    return null;
  }
}

/**
 * Guarda ítems colocados como envoltorio de zustand persist con version 0:
 * `{"state":{"items":[...],"seededSceneIds":["scene"]},"version":0}`.
 * No escribe `initialItemsCreated`.
 */
export function savePlacedItemsState(
  storage: KeyValueStoragePort,
  data: PersistedPlacedItems,
  key: string = PLACED_ITEMS_STORAGE_KEY,
): void {
  storage.setItem(
    key,
    JSON.stringify({
      state: { items: data.items, seededSceneIds: data.seededSceneIds },
      version: 0,
    }),
  );
}
