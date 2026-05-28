# Phase 7 — Walls + openings as first-class engine primitives

**Status**: planned — not started.
**Owner**: TBD.
**Predecessors**: phase 6 (walls with openings shipped as data-only).

---

## Why

The current door / window / hole story is split across layers:

- **engine-core** knows about `GameSceneWall.openings[]` but only as a
  geometry hole — no door / window concept, no open/closed state.
- **engine-renderer-r3f** renders a wall plane + child segment colliders
  computed from the openings, but has no idea what a door is.
- **apps/web-demo** owns *everything* about doors: the type definition,
  the open/closed store, the texture swap, the click-area collider, the
  bridge that turns `item:dropped` events into door state changes, the
  pathfinding click redirect when a door is closed.

That works for one app, but every new game built on the engine would
have to reimplement the demo's door pipeline by hand. Phase 7 promotes
**walls with holes, doors and windows** to first-class primitives that
ship with the engine — declarative data + automatic runtime behaviour +
ready-made R3F rendering — so the next consumer can write

```ts
walls: [
  wallWithDoor({
    position: [0, 0, 3],
    halfSize: [3, 4, 0.5],
    door: {
      id: "dungeon-gate-door",
      requiresItemId: "gold-key",
      closedWallTextureUrl: "/assets/walldoor/closed.png",
      openWallTextureUrl: "/assets/walldoor/open.png",
      hintDialogKeys: { closed: "dungeon.door.locked" },
    },
  }),
];
```

and have everything else (state, events, collisions, pathfinding,
texture swap, click pipeline) wired up by the engine.

---

## Design

### 1. Polymorphic opening type (engine-core)

`GameSceneWallOpening` becomes a discriminated union:

```ts
export type GameSceneWallOpening =
  | GameSceneWallOpeningHole
  | GameSceneWallOpeningDoor
  | GameSceneWallOpeningWindow;

interface BaseOpening {
  id: string;
  position: GameVec3;   // wall-local
  halfSize: GameVec3;
}

interface GameSceneWallOpeningHole extends BaseOpening {
  kind: "hole";
}

interface GameSceneWallOpeningDoor extends BaseOpening {
  kind: "door";
  /** Initial state. Default "closed". */
  defaultState?: "open" | "closed";
  /** Item id that unlocks via the existing inventory drop pipeline. */
  requiresItemId?: string;
  /** Optional override of the parent wall's textureUrl per door state. */
  closedWallTextureUrl?: string;
  openWallTextureUrl?: string;
  /** Hint dialog keys by door state. Default hides hints when open. */
  hintDialogKeys?: { closed?: DialogKey; open?: DialogKey };
  showHintWhenOpen?: boolean;
}

interface GameSceneWallOpeningWindow extends BaseOpening {
  kind: "window";
  /** Stays blocking for physics. Default true. */
  blocksTraversal?: boolean;
  /** Optional decoration plane (glass, bars). */
  decorationTextureUrl?: string;
}
```

### 2. State + events + commands (engine-core)

```ts
// sceneStore
openingStates: Record<openingId, { isOpen: boolean }>;
setOpeningOpen: (id: string, isOpen: boolean) => void;
isOpeningOpen: (id: string) => boolean;

// GameEvent additions
| { type: "opening:opened"; openingId: string }
| { type: "opening:closed"; openingId: string }

// GameCommand addition
| { type: "opening:setState"; openingId: string; isOpen: boolean }
```

### 3. Automatic item → door resolution (engine-core)

The motor already has `ItemDefinition.interactionRules` with
`outcome: "consume"`. We add a tiny rule shim: when an item rule
resolves with outcome `consume` AND the interactionId matches an
opening of kind `door` whose `requiresItemId === item.id`, the engine
automatically calls `setOpeningOpen(openingId, true)` and emits the
event. The demo's `useDoorSystem` bridge collapses to ~10 lines of
wiring or disappears entirely.

### 4. Renderer (engine-renderer-r3f)

`SceneWalls` learns the opening kinds:

- `hole`  → carve segments (current behaviour).
- `door`  → subscribe to `openingStates[id]`. Render the parent wall
            plane with `openWallTextureUrl` when open / `closedWallTextureUrl`
            when closed. Add a `CuboidCollider` in the opening area when
            closed. Click on the opening area dispatches
            `executeCommand({ type: "opening:setState", openingId, isOpen: true })`.
- `window`→ carve segments + render decoration plane + add
            `CuboidCollider` if `blocksTraversal`.

The renderer is the *only* place that talks to R3F / Rapier — the rest
of the pipeline is framework-agnostic.

### 5. Ergonomic helpers (engine-core)

```ts
export function solidWall(opts): GameSceneWall;
export function wallWithHole(opts): GameSceneWall;
export function wallWithDoor(opts): GameSceneWall;
export function wallWithWindow(opts): GameSceneWall;
```

These compose into a wall with mixed openings (e.g. door + window).

### 6. Demo migration

Once the above lands, the demo loses:

- `apps/web-demo/app/components/scene/SceneDoors.tsx`
- `apps/web-demo/app/store/doorStore.ts`
- `apps/web-demo/app/lib/engine/runtime/useDoorSystem.ts`
- `SceneDoor` type in `demo-content/scenes/scenes.ts`
- The `invisible` flag on drop-targets (replaced by opening kind).

The dungeon scene gets rewritten using `wallWithDoor({...})`.

---

## Effort estimate

| Sub-phase | Files | LOC delta | Risk |
|---|---|---|---|
| 7.1 Types + helpers in core | `engine-core/types`, `engine-core/index` | +200 / -30 | low |
| 7.2 State + events + commands in core | `sceneStore`, `events/types`, `commands/types` | +150 / -10 | medium |
| 7.3 Automatic item→door resolution | `inventoryRules` or new `doorRules` | +80 | medium |
| 7.4 Renderer doors + windows | `engine-renderer-r3f/.../scene/*` | +300 / -50 | medium |
| 7.5 Migrate dungeon + cleanup demo | `apps/web-demo` | +80 / -250 | low |
| Tests | `__tests__/openings.test.ts`, `__tests__/doorRules.test.ts` | +150 | low |
| **Total** | | **~1000 net** | |

---

## Open questions

1. **Sequence**: do we keep `phase 6`-style numeric tasks (`tasks/01-*.md`,
   `02-*.md`...) or rather one giant task split into PRs?
2. **Door visuals**: should the engine ship a generic door sprite swap,
   or stay textures-on-wall-plane only? (Current demo uses the latter.)
3. **Multi-key doors**: do we want `requiresItemIds: string[]` (any/all)
   from day one, or land single-key first?
4. **Persistence**: should `openingStates` survive scene switches? Two
   choices: scoped by scene (reset on `setScene`), or global by id.
5. **Window decoration**: billboard like `SceneWallPlane`, or a
   non-billboard quad with a normal facing into the room? Affects
   parallax at low camera angles.

---

## Out of scope (phase 8+)

- Animated doors (slide / swing). Phase 7 keeps the binary swap.
- Doors with HP / destructibility.
- Lock-picking minigames or alternate unlock sources beyond `requiresItemId`.
- Sound effects (handled by a future audio adapter).
