# Task 02-update-pathfinding

**Effort**: 2 days | **Blocks**: [07-integration-testing-and-docs] | **Blocked by**: [01-extend-core-types]

---

## 🎯 Objetivo

Actualizar `findPath()` para respetar los openings de los muros. Un punto dentro de un muro que también está dentro de un opening debe ser considerado transitable.

---

## ✅ Success Criteria

- [ ] `isPointInsideObstacle()` respeta openings
- [ ] Obstáculo interno `ObstacleOpening` creado
- [ ] `toObstacle()` acepta y mapea `GameSceneWallOpening[]`
- [ ] Tests nuevos en `findPath.test.ts` pasan (3 nuevos tests)
- [ ] Backward compatible: muros sin openings se comportan igual

---

## 📍 Archivos modificados

- `packages/engine-core/src/game/logic/pathfinding/findPath.ts`
- `packages/engine-core/__tests__/findPath.test.ts`

---

## 🔑 Lógica clave

```typescript
// En isPointInsideObstacle():
// Si el punto está dentro del muro Y dentro de un opening → no bloqueado
// El tamaño efectivo del opening = halfSize - obstaclePadding (para clearance)
for (const opening of obstacle.openings) {
  const openHalfX = opening.halfX - obstaclePadding;
  const openHalfZ = opening.halfZ - obstaclePadding;
  if (openHalfX > 0 && openHalfZ > 0 &&
      Math.abs(rotatedX - opening.centerX) <= openHalfX &&
      Math.abs(rotatedZ - opening.centerZ) <= openHalfZ) {
    return false; // In opening → not blocked
  }
}
```

---

## 📚 References

- `docs/architecture/07-walls-with-openings.md`
- `packages/engine-core/src/game/logic/pathfinding/findPath.ts`
