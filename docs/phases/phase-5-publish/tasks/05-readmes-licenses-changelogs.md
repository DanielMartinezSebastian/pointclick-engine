# Task 05: READMEs, LICENSE, CHANGELOG per package

**Phase**: 5 | **Estimate**: 2h | **Owner**: —

## Context

`npm install @pointclick-engine/engine-core` mostrará la página del package en npmjs.com con su README. Hoy no hay README por package, ni LICENSE, ni CHANGELOG. Sin esto la página queda vacía y los consumers no entienden qué están instalando.

## Prerequisites

- [ ] Task 04 done (metadata + exports finalizados)
- [ ] License decidida (asumimos MIT por convención del repo — verificar en `package.json`)

## Action

### 1. Crear `packages/engine-core/README.md`

```markdown
# @pointclick-engine/engine-core

Framework-agnostic core for the Point & Click Game Engine. State, rules, pathfinding, ports — zero React, zero Three.js, zero browser globals.

## Install

\`\`\`bash
npm install @pointclick-engine/engine-core
\`\`\`

This package alone is **not** a runnable game. Pair it with a renderer:

- [@pointclick-engine/engine-renderer-r3f](https://www.npmjs.com/package/@pointclick-engine/engine-renderer-r3f) — React Three Fiber
- Or write your own (see [renderer guide](https://github.com/.../docs/architecture/06-renderer-implementation-guide.md))

## Quick example

\`\`\`ts
import { CommandHandler, EventBus, type GameCommand, type GameEvent } from "@pointclick-engine/engine-core";

const bus = new EventBus();
const commands = new CommandHandler();

commands.register("scene:set", (cmd) => {
  // your scene-loading logic
  bus.emit("scene:changed", { type: "scene:changed", sceneId: cmd.sceneId, scene: ... });
});

const unsub = bus.on("scene:changed", (ev) => console.log(ev));
commands.execute({ type: "scene:set", sceneId: "town" });
\`\`\`

## Subpath exports

\`\`\`ts
import { type GameCommand } from "@pointclick-engine/engine-core/commands";
import { type GameEvent } from "@pointclick-engine/engine-core/events";
import { type GameLoopPort, type InputPort } from "@pointclick-engine/engine-core/ports";
import { type GameVec3 } from "@pointclick-engine/engine-core/types";
\`\`\`

## What's inside

- **Commands & Events**: bidirectional API between game and host UI
- **Ports**: agnostic interfaces (`GameLoopPort`, `InputPort`, `ViewportPort`)
- **State**: `sceneStore` (zustand) with optional event emitter
- **Logic**: pathfinding (`findPath`), interaction rules
- **Types**: `GameVec3`, `GameScene`, `GameSceneWall`, etc.

## License

MIT © Daniel Martínez Sebastián

## Status

`v0.1.0` — early stage. API may change in v0.2+.
Full architecture: [docs/architecture/](https://github.com/.../docs/architecture/)
```

### 2. Crear `packages/engine-renderer-r3f/README.md`

```markdown
# @pointclick-engine/engine-renderer-r3f

React Three Fiber renderer for the [Point & Click Game Engine](https://www.npmjs.com/package/@pointclick-engine/engine-core).

## Install

\`\`\`bash
npm install @pointclick-engine/engine-renderer-r3f @pointclick-engine/engine-core
\`\`\`

Peer dependencies (install in your app):

\`\`\`bash
npm install react react-dom three @react-three/fiber @react-three/drei @react-three/rapier zustand
\`\`\`

## Quick start

\`\`\`tsx
import { createGameRuntime, GameViewport } from "@pointclick-engine/engine-renderer-r3f"; // facade
import { mySceneConfigs, myItemConfigs, myDialogRules } from "./my-content";

function App() {
  useEffect(() => {
    createGameRuntime({
      scenes: mySceneConfigs,
      items: myItemConfigs,
      rules: myDialogRules,
    });
  }, []);
  return <GameViewport />;
}
\`\`\`

## Bidirectional communication

The runtime returned by `createGameRuntime` exposes:

- `executeCommand(cmd)` — fire commands at the game from any UI
- `on(type, handler)` — subscribe to game events

See: [Bidirectional Communication guide](https://github.com/.../docs/architecture/05-bidirectional-communication.md)

## What this package provides

- `GameViewport` React component (Canvas + runtime composition)
- `useR3FGameLoop` adapter for `GameLoopPort`
- `WebKeyboardInput` adapter for `InputPort`
- Sprite components (`DavidSprite`, scene primitives)
- `GameTouchSpriteRuntime` (player movement controller)

## License

MIT © Daniel Martínez Sebastián

## Status

`v0.1.0` — early stage. R3F is currently the only supported renderer; the engine is renderer-agnostic by design.
```

### 3. Crear `LICENSE` en cada package

Copiar el LICENSE de la raíz si existe, o crear MIT estándar en:

- `packages/engine-core/LICENSE`
- `packages/engine-renderer-r3f/LICENSE`

Si no existe raíz, generarlo allí también:

```
MIT License

Copyright (c) 2026 Daniel Martínez Sebastián

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
... (texto MIT estándar) ...
```

### 4. Crear `CHANGELOG.md` en cada package

Template estilo Keep-a-Changelog:

```markdown
# Changelog

All notable changes to this package are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] — 2026-MM-DD

### Added
- Initial release.
- Framework-agnostic core: state, rules, pathfinding, events.
- Renderer ports: `GameLoopPort`, `InputPort`, `ViewportPort`.
- Command/Event API: `CommandHandler`, `GameCommand` union, `GameEvent` union, `EventBus`.

### Notes
- API subject to change in v0.2+.
```

Para renderer-r3f, ajustar el "Added" a:

```markdown
### Added
- Initial release.
- R3F implementation of `GameLoopPort` (`useR3FGameLoop`) and `InputPort` (`WebKeyboardInput`).
- `GameViewport`, sprite components, scene primitives.
- Backwards-compatible `onRuntimeEvent` callback via legacy adapter.
```

### 5. Actualizar `package.json` `files` (si no está)

Verificar que `files` incluye `README.md`, `LICENSE`, `CHANGELOG.md`:

```json
{
  "files": ["dist", "src", "README.md", "LICENSE", "CHANGELOG.md"]
}
```

(Si `files` no está definido, npm los incluye por defecto. Pero ser explícito ayuda a evitar leaks de carpetas temporales.)

### 6. Validar lo que se publicaría

```bash
npm pack --dry-run -w packages/engine-core
npm pack --dry-run -w packages/engine-renderer-r3f
```

**Esperado**: lista incluye `dist/`, `src/`, `README.md`, `LICENSE`, `CHANGELOG.md`, `package.json`. No incluye `__tests__/`, `tsconfig.json`, `node_modules/`.

Si aparece basura, añadir a `.npmignore` o ajustar `files`.

## Success Criteria

- [ ] `packages/engine-core/README.md` existe (> 30 líneas, con quickstart y subpath exports)
- [ ] `packages/engine-renderer-r3f/README.md` existe (> 30 líneas)
- [ ] `LICENSE` en cada package + raíz
- [ ] `CHANGELOG.md` en cada package con entrada `[0.1.0]`
- [ ] `npm pack --dry-run -w packages/engine-core` incluye README, LICENSE, CHANGELOG
- [ ] `npm pack --dry-run -w packages/engine-renderer-r3f` incluye README, LICENSE, CHANGELOG
- [ ] Ningún `__tests__/`, `tsconfig.json` ni `.env` aparece en el tarball preview

## On Complete

1. Marca `[x]` en `../tracking.md` para `05-readmes-licenses-changelogs`
2. Commit:
   ```
   docs(packages): add README, LICENSE, CHANGELOG per package

   - [x] Marked: 05-readmes-licenses-changelogs

   See docs/phases/phase-5-publish/tasks/05-readmes-licenses-changelogs.md
   ```

## References

- Keep a Changelog: https://keepachangelog.com/
- ADR-0007 (versionado lockstep)
- Phase 4 README (qué está estable y qué no, alimenta CHANGELOG)

## Notes

Las URLs en los README usan placeholders `https://github.com/.../`. Reemplazar por el URL real del repo (que vendrá decidido en Task 01 / Task 04 al setear `repository`).

Si la owner-info en `package.json` difiere de la del LICENSE, alinearlas. No mezclar nombres legales/handles entre archivos.
