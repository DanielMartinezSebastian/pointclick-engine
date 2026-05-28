# Task 08-validation-gate

**Effort**: 0.5 days | **Blocks**: [phase-close] | **Blocked by**: [07-integration-testing-and-docs]

---

## 🎯 Objetivo

Validar que Phase 6 está completa y lista para cerrar.

---

## ✅ Success Criteria (todos deben pasar)

- [x] `npm test` en `packages/engine-core` → 100% tests pass (65/65 pass)
- [x] `npm run build` en `packages/engine-core` → sin errores TS
- [x] `npm run build` en `packages/engine-renderer-r3f` → sin errores TS
- [x] `npm run build` en `apps/web-demo` → sin errores TS
- [x] Core no importa React/R3F (`grep -r "from 'react'" packages/engine-core/src` → 0 resultados)
- [x] `GameSceneWall.openings[]` es opcional (backward compatible)
- [x] Tracking 8/8 tareas completadas

---

## Checklist de cierre

```bash
cd packages/engine-core && npm test
cd packages/engine-core && npm run build
cd packages/engine-renderer-r3f && npm run build
cd apps/web-demo && npm run build
```

---

## 📚 References

- `docs/phases/phase-6-walls-with-openings/tracking.md`
- `docs/workflow/pre-commit-checklist.md`
