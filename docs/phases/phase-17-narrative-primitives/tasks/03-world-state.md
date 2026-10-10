# Task 17.03 — Core: estado de mundo (flags)

**Effort**: 2.5h | **Modelo**: sonnet | **Blocks**: 04, 10 | **Blocked by**: 01

**Archivos permitidos**: `packages/engine-core/src/game/state/worldStateStore.ts`, `state/index.ts`, `game/commands/types.ts`, `game/events/types.ts`, `game/runtime/executors.ts`, `game/runtime/createGameRuntime.ts`, `src/__tests__/worldState.test.ts`.

## 🎯 Objetivo

Dar al motor memoria: flags con nombre que cualquier regla puede leer y escribir. Es la base de condiciones, guiones y guardado.

## API

```ts
export type FlagValue = boolean | number | string;

// Store reactivo, mismo estilo que dialogStore.ts
type WorldStateStoreState = {
  flags: Record<string, FlagValue>;
  visitedSceneIds: string[];
  setFlag(name: string, value: FlagValue): void;
  clearFlag(name: string): void;
  markSceneVisited(sceneId: string): void;
  setAll(snapshot: { flags: Record<string, FlagValue>; visitedSceneIds: string[] }): void;
  reset(): void;
};
export const useWorldStateStore;
export function getWorldState(): WorldStateStoreState;

// Comandos (aditivos)
//   { type: "state:setFlag"; name: string; value: FlagValue }
//   { type: "state:clearFlag"; name: string }
// Eventos (aditivos)
//   { type: "state:flagChanged"; name: string; value?: FlagValue; previous?: FlagValue }
```

## 📝 Instructions

1. Lee `state/dialogStore.ts`, `state/inventoryStore.ts` y cómo `executors.ts` emite por el `bus`.
2. `setFlag` con el mismo valor no notifica ni emite.
3. `visitedSceneIds` se rellena cuando cambia la escena: suscríbete a `scene:changed` dentro de `createGameRuntime` (no importes un store desde otro) y libera la suscripción en `dispose`.
4. Tests (≥ 14): set y clear, sin cambio no emite, evento con `previous`, escenas visitadas sin duplicados, `reset`, `setAll`, comandos por el runtime.

## ✅ Success Criteria

- [ ] Tests del core verdes; ningún test existente modificado.
- [ ] `coreAgnosticism.test.ts` verde.
- [ ] Los tipos `GameCommand` y `GameEvent` solo crecen.
