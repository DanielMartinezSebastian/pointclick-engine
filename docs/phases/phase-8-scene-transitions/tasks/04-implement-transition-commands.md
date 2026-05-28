# Task 04-implement-transition-commands

**Effort**: 1.5 days | **Blocks**: [05, 06] | **Blocked by**: [02, 03]

---

## 🎯 Objetivo

Implement command handlers for `transition:activate` and `transition:cancel` that coordinate scene changes, dialog flow, and state updates.

---

## ✅ Success Criteria

- [ ] CommandHandler processes `transition:activate` command
- [ ] CommandHandler processes `transition:cancel` command
- [ ] `transition:activate` shows pre-transition dialog if configured
- [ ] On confirmation, emits `transition:started` then `scene:willChange`
- [ ] `transition:cancel` reverts state (e.g., item returns to inventory)
- [ ] Tests cover: activation, cancellation, dialog flow, state rollback
- [ ] All tests pass

---

## 📝 Instructions

See README.md Design section 2 for the expected behavior.

### Key Points

- When `transition:activate` fires, check if `preTransitionDialogKey` exists
- If yes, pause and show dialog with proceed/cancel buttons
- If proceed, set `transitionStates[id].lastVisitedSceneId = currentSceneId`
- Emit `transition:started`, then call `setScene(targetSceneId)`
- If cancel, emit `transition:cancelled` and revert any item occupancy

### Testing

Add to `packages/engine-core/__tests__/transitionCommands.test.ts`:

```typescript
describe("Transition Commands", () => {
  // Test activate with/without dialog
  // Test cancel with state rollback
  // Test competing dialogs (transition + item-drop)
});
```

### Validation

```bash
cd packages/engine-core && npm test -- transitionCommands
cd packages/engine-core && npm run build
```

---

## 📚 References

- `packages/engine-core/src/game/commands/CommandHandler.ts` — Handler pattern
- `docs/phases/phase-8-scene-transitions/README.md` — Design section 2
