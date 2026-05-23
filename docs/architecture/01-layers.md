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
│    apps/web-demo/app/lib/engine/runtime/, render/       │
│    - GameTouchCanvas, useFrame loops                    │
│    - Renderizado 3D (Three.js, Rapier)                  │
│    - Sería diferente con otro renderer                  │
└────────────────────┬────────────────────────────────────┘
                     ↕ events / state subscriptions
┌────────────────────┴────────────────────────────────────┐
│ 3. Core (AGNÓSTICO)                                     │
│    packages/engine-core/ (Fase 2+)                      │
│    - Zustand stores, rules, pathfinding                 │
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

## Flujo de datos

**Entrada usuario** → Presentación → Renderer → Core (state update)
**Estado cambia** → Core emite event → Renderer suscrito reacciona → Presentación se re-renderiza

## Verificación

Test rápido: si borras `react` de `package.json` de `engine-core/`, debe seguir compilando.

## Ver también

- `03-rules-core-vs-render.md` — Dónde va cada cosa
- `04-platform-ports.md` — Detalles de adapters
