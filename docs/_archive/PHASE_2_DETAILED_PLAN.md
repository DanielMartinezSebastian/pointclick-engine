# Fase 2: Plan Granular - Extracción del Core
**Versión**: 1.0  
**Fecha**: 2026-05-23  
**Duración estimada**: 4 semanas (Semanas 3-6 del roadmap)  
**Objetivo**: Transformar `app/lib/core/` y `app/store/sceneStore.ts` en `packages/engine-core/` completamente independiente, sin React, sin R3F

---

## 1. Pre-requisitos: Auditoría y Mapeo

### 1.1 Auditoría de Código Actual (Semana 2.5, ~2 días)

Antes de empezar a mover, necesitamos saber qué tenemos:

```bash
# 1. Identificar archivos que "creen" que son agnósticos pero no lo son
grep -r "import.*from.*react" app/lib/core/ --include="*.ts" --include="*.tsx"
grep -r "import.*from.*@react" app/lib/core/ --include="*.ts" --include="*.tsx"
grep -r "import.*from.*next" app/lib/core/ --include="*.ts" --include="*.tsx"
grep -r "useFrame\|useLoader\|useThree" app/store/ --include="*.ts" --include="*.tsx"

# 2. Contar tamaño actual de core + store
find app/lib/core app/store -name "*.ts" -o -name "*.tsx" | wc -l
du -sh app/lib/core app/store

# 3. Identificar dependencias circulares
npm install --save-dev madge dependency-cruiser
npx madge --circular app/lib/core
```

**Checklist**:
- [ ] Ejecutar auditoría
- [ ] Documentar hallazgos en `docs/AUDIT_FINDINGS.md`
- [ ] Crear issue si hay violaciones
- [ ] Obtener lista de archivos a mover

---

### 1.2 Mapeo Detallado de Archivos (Semana 3, ~1 día)

Para cada archivo de core y store, llenar esta matriz:

| Archivo | Tamaño | Deps (internas) | Deps (externas) | Agnóstico | Target |
|---------|--------|-----------------|-----------------|-----------|--------|
| `app/lib/core/rules/inventoryRules.ts` | XXkb | rule1, rule2 | zustand | ✅ | `packages/engine-core/src/game/logic/inventory/` |
| `app/store/sceneStore.ts` | XXkb | - | zustand | ✅ | `packages/engine-core/src/game/state/` |
| `app/lib/engine/movement/findPath.ts` | XXkb | - | - | ✅ | `packages/engine-core/src/game/logic/pathfinding/` |
| ... | | | | | |

**Herramienta para generar**: Script que inspecciona imports y clasifica automáticamente.

**Resultado**: `docs/PHASE_2_FILE_MAPPING.md`

---

## 2. Fase 2A: Preparación (Semana 3)

### 2.1 Setup Monorepo con Workspaces

```bash
# 1. Instalar herramientas monorepo
npm install -D lerna pnpm-workspace-root

# 2. Crear estructura
mkdir -p packages/{engine-core,engine-types}
mkdir -p apps/web-demo

# 3. Actualizar package.json raíz (root workspace)
```

**Nueva estructura**:
```
point-and-click-game/
├── packages/
│   ├── engine-core/          # NEW: core agnóstico
│   │   ├── src/game/
│   │   │   ├── state/        # sceneStore
│   │   │   ├── logic/        # rules
│   │   │   ├── types/        # tipos públicos
│   │   │   ├── events/       # event bus
│   │   │   └── commands/     # command system
│   │   ├── package.json      # NEW
│   │   └── tsconfig.json     # NEW
│   │
│   └── engine-types/         # FUTURE: tipos compartidos
│
├── apps/
│   └── web-demo/             # RENAMED: actual proyecto
│       ├── app/
│       ├── package.json       # UPDATED: depende de @pointclick-engine/engine-core
│       └── ...
│
└── docs/                      # UPDATED: esta guía aquí
```

**Checklist**:
- [ ] `mkdir -p packages/engine-core/{src/game/{state,logic,types,events,commands},dist}`
- [ ] `mkdir -p packages/engine-types/{src,dist}`
- [ ] `mkdir -p apps/web-demo`
- [ ] Mover contenido actual a `apps/web-demo/`
- [ ] Crear `packages/engine-core/package.json` inicial
- [ ] Crear `packages/engine-core/tsconfig.json`
- [ ] Actualizar root `package.json` con workspaces

**Archivo package.json para engine-core**:
```json
{
  "name": "@pointclick-engine/engine-core",
  "version": "0.1.0",
  "description": "Point & Click game engine core - framework-agnostic",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "test": "vitest run",
    "dev": "tsc --watch"
  },
  "dependencies": {
    "zustand": "^5.0.13"
  },
  "devDependencies": {
    "@types/node": "^20",
    "typescript": "^5",
    "vitest": "^3.2.4"
  }
}
```

---

### 2.2 Crear Bases Estructurales en engine-core (Semana 3, ~3 días)

Crear archivos "scaffolding" que serán la base donde se acoplarán los módulos movidos:

#### 2.2.1 Types Base (`packages/engine-core/src/game/types/index.ts`)

Extrae TODOS los tipos públicos de `app/lib/engine/types/` y consolida:

```typescript
// Vectores y geometría
export type GameVec3 = [x: number, y: number, z: number];
export type GameVec2 = [x: number, y: number];

// Escenas
export type GameSceneGround = { minX: number; maxX: number; minZ: number; maxZ: number; y: number };
export type GameSceneWall = { position: GameVec3; halfSize: GameVec3; rotationY: number };
export type GameSceneConfig = { id: string; name: string; ground: GameSceneGround; walls: GameSceneWall[] };

// Items e Inventario
export type GameItemConfig = { id: string; name: string; rules?: GameItemRule[] };
export type GameItemRule = { key: string; phrases: string[] };

// Estado público
export type GameState = { sceneId: string; playerPos: GameVec3; inventory: GameItemConfig[] };
export type GameActions = { setScene: (id: string) => void; movePlayer: (pos: GameVec3) => void };
```

**Ubicación**: `packages/engine-core/src/game/types/index.ts`  
**Referencia**: Copiar de `app/lib/engine/types/game.ts` e integrar

---

#### 2.2.2 Event System (`packages/engine-core/src/events/EventBus.ts`)

Crear un event bus simple agnóstico (sin dependencias):

```typescript
// packages/engine-core/src/events/EventBus.ts
type EventHandler<T = any> = (data: T) => void;

export class EventBus {
  private listeners = new Map<string, EventHandler[]>();

  on<T>(event: string, handler: EventHandler<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(handler);
    
    // Retorna función para desuscribirse
    return () => {
      const handlers = this.listeners.get(event);
      if (handlers) {
        handlers.splice(handlers.indexOf(handler), 1);
      }
    };
  }

  emit<T>(event: string, data: T): void {
    this.listeners.get(event)?.forEach(h => h(data));
  }

  clear(): void {
    this.listeners.clear();
  }
}

// Eventos públicos
export type GameEvents = {
  'scene-changed': { sceneId: string };
  'player-moved': { position: GameVec3 };
  'item-picked-up': { itemId: string };
  'collision': { type: 'boundary' | 'wall' };
};
```

**Testing**: `packages/engine-core/src/events/EventBus.test.ts`

---

#### 2.2.3 State Store Base (`packages/engine-core/src/game/state/sceneStore.ts`)

MOVER `app/store/sceneStore.ts` aquí. Asegurar que:
- ✅ Solo depende de zustand
- ✅ No importa React
- ✅ Sin hooks (Zustand es agnóstico a eso)

```typescript
// packages/engine-core/src/game/state/sceneStore.ts
import { create } from 'zustand';

export type GameSceneState = {
  sceneId: string;
  playerPosition: GameVec3;
  inventory: GameItemConfig[];
  // ... más state
};

export const useSceneStore = create<GameSceneState>((set) => ({
  sceneId: 'start',
  playerPosition: [0, 0, 0],
  inventory: [],
  
  setScene: (id: string) => set({ sceneId: id }),
  movePlayer: (pos: GameVec3) => set({ playerPosition: pos }),
  // ... más acciones
}));

// IMPORTANTE: Export función agnóstica para acceder sin React
export function getSceneState(): GameSceneState {
  return useSceneStore.getState();
}

export function subscribeSceneState(selector: (s: GameSceneState) => any, listener: (v: any) => void) {
  return useSceneStore.subscribe(
    selector,
    listener
  );
}
```

**Checklist**:
- [ ] Copiar `app/store/sceneStore.ts` → `packages/engine-core/src/game/state/sceneStore.ts`
- [ ] Remover cualquier dependencia React
- [ ] Agregar funciones agnósticas (getState, subscribe)
- [ ] Tests: estado se puede leer/modificar sin React

---

## 3. Fase 2B: Extracción de Módulos (Semanas 3-5)

### 3.1 Sprint 1: Lógica Pura (Semana 3-4, ~5 días)

Mover todo lo que es 100% puro sin dependencias web:

#### 3.1.1 Pathfinding (`app/lib/engine/movement/findPath.ts`)

```bash
# Mover
cp app/lib/engine/movement/findPath.ts packages/engine-core/src/game/logic/pathfinding/findPath.ts

# En el archivo:
# ✅ Verificar que NO importa React, R3F, next, window, document
# ✅ Crear tests sin mocks
```

**Nueva ubicación**: `packages/engine-core/src/game/logic/pathfinding/findPath.ts`  
**Test**: `packages/engine-core/src/game/logic/pathfinding/findPath.test.ts`  
**Actualizar imports**: En apps/web-demo, cambiar:
```typescript
// ANTES
import { findPath } from '@/app/lib/engine/movement/findPath';

// DESPUÉS
import { findPath } from '@pointclick-engine/engine-core';
```

---

#### 3.1.2 Game Rules (`app/lib/core/rules/*`)

Mover TODOS los archivos:

```bash
cp -r app/lib/core/rules/* packages/engine-core/src/game/logic/rules/
```

**Archivos a mover** (ejemplos, verificar en tu proyecto):
- `inventoryRules.ts` → `packages/engine-core/src/game/logic/rules/inventory.ts`
- `dialogRules.ts` → `packages/engine-core/src/game/logic/rules/dialog.ts`
- `collisionRules.ts` → `packages/engine-core/src/game/logic/rules/collision.ts`
- Etc.

**Verificación**: 
```bash
grep -r "import.*react\|import.*next\|import.*@react" packages/engine-core/src/
# NO debe haber resultados
```

**Test cada archivo**:
- [ ] `npm run test -- pathfinding` ✅
- [ ] `npm run test -- rules` ✅
- [ ] `npm run lint` ✅

---

### 3.2 Sprint 2: Platform Adapters (Semana 4, ~3 días)

#### 3.2.1 Extraer Interfaces de Platform

Mover definiciones PURAS (sin implementación web) a core:

```typescript
// packages/engine-core/src/platform/ports.ts
export interface StoragePort {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface TimerPort {
  now(): number;
  setTimeout(cb: () => void, ms: number): number;
  clearTimeout(id: number): void;
}

export interface EnvironmentPort {
  isProduction(): boolean;
  addWindowEventListener(event: string, handler: EventListener): () => void;
}

// ... más ports
```

**Ubicación**: `packages/engine-core/src/platform/ports.ts`

---

#### 3.2.2 Mantener Adapters Web en apps/web-demo

Las **implementaciones** específicas de navegador se quedan donde están:

```typescript
// apps/web-demo/lib/platform-web.ts (ACTUALIZAR imports)
import type { StoragePort, TimerPort } from '@pointclick-engine/engine-core';

export const localStorageAdapter: StoragePort = {
  getItem: (k) => localStorage.getItem(k),
  setItem: (k, v) => localStorage.setItem(k, v),
  removeItem: (k) => localStorage.removeItem(k),
};

// ... más adapters específicos de web
```

**Cambios en web-demo**:
```typescript
// ANTES
import { webPlatform } from '@/app/lib/platform-web';

// DESPUÉS
import { webPlatform } from './lib/platform-web';
import type { StoragePort } from '@pointclick-engine/engine-core';
```

---

### 3.3 Sprint 3: Integración de State en Core (Semana 5, ~3 días)

#### 3.3.1 Validar sceneStore en Aislamiento

```bash
# En packages/engine-core/
npm run test -- sceneStore
# Debe pasar sin dependencias web
```

#### 3.3.2 Crear módulo Game (orchestrator agnóstico)

```typescript
// packages/engine-core/src/game/GameEngine.ts
import { useSceneStore, getSceneState } from './state/sceneStore';
import { EventBus } from '../events/EventBus';
import type { GameSceneConfig } from './types';

export class GameEngine {
  private eventBus = new EventBus();
  private platformPorts: Record<string, any> = {}; // Se inyectarán desde fuera

  constructor(scenes: GameSceneConfig[]) {
    // Registrar escenas
    scenes.forEach(scene => {
      // store scene
    });
  }

  // Acciones agnósticas
  setCurrentScene(sceneId: string) {
    const state = getSceneState();
    useSceneStore.setState({ sceneId });
    this.eventBus.emit('scene-changed', { sceneId });
  }

  getCurrentScene() {
    return getSceneState().sceneId;
  }

  // Event subscription agnóstica
  on(event: string, handler: any) {
    return this.eventBus.on(event, handler);
  }

  emit(event: string, data: any) {
    this.eventBus.emit(event, data);
  }

  // Dependency injection de platforms
  setPlatformPort(name: string, port: any) {
    this.platformPorts[name] = port;
  }
}

export function createGameEngine(config: { scenes: GameSceneConfig[] }): GameEngine {
  return new GameEngine(config.scenes);
}
```

**Test**:
```typescript
// packages/engine-core/src/game/GameEngine.test.ts
import { GameEngine } from './GameEngine';
import { MOCK_SCENES } from './mocks';

test('can create game engine without React', () => {
  const engine = new GameEngine(MOCK_SCENES);
  expect(engine).toBeDefined();
});

test('emits events when scene changes', () => {
  const engine = new GameEngine(MOCK_SCENES);
  const listener = vitest.fn();
  engine.on('scene-changed', listener);
  
  engine.setCurrentScene('town');
  expect(listener).toHaveBeenCalledWith({ sceneId: 'town' });
});
```

**Ubicación**: `packages/engine-core/src/game/GameEngine.ts`

---

## 4. Fase 2C: Refactorización de apps/web-demo (Semana 5-6)

### 4.1 Actualizar Imports (Semana 5, ~1 día)

Todos los imports de core deben venir de `@pointclick-engine/engine-core`:

```bash
# Script para validar transición
find apps/web-demo/app -name "*.ts" -o -name "*.tsx" | xargs grep "@/app/lib/core\|@/app/lib/engine/movement\|@/app/store/sceneStore" | head -20
```

**Mapa de cambios**:

| Viejo | Nuevo |
|------|-------|
| `@/app/lib/core/rules/` | `@pointclick-engine/engine-core` |
| `@/app/store/sceneStore` | `@pointclick-engine/engine-core` |
| `@/app/lib/engine/movement/findPath` | `@pointclick-engine/engine-core` |
| `@/app/lib/platform-web` | `./lib/platform-web` (local) |
| `@/app/lib/engine/runtime/*` | Quedan en web-demo (R3F) |
| `@/app/components/*` | Quedan en web-demo |

**Herramienta automatizada**:
```bash
# Usar find-and-replace para cambios masivos
# ANTES: sed, DESPUÉS: automated script con validación
```

---

### 4.2 Actualizar publicApi.ts (Semana 5, ~2 días)

`publicApi.ts` debe ahora exportar desde ambos lugares:

```typescript
// apps/web-demo/lib/engine/publicApi.ts
// ANTES: exportaba todo de diferentes módulos
// DESPUÉS: re-exporta desde @pointclick-engine/engine-core + componentes R3F

export {
  // Del core
  createGameEngine,
  GameEngine,
  useSceneStore,
  getSceneState,
  type GameSceneConfig,
  type GameState,
  type GameActions,
  type GameVec3,
  // ... etc
} from '@pointclick-engine/engine-core';

// Del renderer R3F (específico)
export { GameViewport, type GameViewportProps } from './publicApi.renderer';
```

**Validación**:
```typescript
// Tests que verifican que publicApi sigue siendo válida
import { createGameEngine, useSceneStore, GameViewport } from '@/app/lib/engine/publicApi';

// Debe funcionar igual que antes
```

---

### 4.3 Actualizar Dependencias y Build (Semana 6, ~1 día)

```bash
# En apps/web-demo/package.json
{
  "dependencies": {
    "@pointclick-engine/engine-core": "workspace:*",
    // ... resto
  },
  "devDependencies": {
    // ... mismo
  }
}

# Build scripts
npm run build  # Debe compilar engine-core primero
npm run dev    # Debe watch engine-core
```

**Configuración de turbo o lerna** (opcional, pero recomendado):

```json
// turbo.json (root)
{
  "tasks": {
    "build": {
      "outputs": ["dist/**"],
      "cache": false
    },
    "test": {
      "outputs": []
    }
  }
}
```

---

## 5. Validación de Fase 2 (Hito crítico)

### 5.1 Gate de Validación

Antes de marcar Fase 2 como "hecha", verificar:

```bash
# 1. Linting sin violaciones de agnósticidad
grep -r "import.*react\|import.*next\|import.*@react-three" packages/engine-core/
# RESULTADO: nada

# 2. Tests de core pasan sin mocks de React
cd packages/engine-core
npm run test
# RESULTADO: 100% passing

# 3. Web-demo aún funciona igual
cd apps/web-demo
npm run dev
# RESULTADO: sin errores en navegador

# 4. Build de ambos funciona
npm run build
cd packages/engine-core && npm run build
cd apps/web-demo && npm run build
# RESULTADO: sin errores

# 5. Imports están actualizados
grep -r "@/app/lib/core/\|@/app/lib/engine/movement/\|@/app/store/sceneStore" apps/web-demo/app/lib/engine
# RESULTADO: nada (todo debe ser de @pointclick-engine/engine-core)
```

### 5.2 Documentación Post-Fase 2

Actualizar:
- `docs/PHASE_2_DETAILED_PLAN.md` → marcar como completado
- `docs/ARCHITECTURE.md` → nueva estructura monorepo
- `CLAUDE.md` → actualizar sección de estructura
- `README.md` → instrucciones para contribuyentes

---

## 6. Anti-patrones a Evitar en Fase 2

| ❌ NO | ✅ SÍ |
|-------|--------|
| Mover archivos sin actualizar imports | Usar script para cambio masivo verificado |
| Deixar lógica React en core | Revisar cada archivo antes de mover |
| Olvidar actualizar paths en tests | Renombar `findPath.test.ts` también |
| Romper publicApi.ts | Validar tests de publicApi después de cambios |
| Circular dependencies entre packages | Usar `madge --circular` frecuentemente |
| Ignorar tipos TypeScript | Ejecutar `tsc` sin errores |

---

## 7. Timeline Estimado

| Semana | Sprint | Duración | Tareas |
|--------|--------|----------|--------|
| 2.5 | Pre | ~2 días | Auditoría + mapeo |
| 3 | Setup + Base | 5 días | Monorepo, types, EventBus, sceneStore |
| 4 | Sprint 1 + 2 | 5 días | Pathfinding, rules, platforms |
| 5 | Sprint 3 + Integration | 5 días | GameEngine, actualizar imports |
| 6 | Refactor web-demo | 5 días | publicApi, validación, docs |

**Total**: 4 semanas (algo de solapamiento)

---

## 8. Recursos y Herramientas

### Auditoría
- `madge`: detectar dependencias circulares
- `dependency-cruiser`: visualizar grafo de dependencias
- `grep`: búsquedas masivas de imports

### Testing
- `vitest`: tests unitarios agnósticos
- `npm run test`: validar core sin mocks

### Build/Monorepo
- Workspaces nativos de npm
- `turbo` (opcional): cachear builds
- `lerna` (opcional): manage múltiples packages

### Documentación
- Markdown en `docs/`
- CLAUDE.md como referencia

---

## 9. Rollback Plan

Si algo falla crítico:

1. **Mantener rama main funcional**: commit a rama `phase-2-core-extraction`
2. **Tests antes de merge**: todos tests en verde
3. **Validación manual**: pro en navegador `npm run dev`
4. Si hay problema: git revert + analizar root cause

---

## 10. Checklist Final Pre-Phase 3

Antes de pasar a Fase 3 (Abstracción del Renderer):

- [ ] `packages/engine-core/` existe y es publicable
- [ ] Todos los tests pasan sin React/R3F
- [ ] `apps/web-demo` depende de `@pointclick-engine/engine-core`
- [ ] `publicApi.ts` es estable (tests en verde)
- [ ] No hay imports de core hacia renderer
- [ ] `ARCHITECTURE.md` documentado
- [ ] CLAUDE.md actualizado con nueva estructura
- [ ] Documentación de API pública en `docs/ENGINE_CORE_API.md`

---

**Documento creado**: 2026-05-23  
**Próxima revisión**: Fin de Semana 6 (Fase 2)  
**Owner**: Daniel Martínez Sebastián
