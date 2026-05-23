# 0002 — useFrame from R3F for game loop

**Status**: accepted (revisar en Fase 3)
**Date**: 2026-05-23

## Context

El engine necesita un loop que avance física, mueva personajes, actualice sprites. Hoy se usa `useFrame` de `@react-three/fiber`.

`useFrame` está acoplado a R3F → no es agnóstico. Sin embargo, es la opción canónica para sincronizar con el renderer R3F.

## Decision

**Para v0.1-v0.2**: usar `useFrame` en la capa Renderer (`apps/web-demo/app/lib/engine/runtime/`). El componente `GameTouchSpriteRuntime` lo invoca y delega a funciones puras del core.

**Para v0.3 (Fase 3)**: definir `RendererPort.onTick(callback)` agnóstico que cada renderer implementa. R3F implementa con `useFrame`, vanilla Three.js con `requestAnimationFrame`, Babylon con su `Engine.runRenderLoop`.

## Consequences

- ✅ Sincronizado con frame rate del renderer (no tearing)
- ✅ Integrado con Rapier physics
- ✅ Funciona en SSR (noop)
- ❌ Acopla la lógica de ticks a R3F en v0.1-v0.2
- ❌ Tests del runtime requieren mock de R3F hasta Fase 3

## Alternatives considered

- **`requestAnimationFrame` directo**: agnóstico pero requeriría re-sincronizar manualmente con R3F y Rapier. Más complejidad sin beneficio inmediato.
- **`setInterval`**: no sincroniza con vsync, tearing visible.
- **Game loop custom en core**: trabajo de Fase 3, prematuro hoy.

## Notes

`useFrame` debe llamar a funciones **puras** del core (e.g., `advancePhysicsStep(dt)`). NO meter lógica directamente en el callback.

En Fase 3, abrir ADR-0005 superseding parte de este si se introduce `RendererPort`.
