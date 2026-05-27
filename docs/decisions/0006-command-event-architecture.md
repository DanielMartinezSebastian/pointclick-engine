# ADR-0006: Command/Event Architecture

**Estado**: Aceptado | **Fecha**: 2026-05-27 | **Autores**: Daniel Martínez Sebastián

## Context

Tras Phase 3, `engine-core` define ports agnósticos y `engine-renderer-r3f` los implementa. La única
forma de interactuar con el juego desde fuera de React era:

1. Renderizar `<GameViewport />` y pasar `onRuntimeEvent` como callback opcional (solo 4 eventos, acoplado a React).
2. Llamar a `getGameActions()` (expone el store interno, no serializable).

Esto impide integrar el motor desde HTML/JS clásico, Vue, Svelte o un wrapper Electron sin acoplarlo a React.

Phase 4 define dos canales formales:

- **Commands** (web → juego): mensajes tipados que el runtime acepta y despacha.
- **Events** (juego → web): notificaciones que el runtime emite a cualquier suscriptor.

## Decision

### Commands (Web → Game)

- **Forma**: discriminated union `GameCommand = { type: "scene:set"; sceneId: string } | ...`
  Naming: `<domain>:<action>` para namespacing claro (`scene:set`, `inventory:pickup`).
- **Dispatcher**: `executeCommand(cmd: GameCommand): void` — sync, fire-and-forget.
- **Comandos desconocidos**: warn + no-op (no throw). Nunca romper al consumidor por forward-compat.
- **Async**: descartado para esta versión (ver Alternatives). Las operaciones async confirman
  su resultado vía evento (`scene:changed`) en lugar de retornar Promise.

### Events (Game → Web)

- **Forma**: discriminated union `GameEvent = { type: "scene:changed"; sceneId: string; scene: GameScene } | ...`
  Naming igual: `<domain>:<action>`.
- **Bus**: `EventBus` existente (síncrono, sin orden garantizado entre listeners).
- **Suscripción**: `on(type, handler) → unsubscribe` — retorna función de limpieza.
- **No replay**: sin re-emisión de eventos pasados (sin event store).

### Ownership

- Un único `EventBus` + `CommandHandler` por instancia de runtime.
- Ambos viven en el handle devuelto por `createGameRuntime()`.
- `executeCommand` y `on` pertenecen al handle, **no al store directamente**.
- El handle se almacena en un singleton de módulo accesible vía `getGameRuntime()`.

### Backwards Compatibility

- `onRuntimeEvent` callback se mantiene: sigue siendo una forma de escuchar los 4 eventos legacy
  (`onMove`, `onCollide`, `onDrop`, `onDialog`) sin cambiar el contrato externo.
- `getGameActions()` y `useGameActions()` se mantienen como atajos convenientes para consumers React.
- El bus es la API **formal** para integradores externos.

### off() vs unsubscribe

- Se elige el patrón unsubscribe (retorno de `on()`) en lugar de `off()`.
- Motivo: más seguro (no requiere igualdad de referencia), más idiomático en React hooks.
- Si en el futuro se necesita `off()`, se añade sin breaking change.

## Consequences

**Facilita**:
- Integración desde cualquier framework (Vue, Svelte, HTML plano, Electron preload).
- Enviar comandos por `postMessage` / iframe / WebView (comandos son objetos serializables).
- Testing sin React: `CommandHandler` + `EventBus` son pure TS sin dependencias de framework.

**Complica**:
- Comandos sin executor real (Phase 4 inicial) solo loguean warning. Consumers deben saber qué
  comandos están cableados vs placeholder.
- El singleton `getGameRuntime()` implica que solo hay un runtime activo por módulo. Suficiente
  para una app demo; en caso multi-instancia se revisará en Phase 5+.

**Deja para futuro**:
- Comandos async (`executeCommand` retorna `Promise<void>` para operaciones largas).
- Replay / recording de comandos para debugging o testing de regresión.
- EventBus tipado genéricamente (hoy usa `string` como key + `unknown` como data).

## Alternatives considered

- **RxJS observables**: descartado — peso extra (~40kB), complejidad innecesaria para el caso de uso.
- **Promesas en executeCommand**: descartado — la mayoría son fire-and-forget; los flujos que
  requieran confirmación escuchan el evento de confirmación. Evita contaminar el contrato síncrono.
- **Function-per-action** (`runtime.setScene(id)`): descartado — no serializable, no se puede
  enviar por `postMessage`, no extensible sin cambiar firma.
- **Zustand subscribe para derivar eventos**: descartado — compara estados completos (costoso),
  menos explícito que emitir en call-sites concretos.

## References

- Phase 4 README: `docs/phases/phase-4-bidirectional-web-game/README.md`
- Bus existente: `packages/engine-core/src/events/EventBus.ts`
- Implementación: `packages/engine-core/src/game/commands/` y `src/game/events/`
- Exposición pública: `apps/web-demo/app/lib/engine/publicApi.ts`
