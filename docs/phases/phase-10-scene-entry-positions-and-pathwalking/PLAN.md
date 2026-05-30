# Phase 10 — Detailed Task Plan

**10 atomic tasks, ~50-150 LOC each, ready to execute in sequence.**

---

## Task 10.1 — Core Types: Add `entryPosition` to Scene Transitions

**File**: `packages/engine-core/src/game/types/index.ts`

**What**: Add optional `entryPosition?: GameVec3` to `BaseSceneTransition`.

**Why**: All three transition kinds (collision, item-drop, item-consume) need to specify where the player spawns in the target scene.

**Steps**:
1. Add field to `BaseSceneTransition` interface:
   ```typescript
   entryPosition?: GameVec3;  // Where player appears in target scene
   ```
2. Update jsdoc: "Optional spawn position in target scene. If omitted, uses scene's playerSpawn."
3. Update transition helpers in `src/game/logic/transitions.ts` to accept `entryPosition?`

**Test**: 
- Type-check: `sceneTransitionOnCollision({ ..., entryPosition: [1, 0, 2] })` compiles
- Backward compat: existing transitions without `entryPosition` still work

**Commit message**: 
```
feat: add entryPosition to scene transitions

Allow specifying where player spawns when entering a scene via transition.
Useful for dungeon exits (appear at exit gate) vs default spawn.
Backward compatible: optional, defaults to playerSpawn.
```

---

## Task 10.2 — Core Validation: Position & Path Accessibility

**File**: `packages/engine-core/src/game/utils/validation.ts` (new file)

**What**: Two pure validation functions:
1. `validateEntryPosition(pos, scene)` → `{ valid, reason? }`
2. `validateWalkPath(from, to, scene)` → `{ reachable, path? }`

**Why**: Core must validate positions are accessible (not in walls, reachable without collision).

**Impl Details**:

**Function 1: validateEntryPosition**
```typescript
export function validateEntryPosition(
  position: GameVec3,
  scene: GameScene
): { valid: boolean; reason?: string } {
  // 1. Check position is within ground bounds
  if (position[0] < scene.ground.minX || position[0] > scene.ground.maxX) 
    return { valid: false, reason: "outside ground (X)" };
  if (position[2] < scene.ground.minZ || position[2] > scene.ground.maxZ)
    return { valid: false, reason: "outside ground (Z)" };
  
  // 2. Check position not inside any wall (use existing collision check)
  // (Reuse/adapt existing wall-collision logic from runtime)
  
  // 3. Return valid
  return { valid: true };
}
```

**Function 2: validateWalkPath**
```typescript
export function validateWalkPath(
  from: GameVec3,
  to: GameVec3,
  scene: GameScene
): { reachable: boolean; path?: GameVec3[] } {
  // Use existing A* pathfinding to check if reachable
  // Return path points if successful
  // This is the groundwork for animation to follow path
}
```

**Test**:
- Valid position inside ground, away from walls → valid
- Position inside wall → invalid with reason
- Position outside ground → invalid with reason
- Reachable path exists → returns path points
- Unreachable destination → reachable: false

**Commit message**:
```
feat(core): add position validation utilities

validateEntryPosition: checks position is within ground and not in walls
validateWalkPath: uses A* to verify reachable path between points

Used by phase 10 to ensure entry positions and walk targets are safe.
```

---

## Task 10.3 — Core State: PlayerWalkingState in sceneStore

**File**: `packages/engine-core/src/game/state/sceneStore.ts`

**What**: Add optional `playerWalkingState` to store and setters.

**Why**: Need to track active walk animation state (target, progress, path).

**Impl**:
```typescript
// In store state:
playerWalkingState: {
  targetPosition: GameVec3;
  pathPoints: GameVec3[];
  progress: 0-1;  // Renderer will update this
  isActive: boolean;
} | null;

// New setters:
setPlayerWalkingState(state: PlayerWalkingState | null): void;
updateWalkProgress(progress: number): void;  // Called by renderer's useFrame
```

**Test**:
- Initial state: `playerWalkingState` is `null`
- After `setPlayerWalkingState`: state updates correctly
- Progress updates from 0 to 1
- Setting to `null` clears it

**Commit message**:
```
feat(core): add playerWalkingState to sceneStore

Track active walk animation (target position, path, progress).
Renderer will update progress via updateWalkProgress() on each frame.
```

---

## Task 10.4 — Core Commands: Add `player:walkTo` to GameCommand

**File**: `packages/engine-core/src/game/commands/types.ts`

**What**: Add new command to union:
```typescript
| { type: "player:walkTo"; position: GameVec3 }
```

**Why**: Cmdbus needs to know about walk command; handlers will consume it.

**Test**:
- Type-check: `{ type: "player:walkTo", position: [1, 2, 3] }` compiles
- Part of `GameCommandType` union correctly

**Commit message**:
```
feat(core): add player:walkTo command

Allows commanding player to walk to target position.
Renderer will handle animation; core tracks state.
```

---

## Task 10.5 — Core Events: Walk Lifecycle Events

**File**: `packages/engine-core/src/game/events/types.ts`

**What**: Add three new events:
```typescript
| { type: "player:walkStarted"; targetPosition: GameVec3 }
| { type: "player:walkCompleted"; position: GameVec3 }
| { type: "player:walkAborted"; reason: "user-input" | "collision" | "unreachable" }
```

**Why**: Demo and renderer need to react to walk state changes (play anim, show feedback).

**Test**:
- Type-check: all three events part of `GameEvent` union
- Part of `GameEventType` correctly
- Can extract specific event: `Extract<GameEvent, { type: "player:walkStarted" }>`

**Commit message**:
```
feat(core): add player walk lifecycle events

- player:walkStarted: animation begins
- player:walkCompleted: reached destination
- player:walkAborted: cancelled (user input, collision, unreachable)
```

---

## Task 10.6 — Core Tests: Validation & Path-Finding

**File**: `packages/engine-core/src/__tests__/playerWalk.test.ts` (new file)

**What**: Comprehensive tests for validation + state transitions.

**Impl**:

```typescript
describe("Player Pathwalking", () => {
  describe("validateEntryPosition", () => {
    test("accepts valid position in ground", () => {
      const scene = makeTestScene();
      const result = validateEntryPosition([5, 0, 10], scene);
      expect(result.valid).toBe(true);
    });

    test("rejects position outside ground bounds", () => {
      const scene = makeTestScene();
      const result = validateEntryPosition([1000, 0, 1000], scene);
      expect(result.valid).toBe(false);
    });

    test("rejects position inside wall", () => {
      const scene = makeTestSceneWithWall([5, 0, 10]);
      const result = validateEntryPosition([5, 0, 10], scene);
      expect(result.valid).toBe(false);
    });
  });

  describe("validateWalkPath", () => {
    test("finds path when reachable", () => {
      const scene = makeTestScene();
      const result = validateWalkPath([0, 0, 0], [10, 0, 10], scene);
      expect(result.reachable).toBe(true);
      expect(result.path).toBeDefined();
      expect(result.path!.length).toBeGreaterThan(0);
    });

    test("rejects unreachable destination", () => {
      const scene = makeTestSceneWithWallBlockingPath();
      const result = validateWalkPath([0, 0, 0], [100, 0, 100], scene);
      expect(result.reachable).toBe(false);
    });
  });

  describe("sceneStore.playerWalkingState", () => {
    test("initializes as null", () => {
      const { getState } = useSceneStore;
      expect(getState().playerWalkingState).toBeNull();
    });

    test("setPlayerWalkingState updates state", () => {
      const { getState, setState } = useSceneStore;
      const walkState = { 
        targetPosition: [5, 0, 10],
        pathPoints: [[0, 0, 0], [5, 0, 10]],
        progress: 0,
        isActive: true
      };
      getState().setPlayerWalkingState(walkState);
      expect(getState().playerWalkingState).toEqual(walkState);
    });

    test("updateWalkProgress increments progress", () => {
      const { getState } = useSceneStore;
      getState().setPlayerWalkingState({...});
      getState().updateWalkProgress(0.5);
      expect(getState().playerWalkingState!.progress).toBe(0.5);
    });
  });
});
```

**Commit message**:
```
test(core): add comprehensive player walk tests

Tests for:
- validateEntryPosition: bounds, walls
- validateWalkPath: reachable, blocked paths
- sceneStore: state management and progress updates
```

---

## Task 10.7 — R3F Hook: usePlayerWalkAnimation

**File**: `packages/engine-renderer-r3f/src/hooks/usePlayerWalkAnimation.ts` (new file)

**What**: Hook that animates player walking along a path using `useFrame`.

**Signature**:
```typescript
export function usePlayerWalkAnimation(
  playerPosition: GameVec3,
  walkingState: PlayerWalkingState | null,
  onWalkAbort?: (reason: string) => void,
  onWalkComplete?: () => void
): {
  animatedPosition: GameVec3;
  isWalking: boolean;
  progress: number;
}
```

**Impl Details**:

1. **Subscribe to walk state**: If `walkingState.isActive`, start animation
2. **Interpolate along path**: Use `useFrame` to increment progress
3. **Detect collisions**: Check if current interpolated position collides with walls
4. **Allow manual cancellation**: Return `isWalking` boolean; if user moves, caller should set walk to null
5. **Return animated position**: Caller uses this instead of raw playerPosition during walk

**Logic**:
```
- progress starts at 0
- each frame: progress += deltaTime / walkDuration (e.g., 2 seconds)
- interpolate position = lerp(pathPoints[0], pathPoints[-1], progress)
- check collision at interpolated position
  - if collision: abort with "collision", return to playerPosition
  - if progress >= 1: complete, emit event
- if playerPosition changes (user input): abort with "user-input"
```

**Commit message**:
```
feat(r3f): add usePlayerWalkAnimation hook

Smoothly animates player walking along calculated path.
- Interpolates position via useFrame
- Detects collisions and aborts if blocked
- Allows manual cancellation on user input
- Returns animated position for rendering
```

---

## Task 10.8 — R3F Integration: SceneTransitions Auto-Walk

**File**: `packages/engine-renderer-r3f/src/scene/SceneTransitions.tsx`

**What**: Modify SceneTransitions to auto-emit `player:walkTo` when `entryPosition` is configured.

**Current behavior**:
- When scene changes, player spawns at `playerSpawn`

**New behavior**:
- If transition has `entryPosition`, player spawns there
- Renderer auto-emits `player:walkTo` toward a logical point (e.g., center of scene, or configured walkTarget)
- Animation plays smoothly

**Impl**:
1. Hook into `transition:completed` event (already listening)
2. Check if new scene's active transition has `entryPosition`
3. If yes: emit `player:walkTo` with target point
4. Hook calls `usePlayerWalkAnimation` for smooth movement

**Commit message**:
```
feat(r3f): integrate entry positions with auto-walk

When scene transition completes:
- If transition defines entryPosition, player appears there
- Renderer auto-emits player:walkTo toward configured target
- Animation renders smoothly via usePlayerWalkAnimation

Enables seamless door-entry and pathwalking on transitions.
```

---

## Task 10.9 — R3F Tests: Animation & Cancellation

**File**: `packages/engine-renderer-r3f/src/__tests__/usePlayerWalkAnimation.test.tsx` (new file)

**What**: Test animation hook behavior.

**Impl**:
```typescript
describe("usePlayerWalkAnimation", () => {
  test("returns playerPosition when not walking", () => {
    const { result } = renderHook(() => 
      usePlayerWalkAnimation([0, 0, 0], null)
    );
    expect(result.current.animatedPosition).toEqual([0, 0, 0]);
    expect(result.current.isWalking).toBe(false);
  });

  test("animates position along path", () => {
    const walkState = {
      targetPosition: [10, 0, 10],
      pathPoints: [[0, 0, 0], [5, 0, 5], [10, 0, 10]],
      progress: 0.5,
      isActive: true
    };
    const { result } = renderHook(() => 
      usePlayerWalkAnimation([0, 0, 0], walkState)
    );
    expect(result.current.isWalking).toBe(true);
    // Animated position should be interpolated halfway
  });

  test("completes walk when progress reaches 1", () => {
    const onComplete = jest.fn();
    const walkState = {
      targetPosition: [10, 0, 10],
      pathPoints: [[0, 0, 0], [10, 0, 10]],
      progress: 0.99,  // Near completion
      isActive: true
    };
    renderHook(() => 
      usePlayerWalkAnimation([0, 0, 0], walkState, undefined, onComplete)
    );
    // Progress reaches 1.0 → onWalkComplete fires
  });

  test("aborts walk on collision", () => {
    const onAbort = jest.fn();
    // Setup: path collides with wall midway
    const walkState = {
      targetPosition: [10, 0, 10],
      pathPoints: [[0, 0, 0], [5, 0, 5], [10, 0, 10]],
      progress: 0.5,
      isActive: true
    };
    renderHook(() => 
      usePlayerWalkAnimation([0, 0, 0], walkState, onAbort)
    );
    // Detects collision → onWalkAbort("collision")
  });
});
```

**Commit message**:
```
test(r3f): add usePlayerWalkAnimation tests

Tests animation behavior:
- Returns raw position when not walking
- Interpolates position along path
- Completes on progress = 1.0
- Aborts on collision detection
```

---

## Task 10.10 — Demo: Scene Definitions & UI Feedback

**File**: `apps/web-demo/app/demo-content/scenes/scenes.ts` + UI components

**What**: 
1. Update 2-3 existing transitions to use `entryPosition`
2. Add optional visual feedback (path debug, destination marker)

**Example**:
```typescript
const personalRoom: GameScene = {
  ...
  transitions: [
    sceneTransitionOnCollision({
      id: "exit-to-dungeon",
      targetSceneId: "dungeon",
      position: [10, 0, 5],
      halfSize: [1, 2, 1],
      entryPosition: [5, 0, 10],  // ← Enter at specific point
    })
  ]
};
```

**UI Feedback** (optional, for debug):
- Show path points in debug overlay
- Marker at entry position + walk target
- Progress indicator during walk

**Commit message**:
```
feat(demo): add entry positions to scene transitions

Updated transitions:
- personalRoom → dungeon: enter at [5, 0, 10]
- dungeon → town: enter at town gate
- etc.

Enables visible walk animations between scenes.
Includes optional debug overlay for path visualization.
```

---

## Execution Order

Execute tasks in sequence: **10.1 → 10.2 → 10.3 → 10.4 → 10.5 → 10.6 → 10.7 → 10.8 → 10.9 → 10.10**

**Rationale**: Core types → logic → tests, then R3F integration → tests, then demo usage.

Each task is:
- ✅ Atomic (single concern)
- ✅ Testable (includes tests)
- ✅ Commitable (one commit per task)
- ✅ ~50-150 LOC (digestible)

---

## Post-Phase Verification

After all 10 tasks complete:

1. **Run full test suite**:
   ```bash
   npm run test -- --testPathPattern="playerWalk|usePlayerWalkAnimation"
   npm run test  # All tests
   ```

2. **Type-check**:
   ```bash
   npm run type-check
   ```

3. **Build**:
   ```bash
   npm run build
   ```

4. **Demo visual test**:
   ```bash
   npm run dev
   # Navigate between scenes with entryPosition
   # Verify smooth walk animation on entry
   # Verify manual input cancels walk
   ```

5. **Update tracking.md**: Mark all ✅ complete

6. **Create summary commit**:
   ```
   Phase 10 complete: Scene entry positions & player pathwalking

   - Core: entryPosition type, validation, walk commands/events
   - R3F: usePlayerWalkAnimation hook, SceneTransitions integration
   - Demo: scene definitions with entry points, visual feedback
   - Tests: 350+ lines of test coverage
   - Backward compatible, 100% tests passing
   ```

---

## 🚦 Progress Tracking

Track progress in adjacent `tracking.md` file — mark each task ✅ as completed.

---

**Ready to execute. Start with Task 10.1 next.**
