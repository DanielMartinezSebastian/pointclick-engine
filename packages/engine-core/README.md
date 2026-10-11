# @pointclick-engine/engine-core

Framework-agnostic core for the Point & Click Game Engine. Runtime, state, rules, pathfinding, i18n, ports — zero React, zero Three.js, zero browser globals.

## Install

```bash
npm install @pointclick-engine/engine-core
```

This package alone is **not** a visible game: it holds the runtime (`createGameRuntime`) but draws nothing. Pair it with a renderer:

- [@pointclick-engine/engine-renderer-r3f](https://www.npmjs.com/package/@pointclick-engine/engine-renderer-r3f) — React Three Fiber (`GameViewport`)
- Or write your own (see [renderer guide](https://github.com/DanielMartinezSebastian/pointclick-engine/blob/main/docs/architecture/06-renderer-implementation-guide.md))

## Quick example

Runs without React or a browser: register content, send commands, listen to events.

```ts
import {
  createGameRuntime,
  type GameItemConfig,
  type GameSceneConfig,
} from "@pointclick-engine/engine-core";

const town: GameSceneConfig = {
  id: "town",
  label: "Town",
  background: "/assets/background/town.jpg",
  playerSpawn: [0, 0, 10],
  ground: { minX: -15, maxX: 15, minZ: -10, maxZ: 30, y: -3 },
  walls: [],
  interactions: [],
};

const trophy: GameItemConfig = {
  id: "trophy",
  name: "Trophy",
  spriteUrl: "/assets/trophy/trophy.png",
  interactionRules: {},
  defaultRule: { outcome: "return" },
};

const runtime = createGameRuntime({ scenes: [town], items: [trophy] });

const unsub = runtime.on("scene:changed", (ev) => console.log(ev.sceneId));
runtime.executeCommand({ type: "scene:set", sceneId: "town" });

// later
unsub();
runtime.dispose();
```

`scene:set` also accepts `spawnPosition?`. `player:stop` aborts route walks (not manual keyboard/joystick movement). `inventory:pickup` and `inventory:drop` have no executor yet.

### i18n

```ts
import {
  registerDictionary,
  translate,
  getRandomPhrase,
} from "@pointclick-engine/engine-core";

registerDictionary("en", { "greeting.hello": { phrases: ["Hello!", "Hey there!"] } });
registerDictionary("es", { "greeting.hello": { phrases: ["¡Hola!", "¡Buenas!"] } });

translate("greeting.hello", { locale: "es" });      // first phrase of the entry
getRandomPhrase("greeting.hello", { locale: "en" }); // random pick
```

## Subpath exports

Import only what you need:

```ts
import type { GameCommand }  from "@pointclick-engine/engine-core/commands";
import type { GameEvent }    from "@pointclick-engine/engine-core/events";
import type { GameLoopPort } from "@pointclick-engine/engine-core/ports";
import type { GameVec3 }     from "@pointclick-engine/engine-core/types";
import { useSceneStore }     from "@pointclick-engine/engine-core/state";
import { createPlaythrough } from "@pointclick-engine/engine-core/testing"; // headless playthroughs (0.6.0, unreleased)
```

## What's inside

| Module        | Key exports |
|---------------|-------------|
| `(root)`      | Re-exports all modules below, plus the runtime and `EventBus` |
| `/commands`   | `CommandHandler`, `GameCommand` union |
| `/events`     | `GameEvent` union, `GameEventHandler`, legacy adapters |
| `/ports`      | `GameLoopPort`, `InputPort`, `ViewportPort`, `AudioPort`, `I18nPort` and headless adapters |
| `/types`      | `GameVec3`, `GameScene`, `GameSceneWall`, `GameSceneInteraction`, `GameSceneTransition`, `PlacedSceneItem`, `ItemDefinition`, `SoundDefinition`, `SceneMusicConfig`, `AudioSettings`, `Locale`, `DialogEntry`, `I18nConfig`, `I18nState` |
| `/state`      | `useSceneStore`, `useDialogStore`, `useInventoryUiStore`, `useInventoryStateStore`, `usePlacedItemsStateStore`, `createAudioSettingsStore`, `createI18nStore`, persistence helpers (`loadInventorySlotsState`, `savePlacedItemsState`, ...) |
| `/testing`    | `createPlaythrough`: runs an adventure without a renderer (0.6.0, unreleased) |
| `(root only)` | `createGameRuntime`, `getGameRuntime`, `registerScene`, `registerItem`, `registerRule`, `getGameState`, `getGameActions`, `toRuntimeScene`, `createInventoryRuleContext`, `EventBus`, `findPath`, `sceneTransitionOnCollision`, `resolveAudioEvents`, `registerDictionary`, `translate`, `getRandomPhrase`, `matchLocale`, `registerI18nExecutors` |

The runtime registries (scenes, items, rules) are module-global: one game per page.

### Narrative (0.6.0, unreleased)

Scenes can declare `hotspots`, `npcs`, `initialItems` and `onEnter`; transitions take `when` / `blocked`; items take `combine`; conversations are `dialogues`. Conditions (`cond`), actions (`act`), the sequencer, the single save (`game:save` / `game:load`) and `validateContent` are exported from the root. See the [authoring guide](https://github.com/DanielMartinezSebastian/pointclick-engine/blob/main/docs/authoring/README.md).

### Ports

Each port interface has a **headless implementation** included for testing without mocks (`HeadlessGameLoop`, `HeadlessInput`, `HeadlessAudioAdapter`, `HeadlessI18nAdapter`). `ViewportPort` has none.

| Interface | Purpose |
|-----------|---------|
| `GameLoopPort` | Frame-tick integration (renderer drives) |
| `InputPort` | Keyboard / pointer input |
| `ViewportPort` | Camera and viewport projection |
| `AudioPort` | Sound playback and music |
| `I18nPort` | Locale detection and persistence |

## Design principles

- **Framework-agnostic**: no React, no Three.js, no `window`, no `document`
- **Testable without mocks**: pure functions, injectable ports, headless adapters included
- **Renderer-replaceable**: implement the port interfaces in any renderer

Full architecture: [docs/architecture/01-layers.md](https://github.com/DanielMartinezSebastian/pointclick-engine/blob/main/docs/architecture/01-layers.md)

## License

MIT © Daniel Martínez Sebastián

## Status

`v0.5.0` — active development. The runtime now lives in this package; see [CHANGELOG](./CHANGELOG.md) for the `item:pickedUp` breaking note.
