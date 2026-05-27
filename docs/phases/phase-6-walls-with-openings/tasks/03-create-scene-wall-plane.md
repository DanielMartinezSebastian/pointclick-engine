# Task 03-create-scene-wall-plane

**Effort**: 2 days | **Blocks**: [04-integrate-wall-plane] | **Blocked by**: [01-extend-core-types]

---

## 🎯 Objetivo

Crear `SceneWallPlane.tsx` en el renderer R3F. Renderiza la textura de un muro como un plano paralelo a la cámara (billboard), posicionado en las coordenadas del muro en el mundo.

---

## ✅ Success Criteria

- [ ] `SceneWallPlane` creado en `packages/engine-renderer-r3f/src/scene/`
- [ ] Sigue el patrón de `SceneBackgroundPlane` (quaternion copy en useFrame)
- [ ] Exportado desde `packages/engine-renderer-r3f/src/index.ts`
- [ ] No renderiza nada si `wall.textureUrl` es undefined (backward compatible)
- [ ] Carga la textura asíncronamente con cleanup correcto

---

## 📍 Archivos creados/modificados

- `packages/engine-renderer-r3f/src/scene/SceneWallPlane.tsx` (NEW)
- `packages/engine-renderer-r3f/src/index.ts` (export)

---

## 📚 References

- `apps/web-demo/app/components/scene/SceneBackgroundPlane.tsx` — patrón a seguir
- `docs/architecture/07-walls-with-openings.md`
