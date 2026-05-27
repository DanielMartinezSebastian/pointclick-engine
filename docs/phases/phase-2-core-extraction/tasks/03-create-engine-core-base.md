# Task 03: Create engine-core base

**Phase**: 2 | **Estimate**: 3h | **Owner**: —

## Context

Crear el esqueleto de `packages/engine-core/`: package.json, tsconfig, estructura de carpetas, tipos base, EventBus, barrel export. Sin lógica todavía — solo el contenedor.

## Prerequisites

- [ ] Task 02 done (monorepo setup)
- [ ] `packages/engine-core/src/` existe

## Action

### 1. Estructura de carpetas

```bash
mkdir -p packages/engine-core/src/{game/{state,logic,types,events,commands},platform}
mkdir -p packages/engine-core/__tests__
```

### 2. `packages/engine-core/package.json`

```json
{
  "name": "@pointclick-engine/engine-core",
  "version": "0.1.0",
  "description": "Framework-agnostic core for Point & Click Game Engine",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "test": "vitest run",
    "test:watch": "vitest",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "zustand": "^5.0.13"
  },
  "devDependencies": {
    "typescript": "^5",
    "vitest": "^3.2.4"
  }
}
```

### 3. `packages/engine-core/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "lib": ["ES2020"],
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src"],
  "exclude": ["dist", "node_modules", "**/*.test.ts"]
}
```

### 4. `packages/engine-core/src/game/types/index.ts`

Extraer y consolidar los tipos públicos actuales (de `app/lib/engine/types/` o donde estén). Mínimo:

```ts
export type GameVec3 = [x: number, y: number, z: number];
export type GameVec2 = [x: number, y: number];

export interface GameSceneGround {
  minX: number; maxX: number; minZ: number; maxZ: number; y: number;
}

export interface GameSceneWall {
  position: GameVec3;
  halfSize: GameVec3;
  rotationY: number;
}

// ... el resto según lo que hay en app/lib/engine/types/
```

**Importante**: verificar tipos actuales con:
```bash
ls apps/web-demo/app/lib/engine/types/
```

### 5. `packages/engine-core/src/events/EventBus.ts`

```ts
type EventHandler<T = unknown> = (data: T) => void;

export class EventBus {
  private listeners = new Map<string, EventHandler[]>();

  on<T = unknown>(event: string, handler: EventHandler<T>): () => void {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    const handlers = this.listeners.get(event)!;
    handlers.push(handler as EventHandler);
    return () => {
      const i = handlers.indexOf(handler as EventHandler);
      if (i > -1) handlers.splice(i, 1);
    };
  }

  emit<T = unknown>(event: string, data: T): void {
    this.listeners.get(event)?.forEach(h => h(data));
  }

  clear(): void { this.listeners.clear(); }
}
```

### 6. `packages/engine-core/__tests__/EventBus.test.ts`

```ts
import { describe, it, expect, vi } from 'vitest';
import { EventBus } from '../src/events/EventBus';

describe('EventBus', () => {
  it('emits to subscribers', () => {
    const bus = new EventBus();
    const fn = vi.fn();
    bus.on('test', fn);
    bus.emit('test', { x: 1 });
    expect(fn).toHaveBeenCalledWith({ x: 1 });
  });

  it('unsubscribe removes listener', () => {
    const bus = new EventBus();
    const fn = vi.fn();
    const off = bus.on('test', fn);
    off();
    bus.emit('test', null);
    expect(fn).not.toHaveBeenCalled();
  });
});
```

### 7. `packages/engine-core/src/index.ts`

```ts
export * from './game/types';
export { EventBus } from './events/EventBus';
export const VERSION = '0.1.0';
```

## Success Criteria

- [ ] `npm run build -w packages/engine-core` compila sin errores
- [ ] `npm run test -w packages/engine-core` pasa (EventBus tests verdes)
- [ ] `packages/engine-core/dist/index.js` y `index.d.ts` generados
- [ ] `grep -r "import.*react\|@react-three\|next" packages/engine-core/src/` devuelve nada

## On Complete

1. Marcar `[x]` en `../tracking.md` para `03-create-engine-core-base`
2. Commit:
   ```
   feat(core): create engine-core base scaffold

   package.json, tsconfig, types base, EventBus, tests.

   - [x] Marked: 03-create-engine-core-base

   See docs/phases/phase-2-core-extraction/tasks/03-create-engine-core-base.md
   ```

## References

- Architecture: `docs/architecture/02-public-api.md`
- ADR: `docs/decisions/0001-zustand-for-state.md`

## Notes

Los tipos del paso 4 deben ser **idénticos** a los actuales para no romper imports. Si los actuales tienen issues (e.g. `any`), no los arregles aquí — abre task separada.
