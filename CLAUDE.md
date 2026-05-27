# Point & Click Game Engine

**Versión**: 2.0-dev | **Estado**: Desarrollo activo | **Owner**: Daniel Martínez Sebastián

Librería agnóstica al framework para juegos point-and-click 2D/2.5D, con primera implementación en R3F. La demo R3F vive en `apps/web-demo/` dentro del monorepo para evaluar engine y demo en paralelo.

---

## Visión

Dos objetivos concurrentes que NO deben sabotearse mutuamente:

1. **Inmediato (v0.1)**: Demo R3F funcional, estable, componentizada
2. **Estratégico (v1.0)**: Librería publicable en npm, agnóstica a renderer

**Principio**: Cada cambio inmediato debe respetar la futura agnosticidad.

---

## Arquitectura de Capas

```
┌────────────────────────────────────────────┐
│ Presentación / UI (apps/web-demo)         │  ← InventoryUI, Joystick, DebugOverlay
├────────────────────────────────────────────┤
│ Renderer R3F (apps/web-demo)              │  ← GameTouchCanvas, useFrame, Three.js
├────────────────────────────────────────────┤
│ Core (packages/engine-core) AGNÓSTICO     │  ← state, rules, pathfinding, events
├────────────────────────────────────────────┤
│ Platform Adapters (apps/web-demo)         │  ← storage, clipboard, timer (web)
└────────────────────────────────────────────┘
```

**Detalles**: `docs/architecture/01-layers.md`

---

## Regla de Oro

**Core NUNCA importa**: React, R3F, Next.js, `window`, `document`.
**Core SIEMPRE es**: testeable sin mocks de framework, reemplazable de renderer.

---

## Dónde Va Cada Cosa

| Tipo | Ubicación | Ejemplos |
|------|-----------|----------|
| **Core** (agnóstico) | `packages/engine-core/` | rules, sceneStore, findPath, types |
| **Renderer** (R3F) | `apps/web-demo/app/lib/engine/runtime/` y `/render/` | useFrame loops, Canvas, sprites |
| **UI** (React) | `apps/web-demo/app/components/` | Joystick, InventoryUI, panels |
| **Platform** (web) | `apps/web-demo/app/lib/platform-web.ts` | localStorage, clipboard adapters |

**Detalles**: `docs/architecture/03-rules-core-vs-render.md`

---

## API Pública (Contrato Estable)

Frontera pública en `apps/web-demo/app/lib/engine/publicApi.ts`. **No romper sin issue + migración**.

Exporta: `createGameRuntime`, `registerScene`, `registerItem`, `registerRule`, `getGameState`, `getGameActions`, `getGameRuntime`, `useGameState`, `useGameActions`, `GameViewport`.

**Phase 4 añade** (via handle devuelto por `createGameRuntime`): `executeCommand`, `on`, `emit`, `dispose`.

**Detalles**: `docs/architecture/02-public-api.md`

---

## Workflow

### Para empezar una tarea

1. **Lee**: `docs/phases/<fase-activa>/README.md` (status)
2. **Pickea**: una tarea de `docs/phases/<fase-activa>/tasks/NN-*.md`
3. **Ejecuta**: instrucciones autocontenidas dentro del task file
4. **Marca**: `[x]` en `docs/phases/<fase-activa>/tracking.md`
5. **Commit**: ver `docs/workflow/commit-convention.md`

### Para crear un plan nuevo

Ver: `docs/workflow/how-to-create-plan.md`

### Para delegar a subagentes

Ver: `docs/workflow/how-to-spawn-subagent.md` — cada task file es autocontenido (~50L) y puede ejecutarse aislado.

### Pre-commit

Ver: `docs/workflow/pre-commit-checklist.md`

---

## Anti-Patterns (NO HAGAS)

| ❌ NO | ✅ SÍ |
|-------|--------|
| Importar React/R3F en `engine-core` | Mover a renderer o usar puerto |
| `useFrame` fuera del renderer | Lógica en core, `useFrame` solo invoca |
| State duplicado en múltiples stores | State en `sceneStore`, derivar resto |
| Cambiar `publicApi.ts` sin issue | Abrir issue → migración → versionado |
| Lógica de juego en componentes UI | State en store, componente solo presenta |
| Crear docs >200L sin razón | Modular en archivos pequeños bajo `docs/` |
| Tocar varios archivos en 1 commit grande | Atomic commits por task del tracking |

---

## Versionado

- **v0.1.x**: Demo R3F funcional (actual)
- **v0.2.x**: `engine-core` extraído del monorepo
- **v0.3.x**: Renderer abstraction (interfaces agnósticas)
- **v0.4.x**: Bidireccionalidad web ↔ juego
- **v1.0.0**: Publicación en npm

---

## Estructura del Repo

```
.
├── CLAUDE.md                          # Este archivo (guía corta)
├── apps/
│   └── web-demo/                      # Next.js demo R3F
│       ├── app/
│       └── public/
├── packages/
│   ├── engine-core/                   # Librería agnóstica (Fase 2)
│   ├── engine-renderer-r3f/           # R3F adapter (Fase 3)
│   └── engine-types/                  # Tipos compartidos
└── docs/
    ├── README.md                      # Índice maestro
    ├── architecture/                  # Diseño (estable)
    ├── workflow/                      # Cómo trabajar (estable)
    ├── phases/                        # Fases en curso (activo)
    ├── components/                    # Docs por componente R3F
    └── decisions/                     # ADRs ligeros
```

**Nota**: la estructura monorepo se materializa en Fase 2. Estado actual: app Next.js plana.

---

## Documentos Clave

| Para... | Lee |
|---------|-----|
| Entender capas | `docs/architecture/01-layers.md` |
| Saber dónde va el código | `docs/architecture/03-rules-core-vs-render.md` |
| Comunicar web ↔ juego | `docs/architecture/05-bidirectional-communication.md` |
| Crear plan nuevo | `docs/workflow/how-to-create-plan.md` |
| Trackear tarea | `docs/workflow/how-to-track-tasks.md` |
| Delegar subagentes | `docs/workflow/how-to-spawn-subagent.md` |
| Hacer commit | `docs/workflow/commit-convention.md` |
| Decisiones tomadas | `docs/decisions/` (ADRs) |
| Fase activa | `docs/phases/phase-4-bidirectional-web-game/` |

---

## Help

- **Issue de pregunta**: label `question`, menciona sección
- **Violación de principio**: PR con sección referenciada + alternativa
- **Sugerir cambio a este doc**: issue `docs`, indica dónde
