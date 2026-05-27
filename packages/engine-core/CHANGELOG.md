# Changelog

All notable changes to `@pointclick-engine/engine-core` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
