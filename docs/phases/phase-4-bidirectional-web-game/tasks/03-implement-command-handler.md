# Task 03: Implement CommandHandler in engine-core

**Phase**: 4 | **Estimate**: 3h | **Owner**: —

## Context

Definir el contrato `GameCommand` (discriminated union) y la clase `CommandHandler` que despacha cada comando. El handler vive en `engine-core` y es **agnóstico**: no toca `sceneStore` directamente. Recibe el mapeo `command → action` por inyección. El cableado a `sceneStore` ocurre en Task 05 (al construir el runtime).

## Prerequisites

- [ ] Task 01 done (ADR-0006 define naming `<domain>:<action>` y `executeCommand: void` sync)
- [ ] `packages/engine-core/src/game/commands/` existe con archivos vacíos

## Action

### 1. Definir el union `GameCommand`

En `packages/engine-core/src/game/commands/types.ts`:

```ts
import type { GameVec3 } from "../types";

export type GameCommand =
  // Scene
  | { type: "scene:set"; sceneId: string }
  | { type: "scene:respawn" }
  // Player
  | { type: "player:move"; position: GameVec3 }
  | { type: "player:stop" }
  // Inventory
  | { type: "inventory:toggle" }
  | { type: "inventory:pickup"; itemId: string }
  | { type: "inventory:drop"; itemId: string; slotIndex: number }
  // Dialog
  | { type: "dialog:trigger"; dialogKey: string }
  | { type: "dialog:dismiss" };

export type GameCommandType = GameCommand["type"];
```

### 2. Implementar `CommandHandler`

En `packages/engine-core/src/game/commands/CommandHandler.ts`:

```ts
import type { GameCommand, GameCommandType } from "./types";

type Executor<T extends GameCommandType> = (
  cmd: Extract<GameCommand, { type: T }>,
) => void;

type ExecutorMap = {
  [K in GameCommandType]?: Executor<K>;
};

export class CommandHandler {
  private executors: ExecutorMap = {};
  private unknownLogger: (cmd: GameCommand) => void;

  constructor(opts?: { onUnknown?: (cmd: GameCommand) => void }) {
    this.unknownLogger =
      opts?.onUnknown ??
      ((cmd) => console.warn(`[CommandHandler] no executor for: ${cmd.type}`));
  }

  /** Registra un executor para un tipo de comando. Sobrescribe si ya existía. */
  register<T extends GameCommandType>(
    type: T,
    executor: Executor<T>,
  ): () => void {
    (this.executors as Record<string, unknown>)[type] = executor as unknown;
    return () => {
      delete (this.executors as Record<string, unknown>)[type];
    };
  }

  /** Ejecuta un comando. Sync, fire-and-forget. */
  execute(cmd: GameCommand): void {
    const executor = (this.executors as Record<string, Executor<GameCommandType> | undefined>)[
      cmd.type
    ];
    if (!executor) {
      this.unknownLogger(cmd);
      return;
    }
    executor(cmd as Extract<GameCommand, { type: typeof cmd.type }>);
  }

  /** Para tests: lista de tipos registrados. */
  registeredTypes(): GameCommandType[] {
    return Object.keys(this.executors) as GameCommandType[];
  }

  clear(): void {
    this.executors = {};
  }
}
```

### 3. Actualizar barrel

`packages/engine-core/src/game/commands/index.ts`:

```ts
export type { GameCommand, GameCommandType } from "./types";
export { CommandHandler } from "./CommandHandler";
```

Confirmar que `packages/engine-core/src/index.ts` re-exporta `./game/commands`.

### 4. Tests headless

Crear `packages/engine-core/__tests__/commandHandler.test.ts`:

- Registrar executor de `scene:set`, ejecutar comando, validar que se invocó con el payload exacto.
- Comando sin executor: invoca `onUnknown` y no throws.
- Sobrescribir executor con un segundo `register()`.
- Unsubscribe devuelto por `register()` deja de despachar.
- `clear()` resetea el mapa.
- Type narrowing: el ejecutor recibe el subtipo correcto (test de compilación, no de runtime).

## Success Criteria

- [ ] `packages/engine-core/src/game/commands/types.ts` define union de 9 comandos
- [ ] `CommandHandler.ts` implementa `register`, `execute`, `clear`
- [ ] `npm run build -w packages/engine-core` pasa
- [ ] `npm run test -w packages/engine-core -- commandHandler` pasa (≥5 tests)
- [ ] `grep -rn "react\|three\|window\.\|document\." packages/engine-core/src/game/commands` devuelve nada
- [ ] `import { CommandHandler, type GameCommand } from "@pointclick-engine/engine-core"` funciona desde `apps/web-demo`

## On Complete

1. Marca `[x]` en `../tracking.md` para `03-implement-command-handler`
2. Commit:
   ```
   feat(engine-core): implement CommandHandler + GameCommand union

   - [x] Marked: 03-implement-command-handler

   See docs/phases/phase-4-bidirectional-web-game/tasks/03-implement-command-handler.md
   ```

## References

- ADR: `docs/decisions/0006-command-event-architecture.md`
- Patrón paralelo: `packages/engine-core/src/events/EventBus.ts`
- Tipo `GameVec3`: `packages/engine-core/src/game/types/`

## Notes

`CommandHandler` debe ser **completamente agnóstico**: no importa nada de `sceneStore`, ni de `EventBus`. El cableado se hace en Task 05 cuando `createGameRuntime` registra los executors apuntando al store.

Si emerge la necesidad de comandos async (ej. cargar escena desde red), preferir mantener `execute()` sync y exponer la confirmación vía evento (`scene:changed`) en vez de retornar Promise. Eso ya está decidido en ADR-0006.
