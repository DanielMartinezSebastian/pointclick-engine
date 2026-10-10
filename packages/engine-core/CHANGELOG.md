# Changelog

All notable changes to `@pointclick-engine/engine-core` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.5.0] — Unreleased

Phase 16: the game runtime moves into this package. `createGameRuntime` and
the content registries no longer live in the demo app.

### Added — Agnostic runtime (`src/game/runtime/`)

- `createGameRuntime`, `getGameRuntime`, `getGameState`, `getGameActions`,
  `registerScene`, `registerItem`, `registerRule`, `toRuntimeScene`,
  `createInventoryRuleContext`, plus the config types (`GameSceneConfig`,
  `GameItemConfig`, `GameRuntimeConfig`, `GameRuntime`, `GameState`,
  `GameActions`, `InventoryUIAdapter`, `DialogUIAdapter`, ...).
- `GameSceneConfig` keeps `transitions` and `music` through registration
  and `scene:set`.
- `scene:set` accepts `spawnPosition?`.
- `player:stop` executor: aborts route walks (emits `player:walkAborted`);
  it does not stop manual keyboard/joystick movement.

### Added — Stores and persistence

- `useDialogStore`, `useInventoryUiStore` (used by `dialog:*` and
  `inventory:toggle` when no host adapter is passed), `useInventoryStateStore`
  and `usePlacedItemsStateStore` (reactive slots and placed items).
- Port-based persistence in `gameStatePersistence.ts`: `KeyValueStoragePort`,
  `loadInventorySlotsState` / `saveInventorySlotsState`,
  `loadPlacedItemsState` / `savePlacedItemsState`.
- Declarative audio: item `pickupSoundUrl` / `dropSoundUrl` and scene
  `music` are resolved by `audioRules` from `item:pickedUp` / `item:dropped`.
- Test `coreAgnosticism.test.ts`; `process.env` access is guarded.

### Changed

- `transition:activate` respects the transition's `spawnPosition`.
- Default dialog-key fallbacks in the core inventory rules use `??`
  instead of `||`: an explicit empty key is now respected.
- `GameActions.setScene` is `(sceneId: string) => void`.
- Audio rules play the drop sound only for `outcome: "place"`.

### Breaking

- Picking up an item travels on the bus as `item:pickedUp`; it used to
  arrive as `item:dropped` with `outcome: "pickup-success"`. Listeners that
  detected pick-ups on `item:dropped` must listen to `item:pickedUp`. The
  legacy `onRuntimeEvent` callback is unchanged.

### Fixed

- Test files are no longer shipped in the published package.

### Known limitations

- `inventory:pickup` and `inventory:drop` have no executor (they only warn).
- Scene/item/rule registries are module-global.
- Other legacy outcomes (`rule-miss`, `on-player`, `pickup-blocked`,
  `item-interact`, `unknown-item`) still travel as `item:dropped` with an
  `outcome` outside the declared type.

## [0.4.0] — 2026-05-31

This release folds in everything between v0.1.x and v0.4.0 (phases 6, 8, 9,
10, 11, 12, 13). Pure additions — no breaking changes for the public surface.

### Added — Walls with openings (Phase 6)

- Wall type extended with `openings: { start, end }[]`; pathfinding respects
  the gaps and produces traversable holes through wall segments.

### Added — Scene transitions as first-class primitives (Phase 8)

- `GameSceneTransition` union with three variants: `kind: "onCollide"`,
  `kind: "onItemDrop"`, `kind: "onItemInteraction"`.
- Helpers `canTransitionBeTriggered`, `resolveTransitionFromItemDrop`,
  and a transition state slice on `sceneStore` (`setScene` clones
  transitions, `updateTransition` / `addTransition` / `removeTransition`).
- Commands and events for scene change requests + transition triggers.

### Added — Placed items in core (Phase 9)

- Agnostic `placedItemsStore` + dialog keys so renderers can drop items
  into a scene and pick them back up without owning the data model.
- Unified placed-item types between authoring (scene config) and runtime.

### Added — Scene entry positions + player walk lifecycle (Phase 10)

- Scene transitions carry `entryPosition` (spawn + target) so cross-scene
  arrivals can animate the player into place.
- New `player:walkTo` command, `playerWalkingState` slice, and
  `player:walkStarted` / `player:walkEnded` events for renderer-side
  pathwalk animations.
- Position validation utilities for `GameVec3`.

### Added — Audio system (Phase 11)

- Types: `SoundDefinition`, `SceneMusicConfig`, `AudioSettings`.
- `AudioPort` interface + `HeadlessAudioAdapter` for tests / SSR.
- `audioSettingsStore` with persistence helpers (mute, volumes).
- `audioRules` processor that translates `GameEvent`s (pickup, drop,
  scene change, dialog) into audio commands.
- New commands and events in the audio namespace.

### Changed — Architecture cleanup (Phase 12)

- Stricter core agnosticism: no `window` / `document` references, no
  framework imports from `engine-core`. Library boundaries verified by
  `sceneStoreAgnosticism` tests.

### Added — i18n / Localization System (Phase 13)

- Core types: `Locale` (BCP-47 string), `DialogEntry`, `DialogDictionary`,
  `LocaleDictionaries`, `I18nConfig`, `I18nState`, `DEFAULT_I18N_CONFIG`.
- New port `I18nPort` (`detectLocale` / `persistLocale` / `clearLocale?`)
  with `HeadlessI18nAdapter` for tests and SSR.
- `i18nStore` with `createI18nStore`, `getI18nStore`, `resetI18nStore`,
  `subscribeI18n`, `setI18nStoreEmitter`, and `bindPort(port)` for one-line
  detect + persist wiring.
- Dictionary registry: `registerDictionary`, `registerDictionaries`,
  `getDictionary`, `clearRegistry`, `getRegisteredLocales`. Incremental
  merge with collision warning.
- Translator: `translate(key, { vars, locale })`, `getRandomPhrase(key,
  { vars, locale, random })` with active → fallback → key fallback chain
  and `{{var}}` interpolation. `matchLocale(candidate, available)` BCP-47
  negotiation.
- Commands: `i18n:setLocale`, `i18n:registerDictionary`.
- Events: `i18n:localeChanged`, `i18n:dictionaryUpdated`.
- `registerI18nExecutors(handler, emit?)` wires both commands against a
  `CommandHandler`.
- 48 new tests (store / registry / translator / headless adapter / executors).

### Changed

- `Locale` is now `string` (BCP-47) instead of a fixed union. The demo
  keeps a narrowed `DemoLocale = "es" | "en"` alias for authoring.

### Backward compatibility

- Pure additions — no breaking changes. Existing consumers continue to work.

## [0.1.0] — 2026-05-27

### Added

- Initial release.
- Framework-agnostic core: no React, no Three.js, no browser globals.
- **State**: `useSceneStore` (Zustand) — scene, player position, interactions, respawn.
- **Types**: `GameVec3`, `GameScene`, `GameSceneWall`, `GameSceneInteraction`, `GameSceneGround`.
- **Commands**: `CommandHandler`, `GameCommand` union (`scene:set`, `scene:respawn`, `player:stop`, `inventory:toggle`, `inventory:pickup`, `inventory:drop`, `dialog:trigger`, `dialog:dismiss`).
- **Events**: `EventBus`, `GameEvent` union (`scene:changed`, `player:moved`, `dialog:triggered`, `dialog:dismissed`).
- **Ports**: `IGameLoopPort`, `IInputPort`, `IViewportPort` — agnostic renderer interfaces.
- **Logic**: `findPath` grid-based pathfinding, inventory interaction rules.
- **Subpath exports**: `/commands`, `/events`, `/ports`, `/types`, `/state`.

### Notes

- API subject to change in v0.2+.
- Commands `player:stop`, `inventory:pickup`, `inventory:drop` are registered but executors are deferred to v0.2.0 (require renderer-side integration).
