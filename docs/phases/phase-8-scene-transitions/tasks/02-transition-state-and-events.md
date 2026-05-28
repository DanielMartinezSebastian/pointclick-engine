# Task 02-transition-state-and-events

**Effort**: 1 day | **Blocks**: [03, 04] | **Blocked by**: [01]

---

## 🎯 Objetivo

Add transition state management to `sceneStore` and define transition-related events and commands in the core event system.

---

## ✅ Success Criteria

- [ ] `sceneStore` has `transitionStates: Record<transitionId, TransitionState>`
- [ ] Methods: `setTransitionAvailable()`, `setTransitionItemOccupying()`
- [ ] New event types defined:
  - `transition:triggered`
  - `transition:started`
  - `transition:completed`
- [ ] New command types defined:
  - `transition:activate`
  - `transition:cancel`
- [ ] All state mutations are immutable (returns new state)
- [ ] Tests pass (state mutations, event emissions)
- [ ] TypeScript builds without errors

---

## 📝 Instructions

### Step 1: Define TransitionState interface

In `packages/engine-core/src/game/types/index.ts`:

```typescript
export interface TransitionState {
  /** The scene this transition was triggered from (for breadcrumbs). */
  lastVisitedSceneId?: string;
  /** For item-drop transitions: the item currently occupying this zone. */
  itemIdOccupying?: string;
  /** Is this transition available to trigger? Default true. */
  isAvailable: boolean;
}
```

### Step 2: Update sceneStore

In `packages/engine-core/src/game/state/sceneStore.ts`:

Add to the `GameSceneStore` interface:

```typescript
transitionStates: Record<string, TransitionState>;
setTransitionAvailable(id: string, available: boolean): void;
setTransitionItemOccupying(id: string, itemId: string | undefined): void;
```

Implement in the store (immutable updates):

```typescript
transitionStates: {} as Record<string, TransitionState>,

setTransitionAvailable(id: string, available: boolean) {
  this.transitionStates[id] = {
    ...this.transitionStates[id],
    isAvailable: available,
  };
  emitStoreChange({ type: "transition:available-changed", transitionId: id });
},

setTransitionItemOccupying(id: string, itemId: string | undefined) {
  this.transitionStates[id] = {
    ...this.transitionStates[id],
    itemIdOccupying: itemId,
  };
  emitStoreChange({ type: "transition:occupancy-changed", transitionId: id });
},
```

### Step 3: Add event types

In `packages/engine-core/src/game/events/types.ts`:

```typescript
export type GameEvent =
  // ... existing events
  | {
      type: "transition:triggered";
      transitionId: string;
      targetSceneId: string;
    }
  | {
      type: "transition:started";
      transitionId: string;
    }
  | {
      type: "transition:completed";
      fromSceneId: string;
      toSceneId: string;
    };
```

### Step 4: Add command types

In `packages/engine-core/src/game/commands/types.ts`:

```typescript
export type GameCommand =
  // ... existing commands
  | {
      type: "transition:activate";
      transitionId: string;
    }
  | {
      type: "transition:cancel";
      transitionId: string;
    };
```

### Step 5: Update CommandHandler (if needed)

In `packages/engine-core/src/game/commands/CommandHandler.ts`, ensure the handler can process the new commands (no-op for now; actual logic in task 04).

### Step 6: Tests

Create `packages/engine-core/__tests__/transitionState.test.ts`:

```typescript
describe("Transition State Management", () => {
  let sceneStore: GameSceneStore;

  beforeEach(() => {
    sceneStore = createSceneStore();
  });

  it("should initialize transition state", () => {
    sceneStore.setScene("test-scene", {
      id: "test-scene",
      label: "Test",
      background: "/bg.jpg",
      playerSpawn: [0, 0, 0],
      ground: { minX: 0, maxX: 10, minZ: 0, maxZ: 10, y: -1 },
      walls: [],
      interactions: [],
      transitions: [
        { id: "exit-1", kind: "collision", targetSceneId: "other", /* ... */ },
      ],
    });
    
    sceneStore.setTransitionAvailable("exit-1", true);
    expect(sceneStore.transitionStates["exit-1"].isAvailable).toBe(true);
  });

  it("should set item occupying a transition", () => {
    sceneStore.setTransitionItemOccupying("room-unlock", "key");
    expect(sceneStore.transitionStates["room-unlock"].itemIdOccupying).toBe("key");
    
    sceneStore.setTransitionItemOccupying("room-unlock", undefined);
    expect(sceneStore.transitionStates["room-unlock"].itemIdOccupying).toBeUndefined();
  });
});
```

### Step 7: Validation

Run:

```bash
cd packages/engine-core && npm test
cd packages/engine-core && npm run build
```

---

## 📚 References

- `docs/phases/phase-8-scene-transitions/README.md` — Design section 2
- `packages/engine-core/src/game/state/sceneStore.ts` — Store pattern
- `packages/engine-core/src/game/events/types.ts` — Event definitions
