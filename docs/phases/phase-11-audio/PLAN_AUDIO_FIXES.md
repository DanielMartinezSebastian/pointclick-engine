# Phase 11 Audio System - Bug Fix Plan

## Issues Found
1. **Canvas click sound only plays on first click**: `playerWalkingState` reference tracking doesn't reset properly when walking stops
2. **Transition sound not working**: Event may not be firing or conflicting with music crossfade

## Root Causes

### Issue 1: Canvas Click Sound
- Current implementation uses `prevWalkingRef` to detect transition from null → walking
- When walking completes, `playerWalkingState` goes back to null
- On second click, the ref still holds the previous state, so no transition is detected
- **Fix**: Track the previous state properly and detect the transition each time

### Issue 2: Transition Sound
- `transition:triggered` event may not be firing from runtime
- OR: Event fires but sound plays quietly/at wrong time due to music crossfade timing
- **Investigation needed**: Check if event is actually being emitted; add logging

## Implementation Plan

### Fix 1: Canvas Click Sound (Priority: HIGH)
```
Location: apps/web-demo/app/components/GameTouchCanvas.tsx
Current: useEffect with prevWalkingRef tracking

Steps:
1. Change detection logic to check if playerWalkingState just became truthy
2. Use a flag to track "was walking last render" instead of ref
3. OR: Use useCallback with proper dependency to only fire once per walking sequence
4. Verify: Click should play for each new walk command, not just first one
```

### Fix 2: Transition Sound (Priority: MEDIUM)
```
Location: apps/web-demo/app/components/GameTouchCanvas.tsx
Current: Listening to runtime.on("transition:triggered")

Steps:
1. Add console logs to verify event fires
2. Check if event structure matches expectation
3. Verify timing: does sound play during crossfade (audio conflict)?
4. Consider: Add transition sound to scene door opening instead (if that's the intent)
5. OR: Delay transition sound slightly to avoid music overlap
```

## Testing Checklist
- [ ] Click canvas multiple times → sound plays each time
- [ ] Transition between scenes → transition sound audible
- [ ] Music still crossfades correctly when transition plays
- [ ] No audio conflicts or overlapping sounds

## Files to Modify
- `apps/web-demo/app/components/GameTouchCanvas.tsx` (audio logic)
- Possibly: `packages/engine-core/src/game/logic/rules/transitionRules.ts` (verify event emission)

## Notes
- The animation walking state fix worked (character shows walk animation while speaking)
- Audio system is otherwise functional (music, pickup/drop SFX work)
- UI click (inventory) works correctly
- Only these two edge cases remain for complete Phase 11
