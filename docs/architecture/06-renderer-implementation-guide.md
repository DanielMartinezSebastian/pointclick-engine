# Renderer Implementation Guide

**Audience**: developers building an alternative renderer (PixiJS, Canvas 2D, native).
**Estado**: estable v0.1 | **Última revisión**: 2026-05-27

---

## TL;DR

A renderer must:

1. Implement `IGameLoopPort` (frame ticker).
2. Implement `IInputPort` (keyboard/mouse/touch events).
3. Subscribe to `sceneStore` state and draw whatever is current.
4. Call `createGameRuntime` (or wire commands directly) to integrate with the bidirectional API.

No need to touch `engine-core` source — the package exposes everything via `@pointclick-engine/engine-core/ports`.

---

## Ports overview

### `IGameLoopPort`

```ts
// @pointclick-engine/engine-core/ports
interface IGameLoopPort {
  subscribe(callback: (deltaMs: number) => void): () => void;
}
```

A renderer calls every subscriber each frame with the elapsed time in milliseconds.
The R3F implementation uses `useFrame` (see `src/adapters/gameLoopR3F.ts`).
For Canvas 2D, use `requestAnimationFrame`.

### `IInputPort`

```ts
interface IInputPort {
  onKeyDown(handler: (key: string) => void): () => void;
  onKeyUp(handler: (key: string) => void): () => void;
}
```

Map your platform events to these handlers and return an unsubscribe function.

### `IViewportPort`

```ts
interface IViewportPort {
  getSize(): { width: number; height: number };
}
```

Used to determine the render target dimensions for camera / projection math.

---

## Step-by-step: minimal Canvas 2D renderer

### 1. Scaffold the package

```bash
mkdir -p packages/engine-renderer-canvas2d/src
```

`packages/engine-renderer-canvas2d/package.json`:

```json
{
  "name": "@pointclick-engine/engine-renderer-canvas2d",
  "version": "0.0.1",
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "peerDependencies": {
    "@pointclick-engine/engine-core": "^0.1.0"
  }
}
```

### 2. Implement `IGameLoopPort`

```ts
// src/adapters/CanvasGameLoop.ts
import type { IGameLoopPort } from "@pointclick-engine/engine-core/ports";

export class CanvasGameLoop implements IGameLoopPort {
  private listeners = new Set<(dt: number) => void>();
  private running = false;
  private lastTs = 0;
  private rafHandle: number | null = null;

  start() {
    this.running = true;
    this.lastTs = performance.now();
    this.rafHandle = requestAnimationFrame(this.tick);
  }

  stop() {
    this.running = false;
    if (this.rafHandle !== null) cancelAnimationFrame(this.rafHandle);
  }

  subscribe(cb: (dt: number) => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private tick = (now: number) => {
    if (!this.running) return;
    const dt = now - this.lastTs;
    this.lastTs = now;
    for (const l of this.listeners) l(dt);
    this.rafHandle = requestAnimationFrame(this.tick);
  };
}
```

### 3. Implement `IInputPort`

```ts
// src/adapters/CanvasKeyboardInput.ts
import type { IInputPort } from "@pointclick-engine/engine-core/ports";

export class CanvasKeyboardInput implements IInputPort {
  onKeyDown(handler: (key: string) => void): () => void {
    const listener = (e: KeyboardEvent) => handler(e.key);
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }

  onKeyUp(handler: (key: string) => void): () => void {
    const listener = (e: KeyboardEvent) => handler(e.key);
    window.addEventListener("keyup", listener);
    return () => window.removeEventListener("keyup", listener);
  }
}
```

### 4. Subscribe to `sceneStore` and draw

```ts
// src/CanvasRenderer.ts
import { useSceneStore } from "@pointclick-engine/engine-core/state";
import type { CanvasGameLoop } from "./adapters/CanvasGameLoop";

export function createCanvasRenderer(
  canvas: HTMLCanvasElement,
  loop: CanvasGameLoop,
): () => void {
  const ctx = canvas.getContext("2d")!;

  const unsub = loop.subscribe(() => {
    const { scene, playerPosition } = useSceneStore.getState();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw player (simple circle)
    const [px, , pz] = playerPosition;
    const sx = canvas.width / 2 + px * 40;
    const sy = canvas.height / 2 + pz * 20;
    ctx.beginPath();
    ctx.arc(sx, sy, 12, 0, Math.PI * 2);
    ctx.fillStyle = "#e94560";
    ctx.fill();

    // Draw scene label
    ctx.fillStyle = "#fff";
    ctx.font = "14px monospace";
    ctx.fillText(scene.label ?? scene.id, 12, 24);
  });

  return unsub;
}
```

### 5. Wire everything

```ts
// src/index.ts
import { useSceneStore } from "@pointclick-engine/engine-core/state";
import type { GameScene } from "@pointclick-engine/engine-core/types";
import { CanvasGameLoop } from "./adapters/CanvasGameLoop";
import { CanvasKeyboardInput } from "./adapters/CanvasKeyboardInput";
import { createCanvasRenderer } from "./CanvasRenderer";

export function mountGame(canvas: HTMLCanvasElement, scenes: GameScene[]) {
  // Seed the store with the first scene
  if (scenes[0]) {
    useSceneStore.getState().setScene(scenes[0].id, scenes[0]);
  }

  const loop = new CanvasGameLoop();
  const disposeRenderer = createCanvasRenderer(canvas, loop);
  const input = new CanvasKeyboardInput();

  const unsubKeyDown = input.onKeyDown((key) => {
    const { playerPosition } = useSceneStore.getState();
    const [x, y, z] = playerPosition;
    const speed = 0.15;
    if (key === "ArrowRight") useSceneStore.getState().setPlayerPosition([x + speed, y, z]);
    if (key === "ArrowLeft")  useSceneStore.getState().setPlayerPosition([x - speed, y, z]);
    if (key === "ArrowUp")    useSceneStore.getState().setPlayerPosition([x, y, z - speed]);
    if (key === "ArrowDown")  useSceneStore.getState().setPlayerPosition([x, y, z + speed]);
  });

  loop.start();

  return () => {
    loop.stop();
    disposeRenderer();
    unsubKeyDown();
  };
}
```

---

## What lives in the renderer vs core

| Concern | Core (`engine-core`) | Renderer |
|--------:|:--------------------:|:--------:|
| State store (`sceneStore`) | ✅ | — |
| Pathfinding (`findPath`) | ✅ | — |
| Rules / dialog logic | ✅ | — |
| Command & Event bus | ✅ | — |
| Drawing / sprites | — | ✅ |
| Input mapping (DOM / native) | — | ✅ |
| Camera / viewport math | — | ✅ |
| Physics (collision) | — | ✅ (renderer-specific lib) |
| Frame loop | — | ✅ |

See [`architecture/03-rules-core-vs-render.md`](03-rules-core-vs-render.md) for the decision rule.

---

## Reference implementation

`packages/engine-renderer-r3f/` is the canonical example:

| File | What it shows |
|------|--------------|
| `src/adapters/gameLoopR3F.ts` | `IGameLoopPort` via `useFrame` |
| `src/adapters/keyboardInput.ts` | `IInputPort` via DOM `keydown` / `keyup` |
| `src/GameTouchSpriteRuntime.tsx` | Movement controller wired to ports + `sceneStore` |
| `src/scene/SceneGround.tsx` | R3F scene primitive |
| `src/scene/SceneWalls.tsx` | Collision mesh from `sceneStore.scene.walls` |

---

## Gotchas

- **`useSceneStore` outside React**: works via `useSceneStore.getState()` and `useSceneStore.subscribe()`. No React hook needed.
- **Don't mutate `sceneStore` directly** from drawing code. Mutations go through `store.setPlayerPosition()` or dispatch commands via `CommandHandler`.
- **`player:moved` is high-frequency.** The R3F renderer emits it every frame. Throttle if your event consumers are expensive.
- **`peerDependencies`**: don't add `@pointclick-engine/engine-core` to `dependencies` — it must resolve from the consumer's installation.

---

## See also

- [`architecture/01-layers.md`](01-layers.md) — The 4 layers and boundaries
- [`architecture/03-rules-core-vs-render.md`](03-rules-core-vs-render.md) — Core vs renderer rule
- [`architecture/05-bidirectional-communication.md`](05-bidirectional-communication.md) — Command & Event API
- ADR-0005: renderer ports design
- ADR-0006: command/event architecture
