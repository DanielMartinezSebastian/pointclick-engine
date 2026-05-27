# Task 07: Update web-demo imports to consume engine-core

**Phase**: 2 | **Estimate**: 2h | **Owner**: —

## Context

Tras tasks 04-06, `engine-core` tiene pathfinding, rules y sceneStore. Pero `apps/web-demo/` aún importa de paths antiguos (`@/app/lib/...`) que ya no existen. Esta task arregla todos los imports.

## Prerequisites

- [ ] Tasks 04, 05, 06 done
- [ ] `apps/web-demo/package.json` ya tiene `"@pointclick-engine/engine-core": "workspace:*"`

## Action

### 1. Encontrar imports rotos

```bash
# En apps/web-demo
grep -rn "@/app/lib/core/rules\|@/app/lib/engine/movement\|@/app/store/sceneStore" apps/web-demo/app
```

Guarda lista de archivos afectados.

### 2. Reemplazar imports

Para cada match, cambiar:

```ts
// Antes
import { findPath } from '@/app/lib/engine/movement/findPath';
import { resolveInventoryDrop } from '@/app/lib/core/rules/inventoryRules';
import { useSceneStore } from '@/app/store/sceneStore';

// Después
import { findPath, resolveInventoryDrop, useSceneStore } from '@pointclick-engine/engine-core';
```

Tip: si el patrón es repetitivo, usar find-and-replace:

```bash
# Ejemplo (usa con cuidado, revisar diffs antes de commit)
find apps/web-demo/app -name "*.ts" -o -name "*.tsx" | xargs sed -i.bak \
  -e "s|'@/app/store/sceneStore'|'@pointclick-engine/engine-core'|g" \
  -e "s|'@/app/lib/engine/movement/findPath'|'@pointclick-engine/engine-core'|g"

# Borrar backups si todo OK
find apps/web-demo/app -name "*.bak" -delete
```

### 3. Verificar publicApi.ts

`apps/web-demo/app/lib/engine/publicApi.ts` debe re-exportar desde engine-core lo necesario para mantener API estable:

```ts
// Re-exports desde engine-core (parte agnóstica)
export {
  findPath,
  useSceneStore,
  getSceneState,
  // ... tipos y funciones públicas
} from '@pointclick-engine/engine-core';

// Específicos R3F siguen aquí
export { GameViewport } from './GameViewport';
```

Esto mantiene `publicApi` como facade — consumidores no notan el cambio.

### 4. Verificar compilación

```bash
npm run build -w apps/web-demo
```

Si hay errores de imports, fix uno por uno.

### 5. Verificar runtime

```bash
npm run dev
```

Abrir `http://localhost:3000`, probar golden path:
- ✅ Escena carga
- ✅ Movimiento WASD funciona
- ✅ Click-to-move funciona
- ✅ Cambio de escena funciona
- ✅ Inventario funciona (si aplica)

## Success Criteria

- [ ] `grep -r "@/app/lib/core/rules\|@/app/lib/engine/movement/findPath\|@/app/store/sceneStore" apps/web-demo/app` devuelve nada
- [ ] `npm run build -w apps/web-demo` pasa sin errores
- [ ] `npm run dev` abre demo y funciona idéntico visualmente
- [ ] `publicApi.ts` re-exporta desde `@pointclick-engine/engine-core`
- [ ] `npm run lint -w apps/web-demo` sin errores

## On Complete

1. Marcar `[x]` en `../tracking.md` para `07-update-webdemo-imports`
2. Commit:
   ```
   refactor(demo): consume engine-core via workspace package

   Replaced all @/app/lib/{core/rules,engine/movement/findPath} and
   @/app/store/sceneStore imports with @pointclick-engine/engine-core.
   publicApi.ts now acts as facade re-exporting from core.

   - [x] Marked: 07-update-webdemo-imports

   See docs/phases/phase-2-core-extraction/tasks/07-update-webdemo-imports.md
   ```

## References

- Architecture: `docs/architecture/02-public-api.md`

## Notes

- Esta task es la más arriesgada porque toca muchos archivos. Hacer en una sola sesión, no a trozos.
- Si `npm run dev` falla con error de módulo no encontrado, verificar que `packages/engine-core/dist/` existe (`npm run build -w packages/engine-core`).
- Mantener `publicApi.ts` como facade es crítico: si en Fase 3 los nombres cambian, los consumidores externos no se enteran.
