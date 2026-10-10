# Task 16.06 — Unificar `inventoryRules`

**Effort**: 3h | **Modelo**: sonnet | **Blocks**: 11 | **Blocked by**: 04

**Archivos permitidos**:
- `apps/web-demo/app/lib/core/rules/inventoryRules.ts` y su test (borrar)
- `apps/web-demo/app/lib/engine/runtime/useInventoryRuntimeController.ts`
- `packages/engine-core/src/game/logic/rules/inventoryRules.ts` (solo si falta paridad, ver paso 3)
- `packages/engine-core/src/__tests__/inventoryRules*.test.ts`

---

## 🎯 Objetivo

Hay dos implementaciones de las reglas de inventario: la del core (287 líneas, con tests) y una copia en la demo (270 líneas) que importa `demo-content` directamente y es **la que el juego usa de verdad**. La del core no se ejecuta en el runtime.

## 📝 Instructions

1. `diff` entre ambas. Clasificar cada diferencia en: (a) solo cambia de dónde viene el registro de ítems, (b) diferencia de comportamiento real. Incluir la clasificación en el reporte.
2. Entender cómo recibe la versión del core el registro de ítems (parámetro/resolver). La demo deberá pasarle un resolver construido desde `ITEMS` — o, mejor, desde `getGameRuntime().getItems()` si la tarea 02 ya registra los ítems.
3. Si hay diferencias de tipo (b), la versión de la demo es la referencia de comportamiento (es la que está probada jugando). Portarlas al core **con un test por cada una**. No cambiar firmas exportadas del core; solo añadir.
4. Cambiar `useInventoryRuntimeController.ts` para importar de `@pointclick-engine/engine-core`.
5. Migrar al core los casos de `apps/web-demo/app/lib/core/rules/inventoryRules.test.ts` que no estén ya cubiertos.
6. `git rm` de la copia de la demo y de su test. Si `app/lib/core/` queda vacío, desaparece.
7. `npm run build:packages` antes de validar la demo.

## ✅ Success Criteria

- [ ] `npm test` y `npm run typecheck` → verdes.
- [ ] `ls apps/web-demo/app/lib/core` → no existe.
- [ ] Número de tests del core ≥ el anterior + casos migrados.
- [ ] `coreAgnosticism.test.ts` verde.

## Reporte

Clasificación de diferencias, comportamientos portados y lista de escenarios de inventario que el orquestador debe probar en navegador (colocar, consumir, devolver, recoger bloqueado, soltar sobre el jugador).
