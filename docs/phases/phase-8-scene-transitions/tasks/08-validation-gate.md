# Task 08-validation-gate

**Effort**: 0.5 days | **Blocks**: [phase-close] | **Blocked by**: [07]

---

## 🎯 Objetivo

Final validation gate: ensure all phase 8 success criteria are met, all tests pass, and the feature is production-ready.

---

## ✅ Success Criteria (todos deben pasar)

- [ ] `npm test` en `packages/engine-core` → 100% tests pass
- [ ] `npm run build` en `packages/engine-core` → sin errores TS
- [ ] `npm run build` en `packages/engine-renderer-r3f` → sin errores TS
- [ ] `npm run build` en `apps/web-demo` → sin errores TS
- [ ] Core no importa React/R3F (`grep -r "from 'react'" packages/engine-core/src` → 0 resultados)
- [ ] All three transition kinds work (collision, item-drop, item-consume)
- [ ] Scene transitions execute correctly in demo
- [ ] Backward compatible: scenes without transitions still work
- [ ] Tracking 8/8 tareas completadas
- [ ] All dialogs display correctly (pre-transition, post-transition, hints)

---

## Checklist de cierre

```bash
# Core validation
cd packages/engine-core && npm test
cd packages/engine-core && npm run build

# Renderer validation
cd packages/engine-renderer-r3f && npm run build

# Demo validation
cd apps/web-demo && npm run build

# React imports check
grep -r "from 'react'" packages/engine-core/src

# Manual testing
npm run dev  # Start demo and test scene transitions
```

---

## 📝 Manual Testing Checklist

- [ ] Town ↔ Dungeon transitions work
- [ ] Pre-transition dialogs show/hide correctly
- [ ] Post-transition dialogs appear in target scene
- [ ] Item-drop transitions (if any) accept items and change scene
- [ ] Cancel button on dialogs works correctly
- [ ] No console errors or warnings
- [ ] Performance is acceptable (no lag on transitions)

---

## 📚 References

- `docs/phases/phase-8-scene-transitions/tracking.md`
- `docs/workflow/pre-commit-checklist.md`
