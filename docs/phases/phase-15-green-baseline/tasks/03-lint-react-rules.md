# Task 15.03 — Lint: errores de reglas React

**Effort**: 2.5h | **Modelo**: sonnet | **Blocks**: 09 | **Blocked by**: —

**Archivos permitidos** (ningún otro):
- `apps/web-demo/app/components/GameTouchCanvas.tsx`
- `apps/web-demo/app/components/debug/FloatingPanel.tsx`
- `apps/web-demo/app/components/intro/IntroScene.tsx`
- `apps/web-demo/app/lib/engine/runtime/useInventoryRuntimeController.ts`

---

## 🎯 Objetivo

Eliminar los 7 errores de ESLint que afectan a comportamiento en runtime. Son cambios sensibles: cada uno debe conservar el comportamiento observable.

## Errores a resolver

| Archivo:línea | Regla | Qué pasa |
|---|---|---|
| `GameTouchCanvas.tsx:212` | `no-explicit-any` | `useRef<any>` para el estado de caminata previo → tipar con `PlayerWalkingState \| null` de `@pointclick-engine/engine-core` |
| `GameTouchCanvas.tsx:236` | `no-explicit-any` | handler de `item:dropped` con `event: any` → usar el tipo del evento; ojo: el código compara `event.outcome === "pickup-success"`, valor que el tipo `GameEvent` de `item:dropped` no declara. **No cambies el tipo del core**; estrecha localmente y deja constancia en el reporte |
| `GameTouchCanvas.tsx:287` | `react-hooks/use-memo` | `useCallback(wrap(fn), deps)` no recibe función inline → usar `useMemo(() => wrapRuntimeEventForTransitions(...), [deps])` |
| `FloatingPanel.tsx:58` | `react-hooks/set-state-in-effect` | sincroniza estado local desde el store dentro de un efecto |
| `IntroScene.tsx:81–82` | `react-hooks/refs` | escribe refs durante el render |
| `useInventoryRuntimeController.ts:157` | `react-hooks/set-state-in-effect` | `setPlacedItems` síncrono dentro de un efecto al cambiar de escena |

Además, en `useInventoryRuntimeController.ts:6` quitar el import sin usar `getGameRuntime`.

## 📝 Instructions

1. Para cada error, leer la función entera antes de tocar: entender por qué existe el patrón.
2. Preferir la solución idiomática (derivar estado en render, `key` para resetear, mover la escritura del ref a un efecto o handler, patrón "ajustar estado al cambiar una prop").
3. Solo si la reescritura idiomática cambia el comportamiento o exige tocar otros archivos, usar `// eslint-disable-next-line <regla> -- <motivo concreto>` en esa línea. Cada disable debe justificarse en el reporte. Máximo 2 disables en total.
4. No tocar los warnings `exhaustive-deps` ni `no-img-element`: cambiar dependencias de efectos sin pruebas visuales es más arriesgado que el warning.
5. No reformatear ni refactorizar nada que no esté en la tabla.

## ✅ Success Criteria

- [ ] `cd apps/web-demo && npx eslint app/components/GameTouchCanvas.tsx app/components/debug/FloatingPanel.tsx app/components/intro/IntroScene.tsx app/lib/engine/runtime/useInventoryRuntimeController.ts` → 0 errores.
- [ ] `npx tsc --noEmit -p apps/web-demo` no añade errores nuevos en estos 4 archivos.
- [ ] `cd apps/web-demo && npx vitest run` no empeora (los 4 fallos previos de `publicApi.test.ts` los arregla otra tarea).
- [ ] `git diff --stat` solo muestra los 4 archivos permitidos.

## Reporte

Por cada error: solución aplicada y por qué conserva el comportamiento. Lista de disables con motivo. Riesgos que el orquestador deba comprobar en navegador (intro, panel flotante de debug, ítems colocados al cambiar de escena, sonido al soltar ítems).
