# Task 15.01 — Arreglar tests de contrato de publicApi

**Effort**: 1.5h | **Modelo**: sonnet | **Blocks**: 09 | **Blocked by**: —

**Archivos permitidos** (ningún otro):
- `apps/web-demo/app/lib/engine/publicApi.test.ts`
- `apps/web-demo/app/lib/engine/publicApi.ts` (solo el tipo `GameActions`)
- `apps/web-demo/app/lib/core/rules/inventoryRules.test.ts`

---

## 🎯 Objetivo

4 tests fallan y hay 10 errores de `tsc`, todos en tests que quedaron desfasados cuando la tarea 12.4 sustituyó los imports de stores de la demo por adapters inyectados.

## Diagnóstico

1. **4 tests rojos** en `describe("publicApi — wired commands (Phase 5)")`: llaman a `createGameRuntime()` sin `inventoryAdapter` ni `dialogAdapter` y luego esperan cambios en `useInventoryStore` / `useDialogStore`. Sin adapter el comando es no-op por diseño.
2. **TS2554 "Expected 2-3 arguments, but got 1"** (líneas 98, 109): `GameActions` es `Pick<SceneStoreSnapshot, "setScene" | ...>`, así que el tipo exige `setScene(id, scene)`, pero la implementación y `docs/LIBRARY_CONSUMPTION_GUIDE.md` usan `setScene(id)`. El tipo está mal, no el test.
3. **TS2345** (líneas 87, 105, 118): `Object.values(SCENES).forEach(registerScene)` — el tipo `Scene` de la demo tiene `rotationY?` opcional y `GameSceneWall` lo exige. La deduplicación de tipos es de la Fase 16; aquí se usa el mismo cast que ya hace `app/page.tsx`.
4. **TS2339 "on type 'never'"** (líneas 131–136): `actionsFromHook` se asigna dentro de un closure y TS lo estrecha a `null`.
5. **TS2322** en `inventoryRules.test.ts:66`: `kind: "drop-target"` se ensancha a `string`.

## 📝 Instructions

1. En `publicApi.ts`, reemplazar el tipo `GameActions` por uno explícito que coincida con la implementación:
   ```ts
   export type GameActions = {
     setScene: (sceneId: string) => void;
     setPlayerPosition: SceneStoreSnapshot["setPlayerPosition"];
     requestRespawn: SceneStoreSnapshot["requestRespawn"];
   };
   ```
   No cambiar nada más de ese archivo.
2. En los 4 tests rojos, crear el runtime con adapters que escriban en los stores de la demo (mismo cableado que `app/page.tsx`). Mantener las aserciones tal cual.
3. Añadir 2 tests nuevos del contrato DI: sin adapters, `inventory:toggle` y `dialog:trigger` no lanzan y `dialog:trigger` sigue emitiendo `dialog:triggered`.
4. Resolver los TS2345 con `Object.values(SCENES) as GameSceneConfig[]`.
5. Resolver los "never" tipando el holder como objeto (`const holder: { actions: GameActions | null } = { actions: null }`).
6. En `inventoryRules.test.ts`, `kind: "drop-target" as const` (o tipar el literal).

## ✅ Success Criteria

- [ ] `cd apps/web-demo && npx vitest run` → 0 fallos, y al menos 52 tests.
- [ ] `npx tsc --noEmit -p apps/web-demo` → 0 errores.
- [ ] Ninguna aserción existente eliminada ni relajada.
- [ ] `git diff --stat` solo muestra los 3 archivos permitidos.

## Reporte

Lista de cambios, salida final de los dos comandos, y cualquier cosa sospechosa vista de paso (sin arreglarla).
