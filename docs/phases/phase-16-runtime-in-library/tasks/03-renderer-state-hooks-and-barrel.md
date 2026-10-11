# Task 16.03 — Renderer: hooks de estado y barrel en la demo

**Effort**: 2.5h | **Modelo**: sonnet | **Blocks**: 07, 11 | **Blocked by**: 02

**Archivos permitidos**:
- `packages/engine-renderer-r3f/src/hooks/useGameState.ts`, `useGameActions.ts` (nuevos)
- `packages/engine-renderer-r3f/src/index.ts`
- `packages/engine-renderer-r3f/src/__tests__/gameStateHooks.test.tsx` (nuevo)
- `apps/web-demo/app/lib/engine/publicApi.ts`
- `apps/web-demo/app/lib/engine/publicApi.test.ts`

---

## 🎯 Objetivo

Tras la tarea 02 el runtime existe en el core y, duplicado, en `publicApi.ts`. Aquí se elimina el duplicado: `publicApi.ts` pasa a ser un barrel de re-export y los dos hooks de React se trasladan al renderer.

## 📝 Instructions

1. Crear `useGameState<T>(selector)` y `useGameActions()` en el renderer, moviendo la implementación actual de `publicApi.ts`. Deben apoyarse en `getGameActions`/registro del core para no duplicar la lógica de `setScene`.
2. Exportarlos desde `packages/engine-renderer-r3f/src/index.ts`.
3. Reescribir `apps/web-demo/app/lib/engine/publicApi.ts` como barrel:
   - `"use client"` se conserva.
   - Re-exporta desde `@pointclick-engine/engine-core` y `@pointclick-engine/engine-renderer-r3f` **todos** los nombres que exporta hoy. Antes de editar, genera la lista con `grep -n "^export" publicApi.ts` y guárdala en el reporte como "antes"; al terminar, compárala con el "después".
   - `GameViewport` se queda definido aquí de momento (lo resuelve la tarea 11).
   - Objetivo: < 120 líneas.
4. `publicApi.test.ts` debe pasar **sin modificar aserciones**. Solo se permite ajustar imports o setup si es imprescindible, explicándolo.
5. Test nuevo en el renderer: `useGameActions().setScene(id)` cambia `sceneId` (usar `renderToString` como hace `publicApi.test.ts`).
6. Recordatorio: la demo resuelve los paquetes por `dist/`. Ejecuta `npm run build:packages` antes de testear la demo.

## ✅ Success Criteria

- [ ] `npm run build:packages && npm test` → 0 fallos.
- [ ] `npm run typecheck` → 0 errores.
- [ ] Lista de exports de `publicApi.ts` "después" ⊇ "antes" (ningún nombre perdido).
- [ ] `grep -c "commands.register" apps/web-demo/app/lib/engine/publicApi.ts` → 0.
- [ ] `git diff --stat` solo muestra archivos permitidos.

## Reporte

Listas de exports antes/después, líneas finales de `publicApi.ts`, y cualquier ajuste hecho en el test con su motivo.
