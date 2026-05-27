# Task 08-validation-gate

**Effort**: 0.5 days | **Blocks**: [phase-close] | **Blocked by**: [07-integration-testing-and-docs]

---

## 🎯 Objetivo

Validar que Phase 6 está completa y lista para cerrar.

---

## ✅ Success Criteria (todos deben pasar)

- [ ] `npm test` en `packages/engine-core` → 100% tests pass
- [ ] `npm run build` en `packages/engine-core` → sin errores TS
- [ ] `npm run build` en `packages/engine-renderer-r3f` → sin errores TS
- [ ] `npm run build` en `apps/web-demo` → sin errores TS
- [ ] Core no importa React/R3F (`grep -r "from 'react'" packages/engine-core/src` → 0 resultados)
- [ ] `GameSceneWall.openings[]` es opcional (backward compatible)
- [ ] Tracking 8/8 tareas completadas

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
