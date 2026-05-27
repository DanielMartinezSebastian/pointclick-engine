# Task 01: Design command/event architecture (ADR-0006)

**Phase**: 4 | **Estimate**: 2h | **Owner**: —

## Context

Phase 4 introduce dos canales nuevos en `engine-core`: comandos (web → juego) y eventos (juego → web). Antes de codificar nada, decidir:

- **Shape**: ¿discriminated union `{ type, payload }` o función-por-acción?
- **Sync vs async**: ¿`executeCommand` retorna `void` o `Promise<void>`?
- **Naming**: ¿camelCase `setScene` o `domain:action` `scene:set`?
- **Error handling**: ¿silencioso, throw, retorna `Result<T, E>`?
- **Ownership**: ¿hay un único `EventBus` por runtime, o uno por dominio?

Esta task es solo diseño. Resultado: ADR-0006 + esqueleto vacío de tipos. **No mover código todavía.**

## Prerequisites

- [ ] Phase 3 cerrada (renderer abstraction completed)
- [ ] Leer `docs/architecture/02-public-api.md` y la sección 4.3 de `docs/ROADMAP_FRAMEWORK_AGNOSTIC_REFACTORING.md`
- [ ] Leer `packages/engine-core/src/events/EventBus.ts` (bus existente, ligero)

## Action

### 1. Auditar lo existente

Listar puntos de integración actuales que hay que respetar o reemplazar:

```bash
grep -rn "onRuntimeEvent\|GameRuntimeEvent\|getGameActions\|emitRuntimeEvent" apps/web-demo/app packages/engine-core/src
```

Inventario mínimo a producir en notas internas del ADR:

- **Callbacks runtime actuales**: `onMove`, `onCollide`, `onDrop`, `onDialog` (en `publicApi.ts` y `runtimeEvents.ts`)
- **Acciones que el consumer puede invocar hoy**: `setScene`, `setPlayerPosition`, `requestRespawn` (vía `getGameActions`)
- **Acciones que existen pero no son públicas**: pickup, drop, dialog dismiss, inventory toggle

### 2. Diseñar las interfaces

Crear `docs/decisions/0006-command-event-architecture.md` con:

```markdown
# ADR-0006: Command/Event Architecture

## Context
<por qué necesitamos comandos y eventos bidireccionales>

## Decision

### Commands (Web → Game)
- Forma: discriminated union `GameCommand = { type: "scene:set", sceneId } | ...`
- Dispatcher: `executeCommand(cmd: GameCommand): void` (sync, fire-and-forget)
- Comandos desconocidos: warn + no-op (no throw)
- Naming: `<domain>:<action>` para namespacing (scene:set, inventory:pickup)

### Events (Game → Web)
- Forma: discriminated union `GameEvent = { type: "scene:changed", sceneId, sceneConfig } | ...`
- Bus: `EventBus` existente (síncrono, sin orden garantizado entre listeners)
- Suscripción: `on(type, handler) → unsubscribe`
- Sin re-emisión de eventos pasados (sin replay)

### Ownership
- Un único bus por instancia de runtime (devuelto por `createGameRuntime`).
- `executeCommand` y `on` viven en el handle del runtime, no en el store directamente.

## Consequences
<lo que facilita, lo que complica, qué deja para futuro>

## Alternatives considered
- RxJS observables: descartado (peso, complejidad innecesaria).
- Promesas en executeCommand: descartado (la mayoría de comandos son fire-and-forget; añadir Promise complica el contrato; los flujos que requieran await escucharán el evento de confirmación).
- Function-per-action (`runtime.setScene(id)`): descartado (no serializable, no se puede mandar desde un iframe/postMessage).
```

### 3. Crear esqueleto de tipos en core

En `packages/engine-core/src/game/commands/` crear (solo signatures, vacíos):

- `index.ts` — barrel
- `types.ts` — `export type GameCommand = never; // populated in task 03`
- `CommandHandler.ts` — `export interface CommandHandler { execute(cmd: GameCommand): void }` (sin implementación)

En `packages/engine-core/src/game/events/` crear:

- `index.ts` — barrel
- `types.ts` — `export type GameEvent = never; // populated in task 02`

### 4. Re-exportar desde engine-core

En `packages/engine-core/src/index.ts`:

```ts
export * from "./game/commands";
export * from "./game/events";
```

## Success Criteria

- [ ] `docs/decisions/0006-command-event-architecture.md` existe con decisión justificada
- [ ] `packages/engine-core/src/game/commands/` existe con 3 archivos (index, types, CommandHandler)
- [ ] `packages/engine-core/src/game/events/` existe con 2 archivos (index, types)
- [ ] `npm run build -w packages/engine-core` pasa
- [ ] `grep -rn "react\|three" packages/engine-core/src/game/commands packages/engine-core/src/game/events` devuelve nada
- [ ] ADR linkado desde `docs/decisions/README.md`

## On Complete

1. Marca `[x]` en `../tracking.md` para `01-design-command-event-architecture`
2. Commit:
   ```
   docs(phase-4): add ADR-0006 command/event architecture + skeleton

   - [x] Marked: 01-design-command-event-architecture

   See docs/phases/phase-4-bidirectional-web-game/tasks/01-design-command-event-architecture.md
   ```

## References

- Architecture: `docs/architecture/02-public-api.md`
- Roadmap section: `docs/ROADMAP_FRAMEWORK_AGNOSTIC_REFACTORING.md` §4.3
- Existing bus: `packages/engine-core/src/events/EventBus.ts`
- ADR template: `docs/decisions/README.md`

## Notes

El bus existente (`EventBus.ts`) usa string keys y `unknown` para data. Tras esta task, considerar si tiparlo con un genérico ligado a `GameEvent`. Decidir en el ADR si refactorizar el bus o envolverlo.

No incluir Physics/RAPIER en el diseño: la abstracción de físicas quedó out-of-scope tras Phase 3.
