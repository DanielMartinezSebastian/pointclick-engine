# Task 04-integrate-wall-plane

**Effort**: 0.5 days | **Blocks**: [07-integration-testing-and-docs] | **Blocked by**: [03-create-scene-wall-plane]

---

## 🎯 Objetivo

Integrar `SceneWallPlane` en `SceneWalls.tsx` del renderer. Para cada muro con `textureUrl`, renderizar el plano de textura fuera del `RigidBody` (solo visual, sin física).

---

## ✅ Success Criteria

- [ ] `SceneWalls` importa y usa `SceneWallPlane`
- [ ] Renderiza planos solo para muros con `textureUrl` definida
- [ ] Los planos están fuera del `RigidBody` (no afectan física)
- [ ] `renderOrder={i}` controla el orden de dibujado

---

## 📍 Archivos modificados

- `packages/engine-renderer-r3f/src/scene/SceneWalls.tsx`

---

## 📚 References

- `packages/engine-renderer-r3f/src/scene/SceneWallPlane.tsx`
- `packages/engine-renderer-r3f/src/scene/SceneWalls.tsx`
