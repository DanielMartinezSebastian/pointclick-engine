# Task 17.10 — Core: guardado único y migración

**Effort**: 4h | **Modelo**: sonnet | **Blocks**: 16, 17 | **Blocked by**: 03

**Archivos permitidos**: `packages/engine-core/src/game/state/saveGame.ts`, `state/index.ts`, `game/commands/types.ts`, `game/events/types.ts`, `game/runtime/{types,executors,createGameRuntime}.ts`, `src/__tests__/saveGame.test.ts`. La demo no se toca aquí (tarea 16).

## 🎯 Objetivo

Hoy la partida son cuatro claves sin versión (`inventory-slots`, `current-scene-id`, `placed-items-state`, `door-states`), escritas desde sitios distintos. Con flags y diálogos hace falta una instantánea única, versionada y migrable.

## API

```ts
export const SAVE_FORMAT_VERSION = 1;
export interface GameSnapshot {
  version: number;
  sceneId: string;
  playerPosition: GameVec3;
  inventory: InventorySlotsState;
  placedItems: PlacedSceneItem[];
  seededSceneIds: string[];
  flags: Record<string, FlagValue>;
  visitedSceneIds: string[];
  /** Estado propio del host (p. ej. puertas de la demo). Opaco para el core. */
  extra?: Record<string, unknown>;
}
export function captureSnapshot(extra?: Record<string, unknown>): GameSnapshot;
export function applySnapshot(snapshot: GameSnapshot): void;
export function saveGame(storage: KeyValueStoragePort, opts?: { key?: string; extra?: … }): void;
export function loadGame(storage: KeyValueStoragePort, opts?: { key?: string }): GameSnapshot | null;
export function clearSave(storage: KeyValueStoragePort, opts?: { key?: string }): void;
/** Construye una instantánea a partir de las cuatro claves de 0.5.0, o null si no hay partida antigua. */
export function migrateLegacySave(storage, opts: { legacySeededSceneId?: string; defaultSceneId: string }): GameSnapshot | null;

// GameRuntimeConfig gana storage?: KeyValueStoragePort
// Comandos: game:save, game:load, game:reset.  Eventos: game:saved, game:loaded, game:reset
```

## 📝 Instructions

1. Reutiliza `gameStatePersistence.ts` para leer los formatos antiguos; no los reimplementes.
2. `loadGame` devuelve `null` ante JSON inválido, forma inesperada o versión superior a la soportada, sin lanzar. Versiones inferiores pasan por una tabla de migraciones (hoy vacía, con el mecanismo y su test).
3. `applySnapshot` restaura la escena con la posición guardada (`scene:set` con `spawnPosition`).
4. `clearSave` borra solo su clave. Nunca `clear()` del almacenamiento.
5. No hay guardado automático en el core: el host decide cuándo llamar a `game:save`.
6. Tests (≥ 22): ida y vuelta completa, cada formato antiguo con un ejemplo literal, JSON corrupto, versión futura, `extra`, comandos y eventos.

## ✅ Success Criteria

- [ ] Tests del core verdes; `coreAgnosticism.test.ts` verde.
- [ ] Ningún archivo nuevo por encima de 250 líneas.
- [ ] Las funciones de persistencia de 0.5.0 siguen exportadas y sin cambios.
