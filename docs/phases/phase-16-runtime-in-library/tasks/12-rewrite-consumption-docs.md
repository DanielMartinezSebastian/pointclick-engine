# Task 16.12 — Reescribir docs de consumo

**Effort**: 2h | **Modelo**: haiku (con plantilla del orquestador) | **Blocks**: 13 | **Blocked by**: 11

**Archivos permitidos**: `docs/LIBRARY_CONSUMPTION_GUIDE.md`, `docs/LIBRARY_API_CONTRACT_V1.md`, `docs/architecture/01-layers.md`, `docs/architecture/02-public-api.md`, `packages/*/README.md`, `packages/*/CHANGELOG.md`, `CLAUDE.md` (solo tabla "Dónde va cada cosa" y sección "API Pública").

---

## 🎯 Objetivo

Que la documentación describa lo que el código hace tras la Fase 16. Cada afirmación debe poder comprobarse contra un archivo.

## 📝 Instructions

1. Quitar los avisos "⚠️ Desfase conocido (2026-10-10)" añadidos en la Fase 15.
2. `LIBRARY_CONSUMPTION_GUIDE.md`: cada bloque de código debe compilar. Método: copiar el ejemplo de `apps/web-demo/app/example-minimal/page.tsx` como "Flujo canónico" en vez de escribir ejemplos nuevos. Para cada `import { X } from "<paquete>"` del documento, comprobar que `X` aparece en el `src/index.ts` de ese paquete.
3. `LIBRARY_API_CONTRACT_V1.md`:
   - "Archivo fuente" pasa a ser `packages/engine-core/src/game/runtime/` + `packages/engine-renderer-r3f/src/index.ts`; `publicApi.ts` se menciona como barrel de compatibilidad.
   - Añadir los exports nuevos de 0.5.0 (`CharacterSprite`, `CharacterDefinition`, `attachAudioSystem`, props nuevas de `GameViewport`, `transitions` en `GameSceneConfig`).
   - Nota de corrección: `GameActions.setScene(sceneId)`.
   - Sección 3 "No soportado": actualizar rutas (ya no existen `app/lib/engine/render/*` ni `movement/*`).
4. `architecture/02-public-api.md`: actualizar "Ubicación actual".
5. `architecture/01-layers.md` y tabla de `CLAUDE.md`: reflejar que el runtime está en core y la orquestación R3F en el renderer.
6. `CHANGELOG.md` de ambos paquetes: entrada `0.5.0` con Added / Changed / Deprecated (`DavidSprite`).
7. Ningún documento nuevo. Ningún documento por encima de 200 líneas.

## ✅ Success Criteria

- [ ] `grep -rn "Desfase conocido" docs` → vacío.
- [ ] Todos los símbolos importados en los ejemplos existen en el `index.ts` correspondiente (pegar la comprobación en el reporte).
- [ ] `wc -l` de cada archivo tocado ≤ 200.

## Reporte

Lista de afirmaciones corregidas y cualquier ejemplo que no hayas podido verificar.
