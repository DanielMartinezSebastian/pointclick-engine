# Task 05: Expose bidirectional API in `createGameRuntime`

**Phase**: 4 | **Estimate**: 3h | **Owner**: —

## Context

Con `CommandHandler` (Task 03) y emisión de eventos del store (Task 04) listos, falta exponerlos públicamente. Actualizar `apps/web-demo/app/lib/engine/publicApi.ts` para que `createGameRuntime` devuelva un handle con `executeCommand`, `on`, `off`, `emit`.

Mantener **backwards compatibility** del `onRuntimeEvent` callback que web-demo usa hoy: se reimplementa como un suscriptor al bus con `legacyAdapter`.

## Prerequisites

- [ ] Task 03 done (`CommandHandler`)
- [ ] Task 04 done (`setSceneStoreEmitter`)

## Action

### 1. Extender `GameRuntime` handle

En `apps/web-demo/app/lib/engine/publicApi.ts`:

```ts
import {
  EventBus,
  CommandHandler,
  setSceneStoreEmitter,
  type GameCommand,
  type GameEvent,
  type GameEventType,
  type GameEventHandler,
  useSceneStore,
} from "@pointclick/engine-core";

export type GameRuntime = {
  // Existentes
  getScenes: () => Record<string, GameSceneConfig>;
  getItems: () => Record<string, GameItemConfig>;
  getRules: () => Record<string, GameRuleConfig>;
  // Nuevos (Phase 4)
  executeCommand: (cmd: GameCommand) => void;
  on: <T extends GameEventType>(type: T, handler: GameEventHandler<T>) => () => void;
  off: <T extends GameEventType>(type: T, handler: GameEventHandler<T>) => void;
  emit: (event: GameEvent) => void;
  /** Libera bus + emitter (llamar al desmontar la app). */
  dispose: () => void;
};
```

### 2. Construir bus + handler en `createGameRuntime`

```ts
export function createGameRuntime(config: GameRuntimeConfig = {}): GameRuntime {
  // ... código actual de registro de scenes/items/rules ...

  const bus = new EventBus();
  const commands = new CommandHandler();

  // Cablear store → bus
  setSceneStoreEmitter((event) => bus.emit(event.type, event));

  // Registrar executors que mapean GameCommand → acciones del store
  commands.register("scene:set", (cmd) => {
    const sceneConfig = _sceneRegistry.get(cmd.sceneId);
    if (!sceneConfig) {
      console.warn(`Scene not registered: ${cmd.sceneId}`);
      return;
    }
    useSceneStore.getState().setScene(sceneConfig.id, {
      id: sceneConfig.id,
      label: sceneConfig.label,
      background: sceneConfig.background,
      playerSpawn: sceneConfig.playerSpawn,
      ground: sceneConfig.ground,
      walls: sceneConfig.walls,
      interactions: sceneConfig.interactions,
    });
  });

  commands.register("scene:respawn", () => {
    useSceneStore.getState().requestRespawn();
  });

  commands.register("player:move", (cmd) => {
    useSceneStore.getState().setPlayerPosition(cmd.position);
  });

  // TODO en Task 06+: inventory:*, dialog:*, player:stop (requieren stores adicionales o señales al renderer)
  // Por ahora registramos no-ops con warning para que el contrato tipográfico esté completo.
  for (const t of ["player:stop", "inventory:toggle", "inventory:pickup", "inventory:drop", "dialog:trigger", "dialog:dismiss"] as const) {
    commands.register(t, (cmd) => console.warn(`[runtime] executor not yet wired: ${cmd.type}`));
  }

  return {
    getScenes: () => Object.fromEntries(_sceneRegistry),
    getItems: () => Object.fromEntries(_itemRegistry),
    getRules: () => Object.fromEntries(_ruleRegistry),
    executeCommand: (cmd) => commands.execute(cmd),
    on: (type, handler) => bus.on(type, handler as (data: unknown) => void),
    off: (type, handler) => {
      // EventBus actual devuelve unsubscribe desde on(). Para mantener off() sencillo:
      // implementar con un Map<handler, unsubscribe> interno al runtime.
      // O alternativamente, eliminar off() del API y forzar a usar el unsubscribe devuelto.
    },
    emit: (event) => bus.emit(event.type, event),
    dispose: () => {
      bus.clear();
      commands.clear();
      setSceneStoreEmitter(null);
    },
  };
}
```

### 3. Mantener `onRuntimeEvent` backwards-compatible

`GameViewport` acepta `onRuntimeEvent`. Reimplementar internamente para que se suscriba al bus y reciba los 4 eventos legacy:

```ts
// En GameTouchCanvas o un wrapper:
useEffect(() => {
  if (!onRuntimeEvent || !runtime) return;
  const unsubs = (["player:moved", "player:collided", "item:dropped", "dialog:triggered"] as const).map((type) =>
    runtime.on(type, (event) => {
      const legacy = gameEventToLegacyRuntimeEvent(event);
      if (legacy) onRuntimeEvent(legacy);
    }),
  );
  return () => unsubs.forEach((u) => u());
}, [onRuntimeEvent, runtime]);
```

**Decisión**: el runtime debe ser accesible desde `GameViewport`. Opciones:
- **A**: `createGameRuntime` guarda el handle en un singleton expuesto vía `getGameRuntime()`.
- **B**: pasar el handle como prop a `GameViewport`.

Elegir A para no romper la API del componente. Documentar en el ADR-0006 como decisión secundaria.

### 4. Emitir `player:moved` y `player:collided` desde el renderer

En el runtime de R3F donde hoy se llama `onRuntimeEvent({ type: "onMove", ... })`, también emitir al bus:

```ts
// En GameTouchSpriteRuntime o equivalente:
const runtime = getGameRuntime();
runtime?.emit({ type: "player:moved", position, action });
```

(El callback `onRuntimeEvent` legacy ya está cubierto por la suscripción del paso 3.)

### 5. Tests

- En engine-core: ya cubiertos por Tasks 03 + 04.
- En web-demo `apps/web-demo/__tests__/publicApi.test.ts`:
  - `createGameRuntime()` retorna un handle con todas las nuevas funciones.
  - `runtime.executeCommand({ type: "scene:set", sceneId: "x" })` muta el store.
  - `runtime.on("scene:changed", spy)` recibe el evento tras `executeCommand("scene:set")`.
  - `runtime.dispose()` desactiva las emisiones del store.
  - `onRuntimeEvent` legacy sigue recibiendo `{ type: "onMove", ... }` (smoke test).

## Success Criteria

- [ ] `GameRuntime` tipa `executeCommand`, `on`, `emit`, `dispose`
- [ ] `createGameRuntime()` registra executors para `scene:set`, `scene:respawn`, `player:move`
- [ ] Comandos sin executor real loguean warning pero no rompen typing
- [ ] `runtime.on("scene:changed", h)` recibe evento tras `executeCommand`
- [ ] `onRuntimeEvent` legacy callback sigue funcionando idéntico (test smoke)
- [ ] `npm run build` pasa (workspace completo)
- [ ] `npm run test` pasa (engine-core + web-demo, incluyendo tests nuevos del publicApi)
- [ ] Demo R3F arranca: `npm run dev` + golden path (escena inicial, WASD, click-to-move, cambio de escena, inventario, diálogos)

## On Complete

1. Marca `[x]` en `../tracking.md` para `05-expose-bidirectional-api`
2. Commit:
   ```
   feat(runtime): expose executeCommand / on / emit in GameRuntime

   - [x] Marked: 05-expose-bidirectional-api

   See docs/phases/phase-4-bidirectional-web-game/tasks/05-expose-bidirectional-api.md
   ```

## References

- ADR: `docs/decisions/0006-command-event-architecture.md`
- Architecture: `docs/architecture/02-public-api.md`
- Tasks previas: 03 (CommandHandler), 04 (store emitter), 02 (legacyAdapter)

## Notes

`off()` puede simplificarse eliminándolo del contrato y forzando el uso del unsubscribe que devuelve `on()`. Si el ADR-0006 lo decidió así, omítelo y documenta en el JSDoc del handle.

Si la firma `executeCommand` o el handle cambia respecto a lo planeado, actualiza también `docs/architecture/02-public-api.md` antes de cerrar la task.

**Compatibilidad**: no eliminar `getGameActions()` ni `useGameActions()`. Quedan como atajo conveniente; los comandos son la API formal para integradores externos.
