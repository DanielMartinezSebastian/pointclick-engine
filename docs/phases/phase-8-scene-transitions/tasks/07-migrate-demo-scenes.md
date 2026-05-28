# Task 07-migrate-demo-scenes

**Effort**: 1.5 days | **Blocks**: [08] | **Blocked by**: [05, 06]

---

## 🎯 Objetivo

Update demo scene definitions to use the new `sceneTransitions[]` array and remove ad-hoc exit zone logic from GameTouchCanvas.

---

## ✅ Success Criteria

- [ ] Scene type in `apps/web-demo/demo-content/scenes/scenes.ts` includes `transitions?: GameSceneTransition[]`
- [ ] All existing exit zones converted to `sceneTransitionOnCollision()`
- [ ] All item-drop transitions converted to `sceneTransitionOnItemDrop()`
- [ ] Dialogs correctly mapped to transition keys
- [ ] Ad-hoc exit logic removed from `GameTouchCanvas.tsx`
- [ ] Scene changes still work (town → dungeon, dungeon → town, etc.)
- [ ] Demo runs without errors

---

## 📝 Instructions

### Step 1: Define new Scene type

In `apps/web-demo/demo-content/scenes/scenes.ts`:

```typescript
export type Scene = {
  // ... existing fields
  transitions?: GameSceneTransition[];
};
```

### Step 2: Migrate existing transitions

For each exit zone currently hardcoded in scenes or GameTouchCanvas:

- Convert to `sceneTransitionOnCollision()` or `sceneTransitionOnItemDrop()`
- Example:
  ```typescript
  transitions: [
    sceneTransitionOnCollision({
      id: "exit-dungeon-to-town",
      targetSceneId: "town",
      position: [0, 1.05, -14],  // Near door
      halfSize: [2, 2.5, 0.5],
      preTransitionDialogKey?: "scene.exit.confirm",
    }),
  ]
  ```

### Step 3: Remove GameTouchCanvas exit logic

In `apps/web-demo/app/components/GameTouchCanvas.tsx`:

Remove any hardcoded exit zone collision detection. The renderer now handles this via `SceneTransitions`.

### Step 4: Testing

- Start demo
- Navigate between scenes (click exit zones)
- Verify dialogs show/hide correctly
- Verify item-drop transitions work (if any exist in demo)

---

## 📚 References

- `docs/phases/phase-8-scene-transitions/README.md` — Design section 6
