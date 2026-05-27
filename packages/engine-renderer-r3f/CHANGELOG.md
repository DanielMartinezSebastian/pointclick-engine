# Changelog

All notable changes to `@pointclick-engine/engine-renderer-r3f` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
