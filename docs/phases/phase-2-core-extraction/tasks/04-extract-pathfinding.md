# Task 04: Extract pathfinding to engine-core

**Phase**: 2 | **Estimate**: 2h | **Owner**: —

## Context

`findPath()` y helpers viven en `apps/web-demo/app/lib/engine/movement/`. Es lógica pura agnóstica — perfecta candidata para extraer primero a `packages/engine-core/`.

## Prerequisites

- [ ] Task 03 done (engine-core base existe)
- [ ] `packages/engine-core/src/game/logic/` existe

## Action

### 1. Identificar archivos a mover

```bash
ls apps/web-demo/app/lib/engine/movement/
```

Filtra solo los agnósticos (sin React/hooks):
- `findPath.ts` y similares → SÍ mover
- `useClickToMoveController.ts` (hook React) → NO mover, queda en web-demo

### 2. Mover archivos agnósticos

```bash
mkdir -p packages/engine-core/src/game/logic/pathfinding
git mv apps/web-demo/app/lib/engine/movement/findPath.ts \
       packages/engine-core/src/game/logic/pathfinding/findPath.ts
# Repetir para cada archivo agnóstico
```

### 3. Actualizar imports en el archivo movido

Buscar en `findPath.ts` (o como se llame) imports tipo `@/app/lib/engine/types/...` y cambiar a relativos:

```ts
// Antes
import type { GameVec3 } from '@/app/lib/engine/types/game';
// Después
import type { GameVec3 } from '../../types';
```

### 4. Copiar tests (si existen)

```bash
git mv apps/web-demo/app/lib/engine/movement/findPath.test.ts \
       packages/engine-core/__tests__/findPath.test.ts 2>/dev/null || \
       echo "No test file existing — consider creating one"
```

Si no había test, crear uno mínimo verificando casos básicos.

### 5. Re-exportar desde index

En `packages/engine-core/src/game/logic/index.ts`:

```ts
export { findPath } from './pathfinding/findPath';
```

En `packages/engine-core/src/index.ts` añadir:

```ts
export * from './game/logic';
```

## Success Criteria

- [ ] `findPath.ts` ahora vive en `packages/engine-core/src/game/logic/pathfinding/`
- [ ] `npm run build -w packages/engine-core` compila sin errores
- [ ] `npm run test -w packages/engine-core` pasa (pathfinding tests verdes)
- [ ] `grep -r "import.*react\|@react-three" packages/engine-core/src/game/logic/` devuelve nada
- [ ] Import desde web-demo aún rota (eso es task 07) — NO actualizar todavía
- [ ] `npm run dev -w apps/web-demo` posiblemente falla — eso es esperado, se arregla en task 07

## On Complete

1. Marcar `[x]` en `../tracking.md` para `04-extract-pathfinding`
2. Commit:
   ```
   refactor(core): extract pathfinding to engine-core

   Moved findPath and helpers from apps/web-demo/app/lib/engine/movement/
   to packages/engine-core/src/game/logic/pathfinding/.
   Imports in web-demo will be fixed in task 07.

   - [x] Marked: 04-extract-pathfinding

   See docs/phases/phase-2-core-extraction/tasks/04-extract-pathfinding.md
   ```

## References

- Architecture: `docs/architecture/03-rules-core-vs-render.md`
- Related: task 07 (update imports)

## Notes

- Usa `git mv` (no `cp` + `rm`) para que git rastree el rename y conserve historial.
- Si `findPath.ts` tiene dependencias internas (otros archivos en `movement/`), muévelos todos juntos.
- Mantén nombres de archivo idénticos para que task 07 sea un find-and-replace simple.
