# Task 04: Wire events to state mutations

**Phase**: 4 | **Estimate**: 3h | **Owner**: —

## Context

`GameEvent` (Task 02) y `EventBus` existen, pero nada en el motor los emite todavía. Esta task conecta las mutaciones de `sceneStore` a un bus inyectable para que cualquier suscriptor reciba `scene:changed`, `player:moved`, `scene:respawnRequested`. El bus se construye en Task 05 dentro del runtime; aquí solo añadimos los puntos de emisión.

**Restricción**: `sceneStore` no debe instanciar el bus por sí mismo (acoplaría store ↔ bus). Aceptamos el bus como dependencia opcional.

## Prerequisites

- [ ] Task 02 done (`GameEvent` union existe)
- [ ] Task 03 done (no es bloqueante técnicamente, pero conviene tenerlo listo)

## Action

### 1. Añadir hook de emisión en `sceneStore`

Hoy `sceneStore` es un store Zustand puro. Refactor para aceptar un emisor opcional:

En `packages/engine-core/src/game/state/sceneStore.ts`, añadir un campo interno:

```ts
type StoreEmitter = (event: GameEvent) => void;

let _emitter: StoreEmitter | null = null;

/**
 * Inyecta el emisor de eventos. Llamado por `createGameRuntime` al crear el runtime.
 * Si nadie llama a este setter, el store funciona como antes (zero-event mode).
 */
export function setSceneStoreEmitter(emitter: StoreEmitter | null): void {
  _emitter = emitter;
}

function emit(event: GameEvent): void {
  if (_emitter) _emitter(event);
}
```

### 2. Emitir en mutaciones clave

En cada action del store, tras aplicar el cambio:

- `setScene(id, scene)` → `emit({ type: "scene:changed", sceneId: id, scene })`
- `requestRespawn()` → `emit({ type: "scene:respawnRequested", sceneId: state.sceneId })`
- `setPlayerPosition(pos)` → **NO** emitir aquí (alta frecuencia: explota el bus). El renderer ya empuja `player:moved` con throttling vía Task 05/06.

### 3. Mantener el modo zero-event para tests

Tests existentes de `sceneStore` (en `__tests__/`) llaman al store sin runtime. Comprobar que pasan sin cambios: si `_emitter` es null, `emit()` es no-op.

### 4. Tests

Crear `packages/engine-core/__tests__/sceneStoreEvents.test.ts`:

- Sin emitter registrado: `setScene` no llama a nada (el test usa un spy global y verifica que no se invocó).
- Con emitter registrado vía `setSceneStoreEmitter(spy)`: `setScene("a", sceneFixture)` emite exactamente `{ type: "scene:changed", sceneId: "a", scene: sceneFixture }`.
- `requestRespawn()` emite `scene:respawnRequested` con el `sceneId` actual.
- `setSceneStoreEmitter(null)` desactiva las emisiones.

### 5. No tocar el renderer aquí

`player:moved` y `player:collided` llegan desde el runtime de R3F vía el callback `onRuntimeEvent` y se reencaminarán al bus en Task 05/06. Esta task solo cubre eventos originados en mutaciones de store.

## Success Criteria

- [ ] `sceneStore.ts` expone `setSceneStoreEmitter` exportada
- [ ] `setScene` y `requestRespawn` emiten cuando hay emitter
- [ ] `setPlayerPosition` NO emite (verificable en tests)
- [ ] Tests existentes de `sceneStore.test.ts` siguen pasando sin cambios
- [ ] Nuevos tests `sceneStoreEvents.test.ts` pasan (≥4 tests)
- [ ] `npm run build -w packages/engine-core` pasa
- [ ] `grep -rn "react\|three" packages/engine-core/src/game/state` devuelve nada

## On Complete

1. Marca `[x]` en `../tracking.md` para `04-wire-events-to-state-mutations`
2. Commit:
   ```
   feat(engine-core): emit GameEvent on sceneStore mutations

   - [x] Marked: 04-wire-events-to-state-mutations

   See docs/phases/phase-4-bidirectional-web-game/tasks/04-wire-events-to-state-mutations.md
   ```

## References

- ADR: `docs/decisions/0006-command-event-architecture.md`
- Store: `packages/engine-core/src/game/state/sceneStore.ts`
- Event union: `packages/engine-core/src/game/events/types.ts`

## Notes

**Alternativa rechazada**: subscribir a `zustand.subscribe()` desde el runtime y derivar eventos de los diffs. Más costoso (compara estados), menos explícito (¿qué cuenta como "cambio"?), y mezcla responsabilidades. Mejor emitir en los call-sites concretos.

**Frecuencia alta**: si en el futuro algún consumer pide `player:moved` (60Hz), añadir un throttle/debounce en el runtime, no en el store.
