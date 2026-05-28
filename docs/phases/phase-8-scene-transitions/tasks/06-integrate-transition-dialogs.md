# Task 06-integrate-transition-dialogs

**Effort**: 1.5 days | **Blocks**: [07, 08] | **Blocked by**: [04, 05]

---

## 🎯 Objetivo

Implement pre-transition and post-transition dialog flow, handling user choices (proceed/cancel) and coordinating with the renderer.

---

## ✅ Success Criteria

- [ ] TransitionDialog component created for pre-transition confirmations
- [ ] Dialog shows `preTransitionDialogKey` text + proceed/cancel buttons
- [ ] Proceed triggers `transition:activate` → scene change
- [ ] Cancel triggers `transition:cancel` → revert state + close dialog
- [ ] Post-transition dialogs display after scene loads
- [ ] Dialog system integrates with existing dialog UI
- [ ] Tests cover: dialog show/hide, button handlers, state management
- [ ] All tests pass

---

## 📝 Instructions

### Key Components

1. **TransitionDialog.tsx**: Modal that shows before transition
2. **useTransitionSystem.ts**: Listen to `transition:triggered`, coordinate dialogs + scene changes
3. Integration with existing dialog system (reuse `DialogBox` component if available)

### Dialog Flow

```
User clicks transition zone
  ↓
Game emits `transition:triggered` event
  ↓
useTransitionSystem intercepts
  ↓
If preTransitionDialogKey: show TransitionDialog (proceed/cancel)
  ↓
On proceed: dispatch `transition:activate` → scene changes
On cancel: dismiss dialog, emit `transition:cancelled`
  ↓
After scene loads: show postTransitionDialogKey if configured
```

### Testing

- Dialog displays with correct text
- Proceed button triggers correct command
- Cancel button reverts state
- Multiple dialogs don't stack

---

## 📚 References

- `apps/web-demo/app/components/DialogBox.tsx` — Dialog pattern
- `docs/phases/phase-8-scene-transitions/README.md` — Design section 2
