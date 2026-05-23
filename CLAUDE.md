# Point & Click Game Engine – CLAUDE.md

**Versión**: 2.0-dev  
**Última actualización**: 2026-05-23  
**Estado**: Desarrollo activo (core + primera demo R3F)  
**Objetivo**: Librería agnóstica al framework con primera implementación en React Three Fiber

---

## 1. Visión Estratégica

El proyecto tiene **dos objetivos concurrentes**:

### 1.1 Objetivo Inmediato (Ahora)
Crear una **demo funcional con R3F** que:
- Implemente un juego point-and-click 2.5D completo
- Demuestre movimiento, inventario, interacciones, diálogos
- Sirva como prueba de concepto de la arquitectura
- Sea usable y demostrablemente estable

### 1.2 Objetivo Estratégico (Futuro)
Refactorizar hacia **librería agnóstica al framework** que:
- Funcione con cualquier renderer (R3F, Babylon.js, Three.js nativo, etc.)
- Tenga comunicación bidireccional (web ↔ juego)
- Sea publicable como paquete npm independiente
- No dependa de React, Next.js o cualquier framework específico

**CLAVE**: Ambos objetivos deben coexistir. Los cambios **inmediatos** no deben sabotear la **refactorización futura**.

---

## 2. Principios Arquitectónicos

### 2.1 Separación de Responsabilidades

```
┌─────────────────────────────────────────────────────────────┐
│ Capa Presentación / Interoperabilidad (Web)                │
│  - InventoryUI, Joystick, DebugOverlay                     │
│  - Event listeners, DOM updates                             │
│  - SSR-safe adapters (platform-web.ts)                      │
└─────────────────────────────────────────────────────────────┘
                         ↕ (bidireccional)
┌─────────────────────────────────────────────────────────────┐
│ Capa Renderer / Integración R3F (Framework-específico)     │
│  - GameTouchCanvas (Canvas + Physics setup)                │
│  - GameTouchSpriteRuntime (useFrame loop)                  │
│  - Adaptación de eventos del core al renderer              │
└─────────────────────────────────────────────────────────────┘
                         ↕
┌─────────────────────────────────────────────────────────────┐
│ Capa Core / Lógica del Juego (Agnóstica)                   │
│  - Game state (Zustand stores)                              │
│  - Game rules (inventario, diálogos, pathfinding)          │
│  - Event system & Command system                            │
│  - Types (GameSceneConfig, GameItemConfig, etc.)           │
└─────────────────────────────────────────────────────────────┘
                         ↕
┌─────────────────────────────────────────────────────────────┐
│ Capa Platform / Adapters (Agnóstica)                        │
│  - Storage, Clipboard, Routing, Network, Timer             │
│  - Fallbacks SSR-safe                                       │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Regla de Oro: Acoplamiento Mínimo

**NUNCA**:
- Importar componentes React en core
- Usar hooks React en game logic
- Depender de @react-three/fiber en state management
- Mezclar UI logic con game rules

**SIEMPRE**:
- Pasar dependencias hacia el renderer/adapters
- Usar interfaces (puertos) para abstraer detalles
- Testear core sin mocks de React/R3F
- Documentar por qué algo vive en core vs. renderer

### 2.3 Versionado Semántico

- **v0.1.x**: Demo prototipo con R3F (actual)
- **v0.2.x**: Core agnóstico + renderer abstracto
- **v1.0.0**: Librería publicable en npm

**Cambios que NO rompen promesa agnóstica**:
- Nuevas funciones en core (siempre opcionales)
- Mejoras internas en runtime sin cambiar contratos públicos
- Nuevas features en renderer R3F

**Cambios que SÍ rompen promesa agnóstica**:
- Mover lógica agnóstica de core a renderer
- Introducir dependencias framework en core
- Cambiar interfaces públicas sin equivalente agnóstico

---

## 3. Estructura Actual (v0.1-dev)

```
app/
├── lib/
│   ├── engine/
│   │   ├── publicApi.ts           ← Frontera pública (no tocar sin review)
│   │   ├── types/                 ← Tipos públicos
│   │   ├── runtime/               ← React hooks + R3F (framework-específico)
│   │   │   ├── GameTouchSpriteRuntime.tsx
│   │   │   ├── useDebugPanelController.ts
│   │   │   ├── useSceneRuntimeController.ts
│   │   │   ├── useInventoryRuntimeController.ts
│   │   │   └── useInteractionEditorController.ts
│   │   ├── render/                ← Componentes R3F
│   │   │   ├── sprite/
│   │   │   └── scene/
│   │   ├── movement/              ← Lógica agnóstica (pathfinding)
│   │   └── engine/
│   │
│   ├── core/
│   │   └── rules/                 ← Lógica pura (inventario, diálogos)
│   │
│   ├── platform-web.ts            ← Adapters web (SSR-safe)
│   │
│   └── ... (stores, utilities)
│
├── components/
│   ├── GameTouchCanvas.tsx        ← Entrada al renderer R3F
│   ├── InventoryUI.tsx
│   ├── Joystick.tsx
│   └── ...
│
├── store/
│   ├── sceneStore.ts              ← State agnóstico (usar como modelo)
│   ├── mobileInputStore.ts        ← State específico de input web
│   └── sceneEditorStore.ts        ← State de debug
│
└── page.tsx                        ← Usa publicApi.GameViewport
```

---

## 4. Guía de Contribución: Dónde va cada cosa

### 4.1 Algo es del CORE si:
- ✅ No depende de React, hooks, @react-three/fiber
- ✅ Es pura lógica de juego (rules, state, pathfinding)
- ✅ Se puede testear sin mocks de UI
- ✅ Será igual en cualquier renderer

**Ejemplos**:
- `findPath()` – pathfinding agnóstico
- `resolveInventoryDropHitDecision()` – reglas de drop agnósticas
- `useSceneStore()` – state agnóstico (Zustand es agnóstico)
- Tipos como `GameSceneConfig`, `GameItemRule`, etc.

**Ubicación**: `app/lib/core/`, `app/lib/engine/movement/`, `app/lib/engine/types/`

---

### 4.2 Algo es del RENDERER (R3F) si:
- ✅ Usa `useFrame`, Canvas, Rapier
- ✅ Maneja visualización específica 3D
- ✅ Reacciona a eventos del core mostrando en pantalla
- ✅ Sería diferente en otro renderer

**Ejemplos**:
- `GameTouchCanvas.tsx` – Canvas configurado para R3F
- `GameTouchSpriteRuntime.tsx` – Usa useFrame
- `DavidSprite.tsx` – Renderizado del personaje
- `SceneBackgroundPlane.tsx` – Plano 3D del fondo

**Ubicación**: `app/lib/engine/runtime/`, `app/lib/engine/render/`, `app/components/`

---

### 4.3 Algo es del PLATFORM (Adapters) si:
- ✅ Accede a APIs del navegador (window, navigator, etc.)
- ✅ Necesita fallback para SSR
- ✅ Podría reemplazarse para otra plataforma (mobile, desktop)

**Ejemplos**:
- `browserClipboardAdapter` – clipboard
- `localStorageAdapter` – persistencia
- `browserEnvironmentAdapter` – event listeners

**Ubicación**: `app/lib/platform-web.ts`

---

## 5. Workflow de Cambios

### 5.1 Si tocas el CORE

```yaml
ANTES DE INICIAR:
  - ¿Es realmente agnóstico? (sin React, sin R3F)
  - ¿Tiene tests unitarios?
  - ¿Es compatible con la futura refactorización?

DURANTE EL CAMBIO:
  - Mantén types públicos estables
  - No introduzcas dependencias framework
  - Documenta por qué está en core
  - Tests deben pasar SIN mocks de React

VALIDACIÓN:
  - npm run test (core tests en verde)
  - npm run lint
  - npm run build
  - Revisa que publicApi.ts no se rompa
```

### 5.2 Si tocas el RENDERER (R3F)

```yaml
ANTES DE INICIAR:
  - ¿Podrías abstraerlo para otros renderers?
  - ¿Evitas lógica de juego dentro del componente?

DURANTE EL CAMBIO:
  - Props del componente = APIs públicas (documentar)
  - Events emitidos hacia core via callbacks
  - State en core, presentación en renderer
  - Tests: vitest para lógica, manual para visual

VALIDACIÓN:
  - npm run dev (verifica en navegador)
  - npm run test
  - npm run lint
  - npm run build
```

### 5.3 Si tocas PLATFORM/ADAPTERS

```yaml
ANTES DE INICIAR:
  - ¿Necesita SSR-safe fallback?
  - ¿Será igual en todas las plataformas web?

DURANTE EL CAMBIO:
  - Implementa con "graceful degradation"
  - typeof window === "undefined" check
  - Try/catch para APIs que pueden fallar

VALIDACIÓN:
  - Tests incluyen SSR scenario
  - npm run test
  - npm run build
  - Revisa que no dependa de React
```

---

## 6. Cambios Frecuentes: Cómo Hacerlos Correctamente

### 6.1 Agregar Nueva Mecánica de Juego

**Ejemplo**: "Quiero agregar un sistema de cooldown para ítems"

```typescript
// 1. Define tipos en core
// app/lib/engine/types/game.ts
export type GameItemCooldown = {
  itemId: string;
  cooldownMs: number;
  startTime: number;
};

// 2. Implementa lógica agnóstica en core
// app/lib/core/rules/itemCooldownRules.ts
export function isItemInCooldown(
  itemId: string,
  cooldowns: Map<string, GameItemCooldown>,
  now: number
): boolean {
  const cd = cooldowns.get(itemId);
  return cd ? now - cd.startTime < cd.cooldownMs : false;
}

// 3. Integra con store agnóstico
// app/store/sceneStore.ts
export const useSceneStore = create<...>((set) => ({
  itemCooldowns: new Map(),
  setItemCooldown: (itemId, cooldownMs) => {
    set((state) => {
      state.itemCooldowns.set(itemId, {
        itemId,
        cooldownMs,
        startTime: Date.now(),
      });
    });
  },
}));

// 4. Usa en runtime R3F (opcional visual)
// app/lib/engine/runtime/useInventoryRuntimeController.ts
// Aquí llamas a isItemInCooldown() para decidir si mostrar animación

// 5. Tests: solo lógica agnóstica
// app/lib/core/rules/itemCooldownRules.test.ts
test('isItemInCooldown returns true if within cooldown', () => {
  const cd = { itemId: 'key', cooldownMs: 1000, startTime: 0 };
  expect(isItemInCooldown('key', new Map([['key', cd]]), 500)).toBe(true);
});
```

**✅ Correcto**: Lógica en core, visualización en renderer, tests agnósticos

---

### 6.2 Agregar Nuevo Componente Visual

**Ejemplo**: "Quiero agregar una barra de vida visual"

```typescript
// 1. State agnóstico en core
// app/store/sceneStore.ts
export type CharacterStats = {
  health: number;
  maxHealth: number;
};

// sceneStore define state y acciones
const useSceneStore = create<...>((set) => ({
  characterStats: { health: 100, maxHealth: 100 },
  takeDamage: (amount) => {
    set((state) => ({
      characterStats: {
        ...state.characterStats,
        health: Math.max(0, state.characterStats.health - amount),
      },
    }));
  },
}));

// 2. Componente visual en renderer (app/components/HealthBar.tsx)
export function HealthBar() {
  const { characterStats } = useSceneStore();
  const percentage = (characterStats.health / characterStats.maxHealth) * 100;
  
  return (
    <div style={{ width: '100px', height: '10px', background: '#ccc' }}>
      <div style={{ width: `${percentage}%`, background: '#f00' }} />
    </div>
  );
}

// 3. Tests: core logic agnóstica, componente manual
// app/lib/core/... (si hay lógica de cálculo)
```

**✅ Correcto**: State en core, rendering en componente, sin lógica de juego en componente

---

### 6.3 Cambiar Mecánica Existente

**Ejemplo**: "El pathfinding es lento, quiero optimizarlo"

```typescript
// ANTES de cambiar:
// 1. Verifica que findPath() sea agnóstico (✅ lo es)
// 2. Ejecuta tests actuales: npm run test
// 3. Mide rendimiento actual: console.time()

// CAMBIO en app/lib/engine/movement/findPath.ts
// ... (optimización)

// DESPUÉS:
// 1. Tests pasan sin cambios
// 2. Verifica que GameTouchSpriteRuntime aún funciona igual
// 3. Prueba en navegador: npm run dev
// 4. Mide rendimiento nuevo vs. viejo
// 5. Commit message: "perf: optimize pathfinding with A* heuristic"
```

**✅ Correcto**: Cambio agnóstico, tests verifican compatibilidad, benchmarks documentados

---

## 7. API Pública (No Romper)

### 7.1 publicApi.ts - Congelado para v0.1

Estos exports se consideran **contrato público**:

```typescript
// Tipos públicos
export type GameSceneConfig
export type GameSceneWall
export type GameSceneGround
export type GameItemConfig
export type GameItemRule
export type GameRuleConfig
export type GameRuntimeEvent
export type GameState
export type GameActions

// Funciones públicas
export function createGameRuntime(config?: GameRuntimeConfig): GameRuntime
export function registerScene(config: GameSceneConfig): void
export function registerItem(config: GameItemConfig): void
export function registerRule(config: GameRuleConfig): void
export function getGameState(): GameState
export function getGameActions(): GameActions
export function useGameState<T>(selector: (state: GameState) => T): T
export function useGameActions(): GameActions
export function GameViewport(props: GameViewportProps): ReactNode
```

**Si necesitas cambiar algo público**:
1. Abre un issue explicando por qué
2. Propón migración path para consumidores
3. Documenta en `LIBRARY_API_CONTRACT_V1.md`
4. Aumenta versión semántica

---

## 8. Decisiones Arquitectónicas Documentadas

### 8.1 Por qué Zustand en core

**Decisión**: Usar Zustand para state management agnóstico

**Rationale**:
- Es agnóstico: funciona sin React (puedes llamar `store.getState()`)
- Pequeño (~1.5kb)
- Flexible: compatible con inyección de dependencias
- Ya usado en proyecto

**Alternativa rechazada**: Redux (demasiado pesado, más opinado)

---

### 8.2 Por qué GameTouchSpriteRuntime usa useFrame

**Decisión**: Usar `useFrame` de R3F para game loop

**Rationale**:
- Sincroniza con frame rate del renderer
- R3F recomendación oficial para motion
- Integrado con Physics (Rapier)
- Funciona en SSR (noop)

**Alternativa**: requestAnimationFrame agnóstico
- Requeriría abstracción extra (RendererPort)
- Fuera de scope para v0.1
- Documentado para Fase 3 de refactorización

---

### 8.3 Por qué core/rules sin dependency injection

**Decisión**: Funciones puras en core/rules (sin DI pattern)

**Rationale**:
- Simples de testear
- Sin overhead de containers
- Fácil de entender
- Funciona con cualquier store

**Cuando usar DI**: En runtime hooks sí (inyectamos adapters)

---

## 9. Checklist Pre-Commit

Antes de hacer commit, verifica:

### Cambios en CORE
- [ ] `npm run test` pasa (tests agnósticos)
- [ ] `npm run lint` OK
- [ ] Archivos core no importan React/R3F/Next.js
- [ ] Documentado POR QUÉ está en core
- [ ] Types públicos no cambiaron (si lo hicieron, issue abierto)

### Cambios en RENDERER
- [ ] `npm run dev` - verifica visual en navegador
- [ ] `npm run test` - logic tests en verde
- [ ] `npm run build` - no errores
- [ ] Props claramente documentadas (JSDoc)
- [ ] Eventos emitidos correctamente hacia core

### Cambios en PLATFORM
- [ ] Maneja SSR (typeof window check)
- [ ] Fallback graceful en navegador sin API
- [ ] `npm run test` incluye SSR scenario

### Todo commit
- [ ] Mensaje claro (qué, por qué, no cómo)
- [ ] PR links a issues si aplica
- [ ] Documentación actualizada si cambios públicos

---

## 10. Errores Comunes (Anti-Patterns)

| ❌ NO HAGAS | ✅ HAZ |
|-----------|---------|
| Importar componentes React en core | Pasar como props o inyectar |
| Usar `useFrame` fuera de renderer | Mover lógica a core, `useFrame` solo llama |
| State en múltiples stores sin sincronizar | State en `sceneStore`, derivado en otros si necesario |
| Eventos sin documentar flujo | Documen EventFlow en comentario o ARCHITECTURE.md |
| Cambiar publicApi sin versionado | Abre issue, propón migration, documenta |
| Logica de juego en componentes UI | State en store, componente solo presenta |
| Platform-web específico para web | Si es web, va aquí; si es agnóstico, va en core |

---

## 11. Roadmap Integrado: Cómo los cambios apoyan refactorización

```
v0.1 (Ahora):
  ✓ Demo funcional con R3F
  ✓ Core de lógica agnóstica
  ✓ publicApi estable
  → Cambios: mejoras en renderer sin tocar core

v0.2 (Fase 2):
  → Extraer core a packages/engine-core/
  → Mantener renderer-r3f compatible
  → Cambios: mover archivos, ajustar imports

v0.3 (Fase 3):
  → Abstraer RendererPort
  → Cambios: interfaces agnósticas en core
  → Demo sigue funcionando igual

v0.4 (Fase 4):
  → Bidireccionalidad
  → Cambios: Command system, EventBus mejorado
  → Demo integra web ↔ juego

v1.0 (Fase 5):
  → Publicar paquetes npm
  → Cambios: estructura de publicación
```

**Principio**: Cada cambio debe ser **reversible** o **compatible hacia adelante**.

---

## 12. Recursos y Referencias

### Documentos Internos
- [`docs/ROADMAP_FRAMEWORK_AGNOSTIC_REFACTORING.md`](docs/ROADMAP_FRAMEWORK_AGNOSTIC_REFACTORING.md) – Plan de 16 semanas
- [`docs/LIBRARY_API_CONTRACT_V1.md`](docs/LIBRARY_API_CONTRACT_V1.md) – Contrato público
- [`docs/LIBRARY_CONSUMPTION_GUIDE.md`](docs/LIBRARY_CONSUMPTION_GUIDE.md) – Cómo usar como librería

### En el Código
- `app/lib/engine/publicApi.ts` – Entrada pública (NO ROMPER)
- `app/lib/core/rules/*.ts` – Modelo de agnósticidad
- `app/store/sceneStore.ts` – Modelo de state agnóstico
- `app/lib/platform-web.ts` – Modelo de adapters

---

## 13. Cómo Pedir Help / Reportar Issues

### Si algo no está claro
1. Abre issue con etiqueta `question`
2. Menciona la sección de CLAUDE.md que no entiendes
3. Describe qué estás tratando de hacer

### Si encuentras violación de principios
1. Pull request con explicación
2. Referencia la sección de CLAUDE.md que violaba
3. Propón solución agnóstica

### Si necesitas agregar algo nuevo a CLAUDE.md
1. Issue con etiqueta `docs`
2. Explica por qué es importante
3. Sugiere dónde debería ir

---

**Mantenido por**: Daniel Martínez Sebastián  
**Próxima revisión**: Después de Fase 2 refactorización  
**Feedback**: Abre issue con etiqueta `claudemd`
