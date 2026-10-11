# Changelog

All notable changes to `@pointclick-engine/engine-renderer-r3f` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.6.0] — Unreleased

Phase 17: narrative primitives in the viewport. Requires
`@pointclick-engine/engine-core` ^0.6.0. Additive over 0.5.0. Guide:
[`docs/authoring/`](../../docs/authoring/README.md).

### Added — Hotspots, NPCs and conversations

- Clickable hotspots: `SceneHotspots`, `useHotspotInteractions`,
  `useVisibleHotspots`, `VerbMenu` (a single applicable verb runs on click,
  several open the menu), item drops onto hotspots, and the engine texts
  `ensureEngineTexts`, `ENGINE_VERB_LABEL_KEYS`, `ENGINE_NO_ACTION_KEY`
  (Spanish and English defaults the host can override).
- NPCs: `SceneNpcs`, `useVisibleNpcs`, `NpcSprite`, `selectNpcAnimation`,
  `spriteScaleAtDepth`; the speech bubble goes over the NPC whose `id` matches
  the line `speaker`. `GameSceneNpc.clickBox` adjusts the clickable box.
- Conversations: `DialogueChoices` (keyboard: arrows, Enter/Space, 1-9) and
  `useDialogue`.
- New `GameViewport` / `GameViewportView` props: `characters` (character
  definitions by `characterId`), `verbMenu`, `noActionDialogKey`,
  `dialogueChoices`. The controller also returns `speechSpeaker`, `dialogue`,
  `dialogueChoicesVisible`, `speechPersistent` and `onSpeechTypingDone`.
- The renderer applies the declarative scene rules with the pure core
  functions: `initialItems` when seeding, `onEnter` on entering a scene, and
  `when` / `blocked` before a transition.
- Path walks emit `player:walkCompleted` and `player:walkAborted`.

### Changed

- Closing the speech bubble goes through the `dialog:dismiss` command, so
  `dialog:dismissed` is emitted (scripts waiting on a `say` rely on it).

### Fixed

- The walk clip no longer flickers between directions.

### Deprecated

- `canLeaveScene`, `onSceneEnter` and `getInitialPlacedItems` are not removed:
  they stay as an advanced path and are evaluated after the declarative rules.
  Prefer `transition.when` / `blocked`, `onEnter` and `initialItems`.

## [0.5.0] — Unreleased

Phase 16: the playable game composition moves into this package. The demo
becomes a consumer. Requires `@pointclick-engine/engine-core` ^0.5.0.

### Added — Playable `GameViewport`

- `GameViewport` works with defaults: uses the active runtime
  (`getGameRuntime()`), built-in character, inventory and transitions.
  Optional props: `initialSceneId`, `storage`, `resolveScene`,
  `canLeaveScene`, `getPhrase`, `getInitialPlacedItems`, `onSceneEnter`,
  `itemContext`, `audio`, `filterPlacedItems`, `startPersistence`,
  `character`, `cameraMode`, `spriteRuntimeProps`, `canPickupItems`,
  `canvasChildren`, `children`, `overlay`, `onSceneReady`, `debug`,
  `onRuntimeEvent`.
- `useGameViewportController` + `GameViewportView`: the two halves of
  `GameViewport`, for hosts that need the controller in their own UI.
- Hooks: `useSceneRuntime`, `useTransitionSystem`, `useInventoryRuntime`,
  `useGameState`, `useGameActions`; `attachAudioSystem` (no React) behind
  `useAudioSystem`.
- `CharacterSprite`, `CharacterDefinition`, `CharacterClip`,
  `CharacterDirection` and helpers (`buildFrameUrls`, `selectClip`,
  `resolveCharacterSprites`, `listCharacterAnimations`, `toSpriteAnimation`).
- Scene components moved from the demo:
  `SceneBackgroundPlane`, `CameraController`, `CameraFitHeight`,
  `SceneDropTargets`, `PlacedSceneItems`.

### Changed

- `useGameState` / `useGameActions` are implemented here and re-exported by
  the demo's `publicApi.ts`.
- Picking up an item is emitted as `item:pickedUp` (see Breaking); the audio
  bridge plays the drop sound only for `outcome: "place"`.

- The loose physics test sphere is no longer rendered by default. Enable it
  with the `collisionSphere` prop of `GameTouchSpriteRuntime` (or
  `spriteRuntimeProps.collisionSphere` on the viewport) and pass your own
  `textureUrl`; the package no longer requests `/globe.svg` from the host.
- Items returned by `getInitialPlacedItems` without `sceneId` are assigned to
  the scene being seeded.

### Fixed

- Peer range for `three` was `^0.150.0`, which only matched 0.150.x and made
  the package uninstallable next to current three releases. Now `>=0.150.0`.
- Test files are no longer shipped in the published package.

### Deprecated

- `DavidSprite` / `DavidSpriteHandle`: use `CharacterSprite` /
  `CharacterSpriteHandle`.
- The exports of `sprite/clips.ts`: pass a `CharacterDefinition` via the
  `character` prop (speaking clip: `CharacterDefinition.speaking`).

### Breaking

- Behavior (from `engine-core` 0.5.0): pick-ups arrive as `item:pickedUp`,
  no longer as `item:dropped` with `outcome: "pickup-success"`. Listeners on
  the runtime bus must be updated.

### Known limitations

- Doors are not an engine primitive (the demo implements them).
- Registries are module-global (one game per page).
- The default character has no bundled assets: without a `character` prop the
  host must serve the frames under `/assets/sprites/david/`.

## [0.4.0] — 2026-05-31

This release folds in everything between v0.1.x and v0.4.0 (phases 6, 8, 9,
10, 11, 12, 13). Pure additions — no breaking changes for the public surface.

### Added — Wall renderer with openings (Phase 6)

- `SceneWalls` now renders true 3D wall segments with visible cuts at
  each opening; sensible default opening positions and editor support.

### Added — Scene transition renderer (Phase 8)

- `SceneTransitions` component handles collision-zone detection and
  triggers transitions via the core handlers (cached empty-transitions
  array prevents infinite loops).

### Added — Player walk animation (Phase 10)

- `usePlayerWalkAnimation` hook reacts to `player:walkTo` / walk
  events from core and drives sprite movement; input is blocked during
  the walk and animation runs on entry-position arrivals.

### Added — Audio system R3F bridge (Phase 11)

- `useAudioSystem` hook wires `GameEvent`s to an `AudioPort` adapter
  (default = web), syncs mute / volume state, and applies persisted
  settings on load.

### Changed — Architecture cleanup (Phase 12)

- Renderer no longer leaks into core; pulled debug logs; `GameCanvasCore`
  added as the headless variant for hosts that supply their own Canvas.

### Added — i18n React surface (Phase 13)

- `useI18n()` → `{ locale, availableLocales, setLocale, t, getPhrase }`.
  Re-renders the consumer when the locale changes.
- `useLocaleDetection({ port, config? })`: mount-time bridge that calls
  `store.bindPort(port)` once. Accepts partial config overrides.
- `<I18nProvider config={...}>`: optional config-reset wrapper, useful
  for tests and Storybook.
- `<LocaleSwitcher />`: drop-in language picker with three modes —
  `as="buttons"` (default), `as="select"`, and `renderOption` render-prop.
  Accessible (`aria-current`, group `aria-label`).

### Changed

- `GameTouchSpriteRuntime.getPhrase` deprecated. The prop was already
  unused inside the runtime (the host resolves boundary phrases from
  `onCollide` events). Hosts should drop the DI and rely on `useI18n`
  or `getRandomPhrase` from `@pointclick-engine/engine-core`. Kept as a
  no-op for backward compat.

### Backward compatibility

- Pure additions — no breaking changes.

## [0.1.0] — 2026-05-27

### Added

- Initial release.
- **`GameViewport`**: main React component composing Canvas, physics (Rapier), and R3F runtime.
- **`createGameRuntime`**: factory that registers scenes, items, and dialog rules; returns a bidirectional handle with `executeCommand`, `on`, `emit`, and `dispose`.
- **Adapters**:
  - `useR3FGameLoop` — `IGameLoopPort` implementation using `useFrame` from `@react-three/fiber`.
  - `WebKeyboardInput` — `IInputPort` implementation for keyboard events.
- **Sprite system**: `DavidSprite` with 2.5D depth scale, directional animation clips, speaking animation.
- **Scene primitives**: `SceneGround`, `SceneWalls`, `SceneCollisionSphere`, `SceneWallPointPreview`.
- **`GameTouchSpriteRuntime`**: player click-to-move controller (mouse, touch, keyboard, joystick).
- **`SpeechBubble`**: in-world dialog display component.
- **Subpath exports**: `/adapters`, `/components`.
- Backwards-compatible `onRuntimeEvent` callback via legacy adapter.

### Notes

- Requires peer dependencies: `react`, `react-dom`, `three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/rapier`, `zustand`.
- API subject to change in v0.2+.
