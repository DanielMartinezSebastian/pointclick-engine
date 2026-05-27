# Task 07: Renderer implementation guide + consumption refresh

**Phase**: 5 | **Estimate**: 3h | **Owner**: —

## Context

La arquitectura agnóstica (Phase 3) permite escribir renderers alternativos, pero no hay guía sobre cómo hacerlo. Y `docs/LIBRARY_CONSUMPTION_GUIDE.md` quedó desactualizada tras Phase 4 (bidirectional API). Esta task entrega:

1. `docs/architecture/06-renderer-implementation-guide.md` — cómo implementar un nuevo renderer
2. `docs/LIBRARY_CONSUMPTION_GUIDE.md` refrescado con la API actual

## Prerequisites

- [ ] Task 04 done (exports estables — la guía referencia rutas finales)
- [ ] Familiaridad con `packages/engine-core/src/ports/` y `packages/engine-renderer-r3f/src/`

## Action

### 1. Crear `docs/architecture/06-renderer-implementation-guide.md`

Mantener < 250 líneas, estructura:

```markdown
# Renderer Implementation Guide

**Audience**: developers building an alternative renderer (PixiJS, Canvas 2D, native).
**Estado**: estable v0.4 | **Última revisión**: <fecha>

## TL;DR

A renderer must:
1. Implement `GameLoopPort` (frame ticker).
2. Implement `InputPort` (keyboard/mouse/touch events).
3. Implement `ViewportPort` (dimensions, camera).
4. Subscribe to `sceneStore` state and draw whatever is current.
5. Emit `player:moved` / `player:collided` events to the runtime bus.

No need to touch `engine-core` source — the package exposes everything needed via `@pointclick-engine/engine-core/ports`.

## Ports overview

### `GameLoopPort`

\`\`\`ts
interface GameLoopPort {
  subscribe(callback: (deltaMs: number) => void): () => void;
}
\`\`\`

A renderer ticks this each frame. R3F implementation uses `useFrame` (see `useR3FGameLoop`). For Canvas 2D, use `requestAnimationFrame`.

### `InputPort`

\`\`\`ts
interface InputPort {
  onKeyDown(handler: (key: string) => void): () => void;
  onKeyUp(handler: (key: string) => void): () => void;
  onPointer(handler: (event: PointerEventLike) => void): () => void;
}
\`\`\`

Map your platform events (DOM, native, gamepad) to these callbacks.

### `ViewportPort`

\`\`\`ts
interface ViewportPort {
  width: number;
  height: number;
  worldToScreen(worldPos: GameVec3): { x: number; y: number };
  screenToWorld(screenX: number, screenY: number): GameVec3;
}
\`\`\`

Used by UI overlays (speech bubbles, debug markers) to project world coords.

## Step-by-step: minimal Canvas 2D renderer

### 1. Scaffold the package

\`\`\`bash
mkdir -p packages/engine-renderer-canvas2d/src
cd packages/engine-renderer-canvas2d
npm init -y
\`\`\`

`package.json`:

\`\`\`json
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
\`\`\`

### 2. Implement `GameLoopPort`

\`\`\`ts
// src/CanvasGameLoop.ts
import type { GameLoopPort } from "@pointclick-engine/engine-core/ports";

export class CanvasGameLoop implements GameLoopPort {
  private listeners = new Set<(dt: number) => void>();
  private running = false;
  private lastTs = 0;

  start() {
    this.running = true;
    this.lastTs = performance.now();
    this.tick();
  }

  stop() { this.running = false; }

  subscribe(cb: (dt: number) => void) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private tick = () => {
    if (!this.running) return;
    const now = performance.now();
    const dt = now - this.lastTs;
    this.lastTs = now;
    this.listeners.forEach((l) => l(dt));
    requestAnimationFrame(this.tick);
  };
}
\`\`\`

### 3. Implement `InputPort`

Wrap DOM events on the canvas element. Same shape as `WebKeyboardInput` in renderer-r3f.

### 4. Render loop subscribing to `sceneStore`

\`\`\`ts
// src/CanvasRenderer.ts
import { useSceneStore } from "@pointclick-engine/engine-core/state";

export function createCanvasRenderer(canvas: HTMLCanvasElement, loop: CanvasGameLoop) {
  const ctx = canvas.getContext("2d")!;
  loop.subscribe(() => {
    const { scene, playerPosition } = useSceneStore.getState();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawScene(ctx, scene);
    drawPlayer(ctx, playerPosition);
  });
}
\`\`\`

### 5. Emit movement events

After moving the player (in response to input):

\`\`\`ts
runtime.emit({ type: "player:moved", position: newPos, action: "east" });
\`\`\`

This keeps web UIs and tests in sync regardless of which renderer is used.

## What lives in the renderer vs core

| Concern | Core | Renderer |
|--------:|:----:|:--------:|
| State store (`sceneStore`) | ✅ | — |
| Pathfinding (`findPath`) | ✅ | — |
| Rules / dialog logic | ✅ | — |
| Drawing | — | ✅ |
| Input mapping (DOM/native) | — | ✅ |
| Camera / viewport math | — | ✅ |
| Physics (collision) | — | ✅ (renderer-specific lib) |

See [`architecture/03-rules-core-vs-render.md`](03-rules-core-vs-render.md) for the rule of thumb.

## Reference implementation

`packages/engine-renderer-r3f/` is the canonical example:

- `src/adapters/useR3FGameLoop.ts` — GameLoopPort via `useFrame`
- `src/adapters/WebKeyboardInput.ts` — InputPort via DOM events
- `src/GameTouchSpriteRuntime.tsx` — movement controller wired to ports
- `src/scene/` — drawing primitives (ground, walls)

Reading these alongside this guide should be enough to implement a second renderer.

## Gotchas

- **Don't import React** if your renderer is not React-based. The `useSceneStore` zustand store works outside React via `useSceneStore.getState()` / `.subscribe()`.
- **Don't mutate `sceneStore` from the renderer.** Use commands or store actions, not direct property writes.
- **`player:moved` is high-frequency.** Throttle or debounce before emitting if your loop is 60Hz+.

## See also

- ADR-0005: renderer ports design
- ADR-0006: command/event architecture
- `architecture/01-layers.md`, `02-public-api.md`, `05-bidirectional-communication.md`
```

### 2. Refrescar `docs/LIBRARY_CONSUMPTION_GUIDE.md`

Leerlo primero (existe en `docs/`). Actualizar:

- Imports: usar nombres de packages reales (`@pointclick-engine/engine-core`)
- Quickstart con la API actual (`createGameRuntime` + bidirectional)
- Quitar referencias a la era pre-Phase 4 (`onRuntimeEvent`-only)
- Añadir sección "Subpath exports"
- Añadir link a `architecture/05-bidirectional-communication.md`
- Añadir link a `architecture/06-renderer-implementation-guide.md`

Si el archivo es muy obsoleto y reescribirlo es más rápido que parchearlo, hacerlo de cero (mantener < 200 líneas).

### 3. Actualizar `README.md` raíz del repo

Si el README raíz es genérico (de un Next.js scaffold), reescribirlo:

```markdown
# Point & Click Game Engine

Framework-agnostic engine for 2D / 2.5D point-and-click games. First renderer: React Three Fiber.

## Packages

| Package | Description |
|---------|-------------|
| [`@pointclick-engine/engine-core`](packages/engine-core) | Agnostic core: state, rules, ports |
| [`@pointclick-engine/engine-renderer-r3f`](packages/engine-renderer-r3f) | R3F renderer implementation |
| [`apps/web-demo`](apps/web-demo) | Next.js demo composing both |

## Quick start

\`\`\`bash
npm install
npm run dev
\`\`\`

→ Demo on http://localhost:3000

## Architecture

See [`docs/`](docs/). Start with [`CLAUDE.md`](CLAUDE.md) for a guided tour.

## Status

`v0.1.0` — early. API may change. See [`docs/phases/`](docs/phases/) for ongoing work.

## License

MIT
```

### 4. Actualizar `docs/README.md` (índice)

Añadir entrada en Architecture:

```markdown
- [`architecture/06-renderer-implementation-guide.md`](architecture/06-renderer-implementation-guide.md) — Cómo escribir un renderer alternativo
```

### 5. Verificar links internos

```bash
grep -rn "\.md" docs/architecture/06-renderer-implementation-guide.md
```

Cada link `[texto](path.md)` debe apuntar a un archivo existente.

## Success Criteria

- [ ] `docs/architecture/06-renderer-implementation-guide.md` existe (< 250 líneas, con ejemplo Canvas 2D paso a paso)
- [ ] `docs/LIBRARY_CONSUMPTION_GUIDE.md` actualizado con la API post-Phase 4
- [ ] `README.md` raíz refrescado con packages, quickstart y status
- [ ] `docs/README.md` linka al nuevo guide
- [ ] Todos los links internos de los docs nuevos resuelven
- [ ] Estilo coherente con `architecture/04-platform-ports.md` y `05-bidirectional-communication.md`

## On Complete

1. Marca `[x]` en `../tracking.md` para `07-final-docs-and-renderer-guide`
2. Commit:
   ```
   docs(phase-5): add renderer implementation guide + refresh consumption guide

   - [x] Marked: 07-final-docs-and-renderer-guide

   See docs/phases/phase-5-publish/tasks/07-final-docs-and-renderer-guide.md
   ```

## References

- ADRs: 0005 (ports design), 0006 (commands/events)
- Reference renderer: `packages/engine-renderer-r3f/src/`
- Style precedent: `docs/architecture/04-platform-ports.md`

## Notes

**No prometer renderers no existentes**: el guide describe cómo escribir uno, no afirma que existan PixiJS/Canvas 2D oficiales. Esos quedan post-v1.0 si la comunidad los aporta.

Si al escribir el guide descubres que un port (ej. `ViewportPort`) no tiene una API suficientemente clara, **NO improvisar en el doc**. Abre una task `07a-clarify-viewport-port.md` y resuelve en código antes de documentar.
