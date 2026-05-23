# Roadmap: Refactorización a Librería Agnóstica al Framework

**Versión**: 1.0  
**Fecha**: 2026-05-23  
**Objetivo**: Transformar el prototipo actual en una librería agnóstica al framework que pueda:

1. Ejecutarse con cualquier renderer (R3F, Babylon.js, Three.js nativo, etc.)
2. Integrarse en proyectos web con comunicación bidireccional
3. Publicarse como paquete npm independiente
4. Mantenerse sin dependencias del stack frontend (React, Next.js)

---

## 1. Fases Generales

### Fase 1: Análisis y Planificación (Semana 1-2)

- [x] Evaluación actual del acoplamiento
- [ ] Identificación de límites entre core y renderer
- [ ] Definición de interfaces agnósticas
- [ ] Planificación del monorepo

### Fase 2: Extracción del Core (Semana 3-6)

- [ ] Crear `packages/engine-core/`
- [ ] Extraer lógica pura (state, rules, logic)
- [ ] Eliminar dependencias React/R3F del core
- [ ] Tests unitarios en core

### Fase 3: Abstracción del Renderer (Semana 7-10)

- [ ] Crear interfaces agnósticas para renderer
- [ ] Mover `engine-renderer-r3f/` con implementación actual
- [ ] Desacoplar GameTouchCanvas del core
- [ ] Adaptar hooks de runtime

### Fase 4: Bidireccionalidad (Semana 11-13)

- [ ] Sistema de comandos web → juego
- [ ] Sistema de eventos juego → web
- [ ] Example: integración web clásica
- [ ] Documentación de interoperabilidad

### Fase 5: Demo y Publicación (Semana 14-16)

- [ ] Limpiar `/apps/web-demo`
- [ ] Crear ejemplos con otros renderers (opcional)
- [ ] Publicar en npm
- [ ] Documentación final

---

## 2. Estructura Objetivo (Monorepo)

```
point-and-click-game/
├── packages/
│   ├── engine-core/              # 🎮 Lógica pura (agnóstico)
│   │   ├── src/
│   │   │   ├── game/
│   │   │   │   ├── state/        # Zustand stores agnósticos
│   │   │   │   ├── logic/        # Game rules, AI, pathfinding
│   │   │   │   ├── types/        # TypeScript interfaces públicas
│   │   │   │   └── index.ts      # Public API
│   │   │   ├── platform/         # Port definitions (storage, timer, etc.)
│   │   │   ├── events/           # Event system
│   │   │   └── commands/         # Command system
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── engine-renderer-r3f/      # 🔺 R3F implementation (framework-específico)
│   │   ├── src/
│   │   │   ├── renderer/
│   │   │   │   ├── GameTouchCanvas.tsx
│   │   │   │   ├── components/
│   │   │   │   └── hooks/
│   │   │   ├── adapters/         # Platform adapters web
│   │   │   └── index.ts          # Public API (GameViewport)
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── engine-types/             # 📦 Tipos públicos compartidos
│   │   ├── src/
│   │   │   ├── game.ts
│   │   │   ├── events.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   └── web-demo/                 # 🌐 Demo actual (Next.js 16)
│       ├── app/
│       ├── public/
│       ├── package.json
│       └── tsconfig.json
│
├── docs/
│   ├── LIBRARY_API_CONTRACT_V1.md
│   ├── LIBRARY_CONSUMPTION_GUIDE.md
│   ├── ARCHITECTURE.md
│   ├── BIDIRECTIONAL_COMMUNICATION.md
│   └── ROADMAP_FRAMEWORK_AGNOSTIC_REFACTORING.md (este archivo)
│
└── package.json (root workspace)
```

---

## 3. Matriz de Componentes: Qué se mueve dónde

| Archivo/Componente                     | Core  | Renderer-R3F | Razón                    |
| -------------------------------------- | ----- | ------------ | ------------------------ |
| `lib/core/rules/*`                     | ✅    |              | Lógica pura, sin React   |
| `store/sceneStore.ts`                  | ✅    |              | State agnóstico          |
| `store/mobileInputStore.ts`            |       | ✅           | Específico de input web  |
| `GameTouchSpriteRuntime.tsx`           |       | ✅           | Usa useFrame (R3F)       |
| `GameTouchCanvas.tsx`                  |       | ✅           | Canvas React Three Fiber |
| `publicApi.ts`                         | Ambos |              | Facade que coordina      |
| `platform-web.ts`                      |       | ✅           | Adapters web específicos |
| `movement/findPath.ts`                 | ✅    |              | Pathfinding agnóstico    |
| `movement/useClickToMoveController.ts` |       | ✅           | Hook React               |
| `Joystick.tsx`                         |       | ✅           | Componente UI            |
| `InventoryUI.tsx`                      |       | ✅           | Componente UI            |

---

## 4. Cambios Estructurales por Fase

### 4.1 Fase 2: Extracción del Core

**Objetivo**: Crear `packages/engine-core/` completamente independiente

**Cambios principales**:

1. **Extraer state agnóstico**
   - Mover lógica de `sceneStore.ts` → `engine-core/src/game/state/`
   - Crear adapters para zustand (permitir otras librerías de state)
   - Tipos públicos en `engine-core/src/game/types/`

2. **Extraer game logic**
   - Mover `lib/core/rules/*` → `engine-core/src/game/logic/`
   - Mover `movement/findPath.ts` → `engine-core/src/game/logic/pathfinding/`
   - Tests unitarios sin React

3. **Definir event system agnóstico**
   - `engine-core/src/events/EventBus.ts` (pub/sub simple)
   - Tipos de eventos públicos

4. **Definir command system**
   - `engine-core/src/commands/CommandHandler.ts`
   - Interfaz para ejecutar acciones desde fuera

5. **Platform ports**
   - Mover interfaces de `platform-web.ts` → `engine-core/src/platform/`
   - Adapters específicos van a renderer

**Dependencias resultantes**:

- ✅ Sin React
- ✅ Sin R3F
- ✅ Sin Next.js
- ✅ Zustand (u otra compatible)
- ✅ TypeScript

---

### 4.2 Fase 3: Abstracción del Renderer

**Objetivo**: Desacoplar completamente la implementación R3F

**Cambios principales**:

1. **Crear interfaz agnóstica de Renderer**

   ```ts
   // engine-core/src/renderer/RendererPort.ts
   export interface RendererPort {
     // Métodos que el renderer debe implementar
     render(scene: SceneConfig): void;
     updateCharacterPosition(pos: Vec3): void;
     playAnimation(character: string, anim: string): void;
     // ... etc
   }
   ```

2. **Mover componentes R3F**
   - `GameTouchCanvas.tsx` → `engine-renderer-r3f/src/renderer/GameTouchCanvas.tsx`
   - `GameTouchSpriteRuntime.tsx` → `engine-renderer-r3f/src/renderer/GameTouchSpriteRuntime.tsx`
   - Componentes UI → `engine-renderer-r3f/src/components/`

3. **Adaptar GameViewport**
   - `publicApi.ts` permanece en engine-core pero como factory
   - `GameViewport` (componente React) vive en renderer-r3f
   - Mantener compatibilidad hacia atrás

4. **Inyección de dependencias**
   - Core no instancia renderer, lo recibe como inyección
   - Renderer se configura en la app host

---

### 4.3 Fase 4: Bidireccionalidad

**Objetivo**: Permitir comunicación web ↔ juego

**Cambios principales**:

1. **Command System (Web → Juego)**

   ```ts
   // Juego acepta comandos del exterior
   gameEngine.executeCommand("setScene", { sceneId: "town" });
   gameEngine.executeCommand("pickupItem", { itemId: "key" });
   gameEngine.executeCommand("movePlayer", { target: [0, 0, 5] });
   ```

2. **Event System Bidireccional (Juego ↔ Web)**

   ```ts
   // Juego emite eventos
   gameEngine.on('sceneChanged', (sceneId) => { ... });
   gameEngine.on('itemPickedUp', (itemId) => { ... });
   gameEngine.on('dialogTriggered', (text, key) => { ... });

   // Web puede escuchar y reaccionar
   gameEngine.emit('externalAction', { action: 'useItem', itemId: 'key' });
   ```

3. **Ejemplo: Integración Web Clásica**

   ```html
   <!-- docs/examples/html-integration.html -->
   <div id="game-container"></div>
   <div id="web-ui">
     <!-- UI web tradicional -->
     <button onclick="openInventory()">Inventario</button>
     <form id="quest-log">...</form>
   </div>

   <script>
     import { createGameEngine } from '@pointclick/engine-core';
     import { createR3FRenderer } from '@pointclick/engine-renderer-r3f';

     const engine = createGameEngine({ ... });
     const renderer = createR3FRenderer(container);
     engine.setRenderer(renderer);

     // Web → Game
     window.openInventory = () => {
       engine.executeCommand('toggleInventory');
     };

     // Game → Web
     engine.on('itemPickedUp', (item) => {
       updateWebQuestLog(item.name);
     });
   </script>
   ```

---

### 4.4 Fase 5: Publicación

**Cambios principales**:

1. **Estructura de paquetes**

   ```json
   // packages/engine-core/package.json
   {
     "name": "@pointclick/engine-core",
     "version": "0.1.0",
     "exports": {
       ".": "./dist/index.js",
       "./types": "./dist/types/index.js",
       "./events": "./dist/events/index.js"
     }
   }

   // packages/engine-renderer-r3f/package.json
   {
     "name": "@pointclick/engine-renderer-r3f",
     "version": "0.1.0",
     "peerDependencies": {
       "@pointclick/engine-core": "^0.1.0",
       "react": "^19.0.0",
       "@react-three/fiber": "^9.0.0"
     }
   }
   ```

2. **Limpiar demo**
   - `/apps/web-demo` depende de paquetes locales
   - Eliminar código duplicado
   - Actualizar imports

3. **Documentación**
   - `ARCHITECTURE.md`: Cómo está estructurado
   - `BIDIRECTIONAL_COMMUNICATION.md`: Cómo usar web ↔ juego
   - `RENDERER_IMPLEMENTATION.md`: Cómo crear un renderer custom
   - Examples en `docs/examples/`

---

## 5. Hitos Críticos (Gates)

Cada fase termina con validación:

| Hito       | Validación                                             |
| ---------- | ------------------------------------------------------ |
| Fin Fase 2 | Core sin React, tests pasando, importable aisladamente |
| Fin Fase 3 | Renderer-R3F funcional sin cambios en core             |
| Fin Fase 4 | Web-demo comunica bidireccional con juego              |
| Fin Fase 5 | Paquetes publicables, docs completas                   |

---

## 6. Riesgos y Mitigaciones

| Riesgo                        | Impacto | Mitigación                                      |
| ----------------------------- | ------- | ----------------------------------------------- |
| Breaking changes en publicApi | Alto    | Versionar v2, documentar migración              |
| Pérdida de rendimiento R3F    | Medio   | Perfilar antes/después de refactor              |
| Complejidad monorepo          | Medio   | Usar workspaces de npm/pnpm, docs claras        |
| Dependencias circulares       | Alto    | Lint automático (`madge`, `dependency-cruiser`) |

---

## 7. Próximos Pasos

1. **Crear plan granular para Fase 2** (extracción core)
   - Listar archivos exactos a mover
   - Definir nueva estructura de imports
   - Detallar cambios en tests

2. **Revisar con stakeholders**
   - ¿Cuándo comenzar?
   - ¿Prioridad relativa vs. nuevas features?

3. **Setup inicial**
   - Convertir a monorepo con workspaces
   - Crear estructura base de directorios
   - Configurar build/test en cada workspace

---

## Apéndice: Comandos y Eventos Planeados

### Comandos (Web → Juego)

```ts
// Escena
executeCommand("setScene", { sceneId: string });
executeCommand("requestRespawn", {});

// Inventario
executeCommand("toggleInventory", {});
executeCommand("pickupItem", { itemId: string });
executeCommand("dropItem", { itemId: string, slotIndex: number });

// Movimiento
executeCommand("movePlayer", { position: [x, y, z] });
executeCommand("stopMovement", {});

// Diálogos
executeCommand("dismissDialog", {});
executeCommand("triggerDialog", { dialogKey: string });
```

### Eventos (Juego → Web)

```ts
// Escena
'sceneChanged' → { sceneId: string, sceneConfig: GameSceneConfig }

// Personaje
'playerMoved' → { position: [x, y, z], action: string }
'playerCollided' → { reason: 'boundary' | 'stuck', position: [x, y, z] }

// Inventario
'itemPickedUp' → { itemId: string, quantity: number }
'itemDropped' → { itemId: string, outcome: 'consume' | 'place' | 'return' }

// Diálogos
'dialogTriggered' → { text: string, dialogKey: string, source: string }
'dialogDismissed' → {}
```

---

**Documento creado**: 2026-05-23  
**Próxima revisión**: Después de plan granular Fase 2
