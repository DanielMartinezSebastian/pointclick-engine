# Task 16.01 — ADR-0009 + issue

**Effort**: 30min | **Modelo**: opus (orquestador) | **Blocks**: 02, 03 | **Blocked by**: visto bueno del owner

---

## 🎯 Objetivo

`CLAUDE.md` prohíbe cambiar `publicApi.ts` sin issue y plan de migración. Esta tarea cumple ese requisito antes de mover código.

## 📝 Instructions

1. Revisar con el owner [ADR-0009](../../../decisions/0009-runtime-lives-in-packages.md). Puntos que debe confirmar:
   - El runtime agnóstico va a `engine-core` (no a un paquete nuevo).
   - `publicApi.ts` de la demo queda como barrel; contrato v1 sin cambios breaking.
   - Versión objetivo 0.5.0 en lockstep.
2. Con su aprobación, abrir el issue en GitHub con el borrador incluido en el ADR (`gh issue create`, label `architecture`).
3. Cambiar `Status` del ADR a `accepted` y añadir el número de issue.
4. Referenciar el issue en los commits de las tareas 02 y 03 (`See #N`).

## ✅ Success Criteria

- [ ] Issue abierto y enlazado desde el ADR.
- [ ] ADR en estado `accepted`.

## Nota

Abrir un issue es una acción visible fuera del repo local: no se hace sin confirmación explícita del owner.
