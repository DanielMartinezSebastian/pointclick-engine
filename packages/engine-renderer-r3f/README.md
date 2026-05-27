# @pointclick-engine/engine-renderer-r3f

React Three Fiber renderer for the [Point & Click Game Engine](https://www.npmjs.com/package/@pointclick-engine/engine-core).

## Install

```bash
npm install @pointclick-engine/engine-renderer-r3f @pointclick-engine/engine-core
```

Peer dependencies (install in your app):

```bash
npm install react react-dom three @react-three/fiber @react-three/drei @react-three/rapier zustand
```

## Quick start

```tsx
import { useEffect } from "react";
import { createGameRuntime, GameViewport } from "@pointclick-engine/engine-renderer-r3f";

const myScenes = [
  {
    id: "town",
    label: "Town",
    background: "/assets/background/town.jpg",
    playerSpawn: [0, 0, 10],
    ground: { minX: -15, maxX: 15, minZ: -10, maxZ: 30, y: -3 },
    walls: [],
    interactions: [],
  },
];

function App() {
  useEffect(() => {
    const runtime = createGameRuntime({ scenes: myScenes });
    return () => runtime.dispose();
  }, []);

  return <GameViewport />;
}
```

## Bidirectional communication

```ts
const runtime = createGameRuntime({ scenes: myScenes });

// Send commands to the game from any HTML/UI code
runtime.executeCommand({ type: "scene:set", sceneId: "dungeon" });
runtime.executeCommand({ type: "dialog:trigger", dialogKey: "welcome" });
runtime.executeCommand({ type: "inventory:toggle" });

// Subscribe to game events
const unsub = runtime.on("scene:changed", (ev) => {
  console.log("Entered scene:", ev.sceneId);
});
```

See: [Bidirectional Communication guide](https://github.com/danielmartinezsebastian/2d-game-test/blob/main/docs/architecture/05-bidirectional-communication.md)

## Subpath exports

```ts
import { useR3FGameLoop, WebKeyboardInput } from "@pointclick-engine/engine-renderer-r3f/adapters";
import { GameTouchSpriteRuntime, SpeechBubble } from "@pointclick-engine/engine-renderer-r3f/components";
```

## What this package provides

| Export                  | Description |
|-------------------------|-------------|
| `GameViewport`          | Main React component (Canvas + physics + runtime) |
| `createGameRuntime`     | Factory: register scenes/items/rules, returns bidirectional handle |
| `useR3FGameLoop`        | `IGameLoopPort` implementation for R3F (`useFrame`) |
| `WebKeyboardInput`      | `IInputPort` implementation for keyboard events |
| `GameTouchSpriteRuntime`| Player movement controller (click-to-move, touch, keyboard) |
| `SpeechBubble`          | In-world speech bubble component |
| `DavidSprite`           | 2D sprite with depth-based scale, animation clips |
| `SceneGround` / `SceneWalls` | R3F scene primitives |

## License

MIT © Daniel Martínez Sebastián

## Status

`v0.1.0` — early stage. R3F is currently the only supported renderer; the engine is renderer-agnostic by design.
