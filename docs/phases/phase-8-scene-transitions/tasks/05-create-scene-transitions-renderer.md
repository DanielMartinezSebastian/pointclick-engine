# Task 05-create-scene-transitions-renderer

**Effort**: 2 days | **Blocks**: [06, 07] | **Blocked by**: [01, 04]

---

## 🎯 Objetivo

Implement `SceneTransitions.tsx` component in engine-renderer-r3f that renders collision zones, item-drop zones, and triggers appropriate commands based on user interaction.

---

## ✅ Success Criteria

- [ ] `SceneTransitions.tsx` component created
- [ ] Renders invisible collision colliders for "collision" kind transitions
- [ ] Renders visible drop zones for "item-drop" transitions with visual feedback
- [ ] Collision with player triggers `transition:activate` command
- [ ] Click on drop zone triggers appropriate command
- [ ] Visual feedback shows item occupancy state
- [ ] Hint dialogs display based on `hintDialogKeys` + occupancy
- [ ] Tests cover: rendering, collision detection, visual state
- [ ] Integration with existing renderer components

---

## 📝 Instructions

### Key Responsibilities

1. **Collision-based transitions**: Invisible CuboidCollider + invisible click zone
2. **Item-drop transitions**: Visual zone (cylinder base + highlight) with item occupancy indicator
3. **Event handling**: Dispatch `transition:activate` on collision/click
4. **Dialog hints**: Subscribe to `transitionStates[id].itemIdOccupying` and show appropriate hints

### File Structure

```
packages/engine-renderer-r3f/src/scene/
├── SceneTransitions.tsx (main component)
└── SceneTransitions.utils.ts (helpers for visual feedback)
```

### Rendering Strategy

- Use Rapier CuboidCollider for collision detection
- Use Three.js meshes for drop zone visuals (reuse patterns from SceneInteractionSphere)
- DepthTest=false for hint dialogs (similar to SceneWallPlane)

### Testing

Create `apps/web-demo/app/lib/engine/render/scene/__tests__/SceneTransitions.test.tsx`:

```typescript
describe("SceneTransitions Renderer", () => {
  // Test collision zone invisible but functional
  // Test drop zone visual appearance
  // Test item occupancy indicators
  // Test hint dialog display
});
```

---

## 📚 References

- `packages/engine-renderer-r3f/src/scene/SceneWalls.tsx` — Collider pattern
- `docs/phases/phase-8-scene-transitions/README.md` — Design section 4
