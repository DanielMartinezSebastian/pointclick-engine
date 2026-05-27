# @pointclick-engine/engine-core

Framework-agnostic core for the Point & Click Game Engine. State, rules, pathfinding, ports — zero React, zero Three.js, zero browser globals.

## Install

```bash
npm install @pointclick-engine/engine-core
```

This package alone is **not** a runnable game. Pair it with a renderer:

- [@pointclick-engine/engine-renderer-r3f](https://www.npmjs.com/package/@pointclick-engine/engine-renderer-r3f) — React Three Fiber
- Or write your own (see [renderer guide](https://github.com/danielmartinezsebastian/2d-game-test/blob/main/docs/architecture/06-renderer-implementation-guide.md))

## Quick example

```ts
import { CommandHandler, EventBus } from "@pointclick-engine/engine-core";
import type { GameCommand, GameEvent } from "@pointclick-engine/engine-core";

const bus = new EventBus();
const commands = new CommandHandler();

commands.register("scene:set", (cmd) => {
  // your scene-loading logic
  bus.emit("scene:changed", { type: "scene:changed", sceneId: cmd.sceneId, scene: { ... } });
});

const unsub = bus.on("scene:changed", (ev) => console.log(ev));
commands.execute({ type: "scene:set", sceneId: "town" });
// later
unsub();
```

## Subpath exports

Import only what you need:

```ts
import type { GameCommand }    from "@pointclick-engine/engine-core/commands";
import type { GameEvent }      from "@pointclick-engine/engine-core/events";
import type { IGameLoopPort }  from "@pointclick-engine/engine-core/ports";
import type { GameVec3 }       from "@pointclick-engine/engine-core/types";
import { useSceneStore }       from "@pointclick-engine/engine-core/state";
```

## What's inside

| Module            | Contents |
|-------------------|----------|
| `(root)`          | All of the below re-exported |
| `/commands`       | `CommandHandler`, `GameCommand` union |
| `/events`         | `EventBus`, `GameEvent` union, legacy adapter |
| `/ports`          | `IGameLoopPort`, `IInputPort`, `IViewportPort` (agnostic interfaces) |
| `/types`          | `GameVec3`, `GameScene`, `GameSceneWall`, etc. |
| `/state`          | `useSceneStore` (Zustand), `emitRuntimeEvent` |

## Design principles

- **Framework-agnostic**: no React, no Three.js, no `window`, no `document`
- **Testable without mocks**: pure functions, injectable ports
- **Renderer-replaceable**: implement the port interfaces in any renderer

Full architecture: [docs/architecture/01-layers.md](https://github.com/danielmartinezsebastian/2d-game-test/blob/main/docs/architecture/01-layers.md)

## License

MIT © Daniel Martínez Sebastián

## Status

`v0.1.0` — early stage. API may change in v0.2+.
