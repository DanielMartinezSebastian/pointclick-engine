# Point & Click Game Engine

Framework-agnostic engine for 2D / 2.5D point-and-click games. First renderer: React Three Fiber.

## 🎮 Live Demo

Try it deployed with Next.js + React Three Fiber:  
**[https://pointclick-engine-web-demo.vercel.app/](https://pointclick-engine-web-demo.vercel.app/)**

| Route | Description |
|-------|-------------|
| [`/`](https://pointclick-engine-web-demo.vercel.app/) | Main game scene |
| [`/example-bridge`](https://pointclick-engine-web-demo.vercel.app/example-bridge) | Bidirectional web ↔ game API |
| [`/debug`](https://pointclick-engine-web-demo.vercel.app/debug) | Debug & editor tools |

## Packages

| Package | Description |
|---------|-------------|
| [`@pointclick-engine/engine-core`](packages/engine-core) | Agnostic core: state, rules, pathfinding, ports, commands & events |
| [`@pointclick-engine/engine-renderer-r3f`](packages/engine-renderer-r3f) | React Three Fiber renderer implementation |
| [`apps/web-demo`](apps/web-demo) | Next.js demo composing both packages |

## Quick start

```bash
npm install
npm run dev
```

→ Demo at <http://localhost:3000>  
→ Bidirectional API demo at <http://localhost:3000/example-bridge>  
→ Debug tools at <http://localhost:3000/debug> (requires `NEXT_PUBLIC_ENABLE_DEBUG=true`)

## Controls

- Move: `WASD` / arrow keys
- Click-to-move: click on the ground plane
- Touch: tap to move
- Respawn: on-screen button
- Drag items from inventory, drop on scene targets

## Architecture

```
┌─────────────────────────────────────────────┐
│ Presentation / UI   (apps/web-demo)         │  ← InventoryUI, Joystick, DebugOverlay
├─────────────────────────────────────────────┤
│ Renderer R3F        (engine-renderer-r3f)   │  ← Canvas, useFrame, Three.js
├─────────────────────────────────────────────┤
│ Core                (engine-core) AGNOSTIC  │  ← state, rules, pathfinding, events
└─────────────────────────────────────────────┘
```

Full docs: [`docs/`](docs/) — start with [`CLAUDE.md`](CLAUDE.md) for a guided tour.

## Status

`v0.1.0` — early stage. API may change in v0.2+.  
See [`docs/phases/`](docs/phases/) for ongoing work.

## License

MIT © Daniel Martínez Sebastián — see [`LICENSE`](LICENSE).
