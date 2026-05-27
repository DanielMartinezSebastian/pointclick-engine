# Task 07: Update web-demo imports to consume engine-renderer-r3f

**Phase**: 3 | **Estimate**: 2h | **Owner**: —

## Context

Tras Task 06, los componentes R3F genéricos viven en `packages/engine-renderer-r3f/`. `apps/web-demo/` tiene imports rotos que apuntan a las rutas viejas. Esta task arregla todos los imports y verifica que la demo sigue funcionando.

## Prerequisites

- [ ] Task 06 done (renderer-r3f tiene los componentes)
- [ ] `packages/engine-renderer-r3f/dist/` existe (build hecho)

## Action

### 1. Añadir dependencia en web-demo

`apps/web-demo/package.json`:

```json
"dependencies": {
  "@pointclick-engine/engine-core": "*",
  "@pointclick-engine/engine-renderer-r3f": "*"
}
```

```bash
npm install
```

### 2. Encontrar imports rotos

```bash
grep -rn "from \"\\.\\..*/engine/render\|from \"\\.\\..*/engine/runtime/GameTouchSpriteRuntime\|from \"\\.\\..*/engine/render/sprite\|from \"\\.\\..*/engine/render/scene" apps/web-demo/app
```

### 3. Reemplazar imports en bloque

```bash
find apps/web-demo/app -name "*.ts" -o -name "*.tsx" | while read f; do
  # SpeechBubble
  sed -i 's|from "[^"]*engine/render/SpeechBubble"|from "@pointclick-engine/engine-renderer-r3f"|g' "$f"
  # Sprite
  sed -i 's|from "[^"]*engine/render/sprite/\([^"]*\)"|from "@pointclick-engine/engine-renderer-r3f"|g' "$f"
  # Scene
  sed -i 's|from "[^"]*engine/render/scene/\([^"]*\)"|from "@pointclick-engine/engine-renderer-r3f"|g' "$f"
  # Runtime
  sed -i 's|from "[^"]*engine/runtime/GameTouchSpriteRuntime"|from "@pointclick-engine/engine-renderer-r3f"|g' "$f"
done
```

Revisar diffs antes de commit.

### 4. Verificar publicApi.ts

`apps/web-demo/app/lib/engine/publicApi.ts` debe re-exportar lo necesario para mantener contrato estable:

```ts
// Re-exports from renderer
export { useR3FGameLoop, WebKeyboardInput } from "@pointclick-engine/engine-renderer-r3f";

// Core re-exports unchanged
export { findPath, useSceneStore, /* ... */ } from "@pointclick-engine/engine-core";

// GameViewport ya re-exporta GameTouchCanvas (web-demo) que ahora usa
// componentes de engine-renderer-r3f internamente
```

### 5. Build completo

```bash
npm run build
```

Iterar hasta verde.

### 6. Test runtime

```bash
npm run dev
```

Abrir `http://localhost:3000`, golden path:
- ✅ Escena carga
- ✅ WASD movement
- ✅ Click-to-move
- ✅ Cambio de escena
- ✅ Inventario abre y permite drag/drop
- ✅ Diálogos aparecen al chocar con paredes

### 7. Lint

```bash
npm run lint
```

## Success Criteria

- [ ] `grep "engine/render\|engine/runtime/GameTouchSpriteRuntime" apps/web-demo/app` devuelve nada (todos vienen de engine-renderer-r3f)
- [ ] `npm run build` pasa sin errores
- [ ] `npm test` pasa
- [ ] `npm run dev` → demo funciona idéntica a antes de Phase 3
- [ ] `npm run lint -w apps/web-demo` sin errores

## On Complete

1. Marca `[x]` en `../tracking.md` para `07-update-webdemo-imports`
2. Commit:
   ```
   refactor(demo): consume engine-renderer-r3f via workspace package

   Replaced all relative imports of R3F render components with imports
   from @pointclick-engine/engine-renderer-r3f. Demo functionality verified
   via dev server.

   - [x] Marked: 07-update-webdemo-imports

   See docs/phases/phase-3-renderer-abstract/tasks/07-update-webdemo-imports.md
   ```

## References

- Architecture: `docs/architecture/02-public-api.md`
- Phase 2 task equivalente: `docs/phases/phase-2-core-extraction/tasks/07-update-webdemo-imports.md`

## Notes

Esta task es propensa a regressions visuales. Si algo se ve raro tras la migración, revisar:
- Imports olvidados (componentes que el sed no agarró)
- Versiones de three/R3F duplicadas (forzar misma versión en root package.json)
- `next/dynamic` con `ssr: false` puede necesitar ajuste para componentes movidos
