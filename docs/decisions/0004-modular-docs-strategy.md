# 0004 — Modular docs strategy (subagent-first)

**Status**: accepted
**Date**: 2026-05-23

## Context

Primera iteración de documentación (2026-05-23 AM) produjo 4 archivos monolíticos sumando ~3700 líneas para planificar UNA fase, y CLAUDE.md inflado a 978 líneas. Problemas:

- Subagentes consumen ~30k tokens leyendo guías antes de empezar tarea
- Redundancia: misma info en QUICK_START, DETAILED_PLAN, TRACKING
- Difícil mantener: cambio menor requiere editar 3 archivos
- No componentizable: tareas no aislables para delegación

## Decision

**Docs modulares pequeños orientados a subagentes.**

Reglas:
1. CLAUDE.md ≤ 200L (solo esencial: visión, capas, regla de oro, links)
2. `docs/architecture/` por tema, ~50L cada uno
3. `docs/workflow/` por flujo, ~60L cada uno
4. Tareas autocontenidas: `docs/phases/<fase>/tasks/NN-*.md` (~50L cada una)
5. ADRs ligeros: ~30L cada uno
6. Componentes documentados individualmente cuando aporta valor

## Consequences

- ✅ Subagente lee ~50L (1 task file) + opcional 1-2 refs = ~3k tokens vs 30k antes
- ✅ Cambios localizados: editar un archivo, no tres
- ✅ Tareas delegables sin re-narrar contexto
- ✅ Onboarding más rápido (lee solo lo que necesitas)
- ❌ Más archivos: requiere índice (`docs/README.md`)
- ❌ Mayor disciplina al crear plan (template obligatorio)

## Alternatives considered

- **Mantener monolitos**: rechazado, anti-patrón confirmado por tamaño actual.
- **Solo CLAUDE.md gigante**: rechazado, hace ilusoria la separación.
- **Wiki externa (Notion, GitHub Wiki)**: rechazado, queremos docs versionados con el código.

## Notes

Documentos previos (los monolíticos) se archivan en `docs/_archive/` con README explicando que fueron reemplazados. No se borran para preservar historia.

Si en el futuro un task file supera 80L, dividir en sub-tasks (`NNa-`, `NNb-`) en lugar de inflar.
