# Task 05-extend-wall-editor-panel

**Effort**: 2 days | **Blocks**: [07-integration-testing-and-docs] | **Blocked by**: [06-extend-scene-editor-store]

---

## 🎯 Objetivo

Extender `WallEditorPanel.tsx` con UI para:
1. Openings CRUD (agregar, editar, eliminar)
2. Selector de URL de textura
3. Ajuste de posición de textura (texturePosition)

---

## ✅ Success Criteria

- [ ] `WallOpeningEditor.tsx` creado como subcomponente
- [ ] `WallEditorPanel` muestra sección "Openings" con lista y botón + Agregar
- [ ] `WallEditorPanel` muestra campo de texto para textureUrl
- [ ] `WallEditorPanel` muestra inputs Tex X/Y/Z para texturePosition (solo si hay textureUrl)
- [ ] Todas las mutaciones delegan a `sceneEditorStore`
- [ ] JSON textarea en el panel refleja openings y texturas

---

## 📍 Archivos creados/modificados

- `apps/web-demo/app/components/debug/WallOpeningEditor.tsx` (NEW)
- `apps/web-demo/app/components/debug/WallEditorPanel.tsx` (EXTEND)

---

## 📚 References

- `apps/web-demo/app/store/sceneEditorStore.ts` — store actions
- `docs/architecture/07-walls-with-openings.md`
