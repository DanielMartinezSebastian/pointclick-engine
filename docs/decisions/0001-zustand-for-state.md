# 0001 — Zustand for state management

**Status**: accepted
**Date**: 2026-05-23

## Context

El engine necesita state management. Debe ser agnóstico al framework para vivir en `packages/engine-core/` y permitir uso desde cualquier renderer (R3F, Babylon, vanilla Three.js).

## Decision

Usar **Zustand** como state library. Vive en `packages/engine-core/src/game/state/`.

Estado accesible via:
- `useSceneStore()` — hook React (en demo)
- `getSceneState()` — función pura (cualquier contexto)
- `subscribeSceneState(listener)` — pub/sub sin React

## Consequences

- ✅ ~1.5kb, mínimo overhead
- ✅ Funciona sin React (`store.getState()`)
- ✅ Hook React opcional, no obligatorio
- ✅ Compatible con SSR
- ❌ No tiene devtools tan ricos como Redux
- ❌ Sin time-travel debugging out-of-the-box

## Alternatives considered

- **Redux Toolkit**: demasiado opinado, más pesado, no necesitamos su ecosistema.
- **Jotai/Recoil**: muy ligados a React, no son framework-agnostic.
- **Estado custom**: reinventar la rueda, errores sutiles en pub/sub.
- **Valtio**: proxy-based, magia que dificulta debugging.

## Notes

Si en el futuro hace falta state cross-store (mobileInputStore + sceneStore), considerar selectors combinados o un parent store. No introducir Redux.
