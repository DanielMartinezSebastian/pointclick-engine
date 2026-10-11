# Task 16.05 — Borrar copias de render en la demo

**Effort**: 1.5h | **Modelo**: haiku | **Blocks**: 09 | **Blocked by**: Fase 15

**Archivos permitidos**: `apps/web-demo/app/lib/engine/render/**` (borrar), los shims de una línea en `apps/web-demo/app/components/scene/` y `components/sprite/`, `apps/web-demo/app/components/SpeechBubble.tsx`, y los imports de los archivos que los consumían.

---

## 🎯 Objetivo

`apps/web-demo/app/lib/engine/render/` contiene copias de 7 archivos que ya viven en `packages/engine-renderer-r3f/src/`:

| Archivo | Paquete | Demo | Estado |
|---|---|---|---|
| `SpeechBubble.tsx` | 316 L | 242 L | divergido |
| `scene/SceneWalls.tsx` | 165 L | 130 L | divergido |
| `scene/SceneGround.tsx` | 126 | 126 | igual |
| `scene/SceneCollisionSphere.tsx` | 31 | 31 | igual |
| `scene/SceneWallPointPreview.tsx` | — | — | comprobar |
| `sprite/DavidSprite.tsx` | 230 | 230 | igual |
| `sprite/clips.ts`, `sprite/speakingAnimation.ts` | 72 / 46 | 72 / 46 | igual |

## 📝 Instructions

1. Para cada archivo de la copia, localizar quién lo importa: `grep -rn "engine/render" apps/web-demo/app`. Seguir también los shims de una línea de `components/scene/*.tsx` y `components/sprite/*`.
2. **Antes de borrar nada**, construir una tabla: símbolo → quién lo usa → ¿lo exporta `@pointclick-engine/engine-renderer-r3f`? (mirar `packages/engine-renderer-r3f/src/index.ts`).
3. Si un símbolo usado **no** está exportado por el paquete: no borres ese archivo, repórtalo y sigue con el resto.
4. Para los dos archivos divergidos, ejecutar `diff` entre copia y paquete y pegar el resultado en el reporte. Si la copia de la demo tiene código que el paquete no tiene y alguien lo usa, **no la borres**: repórtalo.
5. Redirigir los imports al paquete y borrar con `git rm` las copias y los shims que queden sin consumidores.
6. `npm run build:packages` antes de validar.

## ✅ Success Criteria

- [ ] `npm run typecheck` y `npm test` → verdes.
- [ ] `npm run build -w apps/web-demo` → verde.
- [ ] `grep -rn "lib/engine/render" apps/web-demo/app` → vacío, o solo los archivos reportados como no borrables.

## Reporte

La tabla del paso 2, los `diff` del paso 4 y la lista de archivos borrados y no borrados con motivo.
