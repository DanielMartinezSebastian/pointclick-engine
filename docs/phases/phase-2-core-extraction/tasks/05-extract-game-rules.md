# Task 05: Extract game rules to engine-core

**Phase**: 2 | **Estimate**: 3h | **Owner**: —

## Context

`apps/web-demo/app/lib/core/rules/` contiene lógica pura: inventario drop decisions, dialog rules, collision rules. Es agnóstica y debe vivir en `packages/engine-core/`.

## Prerequisites

- [ ] Task 03 done (engine-core base existe)
- [ ] `packages/engine-core/src/game/logic/rules/` existe (o crear ahora)

## Action

### 1. Listar archivos a mover

```bash
ls apps/web-demo/app/lib/core/rules/
```

Espera ver algo como: `inventoryRules.ts`, `dialogRules.ts`, etc. Cada uno debe ser puro (sin React).

### 2. Verificar agnosticidad de cada uno

```bash
grep -rn "import.*react\|@react-three\|next\|window\." apps/web-demo/app/lib/core/rules/
```

Esperado: nada. Si hay matches, son violations que se documentan en task 01 follow-up.

### 3. Mover archivos

```bash
mkdir -p packages/engine-core/src/game/logic/rules
git mv apps/web-demo/app/lib/core/rules/*.ts \
       packages/engine-core/src/game/logic/rules/
```

### 4. Actualizar imports relativos en cada archivo

Para cada archivo movido, buscar imports `@/app/lib/...` y cambiar a paths relativos a la nueva ubicación:

```ts
// Antes
import type { GameItemConfig } from '@/app/lib/engine/types/game';
// Después
import type { GameItemConfig } from '../../types';
```

### 5. Crear barrel `packages/engine-core/src/game/logic/rules/index.ts`

```ts
export * from './inventoryRules';
export * from './dialogRules';
// ... uno por archivo
```

### 6. Actualizar `packages/engine-core/src/game/logic/index.ts`

```ts
export { findPath } from './pathfinding/findPath';
export * from './rules';
```

### 7. Migrar / crear tests

Para cada rule file, si existe `*.test.ts`, moverlo a `__tests__/`:

```bash
git mv apps/web-demo/app/lib/core/rules/*.test.ts packages/engine-core/__tests__/
```

Si no hay tests, crear mínimos (al menos 1 happy path por función pública).

## Success Criteria

- [ ] Todos los archivos de `rules/` movidos a `packages/engine-core/src/game/logic/rules/`
- [ ] `apps/web-demo/app/lib/core/rules/` ya no existe o está vacío
- [ ] `npm run build -w packages/engine-core` compila sin errores
- [ ] `npm run test -w packages/engine-core` pasa (rules tests verdes)
- [ ] `grep -r "import.*react" packages/engine-core/src/game/logic/rules/` devuelve nada
- [ ] Re-exports en `index.ts` correctos

## On Complete

1. Marcar `[x]` en `../tracking.md` para `05-extract-game-rules`
2. Commit:
   ```
   refactor(core): extract game rules to engine-core

   Moved app/lib/core/rules/ to packages/engine-core/src/game/logic/rules/.
   All rules verified agnostic (no React/R3F imports).

   - [x] Marked: 05-extract-game-rules

   See docs/phases/phase-2-core-extraction/tasks/05-extract-game-rules.md
   ```

## References

- Architecture: `docs/architecture/03-rules-core-vs-render.md`
- Related: task 07 (update imports in web-demo)

## Notes

- Si un archivo de rules tiene dependencia oculta de React (probablemente vino de un hook mal-clasificado), documentar en task 01 follow-up y considerar dejarlo en web-demo.
- Tests son **importantes** aquí — son lógica pura, fáciles de testear sin mocks.
