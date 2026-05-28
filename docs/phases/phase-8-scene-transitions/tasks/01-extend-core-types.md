# Task 01-extend-core-types

**Effort**: 1 day | **Blocks**: [02, 03, 04] | **Blocked by**: none

---

## 🎯 Objetivo

Define the polymorphic `GameSceneTransition` type and all three transition kinds in engine-core, with full JSDoc and examples. This is the foundation for all subsequent tasks.

---

## ✅ Success Criteria

- [ ] `GameSceneTransition` union type defined in `packages/engine-core/src/game/types/index.ts`
- [ ] Base interface `BaseSceneTransition` with shared fields
- [ ] Three discriminated union members:
  - `GameSceneTransitionOnCollision` (kind: "collision")
  - `GameSceneTransitionOnItemDrop` (kind: "item-drop")
  - `GameSceneTransitionOnItemConsume` (kind: "item-consume")
- [ ] All fields documented with JSDoc
- [ ] Export helper functions:
  - `sceneTransitionOnCollision(opts): GameSceneTransitionOnCollision`
  - `sceneTransitionOnItemDrop(opts): GameSceneTransitionOnItemDrop`
  - `sceneTransitionOnItemConsume(opts): GameSceneTransitionOnItemConsume`
- [ ] `GameScene` type updated to include `transitions?: GameSceneTransition[]`
- [ ] TypeScript compiles without errors
- [ ] No React/R3F imports in core

---

## 📝 Instructions

### Step 1: Update `packages/engine-core/src/game/types/index.ts`

Add the base interface and three discriminated union types:

```typescript
export interface BaseSceneTransition {
  id: string;
  targetSceneId: string;
  position: GameVec3;
  halfSize: GameVec3;
  rotationY?: number;
  preTransitionDialogKey?: DialogKey;
  postTransitionDialogKey?: DialogKey;
}

export interface GameSceneTransitionOnCollision extends BaseSceneTransition {
  kind: "collision";
}

export interface GameSceneTransitionOnItemDrop extends BaseSceneTransition {
  kind: "item-drop";
  requiresItemId?: string;
  consumeItem?: boolean;
  hintDialogKeys?: { empty?: DialogKey; occupied?: DialogKey };
}

export interface GameSceneTransitionOnItemConsume extends BaseSceneTransition {
  kind: "item-consume";
  requiresItemId: string;
  preConsumptionDialogKey?: DialogKey;
}

export type GameSceneTransition =
  | GameSceneTransitionOnCollision
  | GameSceneTransitionOnItemDrop
  | GameSceneTransitionOnItemConsume;
```

### Step 2: Add helper functions

In `packages/engine-core/src/game/logic/` or a new `transitions.ts` file:

```typescript
export function sceneTransitionOnCollision(opts: {
  id: string;
  targetSceneId: string;
  position: GameVec3;
  halfSize: GameVec3;
  rotationY?: number;
  preTransitionDialogKey?: DialogKey;
  postTransitionDialogKey?: DialogKey;
}): GameSceneTransitionOnCollision {
  return {
    kind: "collision",
    ...opts,
  };
}

// Similar for sceneTransitionOnItemDrop and sceneTransitionOnItemConsume
```

### Step 3: Update GameScene

In `packages/engine-core/src/game/types/index.ts`, add to the GameScene interface:

```typescript
export interface GameScene {
  // ... existing fields
  transitions?: GameSceneTransition[];
}
```

### Step 4: Export from public API

Update `packages/engine-core/src/index.ts` to export:

```typescript
export type {
  GameSceneTransition,
  GameSceneTransitionOnCollision,
  GameSceneTransitionOnItemDrop,
  GameSceneTransitionOnItemConsume,
} from "./game/types/index";

export {
  sceneTransitionOnCollision,
  sceneTransitionOnItemDrop,
  sceneTransitionOnItemConsume,
} from "./game/logic/transitions";
```

### Step 5: Testing

Create `packages/engine-core/__tests__/transitionTypes.test.ts`:

```typescript
describe("Scene Transition Types", () => {
  it("should create a collision transition", () => {
    const t = sceneTransitionOnCollision({
      id: "exit-1",
      targetSceneId: "level-2",
      position: [0, 0, 0],
      halfSize: [1, 2, 1],
    });
    expect(t.kind).toBe("collision");
    expect(t.targetSceneId).toBe("level-2");
  });

  it("should create an item-drop transition", () => {
    const t = sceneTransitionOnItemDrop({
      id: "unlock-room",
      targetSceneId: "personal-room",
      position: [3, 0, 5],
      halfSize: [1, 1, 1],
      requiresItemId: "key",
      consumeItem: false,
    });
    expect(t.kind).toBe("item-drop");
    expect(t.consumeItem).toBe(false);
  });

  it("should allow transitions in scene definition", () => {
    const scene: GameScene = {
      id: "level-1",
      label: "Level 1",
      background: "/bg.jpg",
      playerSpawn: [0, 0, 0],
      ground: { minX: 0, maxX: 10, minZ: 0, maxZ: 10, y: -1 },
      walls: [],
      interactions: [],
      transitions: [
        sceneTransitionOnCollision({
          id: "exit",
          targetSceneId: "town",
          position: [8, 0, 5],
          halfSize: [1, 2, 1],
        }),
      ],
    };
    expect(scene.transitions).toHaveLength(1);
  });
});
```

### Step 6: Validation

Run:

```bash
cd packages/engine-core && npm run build
cd packages/engine-core && npm test
grep -r "from 'react'" src/ # Should return nothing
```

---

## 📚 References

- `docs/phases/phase-8-scene-transitions/README.md` — Design section 1
- `docs/architecture/03-rules-core-vs-render.md` — Where core types live
