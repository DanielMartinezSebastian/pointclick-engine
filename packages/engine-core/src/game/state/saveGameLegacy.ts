import { sceneRegistry } from "../runtime/registry";
import type { GameVec3 } from "../types";
import {
  INVENTORY_SLOTS_STORAGE_KEY,
  PLACED_ITEMS_STORAGE_KEY,
  loadInventorySlotsState,
  loadPlacedItemsState,
  type KeyValueStoragePort,
} from "./gameStatePersistence";
import { DEFAULT_INVENTORY_SLOT_COUNT, createEmptySlots } from "./inventoryStore";
import { SAVE_FORMAT_VERSION, type GameSnapshot } from "./saveGame";

/** Clave antigua de la escena actual: TEXTO PLANO (sin JSON). */
export const LEGACY_SCENE_ID_STORAGE_KEY = "current-scene-id";

function readExtra(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

/**
 * Construye una instantánea a partir de las claves de 0.5.0 (`inventory-slots`,
 * `current-scene-id`, `placed-items-state`). NO borra las claves antiguas ni escribe la
 * nueva: quien llama decide. Devuelve null si no existe NINGUNA de esas tres claves.
 * Lo que falte o sea ilegible se rellena con valores neutros (escena `defaultSceneId`,
 * inventario vacío de tamaño por defecto, sin ítems colocados). `flags` y
 * `visitedSceneIds` quedan vacíos. `playerPosition` se toma del `playerSpawn` de la escena
 * si está registrada; si no, se omite (y `applySnapshot` usa el spawn por defecto).
 * `extraKeys`: claves antiguas del host cuyo contenido (JSON parseado, o texto si no es
 * JSON) se copia a `snapshot.extra[clave]` (las ausentes se ignoran; no cuentan para
 * decidir si existe partida antigua).
 */
export function migrateLegacySave(
  storage: KeyValueStoragePort,
  opts: { legacySeededSceneId?: string; defaultSceneId: string; extraKeys?: string[] },
): GameSnapshot | null {
  const rawScene = storage.getItem(LEGACY_SCENE_ID_STORAGE_KEY);
  const rawInventory = storage.getItem(INVENTORY_SLOTS_STORAGE_KEY);
  const rawPlaced = storage.getItem(PLACED_ITEMS_STORAGE_KEY);
  if (rawScene === null && rawInventory === null && rawPlaced === null) return null;

  const sceneId = rawScene?.trim() ? rawScene.trim() : opts.defaultSceneId;
  const inventory =
    loadInventorySlotsState(storage) ?? createEmptySlots(DEFAULT_INVENTORY_SLOT_COUNT);
  const placed = loadPlacedItemsState(storage, { legacySeededSceneId: opts.legacySeededSceneId });

  const snapshot: GameSnapshot = {
    version: SAVE_FORMAT_VERSION,
    sceneId,
    inventory,
    placedItems: placed?.items ?? [],
    seededSceneIds: placed?.seededSceneIds ?? [],
    flags: {},
    visitedSceneIds: [],
  };
  const spawn = sceneRegistry.get(sceneId)?.playerSpawn;
  if (spawn) snapshot.playerPosition = [...spawn] as GameVec3;

  const extra: Record<string, unknown> = {};
  for (const key of opts.extraKeys ?? []) {
    const raw = storage.getItem(key);
    if (raw !== null) extra[key] = readExtra(raw);
  }
  if (Object.keys(extra).length > 0) snapshot.extra = extra;
  return snapshot;
}
