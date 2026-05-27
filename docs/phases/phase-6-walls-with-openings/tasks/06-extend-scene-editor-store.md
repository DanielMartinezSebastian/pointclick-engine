# Task 06-extend-scene-editor-store

**Effort**: 1 day | **Blocks**: [05-extend-wall-editor-panel] | **Blocked by**: [01-extend-core-types]

---

## 🎯 Objetivo

Extender `sceneEditorStore.ts` con métodos CRUD para openings y helpers para textura del muro seleccionado.

---

## ✅ Success Criteria

- [ ] `addOpeningToSelectedWall()` añade opening con id único
- [ ] `removeOpeningFromSelectedWall(id)` elimina por id
- [ ] `updateOpeningInSelectedWall(id, updater)` actualiza por id
- [ ] `updateSelectedWallTextureUrl(url)` actualiza textureUrl
- [ ] `updateSelectedWallTexturePosition(axis, value)` actualiza eje individual
- [ ] Todos delegan a `sceneStore.updateWall()` sin duplicar estado
- [ ] `sceneStore` no conoce `sceneEditorStore` (sin acoplamiento circular)

---

## 📍 Archivos modificados

- `apps/web-demo/app/store/sceneEditorStore.ts`

---

## 📚 References

- `apps/web-demo/app/store/sceneEditorStore.ts` — base
- `packages/engine-core/src/game/state/sceneStore.ts` — updateWall
