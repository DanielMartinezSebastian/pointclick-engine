# Task 03-transition-rules-processor

**Effort**: 2 days | **Blocks**: [04] | **Blocked by**: [01, 02]

---

## 🎯 Objetivo

Implement the rules processor that automatically converts item-drop interactions into transition triggers, handling item consumption, state updates, and event emission.

---

## ✅ Success Criteria

- [ ] `transitionRules.ts` created with rule processor
- [ ] Listens for `item:dropped` events with outcome="place" or "consume"
- [ ] Matches `interactionId` against transitions of kind "item-drop"
- [ ] Updates `transitionStates[id].itemIdOccupying` when item placed
- [ ] Emits `transition:triggered` when conditions are met
- [ ] Consumes item from inventory if `consumeItem: true`
- [ ] Handles pre-transition dialogs
- [ ] Tests cover: matching, consumption, no-match scenarios
- [ ] All tests pass

---

## 📝 Instructions

### Step 1: Create transitionRules processor

In `packages/engine-core/src/game/logic/rules/transitionRules.ts`:

```typescript
import { GameSceneStore } from "../state/sceneStore";
import { GameEvent } from "../events/types";
import { GameSceneTransition } from "../types/index";

export function processTransitionRules(
  sceneStore: GameSceneStore,
  event: GameEvent
): void {
  if (event.type !== "item:dropped") {
    return;
  }

  // Get current scene transitions
  const currentScene = sceneStore.getCurrentScene();
  if (!currentScene?.transitions) {
    return;
  }

  // Find matching transition (must be kind: "item-drop")
  const matching = currentScene.transitions.find(
    (t): t is GameSceneTransitionOnItemDrop =>
      t.kind === "item-drop" &&
      t.id === event.interactionId &&
      (!t.requiresItemId || t.requiresItemId === event.itemId)
  );

  if (!matching) {
    return;
  }

  // Update occupancy
  if (event.outcome === "place") {
    sceneStore.setTransitionItemOccupying(matching.id, event.itemId);
  } else if (event.outcome === "consume") {
    sceneStore.setTransitionItemOccupying(matching.id, event.itemId);
    if (matching.consumeItem) {
      sceneStore.removeItemFromInventory(event.itemId);
    }
  }

  // Emit triggered event
  sceneStore.emit({
    type: "transition:triggered",
    transitionId: matching.id,
    targetSceneId: matching.targetSceneId,
  });
}
```

### Step 2: Integrate into RuntimeRuleProcessor

In `packages/engine-core/src/game/logic/rules/index.ts`:

Add transitionRules to the rule processor chain:

```typescript
import { processTransitionRules } from "./transitionRules";

export function applyGameRules(
  sceneStore: GameSceneStore,
  event: GameEvent
): void {
  processInventoryRules(sceneStore, event);
  processTransitionRules(sceneStore, event);  // NEW
}
```

### Step 3: Add helper to sceneStore

In `packages/engine-core/src/game/state/sceneStore.ts`:

```typescript
removeItemFromInventory(itemId: string): void {
  const inventory = this.inventory.filter((item) => item.id !== itemId);
  this.inventory = inventory;
  emitStoreChange({ type: "inventory:changed" });
}
```

### Step 4: Tests

Create `packages/engine-core/__tests__/transitionRules.test.ts`:

```typescript
describe("Transition Rules", () => {
  let sceneStore: GameSceneStore;
  let emissions: GameEvent[] = [];

  beforeEach(() => {
    sceneStore = createSceneStore();
    sceneStore.on("*", (event) => emissions.push(event));
    
    const scene: GameScene = {
      id: "test",
      label: "Test",
      background: "/bg.jpg",
      playerSpawn: [0, 0, 0],
      ground: { minX: 0, maxX: 10, minZ: 0, maxZ: 10, y: -1 },
      walls: [],
      interactions: [],
      transitions: [
        sceneTransitionOnItemDrop({
          id: "unlock-room",
          targetSceneId: "personal-room",
          position: [5, 0, 5],
          halfSize: [1, 1, 1],
          requiresItemId: "key",
          consumeItem: true,
        }),
      ],
    };
    sceneStore.setScene("test", scene);
  });

  it("should emit transition:triggered on item drop match", () => {
    sceneStore.addItemToInventory({ id: "key-1", itemId: "key" });
    
    processTransitionRules(sceneStore, {
      type: "item:dropped",
      interactionId: "unlock-room",
      itemId: "key",
      outcome: "consume",
    });

    expect(emissions).toContainEqual({
      type: "transition:triggered",
      transitionId: "unlock-room",
      targetSceneId: "personal-room",
    });
  });

  it("should consume item if consumeItem: true", () => {
    sceneStore.addItemToInventory({ id: "key-1", itemId: "key" });
    expect(sceneStore.inventory).toHaveLength(1);

    processTransitionRules(sceneStore, {
      type: "item:dropped",
      interactionId: "unlock-room",
      itemId: "key",
      outcome: "consume",
    });

    expect(sceneStore.inventory).toHaveLength(0);
  });

  it("should not trigger if item id doesn't match", () => {
    processTransitionRules(sceneStore, {
      type: "item:dropped",
      interactionId: "unlock-room",
      itemId: "wrong-key",
      outcome: "consume",
    });

    expect(emissions).not.toContainEqual(
      expect.objectContaining({ type: "transition:triggered" })
    );
  });
});
```

### Step 5: Validation

Run:

```bash
cd packages/engine-core && npm test -- transitionRules
cd packages/engine-core && npm run build
```

---

## 📚 References

- `docs/phases/phase-8-scene-transitions/README.md` — Design section 3
- `packages/engine-core/src/game/logic/rules/inventoryRules.ts` — Similar pattern
