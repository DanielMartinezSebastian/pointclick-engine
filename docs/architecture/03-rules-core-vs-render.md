# Reglas: Core vs Renderer vs UI vs Platform

**Decisión rápida**: ¿Dónde va este código?

## Árbol de decisión

```
¿Importa React, R3F, Next.js?
├─ SÍ → ¿Es UI pura?
│        ├─ SÍ → UI (apps/web-demo/app/components/)
│        └─ NO → Renderer (apps/web-demo/app/lib/engine/runtime/ o /render/)
│
└─ NO → ¿Accede a window/document/navigator?
         ├─ SÍ → Platform adapter (apps/web-demo/app/lib/platform-web.ts)
         └─ NO → Core (packages/engine-core/)
```

## Criterios por capa

### Core (agnóstico)

**Va aquí si**:
- ✅ No depende de React, hooks, @react-three/fiber
- ✅ Es lógica pura de juego (rules, state, pathfinding, types)
- ✅ Se puede testear sin mocks de UI
- ✅ Sería igual en cualquier renderer

**Ejemplos**:
- `findPath()` — pathfinding
- `resolveInventoryDropHitDecision()` — reglas drop
- `useSceneStore()` — Zustand store (zustand es agnóstico)
- Tipos `GameSceneConfig`, `GameItemRule`

### Renderer (R3F)

**Va aquí si**:
- ✅ Usa `useFrame`, `Canvas`, Rapier directamente
- ✅ Maneja visualización 3D
- ✅ Reacciona a eventos del core mostrando en pantalla

**Ejemplos**:
- `GameTouchCanvas.tsx`
- `GameTouchSpriteRuntime.tsx`
- `DavidSprite.tsx`
- `SceneBackgroundPlane.tsx`

### UI (React)

**Va aquí si**:
- ✅ Componente React presentacional
- ✅ Fuera del Canvas 3D (overlay HTML)
- ✅ Solo lee state, no contiene lógica de juego

**Ejemplos**:
- `InventoryUI.tsx`
- `Joystick.tsx`
- `SpeechBubble.tsx` (overlay)
- `DebugOverlayPanel.tsx`

### Platform (web adapters)

**Va aquí si**:
- ✅ Accede a `window`, `document`, `navigator`, `localStorage`
- ✅ Necesita fallback para SSR
- ✅ Reemplazable en otra plataforma

**Ejemplos**:
- `localStorageAdapter`
- `browserClipboardAdapter`
- `browserEnvironmentAdapter`

## Casos límite

**¿Y si necesito acceso al timer/clock?**
→ Define puerto `TimerPort` en core, implementa `browserTimerAdapter` en platform.

**¿Y si necesito persistir state?**
→ Core define interfaz, platform implementa con localStorage.

**¿State global de input mobile?**
→ Específico de web (`mobileInputStore.ts` queda en `apps/web-demo/`).

## Anti-patterns

| ❌ | ✅ |
|----|----|
| `import { useState } from 'react'` en core | Pasa estado como argumento o usa Zustand |
| `window.localStorage` en core | Inyecta `StoragePort` |
| Lógica de inventario en `InventoryUI.tsx` | UI lee state, lógica en core/rules |
| `useFrame` en core | useFrame en renderer llama función de core |
