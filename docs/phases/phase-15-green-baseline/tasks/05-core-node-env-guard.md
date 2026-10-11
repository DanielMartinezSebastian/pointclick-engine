# Task 15.05 — Core: guarda de `process.env`

**Effort**: 30min | **Modelo**: haiku | **Blocks**: 09 | **Blocked by**: —

**Archivos permitidos** (ningún otro):
- `packages/engine-core/src/game/state/sceneStore.ts` (solo la línea de `SHOULD_LOG_STATE_TRANSITIONS`)
- `packages/engine-core/src/__tests__/coreAgnosticism.test.ts` (nuevo)

---

## 🎯 Objetivo

`sceneStore.ts:32` lee `process.env.NODE_ENV` sin comprobar que `process` exista:

```ts
const SHOULD_LOG_STATE_TRANSITIONS = process.env.NODE_ENV !== "production";
```

En un entorno sin bundler (ESM directo en navegador) eso lanza `ReferenceError` al importar el core. Los otros dos usos del core ya llevan guarda (`game/i18n/registry.ts:9`, `game/state/i18nStore.ts:45`).

## 📝 Instructions

1. Cambiar la línea para usar la misma guarda que `i18nStore.ts:45`:
   ```ts
   const SHOULD_LOG_STATE_TRANSITIONS =
     typeof process !== "undefined" && process.env?.NODE_ENV !== "production";
   ```
2. Crear `packages/engine-core/src/__tests__/coreAgnosticism.test.ts` con un test que recorra todos los `.ts` de `packages/engine-core/src` (excluyendo `__tests__` y `*.test.ts`) usando `node:fs` y `node:path`, y falle si alguno contiene:
   - un import de `react`, `react-dom`, `three`, `next`, `@react-three/…`
   - uso de `window.`, `document.`, `localStorage`, `navigator.` **fuera de comentarios**
   - `process.env` sin `typeof process` en la misma línea

   Para ignorar comentarios basta con descartar líneas cuyo contenido recortado empiece por `//`, `*` o `/*`. El mensaje de fallo debe listar `archivo:línea`.
3. Mira un test existente de la carpeta (p. ej. `i18nStore.test.ts`) para copiar el estilo de imports de vitest.

## ✅ Success Criteria

- [ ] `cd packages/engine-core && npx vitest run` → 0 fallos, ≥ 245 tests.
- [ ] `npx tsc --noEmit -p packages/engine-core` → 0 errores.
- [ ] El test nuevo falla si añades temporalmente `window.foo` a un archivo del core (compruébalo y revierte).
- [ ] `git diff --stat` solo muestra los 2 archivos permitidos.

## Reporte

Salida de los comandos y confirmación de la prueba negativa.
