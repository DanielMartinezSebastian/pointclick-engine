# Task 06: Extract sceneStore to engine-core

**Phase**: 2 | **Estimate**: 2h | **Owner**: —

## Context

`apps/web-demo/app/store/sceneStore.ts` es Zustand, agnóstico por naturaleza. Debe vivir en `packages/engine-core/` para ser el state oficial del engine.

**No mover**: `mobileInputStore.ts` (específico de input web) ni `sceneEditorStore.ts` (debug-only de la demo).

## Prerequisites

- [ ] Task 03 done
- [ ] `packages/engine-core/src/game/state/` existe

## Action

### 1. Verificar agnosticidad

```bash
grep -n "import.*react\|useState\|useEffect\|useFrame" apps/web-demo/app/store/sceneStore.ts
```

Esperado: vacío. Si hay matches, fix antes de mover.

### 2. Mover archivo

```bash
git mv apps/web-demo/app/store/sceneStore.ts \
       packages/engine-core/src/game/state/sceneStore.ts
```

### 3. Actualizar imports en sceneStore.ts

Cambiar imports de tipos `@/app/lib/engine/types/...` a paths relativos:

```ts
// Antes
import type { GameSceneConfig } from '@/app/lib/engine/types/game';
// Después
import type { GameSceneConfig } from '../types';
```

### 4. Exponer API agnóstica adicional

Al final del archivo, añadir helpers que no requieren React:

```ts
/** Read state sin React (para uso desde otros renderers o tests) */
export function getSceneState() {
  return useSceneStore.getState();
}

/** Subscribirse a cambios sin React */
export function subscribeSceneState(
  listener: (state: ReturnType<typeof useSceneStore.getState>) => void
) {
  return useSceneStore.subscribe(listener);
}
```

### 5. Barrel `packages/engine-core/src/game/state/index.ts`

```ts
export { useSceneStore, getSceneState, subscribeSceneState } from './sceneStore';
export type { /* tipos de state exportados desde sceneStore */ } from './sceneStore';
```

### 6. Re-export desde `packages/engine-core/src/index.ts`

```ts
export * from './game/state';
```

### 7. Test agnóstico

Crear `packages/engine-core/__tests__/sceneStore.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { useSceneStore, getSceneState } from '../src/game/state/sceneStore';

describe('sceneStore', () => {
  it('can read state without React', () => {
    const state = getSceneState();
    expect(state).toBeDefined();
  });

  it('setScene updates sceneId', () => {
    useSceneStore.getState().setScene('test-scene');
    expect(getSceneState().sceneId).toBe('test-scene');
  });
});
```

## Success Criteria

- [ ] `sceneStore.ts` ahora en `packages/engine-core/src/game/state/`
- [ ] `apps/web-demo/app/store/sceneStore.ts` ya no existe (sí siguen `mobileInputStore.ts` y `sceneEditorStore.ts`)
- [ ] `npm run build -w packages/engine-core` pasa
- [ ] `npm run test -w packages/engine-core` pasa (sceneStore tests verdes)
- [ ] `grep "react\|useFrame" packages/engine-core/src/game/state/` devuelve nada
- [ ] `getSceneState()` y `subscribeSceneState()` exportados

## On Complete

1. Marcar `[x]` en `../tracking.md` para `06-extract-scene-store`
2. Commit:
   ```
   refactor(core): extract sceneStore to engine-core

   Moved sceneStore.ts. Added getSceneState() and subscribeSceneState()
   for React-free consumption.

   - [x] Marked: 06-extract-scene-store

   See docs/phases/phase-2-core-extraction/tasks/06-extract-scene-store.md
   ```

## References

- Architecture: `docs/architecture/03-rules-core-vs-render.md`
- ADR: `docs/decisions/0001-zustand-for-state.md`

## Notes

`mobileInputStore.ts` y `sceneEditorStore.ts` se quedan en web-demo porque son específicos (input touch web, editor de debug). Si en el futuro hace falta input agnóstico, abrir nueva fase.
