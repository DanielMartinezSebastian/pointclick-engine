# Task 15.08 — Resincronizar docs con el código

**Effort**: 1.5h | **Modelo**: haiku | **Blocks**: 09 | **Blocked by**: —

**Archivos permitidos**: solo `.md` bajo `docs/` (excepto `docs/phases/phase-15-*` y `docs/phases/phase-16-*`), más `CLAUDE.md`, `README.md` raíz, `.gitignore` y los archivos sueltos de la raíz listados abajo. **Ningún archivo de código.**

---

## 🎯 Objetivo

Corregir estados y enlaces erróneos. Cada cambio es un hecho comprobable; no redactes contenido nuevo ni opines.

## Cambios exactos

### A. Estado de fases (campo `Status`/`Estado` del `README.md` y cabecera de `tracking.md`)

| Fase | Hoy dice | Debe decir |
|---|---|---|
| `phase-6-walls-with-openings` | Planning | completed |
| `phase-8-scene-transitions` | Planned | completed |
| `phase-10-scene-entry-positions-and-pathwalking` | In Progress | completed |
| `phase-11-audio` | Planned | completed — gate de validación pendiente (ver Phase 15) |
| `phase-12-architecture-cleanup` | Planned | completed — gate de validación pendiente (ver Phase 15) |
| `phase-13-i18n` | Planned | completed — gate de validación pendiente (ver Phase 15) |
| `phase-7-walls-first-class` | planned — not started | **no tocar** (es correcto) |

No marques ningún checkbox de los "Post-Phase Checklist": los valida el orquestador.

### B. `docs/README.md`, sección Phases

- `phase-7`: cambiar "✅ Completed" por "📋 Planned (not started)".
- Añadir entradas que faltan, con el mismo formato: phase-10 (✅), phase-11-audio (✅), phase-12 (✅), phase-13 (✅), `phase-15-green-baseline` (🚧 Active), `phase-16-runtime-in-library` (📋 Planning).
- Sección Decisions: añadir los ADR que existen en `docs/decisions/` y no están listados (0005 a 0009).
- Sección Architecture: añadir `07-walls-with-openings.md` y `08-scene-transitions.md`.

### C. `CLAUDE.md` (solo estas 4 líneas)

- Cabecera `**Versión**: 2.0-dev` → `**Versión**: 0.4.0`.
- `- **v0.1.x**: Demo R3F funcional (actual)` → quitar `(actual)` y añadirlo a la línea de `v0.4.x`.
- Borrar la línea `**Nota**: la estructura monorepo se materializa en Fase 2. Estado actual: app Next.js plana.`
- Tabla "Documentos Clave", fila "Fase activa": `docs/phases/phase-15-green-baseline/`.

### D. Archivos sueltos

- `git mv` a `docs/_archive/`: `FEATURE_WALLS_OPENINGS_VISUAL_GUIDE.md`, `PHASE_6_EXECUTIVE_SUMMARY.md`, `TODAY_DELIVERABLES.md`, `docs/DEBUG_MODE_REVIEW.md`.
- `git mv docs/phases/phase-11/PLAN_AUDIO_FIXES.md docs/phases/phase-11-audio/PLAN_AUDIO_FIXES.md` (la carpeta `phase-11` queda vacía y desaparece).
- `git rm --cached dev.log` y añadir `*.log` a `.gitignore`.
- Tras mover, buscar con grep referencias a las rutas antiguas en `docs/` y `README.md` y actualizarlas.

### E. Avisos de desfase (un bloque de cita al inicio, sin reescribir el documento)

En `docs/LIBRARY_CONSUMPTION_GUIDE.md`, `docs/LIBRARY_API_CONTRACT_V1.md` y `docs/architecture/02-public-api.md`:

> ⚠️ **Desfase conocido (2026-10-10)**: `createGameRuntime`, `GameViewport`, `useGameState`, `useGameActions` y `registerRule` viven hoy en `apps/web-demo/app/lib/engine/publicApi.ts`; `@pointclick-engine/engine-renderer-r3f` **no** los exporta todavía. Se corrige en `docs/phases/phase-16-runtime-in-library/`.

## ✅ Success Criteria

- [ ] `git status --short` no muestra ningún `.ts`/`.tsx`/`.json` modificado.
- [ ] `ls docs/phases/phase-11 2>/dev/null` → no existe.
- [ ] `grep -rn "TODAY_DELIVERABLES\|PHASE_6_EXECUTIVE_SUMMARY" docs README.md CLAUDE.md` solo devuelve rutas bajo `_archive`.
- [ ] Todos los enlaces relativos añadidos en `docs/README.md` apuntan a rutas que existen.

## Reporte

Lista de archivos tocados y movidos. Cualquier otra incoherencia que veas: **repórtala, no la arregles**.
