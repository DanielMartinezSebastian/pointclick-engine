# Fase 2: Quick Start - Comenzar Ahora

**Tiempo total**: ~4 semanas  
**Semana 1 (Ahora - Semana 3)**: Setup + Auditoría  
**Semanas 2-3 (Semanas 4-5)**: Extracción de módulos  
**Semana 4 (Semana 6)**: Integration + Validación

---

## HOY (Semana 2.5): Auditoría Pre-Extracción (1-2 días)

### Paso 1: Detectar contaminación React en core (30 min)

```bash
# Ejecutar en raíz del proyecto
cd C:\COMPARTIDO\2d-game-test\2d-game-test

# Buscar imports sospechosos
echo "=== Buscando React en core ==="
grep -r "import.*react\|import.*@react" app/lib/core/ app/store/ --include="*.ts" --include="*.tsx" 2>/dev/null || echo "✅ Nada encontrado"

echo "=== Buscando next en core ==="
grep -r "import.*next" app/lib/core/ app/store/ --include="*.ts" --include="*.tsx" 2>/dev/null || echo "✅ Nada encontrado"

echo "=== Buscando R3F en core ==="
grep -r "import.*@react-three\|useFrame\|useLoader\|useThree" app/lib/core/ app/store/ --include="*.ts" --include="*.tsx" 2>/dev/null || echo "✅ Nada encontrado"

echo "=== Buscando APIs del navegador en core ==="
grep -r "window\|document\|navigator" app/lib/core/ app/store/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "// " | head -10 || echo "✅ Nada encontrado"
```

**Resultado esperado**: Nada encontrado (✅) o lista de archivos a limpiar (⚠️)

**Si encuentra problemas**:
- Documentar en `docs/AUDIT_FINDINGS.md`
- Crear issues para cada violación
- Priorizar fixing antes de extracción

---

### Paso 2: Mapear archivos a extraer (1 día)

Crear `docs/PHASE_2_FILE_MAPPING.md`:

```markdown
# Mapeo de Archivos Fase 2

## CORE: Agnóstico (Mover a packages/engine-core/)

### State Management
- app/store/sceneStore.ts → packages/engine-core/src/game/state/sceneStore.ts

### Game Rules (pura lógica)
- app/lib/core/rules/* → packages/engine-core/src/game/logic/rules/

### Pathfinding
- app/lib/engine/movement/findPath.ts → packages/engine-core/src/game/logic/pathfinding/findPath.ts

### Types (tipos públicos)
- app/lib/engine/types/* → packages/engine-core/src/game/types/

## RENDERER: R3F (Quedan en apps/web-demo/)

- app/lib/engine/runtime/* (hooks React)
- app/lib/engine/render/* (componentes Three.js)
- app/components/* (UI React)
- app/store/mobileInputStore.ts (específico de web)

## PLATFORM: Adapters Web (Quedan en apps/web-demo/lib/platform-web.ts)

- Implementaciones específicas de navegador
- Puertos agnósticos → packages/engine-core/src/platform/
```

---

### Paso 3: Listar dependencias (30 min)

Para cada archivo a mover, registrar sus imports:

```typescript
// app/lib/core/rules/inventoryRules.ts
// Dependencias actuales:
// - zustand (OK - agnóstico)
// - ../types (internal - se moverá juntos)

// app/store/sceneStore.ts
// Dependencias actuales:
// - zustand (OK)
// - Ningún React (OK)
```

---

## PRÓXIMA SEMANA (Semana 3): Setup Monorepo + Crear Base

### Día 1: Estructura de Monorepo

```bash
# 1. Crear directorios
mkdir -p packages/engine-core/{src/game/{state,logic,types,events,commands},dist,__tests__}
mkdir -p packages/engine-types/{src,dist}
mkdir -p apps/web-demo

# 2. Mover contenido actual a apps/web-demo (si aún no está)
# (Ajustar según estructura actual)

# 3. Verificar estructura
ls -la packages/
```

**Resultado**:
```
packages/
├── engine-core/
│   ├── src/game/
│   │   ├── state/
│   │   ├── logic/
│   │   ├── types/
│   │   ├── events/
│   │   └── commands/
│   ├── dist/
│   ├── __tests__/
│   └── (package.json, tsconfig.json)
└── engine-types/
    └── src/
```

---

### Día 2: Crear Archivos Base

#### 2a. `packages/engine-core/package.json`

```json
{
  "name": "@pointclick-engine/engine-core",
  "version": "0.1.0",
  "description": "Point & Click game engine - framework agnostic core",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "test": "vitest run",
    "test:watch": "vitest",
    "dev": "tsc --watch",
    "clean": "rm -rf dist"
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

#### 2b. `packages/engine-core/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
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
    "moduleResolution": "node",
    "resolveJsonModule": true
  },
  "include": ["src"],
  "exclude": ["dist", "node_modules", "**/*.test.ts"]
}
```

#### 2c. `packages/engine-core/src/game/types/index.ts` (base)

```typescript
/**
 * Public types for Point & Click Game Engine
 * These form the contract between core and any renderer
 */

// Geometry
export type GameVec3 = [x: number, y: number, z: number];
export type GameVec2 = [x: number, y: number];

// Scene configuration
export interface GameSceneGround {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  y: number;
}

export interface GameSceneWall {
  position: GameVec3;
  halfSize: GameVec3;
  rotationY: number;
}

export interface GameSceneConfig {
  id: string;
  name: string;
  ground: GameSceneGround;
  walls: GameSceneWall[];
}

// Items
export interface GameItemConfig {
  id: string;
  name: string;
  rules?: GameItemRule[];
}

export interface GameItemRule {
  key: string;
  phrases: string[];
}

// State (public interface)
export interface GameState {
  sceneId: string;
  playerPosition: GameVec3;
  inventory: GameItemConfig[];
}

export interface GameActions {
  setScene(id: string): void;
  movePlayer(pos: GameVec3): void;
  pickupItem(id: string): void;
  dropItem(id: string): void;
}
```

#### 2d. `packages/engine-core/src/events/EventBus.ts`

```typescript
/**
 * Simple event bus implementation - framework agnostic
 */

type EventHandler<T = any> = (data: T) => void;

export class EventBus {
  private listeners = new Map<string, EventHandler[]>();

  on<T = any>(event: string, handler: EventHandler<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    const handlers = this.listeners.get(event)!;
    handlers.push(handler);

    // Return unsubscribe function
    return () => {
      const index = handlers.indexOf(handler);
      if (index > -1) handlers.splice(index, 1);
    };
  }

  emit<T = any>(event: string, data: T): void {
    this.listeners.get(event)?.forEach((h) => h(data));
  }

  clear(): void {
    this.listeners.clear();
  }
}
```

#### 2e. `packages/engine-core/src/index.ts` (barrel export)

```typescript
// Public API - the boundary between core and renderer/web

// Types
export type {
  GameVec3,
  GameVec2,
  GameSceneGround,
  GameSceneWall,
  GameSceneConfig,
  GameItemConfig,
  GameItemRule,
  GameState,
  GameActions,
} from './game/types';

// Event system
export { EventBus } from './events/EventBus';

// State (to be exported after migration)
// export { useSceneStore, getSceneState } from './game/state/sceneStore';

// Store version
export const VERSION = '0.1.0';
```

---

### Día 3: Crear Estructura Root Workspaces

Actualizar `package.json` (raíz):

```json
{
  "name": "point-and-click-game",
  "version": "0.1.0",
  "workspaces": [
    "packages/*",
    "apps/*"
  ],
  "scripts": {
    "build": "npm run build --workspaces",
    "test": "npm run test --workspaces",
    "dev:demo": "npm run dev -w apps/web-demo",
    "clean": "npm run clean --workspaces"
  }
}
```

**Test it**:
```bash
npm install
npm run build
# Debería compilar packages/engine-core/
```

---

## Semana 4: Extracción Módulo 1 (Pathfinding)

### Paso 1: Copiar archivos

```bash
cp app/lib/engine/movement/findPath.ts packages/engine-core/src/game/logic/pathfinding/findPath.ts
cp app/lib/engine/movement/findPath.test.ts packages/engine-core/src/game/logic/pathfinding/findPath.test.ts
```

### Paso 2: Actualizar imports en el archivo

```typescript
// ANTES
import type { GameVec3 } from '@/app/lib/engine/types/game';

// DESPUÉS
import type { GameVec3 } from '../../types';
```

### Paso 3: Crear barrel export

```typescript
// packages/engine-core/src/game/logic/index.ts
export { findPath } from './pathfinding/findPath';
```

### Paso 4: Verificar tests

```bash
cd packages/engine-core
npm run test -- pathfinding
# Debe pasar ✅
```

### Paso 5: Actualizar apps/web-demo

Cambiar todos los imports:

```typescript
// ANTES
import { findPath } from '@/app/lib/engine/movement/findPath';

// DESPUÉS
import { findPath } from '@pointclick-engine/engine-core';
```

---

## Semana 5: Extracción Módulo 2 (State Store)

Similar al Paso anterior, pero para `sceneStore.ts`:

```bash
cp app/store/sceneStore.ts packages/engine-core/src/game/state/sceneStore.ts
```

**Importante**: Verificar que NO depende de React:

```bash
grep "import.*react\|useState\|useEffect\|useCallback" packages/engine-core/src/game/state/sceneStore.ts
# Debe estar vacío
```

---

## Semana 6: Integración + Validación

### Gate de Validación (Checklist Final)

Antes de marcar Fase 2 como "hecha":

```bash
# 1. Sin violaciones de agnósticidad
grep -r "import.*react\|import.*@react-three\|import.*next" packages/engine-core/
# Resultado: NADA

# 2. Tests pasan
npm run test -w packages/engine-core
# Resultado: todos ✅

# 3. Build sin errores
npm run build
# Resultado: sin errores

# 4. Web-demo aún funciona
npm run dev:demo
# Resultado: en navegador funciona igual

# 5. Imports actualizados
grep -r "@/app/lib/core/\|@/app/lib/engine/movement\|@/app/store/sceneStore" apps/web-demo/app
# Resultado: NADA (todo de @pointclick-engine/engine-core)
```

---

## Checklist de Completude - Marcar Conforme Avances

### Semana 2.5: Auditoría
- [ ] Ejecutar búsquedas de contaminación React
- [ ] Documentar hallazgos
- [ ] Crear `docs/AUDIT_FINDINGS.md`
- [ ] Crear `docs/PHASE_2_FILE_MAPPING.md`

### Semana 3: Setup
- [ ] Crear estructura packages/engine-core/
- [ ] Crear `package.json` y `tsconfig.json` base
- [ ] Crear archivos base (types, EventBus, index.ts)
- [ ] Actualizar root `package.json` con workspaces
- [ ] Verificar `npm install` funciona

### Semana 4: Módulo 1
- [ ] Copiar pathfinding a core
- [ ] Actualizar imports en core
- [ ] Actualizar imports en web-demo
- [ ] Tests de pathfinding pasan
- [ ] Build de core sin errores
- [ ] Web-demo sigue funcionando

### Semana 5: Módulo 2
- [ ] Copiar sceneStore a core
- [ ] Remover dependencias React (si las hay)
- [ ] Crear tests agnósticos
- [ ] Actualizar imports en web-demo
- [ ] Tests de store pasan
- [ ] Linting sin errors

### Semana 6: Integración
- [ ] Gate de validación: agnósticidad ✅
- [ ] Gate de validación: tests ✅
- [ ] Gate de validación: build ✅
- [ ] Gate de validación: funcionamiento ✅
- [ ] Gate de validación: imports ✅
- [ ] Documentación actualizada (ARCHITECTURE.md)
- [ ] CLAUDE.md actualizado con nueva estructura

---

## Comandos Útiles

```bash
# Mirar estructura actual
ls -la packages/
ls -la apps/

# Compilar todo
npm run build

# Compilar solo core
npm run build -w packages/engine-core

# Tests core en watch mode
npm run test:watch -w packages/engine-core

# Lint para agnósticidad
grep -r "react\|@react-three\|next" packages/engine-core/src/

# Contar líneas de código
find packages/engine-core/src -name "*.ts" | xargs wc -l

# Ver tamaño final compilado
du -sh packages/engine-core/dist/
```

---

## Si Algo Falla

### "Module not found: @pointclick-engine/engine-core"

```bash
# Solución: Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install

# O verificar que web-demo depende de engine-core en package.json
cat apps/web-demo/package.json | grep engine-core
```

### "Type error: Cannot find module"

```bash
# Solución: Recompilar tipos
npm run build -w packages/engine-core

# Limpiar cache
npm run clean -w packages/engine-core
npm run build -w packages/engine-core
```

### Tests fallan con "React not found"

```bash
# Significa que el archivo de test está importando React innecesariamente
grep "import.*react" packages/engine-core/src/game/logic/test.ts
# Remover esa línea si es de test

# O el módulo testea tiene dependencia oculta
# Verificar con: grep -r "import.*react" packages/engine-core/src/game/logic/
```

---

## Documentación Referencia

- **Arquitectura general**: `docs/ROADMAP_FRAMEWORK_AGNOSTIC_REFACTORING.md`
- **Plan detallado**: `docs/PHASE_2_DETAILED_PLAN.md` (este archivo es el resumido)
- **Estado del proyecto**: `docs/PROJECT_STATUS_ASSESSMENT.md`
- **Principios de contribución**: `CLAUDE.md`

---

## Siguientes Pasos (Fase 3)

Una vez Fase 2 esté **completada y validada**:

1. **Abstraer Renderer**: Crear interfaces agnósticas para cómo el core habla con visualización
2. **Mover GameTouchCanvas**: A `packages/engine-renderer-r3f/`
3. **Crear RendererPort**: Interface que cualquier renderer debe implementar

---

**Creado**: 2026-05-23  
**Para empezar**: VER PASO 1 (Auditoría) ARRIBA  
**Tiempo estimado**: 4 semanas concentradas
