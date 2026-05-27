# Task 02: Create engine-renderer-r3f package scaffold

**Phase**: 3 | **Estimate**: 2h | **Owner**: —

## Context

Crear el package `packages/engine-renderer-r3f/` con package.json, tsconfig, vitest y barrel index, siguiendo el mismo patrón que `engine-core/`. Aún sin código real, solo scaffold listo para recibir componentes en Task 06.

## Prerequisites

- [ ] Task 01 done (ports definidos en engine-core)
- [ ] `packages/engine-core/dist/` existe (build hecho)

## Action

### 1. Crear estructura de directorios

```bash
mkdir -p packages/engine-renderer-r3f/src
mkdir -p packages/engine-renderer-r3f/__tests__
```

### 2. Crear `package.json`

```json
{
  "name": "@pointclick-engine/engine-renderer-r3f",
  "version": "0.1.0",
  "description": "R3F (React Three Fiber) renderer for Point & Click Game Engine",
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "files": ["dist", "src"],
  "scripts": {
    "build": "tsc",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@pointclick-engine/engine-core": "*",
    "@react-three/fiber": "^8.0.0",
    "@react-three/drei": "^9.0.0",
    "@react-three/rapier": "^1.0.0",
    "three": "^0.160.0",
    "zustand": "^4.0.0"
  },
  "peerDependencies": {
    "react": "^18.0.0 || ^19.0.0",
    "react-dom": "^18.0.0 || ^19.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "@types/three": "^0.160.0",
    "typescript": "^5.0.0",
    "vitest": "^3.0.0"
  }
}
```

**Nota**: copia versiones exactas de `apps/web-demo/package.json` para evitar mismatches.

### 3. Crear `tsconfig.json`

Copia el de `packages/engine-core/tsconfig.json` y ajusta:
- `"jsx": "react-jsx"` (necesario para R3F)
- `"target": "ES2020"`
- `"moduleResolution": "bundler"`

### 4. Crear `src/index.ts` con un export stub

```ts
export const RENDERER_VERSION = "0.1.0";
// TODO(phase-3): export R3F components after Task 06
```

### 5. Registrar en root `package.json` workspaces

Verificar que `packages/*` ya cubre el nuevo package. Si no, añadir.

### 6. Instalar dependencias

```bash
npm install
```

### 7. Build y test scaffold

```bash
npm run build -w packages/engine-renderer-r3f
```

## Success Criteria

- [ ] `packages/engine-renderer-r3f/` existe con package.json, tsconfig, src/index.ts
- [ ] `npm install` sin errores
- [ ] `npm run build -w packages/engine-renderer-r3f` pasa (genera `dist/`)
- [ ] `node -e "console.log(require('@pointclick-engine/engine-renderer-r3f').RENDERER_VERSION)"` imprime `0.1.0`

## On Complete

1. Marca `[x]` en `../tracking.md` para `02-create-renderer-r3f-package`
2. Commit:
   ```
   feat(renderer): create engine-renderer-r3f package scaffold

   - [x] Marked: 02-create-renderer-r3f-package

   See docs/phases/phase-3-renderer-abstract/tasks/02-create-renderer-r3f-package.md
   ```

## References

- Reference: `packages/engine-core/package.json` (mismo patrón)
- ADR-0003: `docs/decisions/0003-monorepo-with-demo.md`

## Notes

No mover código en esta task. Solo scaffold. Si `npm install` falla por versiones incompatibles, fijar a las mismas que web-demo.
