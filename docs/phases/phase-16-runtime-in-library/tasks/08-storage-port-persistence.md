# Task 16.08 — Persistencia vía `StoragePort`

**Effort**: 1.5h | **Modelo**: haiku | **Blocks**: 13 | **Blocked by**: Fase 15

**Archivos permitidos**:
- `apps/web-demo/app/lib/engine/runtime/useInventoryRuntimeController.ts` (solo las líneas de `localStorage`)
- `apps/web-demo/app/lib/engine/runtime/useSceneRuntimeController.ts` (solo las líneas de `localStorage`)
- `apps/web-demo/app/components/InventoryUI.tsx` (solo la línea de `localStorage.clear()`)
- `apps/web-demo/app/lib/gamePersistence.ts` (nuevo)

---

## 🎯 Objetivo

Tres sitios acceden a `localStorage` directamente, saltándose el adapter que el repo ya tiene (`localStorageAdapter` en `apps/web-demo/app/lib/platform-web.ts`, con fallback SSR):

- `useInventoryRuntimeController.ts` — clave `"inventory-slots"`
- `useSceneRuntimeController.ts` — clave `"current-scene-id"`
- `InventoryUI.tsx:311` — `localStorage.clear()` como "reiniciar partida", que además borra el idioma y los ajustes de audio

No es el sistema de guardado (eso es la fase narrativa); es dejar un único punto de acceso.

## 📝 Instructions

1. Crear `apps/web-demo/app/lib/gamePersistence.ts` con:
   ```ts
   export const GAME_STORAGE_KEYS = {
     inventorySlots: "inventory-slots",
     currentSceneId: "current-scene-id",
   } as const;
   export function loadInventorySlots(): InventorySlotsState | null
   export function saveInventorySlots(slots: InventorySlotsState): void
   export function loadCurrentSceneId(): string | null
   export function saveCurrentSceneId(id: string): void
   /** Borra solo el progreso de partida, no idioma ni audio. */
   export function clearGameProgress(): void
   ```
   Todo a través de `localStorageAdapter`. Conservar los mismos nombres de clave y el mismo formato JSON (compatibilidad con partidas existentes). `JSON.parse` dentro de `try/catch` devolviendo `null`.
2. `clearGameProgress` debe borrar también las claves de los stores persistidos de la demo: busca los `name:` de `persist(` en `apps/web-demo/app/store/*.ts` (p. ej. `"door-states"`) y añádelos. No borrar `"i18n-locale"` ni la clave de ajustes de audio.
3. Sustituir los accesos directos en los 3 archivos por estas funciones. No cambiar nada más de esos archivos.

## ✅ Success Criteria

- [ ] `grep -rn "localStorage" apps/web-demo/app --include=*.ts --include=*.tsx | grep -v "platform-web\|\.test\."` → solo comentarios.
- [ ] `npm run typecheck`, `npm run lint`, `npm test` → verdes.

## Reporte

Claves gestionadas, claves que `clearGameProgress` borra y cuáles conserva.
