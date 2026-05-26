# Task 03: Extract runtime events to engine-core

**Phase**: 3 | **Estimate**: 2h | **Owner**: —

## Context

Los tipos `RuntimeEvent`, `RuntimeEventHandler` viven en `apps/web-demo/app/lib/engine/types/runtimeEvents.ts`. Son agnósticos al renderer (describen qué ocurre en el juego, no cómo se renderiza). Deben vivir en `engine-core` para que cualquier renderer pueda emitirlos.

**No mover**: lógica que dispatchea eventos (queda en renderer hasta Task 06).

## Prerequisites

- [ ] Task 01 done (ports diseñados)
- [ ] `packages/engine-core/src/game/types/` existe (de Phase 2)

## Action

### 1. Auditar uso actual

```bash
grep -rn "RuntimeEvent\|RuntimeEventHandler\|emitRuntimeEvent" apps/web-demo/app
```

Guardar lista de archivos consumidores.

### 2. Verificar agnosticidad

```bash
cat apps/web-demo/app/lib/engine/types/runtimeEvents.ts
```

**Esperado**: ningún import de React/R3F. Si los hay, fix antes de mover.

### 3. Mover archivo a engine-core

Crear `packages/engine-core/src/events/runtimeEvents.ts` con el contenido de `apps/web-demo/app/lib/engine/types/runtimeEvents.ts`.

**Importante**: usar tipos ya existentes en engine-core (`GameVec3`, etc.) en lugar de redefinir.

### 4. Mover `emitRuntimeEvent` también

Si hay una función helper como `emitRuntimeEvent(handler, event)`, también va al core porque es agnóstica.

### 5. Crear barrel en events

`packages/engine-core/src/events/index.ts`:

```ts
export { EventBus } from "./EventBus";
export * from "./runtimeEvents";
```

### 6. Re-export desde engine-core

En `packages/engine-core/src/index.ts`, asegurar:

```ts
export * from "./events";
```

(ya debería estar, ajustar si EventBus se exportaba directamente)

### 7. Actualizar imports en web-demo

```bash
grep -rln 'from ".*types/runtimeEvents"' apps/web-demo/app | while read f; do
  sed -i 's|from "\.\./.*types/runtimeEvents"|from "@pointclick/engine-core"|g' "$f"
done
```

Verificar visualmente algunos archivos editados.

### 8. Eliminar archivo viejo

```bash
rm apps/web-demo/app/lib/engine/types/runtimeEvents.ts
```

### 9. Build + test

```bash
npm run build
npm test
```

## Success Criteria

- [ ] `packages/engine-core/src/events/runtimeEvents.ts` existe
- [ ] `apps/web-demo/app/lib/engine/types/runtimeEvents.ts` NO existe
- [ ] `RuntimeEvent` importable desde `@pointclick/engine-core`
- [ ] `npm run build` pasa para todo el workspace
- [ ] `npm test` pasa (engine-core + web-demo)
- [ ] `grep "engine/types/runtimeEvents" apps/web-demo` devuelve nada

## On Complete

1. Marca `[x]` en `../tracking.md` para `03-extract-runtime-events-to-core`
2. Commit:
   ```
   refactor(core): extract runtime events to engine-core

   Moved RuntimeEvent types from apps/web-demo to packages/engine-core.
   Updated all consumers to import from @pointclick/engine-core.

   - [x] Marked: 03-extract-runtime-events-to-core

   See docs/phases/phase-3-renderer-abstract/tasks/03-extract-runtime-events-to-core.md
   ```

## References

- Architecture: `docs/architecture/03-rules-core-vs-render.md`
- Phase 2 example: `docs/phases/phase-2-core-extraction/tasks/06-extract-scene-store.md`

## Notes

Si los tipos referencian algo específico de R3F (Vector3, etc.), reemplazar por equivalentes agnósticos (`GameVec3` ya en core).
