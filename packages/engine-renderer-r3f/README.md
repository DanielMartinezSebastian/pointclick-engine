# @pointclick-engine/engine-renderer-r3f

React Three Fiber renderer for the [Point & Click Game Engine](https://www.npmjs.com/package/@pointclick-engine/engine-core). Provides `GameViewport`: a playable game in one component.

## Install

```bash
npm install @pointclick-engine/engine-renderer-r3f @pointclick-engine/engine-core
```

Peer dependencies (install in your app):

```bash
npm install react react-dom three @react-three/fiber @react-three/drei @react-three/rapier zustand
```

Supported ranges: React 18/19 · Three ≥0.150 · R3F 8/9 · Drei 9/10 · Rapier 1/2 · Zustand 4/5.

## Quick start

The runtime comes from `engine-core`; the viewport from this package. Create the runtime once, mount the viewport when it exists (`GameViewport` is client-only).

```tsx
"use client";

import { useEffect, useState } from "react";
import {
  createGameRuntime,
  type GameRuntime,
  type GameSceneConfig,
} from "@pointclick-engine/engine-core";
import { GameViewport } from "@pointclick-engine/engine-renderer-r3f";

const TOWN: GameSceneConfig = {
  id: "town",
  label: "Town",
  background: "/assets/background/town.jpg",
  playerSpawn: [0, 0, 10],
  ground: { minX: -15, maxX: 15, minZ: -10, maxZ: 30, y: -3 },
  walls: [],
  interactions: [],
};

export default function Game() {
  const [runtime, setRuntime] = useState<GameRuntime | null>(null);

  useEffect(() => {
    const created = createGameRuntime({ scenes: [TOWN] });
    setRuntime(created);
    return () => {
      created.dispose();
      setRuntime(null);
    };
  }, []);

  if (!runtime) return null;
  return <GameViewport runtime={runtime} initialSceneId="town" />;
}
```

With the defaults the game is playable: built-in character, inventory, item pick-up/placing and scene transitions. No persistence and no audio unless you pass `storage` / `audio`. A complete example that imports only from the packages: `apps/web-demo/app/example-minimal/page.tsx` in the monorepo. Option groups: [consumption guide](https://github.com/DanielMartinezSebastian/pointclick-engine/blob/main/docs/LIBRARY_CONSUMPTION_GUIDE.md).

Need your own UI around the game state? Use `useGameViewportController` + `GameViewportView` instead of `GameViewport`.

## i18n / Localization

`useI18n`, `useLocaleDetection`, `I18nProvider` and `LocaleSwitcher` are exported from the root entry point. Dictionaries are registered with `registerDictionary` from `engine-core`. Next.js recipes: [`docs/integrations/nextjs-i18n.md`](https://github.com/DanielMartinezSebastian/pointclick-engine/blob/main/docs/integrations/nextjs-i18n.md).

## Subpath exports

```ts
// Port adapters (implement engine-core interfaces for R3F / browser)
import { useR3FGameLoop, WebKeyboardInput } from "@pointclick-engine/engine-renderer-r3f/adapters";

// React components (canvas, sprites, a subset of scene primitives)
import { GameCanvasCore, CharacterSprite, SceneGround } from "@pointclick-engine/engine-renderer-r3f/components";
```

`GameViewport`, the hooks and the i18n components are only in the root entry point.

## What this package provides

### Viewport

| Export | Description |
|--------|-------------|
| `GameViewport` | Playable game: controller + view with sensible defaults |
| `useGameViewportController` | Hook (no JSX) that runs the generic game hooks and returns what the view and your UI need |
| `GameViewportView` | Presentational view: Canvas, scene, character, items, fade curtain. Extend with `children`, `canvasChildren`, `overlay` |
| `GameCanvasCore` | Minimal R3F `Canvas` shell |
| `GameTouchSpriteRuntime` | Player movement runtime: click-to-move, touch, keyboard |

### Scene primitives

| Export | Description |
|--------|-------------|
| `SceneGround`, `SceneWalls`, `SceneWallPlane` | Ground and collidable walls |
| `SceneBackgroundPlane`, `CameraController`, `CameraFitHeight` | Background and fixed camera |
| `SceneTransitions` | Renders transition zones from `GameSceneTransition[]` |
| `SceneDropTargets`, `PlacedSceneItems` | Inventory drop targets and items placed in the scene |
| `computeWallSegments` | Pure function: converts walls → `WallSegment[]` |

### Sprite

| Export | Description |
|--------|-------------|
| `CharacterSprite` | Billboarded sprite driven by a `CharacterDefinition` (clips per direction, optional speaking clip) |
| `DavidSprite` | **Deprecated** — use `CharacterSprite` (also the `clips.ts` exports) |
| `SpeechBubble` | In-world speech bubble |

### Hooks

| Export | Description |
|--------|-------------|
| `useGameState`, `useGameActions` | Read `GameState` / get `GameActions` from React |
| `useSceneRuntime` | Scene seeding and optional scene-id persistence |
| `useTransitionSystem` | Scene transitions with fade and an optional `canLeaveScene` rule |
| `useInventoryRuntime` | Inventory drag/drop, pick-up, initial placed items, `onSceneEnter` |
| `useAudioSystem`, `attachAudioSystem` | Connect an `AudioPort` to runtime events (`attachAudioSystem` has no React) |
| `usePlayerWalkAnimation`, `useClickToMoveController` | Walk animation and ground-click movement |
| `useKeyboardMovementInput` | WASD / arrow-key input state |
| `useI18n`, `useLocaleDetection` | Translator access and locale detection |

### Port adapters

| Export | Description |
|--------|-------------|
| `useR3FGameLoop` | `GameLoopPort` implementation — delegates to R3F `useFrame` |
| `WebKeyboardInput` | `InputPort` implementation — browser `KeyboardEvent` listener |

### Narrative (0.6.0, unreleased)

| Export | Description |
|--------|-------------|
| `SceneHotspots`, `useHotspotInteractions`, `VerbMenu` | Clickable hotspots with a verb menu |
| `SceneNpcs`, `NpcSprite` | NPCs drawn as sprites; pass their characters in the `characters` prop of `GameViewport` |
| `DialogueChoices`, `useDialogue` | Conversation choices UI and its hook |

Other new `GameViewport` props: `verbMenu`, `dialogueChoices`, `noActionDialogKey`. The advanced callbacks `canLeaveScene`, `onSceneEnter` and `getInitialPlacedItems` keep working; prefer the declarative scene data. See the [authoring guide](https://github.com/DanielMartinezSebastian/pointclick-engine/blob/main/docs/authoring/README.md).

## Known limitations

- Doors are not part of the engine (the monorepo demo implements them).
- The scene/item registries live in `engine-core` and are module-global.

## License

MIT © Daniel Martínez Sebastián

## Status

`v0.5.0` — active development. R3F is currently the only supported renderer; the engine is renderer-agnostic by design.
