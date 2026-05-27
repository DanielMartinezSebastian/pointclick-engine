# Task 02: Define event taxonomy in engine-core

**Phase**: 4 | **Estimate**: 3h | **Owner**: —

## Context

Hoy `GameRuntimeEvent` vive en `apps/web-demo/app/lib/engine/publicApi.ts` y solo cubre 4 casos (`onMove`, `onCollide`, `onDrop`, `onDialog`). En Phase 4 esto debe:

1. Vivir en `engine-core` (es contrato público agnóstico).
2. Expandirse a la taxonomía completa del roadmap (`scene:changed`, `player:moved`, `player:collided`, `item:pickedUp`, `item:dropped`, `dialog:triggered`, `dialog:dismissed`).
3. Mantener compatibilidad con el `onRuntimeEvent` actual (alias o adapter en Task 05).

## Prerequisites

- [ ] Task 01 done (ADR-0006 define el shape `<domain>:<action>`)
- [ ] `packages/engine-core/src/game/events/` existe (creado en Task 01)

## Action

### 1. Definir el union `GameEvent`

En `packages/engine-core/src/game/events/types.ts`:

```ts
import type { GameVec3, GameScene } from "../types";

export type GameEvent =
  // Scene
  | { type: "scene:changed"; sceneId: string; scene: GameScene }
  | { type: "scene:respawnRequested"; sceneId: string }
  // Player
  | { type: "player:moved"; position: GameVec3; action: "idle" | "north" | "south" | "west" | "east" }
  | { type: "player:collided"; reason: "boundary" | "stuck"; position: GameVec3 }
  // Inventory
  | { type: "item:pickedUp"; itemId: string; quantity: number }
  | { type: "item:dropped"; itemId: string; outcome: "consume" | "place" | "return"; interactionId?: string }
  // Dialog
  | { type: "dialog:triggered"; text: string; dialogKey?: string; source: string }
  | { type: "dialog:dismissed"; dialogKey?: string };

export type GameEventType = GameEvent["type"];

export type GameEventHandler<T extends GameEventType = GameEventType> = (
  event: Extract<GameEvent, { type: T }>,
) => void;
```

### 2. Mapear eventos legacy → nuevos

Crear `packages/engine-core/src/game/events/legacyAdapter.ts`:

```ts
import type { GameEvent } from "./types";
import type { RuntimeEvent } from "../types"; // tipo actual de runtimeEvents

/**
 * Mapea un RuntimeEvent legacy (onMove/onCollide/onDrop/onDialog)
 * al nuevo GameEvent equivalente. Permite mantener el callback
 * `onRuntimeEvent` mientras el bus es la fuente de verdad.
 */
export function legacyRuntimeEventToGameEvent(ev: RuntimeEvent): GameEvent {
  switch (ev.type) {
    case "onMove":
      return { type: "player:moved", position: ev.position, action: ev.action };
    case "onCollide":
      return { type: "player:collided", reason: ev.reason, position: ev.position };
    case "onDrop":
      return { type: "item:dropped", itemId: ev.itemId, outcome: ev.outcome as "consume" | "place" | "return", interactionId: ev.interactionId };
    case "onDialog":
      return { type: "dialog:triggered", text: ev.text, dialogKey: ev.dialogKey, source: ev.source };
  }
}

/** Inverso: GameEvent → RuntimeEvent (solo los 4 legacy soportados). */
export function gameEventToLegacyRuntimeEvent(ev: GameEvent): RuntimeEvent | null {
  switch (ev.type) {
    case "player:moved":
      return { type: "onMove", position: ev.position, action: ev.action };
    case "player:collided":
      return { type: "onCollide", reason: ev.reason, position: ev.position };
    case "item:dropped":
      return { type: "onDrop", itemId: ev.itemId, outcome: ev.outcome, interactionId: ev.interactionId };
    case "dialog:triggered":
      return { type: "onDialog", text: ev.text, dialogKey: ev.dialogKey, source: ev.source };
    default:
      return null;
  }
}
```

### 3. Actualizar barrel y re-exports

`packages/engine-core/src/game/events/index.ts`:

```ts
export type { GameEvent, GameEventType, GameEventHandler } from "./types";
export {
  legacyRuntimeEventToGameEvent,
  gameEventToLegacyRuntimeEvent,
} from "./legacyAdapter";
```

Confirmar que `packages/engine-core/src/index.ts` re-exporta `./game/events`.

### 4. Tests headless

Crear `packages/engine-core/__tests__/gameEvents.test.ts` cubriendo:

- Mapeo legacy → GameEvent para los 4 casos
- Mapeo GameEvent → legacy (los 4 soportados + null para los nuevos como `scene:changed`)
- Exhaustividad: cada `GameEventType` aparece al menos una vez en el test

## Success Criteria

- [ ] `packages/engine-core/src/game/events/types.ts` existe con union de 8 eventos
- [ ] `legacyAdapter.ts` mapea correctamente los 4 legacy en ambos sentidos
- [ ] `npm run build -w packages/engine-core` pasa
- [ ] `npm run test -w packages/engine-core -- gameEvents` pasa (≥4 tests)
- [ ] `grep -rn "react\|three\|@react-three" packages/engine-core/src/game/events` devuelve nada
- [ ] `import { GameEvent } from "@pointclick/engine-core"` funciona desde `apps/web-demo`

## On Complete

1. Marca `[x]` en `../tracking.md` para `02-define-event-taxonomy`
2. Commit:
   ```
   feat(engine-core): define GameEvent taxonomy + legacy adapter

   - [x] Marked: 02-define-event-taxonomy

   See docs/phases/phase-4-bidirectional-web-game/tasks/02-define-event-taxonomy.md
   ```

## References

- ADR: `docs/decisions/0006-command-event-architecture.md` (creado en Task 01)
- Roadmap §4.3 (lista de eventos planeados)
- Runtime events actuales: `packages/engine-core/src/events/runtimeEvents.ts`

## Notes

No borrar `RuntimeEvent` todavía: web-demo lo usa vía `onRuntimeEvent` y la migración completa ocurre en Task 05.

Si surgen eventos no contemplados en el roadmap (ej. `scene:loadFailed`, `player:idleTimeout`) añádelos al union pero documenta en el ADR por qué.
