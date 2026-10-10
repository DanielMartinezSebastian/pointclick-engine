import type { GameVec3, InventorySlotsState, PlacedSceneItem } from "../types";
import { sceneRegistry, toRuntimeScene } from "../runtime/registry";
import type { KeyValueStoragePort } from "./gameStatePersistence";
import { useInventoryStateStore } from "./inventoryStore";
import { usePlacedItemsStateStore } from "./placedItemsReactiveStore";
import { useSceneStore } from "./sceneStore";
import { useWorldStateStore, type FlagValue } from "./worldStateStore";

/** Versión actual del formato de guardado. Súbela al cambiar `GameSnapshot` y añade su migración. */
export const SAVE_FORMAT_VERSION = 1;

/** Clave por defecto de la partida única. */
export const SAVE_STORAGE_KEY = "pointclick-save";

/**
 * Instantánea completa de la partida (lo que se serializa con `JSON.stringify`,
 * `version` primero).
 *
 * `playerPosition` es OPCIONAL: ausente significa "sin posición guardada" y
 * `applySnapshot` usa el spawn por defecto de la escena (el formato de 0.5.0 no
 * guardaba la posición del jugador).
 */
export interface GameSnapshot {
  version: number;
  sceneId: string;
  playerPosition?: GameVec3;
  inventory: InventorySlotsState;
  placedItems: PlacedSceneItem[];
  seededSceneIds: string[];
  flags: Record<string, FlagValue>;
  visitedSceneIds: string[];
  /** Estado propio del host (p. ej. puertas de la demo). Opaco para el core. */
  extra?: Record<string, unknown>;
}

export type SaveOptions = { key?: string };

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/** Lee los stores y construye la instantánea (copias; no comparte referencias con los stores). */
export function captureSnapshot(extra?: Record<string, unknown>): GameSnapshot {
  const scene = useSceneStore.getState();
  const world = useWorldStateStore.getState();
  const placed = usePlacedItemsStateStore.getState();
  const snapshot: GameSnapshot = {
    version: SAVE_FORMAT_VERSION,
    sceneId: scene.sceneId,
    playerPosition: [...scene.playerPosition] as GameVec3,
    inventory: cloneJson(useInventoryStateStore.getState().slots),
    placedItems: cloneJson(placed.items),
    seededSceneIds: [...placed.seededSceneIds],
    flags: { ...world.flags },
    visitedSceneIds: [...world.visitedSceneIds],
  };
  if (extra) snapshot.extra = extra;
  return snapshot;
}

/**
 * Restaura la instantánea. Orden: inventario, ítems colocados + escenas sembradas,
 * flags + escenas visitadas y, AL FINAL, la escena (`setScene` con la posición guardada
 * o el spawn por defecto), para que lo que se evalúe al entrar vea el estado ya restaurado.
 * Si la escena no está registrada no cambia de escena, avisa y devuelve `false`
 * (el resto del estado ya queda restaurado).
 */
export function applySnapshot(snapshot: GameSnapshot): boolean {
  // Se comprueba la escena antes de tocar nada: una instantánea que no se puede
  // aplicar entera no se aplica a medias.
  const sceneConfig = sceneRegistry.get(snapshot.sceneId);
  if (!sceneConfig) {
    console.warn(`[save] applySnapshot — scene not registered: ${snapshot.sceneId}`);
    return false;
  }

  // El estado se restaura antes de fijar la escena, para que las reglas que se
  // evalúan al entrar en ella lo vean ya restaurado.
  const slots = cloneJson(snapshot.inventory);
  useInventoryStateStore.setState({ slots, slotCount: slots.length });

  const placed = usePlacedItemsStateStore.getState();
  placed.setItems(cloneJson(snapshot.placedItems));
  placed.setSeededSceneIds(snapshot.seededSceneIds);

  useWorldStateStore.getState().setAll({
    flags: snapshot.flags,
    visitedSceneIds: snapshot.visitedSceneIds,
  });

  useSceneStore
    .getState()
    .setScene(sceneConfig.id, toRuntimeScene(sceneConfig), snapshot.playerPosition);
  return true;
}

/** Guarda la instantánea actual como JSON bajo una única clave. */
export function saveGame(
  storage: KeyValueStoragePort,
  opts: SaveOptions & { extra?: Record<string, unknown> } = {},
): void {
  storage.setItem(opts.key ?? SAVE_STORAGE_KEY, JSON.stringify(captureSnapshot(opts.extra)));
}

// ---------------------------------------------------------------------------
// Migraciones por versión
// ---------------------------------------------------------------------------

export type SnapshotMigration = (snapshot: Record<string, unknown>) => Record<string, unknown>;

/**
 * Tabla `{ [fromVersion]: migración a fromVersion + 1 }`. Hoy vacía: solo existe la v1.
 * Al subir `SAVE_FORMAT_VERSION` a N, añade la entrada N-1.
 */
export const SAVE_MIGRATIONS: Record<number, SnapshotMigration> = {};

/**
 * Aplica en cadena las migraciones desde `raw.version` hasta `target`.
 * Devuelve null si falta algún eslabón o la versión es inválida / superior a `target`.
 * `target` y `migrations` son inyectables para poder probar el mecanismo.
 */
export function applySaveMigrations(
  raw: Record<string, unknown>,
  target: number = SAVE_FORMAT_VERSION,
  migrations: Record<number, SnapshotMigration> = SAVE_MIGRATIONS,
): Record<string, unknown> | null {
  let current = raw;
  let version = current.version;
  if (typeof version !== "number" || !Number.isInteger(version) || version < 1) return null;
  if (version > target) return null;
  while (version < target) {
    const step: SnapshotMigration | undefined = migrations[version];
    if (!step) return null;
    version += 1;
    current = { ...step(current), version };
  }
  return current;
}

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);
const isStrArr = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every((s) => typeof s === "string");

function isValidSnapshot(v: Record<string, unknown>): boolean {
  const pos = v.playerPosition;
  return (
    typeof v.sceneId === "string" &&
    Array.isArray(v.inventory) &&
    Array.isArray(v.placedItems) &&
    isStrArr(v.seededSceneIds) &&
    isObj(v.flags) &&
    isStrArr(v.visitedSceneIds) &&
    (pos === undefined ||
      (Array.isArray(pos) && pos.length === 3 && pos.every((n) => typeof n === "number"))) &&
    (v.extra === undefined || isObj(v.extra))
  );
}

/**
 * Lee y valida la partida. Devuelve null si no existe, JSON inválido, forma inesperada,
 * versión superior a la soportada o sin migración disponible. Nunca lanza.
 */
export function loadGame(storage: KeyValueStoragePort, opts: SaveOptions = {}): GameSnapshot | null {
  try {
    const text = storage.getItem(opts.key ?? SAVE_STORAGE_KEY);
    if (!text) return null;
    const parsed: unknown = JSON.parse(text);
    if (!isObj(parsed)) return null;
    const migrated = applySaveMigrations(parsed);
    if (!migrated || !isValidSnapshot(migrated)) return null;
    return migrated as unknown as GameSnapshot;
  } catch {
    return null;
  }
}

/**
 * Borra SOLO la clave de guardado (nunca `clear()`). Si el puerto no tiene `removeItem`,
 * la deja vacía (`loadGame` trata la cadena vacía como "sin partida").
 */
export function clearSave(storage: KeyValueStoragePort, opts: SaveOptions = {}): void {
  const key = opts.key ?? SAVE_STORAGE_KEY;
  if (storage.removeItem) storage.removeItem(key);
  else storage.setItem(key, "");
}

/** Vacía los stores de partida (inventario al tamaño actual, ítems, sembrados, mundo). No cambia de escena. */
export function resetGameState(): void {
  useInventoryStateStore.getState().reset();
  usePlacedItemsStateStore.getState().reset();
  useWorldStateStore.getState().reset();
}
