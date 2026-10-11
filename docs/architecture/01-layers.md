# Arquitectura: Las 4 Capas

## Diagrama

```
┌─────────────────────────────────────────────────────────┐
│ 1. Presentación / UI                                    │
│    apps/web-demo/app/components/                        │
│    - InventoryUI, Joystick, DebugOverlay                │
│    - Solo presenta state; emite eventos hacia core      │
└────────────────────┬────────────────────────────────────┘
                     ↕ props / callbacks
┌────────────────────┴────────────────────────────────────┐
│ 2. Renderer R3F                                         │
│    packages/engine-renderer-r3f/src/                    │
│    - GameViewport (composición jugable), hooks de       │
│      escena/transiciones/inventario/audio, sprites      │
│    - Renderizado 3D (Three.js, Rapier)                  │
│    - Sería diferente con otro renderer                  │
└────────────────────┬────────────────────────────────────┘
                     ↕ events / state subscriptions
┌────────────────────┴────────────────────────────────────┐
│ 3. Core (AGNÓSTICO)                                     │
│    packages/engine-core/src/                            │
│    - Runtime (game/runtime/): createGameRuntime,        │
│      registros, executors de comandos                   │
│    - Zustand stores, rules, pathfinding, puertos        │
│    - Sin React, sin R3F, sin Next.js                    │
│    - Testeable sin mocks de framework                   │
└────────────────────┬────────────────────────────────────┘
                     ↕ port interfaces
┌────────────────────┴────────────────────────────────────┐
│ 4. Platform Adapters                                    │
│    apps/web-demo/app/lib/platform-web.ts                │
│    - localStorage, clipboard, timer, env                │
│    - SSR-safe fallbacks                                 │
│    - Reemplazables (desktop, mobile native)             │
└─────────────────────────────────────────────────────────┘
```

## Responsabilidades

| Capa | Conoce | NO conoce |
|------|--------|-----------|
| Presentación | Renderer + Core state | Platform internals |
| Renderer | Core (state, events) + R3F | UI components específicos |
| Core | Solo types y puertos | React, R3F, navegador |
| Platform | API del navegador + puertos | Lógica de juego |

## Qué queda en la demo (`apps/web-demo`)

Tras la Fase 16 el runtime ya no vive en la demo. La demo es **consumidora y punto de composición**:

- `app/lib/engine/publicApi.ts`: barrel de re-export del contrato v1 (ver [`02-public-api.md`](02-public-api.md)).
- `demo-content/`: escenas, ítems, diálogos y personaje de la demo.
- `app/components/` y `app/store/`: UI propia (inventario, joystick, paneles de depuración, editores) y puertas (`SceneDoors.tsx`, `useDoorSystem.ts`).
- `app/lib/engine/runtime/`: opciones de la demo para `useGameViewportController` (`demoViewportOptions.ts`, `demoSceneRules.ts`) y hooks de depuración/editores.
- `app/lib/platform-web.ts`, `platform-web-audio.ts`, `platform-web-i18n.ts`, `gamePersistence.ts`: adapters web.
- `app/example-minimal/page.tsx`: juego que importa solo de los paquetes.

## Flujo de datos

**Entrada usuario** → Presentación → Renderer → Core (state update)
**Estado cambia** → Core emite event → Renderer suscrito reacciona → Presentación se re-renderiza

## Verificación

Test rápido: si borras `react` de `package.json` de `engine-core/`, debe seguir compilando. Además, `packages/engine-core/src/__tests__/` incluye un test de agnosticismo del core.

## Ver también

- `03-rules-core-vs-render.md` — Dónde va cada cosa
- `04-platform-ports.md` — Detalles de adapters
