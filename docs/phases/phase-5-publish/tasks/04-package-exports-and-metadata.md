# Task 04: Package exports + metadata

**Phase**: 5 | **Estimate**: 2h | **Owner**: —

## Context

`engine-core` y `engine-renderer-r3f` exponen un único entry point (`.`) en su `exports` map. Para consumers serios necesitamos subpath exports (`/commands`, `/events`, `/ports`, `/types`) y metadata correcta (`sideEffects`, `peerDependencies`, `repository`, `bugs`, `homepage`).

## Prerequisites

- [ ] Task 01 done (ADR-0007 decide solo ESM)
- [ ] Conocer la estructura de `packages/engine-core/src/` (game/, ports/, events/, etc.)

## Action

### 1. Ampliar exports de `engine-core`

Editar `packages/engine-core/package.json`:

```json
{
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./commands": {
      "import": "./dist/game/commands/index.js",
      "types": "./dist/game/commands/index.d.ts"
    },
    "./events": {
      "import": "./dist/game/events/index.js",
      "types": "./dist/game/events/index.d.ts"
    },
    "./ports": {
      "import": "./dist/ports/index.js",
      "types": "./dist/ports/index.d.ts"
    },
    "./types": {
      "import": "./dist/game/types/index.js",
      "types": "./dist/game/types/index.d.ts"
    },
    "./state": {
      "import": "./dist/game/state/index.js",
      "types": "./dist/game/state/index.d.ts"
    }
  },
  "sideEffects": false
}
```

Validar `sideEffects: false` revisando que ningún `.ts` ejecuta código al import (sin top-level register, sin polyfills). Si hay alguno, eliminarlo o marcarlo explícitamente.

### 2. Ampliar exports de `engine-renderer-r3f`

Editar `packages/engine-renderer-r3f/package.json`:

```json
{
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./adapters": {
      "import": "./dist/adapters/index.js",
      "types": "./dist/adapters/index.d.ts"
    },
    "./components": {
      "import": "./dist/components/index.js",
      "types": "./dist/components/index.d.ts"
    }
  }
}
```

`sideEffects`: en R3F hay efectos por la naturaleza del renderer. Marcar con array los archivos con side effects (ej. `["**/*.css"]`) o dejar `true` por seguridad.

### 3. Auditar dependencies de renderer-r3f

Hoy `three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/rapier`, `zustand` están en `dependencies`. Para una librería peer-friendly, deberían ir en `peerDependencies` con rango amplio:

```json
{
  "dependencies": {
    "@pointclick-engine/engine-core": "*"
  },
  "peerDependencies": {
    "react": "^18.0.0 || ^19.0.0",
    "react-dom": "^18.0.0 || ^19.0.0",
    "three": "^0.150.0",
    "@react-three/fiber": "^8.0.0 || ^9.0.0",
    "@react-three/drei": "^9.0.0 || ^10.0.0",
    "@react-three/rapier": "^1.0.0 || ^2.0.0",
    "zustand": "^4.0.0 || ^5.0.0"
  },
  "peerDependenciesMeta": {
    "@react-three/rapier": { "optional": false }
  },
  "devDependencies": {
    "@react-three/drei": "^10.7.7",
    "@react-three/fiber": "^9.6.1",
    "@react-three/rapier": "^2.2.0",
    "three": "^0.184.0",
    "zustand": "^5.0.13"
  }
}
```

**Cuidado**: mover de `dependencies` a `peerDependencies` puede romper la instalación de `apps/web-demo` si no instala explícitamente esas deps. Verificar que `apps/web-demo/package.json` ya las tiene (lo tiene, según el package.json revisado).

### 4. Reemplazar `@pointclick-engine/engine-core: "*"` en renderer-r3f

Cambiar de `"*"` a `"workspace:*"` (npm workspaces lo resuelve) o al rango target una vez publicado:

```json
"dependencies": {
  "@pointclick-engine/engine-core": "^0.1.0"
}
```

Durante desarrollo `npm install` resuelve por workspace.

### 5. Añadir metadata estándar

Para ambos packages, añadir:

```json
{
  "repository": {
    "type": "git",
    "url": "git+https://github.com/<owner>/<repo>.git",
    "directory": "packages/engine-core"
  },
  "bugs": {
    "url": "https://github.com/<owner>/<repo>/issues"
  },
  "homepage": "https://github.com/<owner>/<repo>#readme",
  "engines": {
    "node": ">=18.0.0"
  },
  "publishConfig": {
    "access": "public"
  }
}
```

### 6. Verificar `files` y build output

```bash
npm run build -w packages/engine-core
ls packages/engine-core/dist/
```

**Esperado**: `dist/index.js`, `dist/index.d.ts`, `dist/game/commands/`, `dist/game/events/`, `dist/ports/`, `dist/game/types/`, `dist/game/state/`.

Si TypeScript no emite los subpaths como espera el `exports`, ajustar `tsconfig.json` (`declarationDir`, `outDir`, `rootDir`).

### 7. Smoke test de subpath imports

En `apps/web-demo` (o un test temporal):

```ts
import { GameCommand } from "@pointclick-engine/engine-core/commands";
import { GameEvent } from "@pointclick-engine/engine-core/events";
import { GameLoopPort } from "@pointclick-engine/engine-core/ports";
```

Compilar con `npm run build -w apps/web-demo`. Si TypeScript no resuelve, falta `moduleResolution: "Bundler"` o `"NodeNext"` en el tsconfig del demo.

## Success Criteria

- [ ] `packages/engine-core/package.json` define 6 subpath exports
- [ ] `packages/engine-renderer-r3f/package.json` define al menos 2 subpath exports
- [ ] `sideEffects: false` en engine-core
- [ ] `three`, `@react-three/*`, `react`, `zustand` movidos a `peerDependencies` en renderer-r3f
- [ ] Cada package tiene `repository`, `bugs`, `homepage`, `engines`, `publishConfig.access: public`
- [ ] `npm run build` pasa workspace completo
- [ ] Smoke test: `import { GameCommand } from "@pointclick-engine/engine-core/commands"` compila desde `apps/web-demo`
- [ ] Demo `/` y `/example-bridge` siguen verdes

## On Complete

1. Marca `[x]` en `../tracking.md` para `04-package-exports-and-metadata`
2. Commit:
   ```
   chore(packages): add subpath exports, peerDeps, metadata

   - [x] Marked: 04-package-exports-and-metadata

   See docs/phases/phase-5-publish/tasks/04-package-exports-and-metadata.md
   ```

## References

- Node docs: https://nodejs.org/api/packages.html#subpath-exports
- ADR-0007: release strategy
- Audit report (Task 01): lista de deps actuales

## Notes

**Trampa**: si TypeScript se queja con `Cannot find module '@pointclick-engine/engine-core/commands'`, suele ser `moduleResolution`. Asegurar:

```json
"compilerOptions": {
  "moduleResolution": "Bundler",  // o "NodeNext"
  "module": "ESNext"               // o "NodeNext"
}
```

**No bumpear versión todavía**. Phase 5 cierra en v0.1.0 (decidido en ADR-0007). El bump y tag ocurren en Task 08.

`peerDependenciesMeta` permite marcar opcionales. Si un consumer no usa physics, debería poder omitir `@react-three/rapier`. Evaluar si conviene marcarlo `optional: true` y proteger el código con un try-import dinámico — si requiere refactor mayor, dejarlo `optional: false` y documentarlo.
