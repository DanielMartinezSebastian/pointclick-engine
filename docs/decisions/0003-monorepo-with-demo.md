# 0003 — Monorepo with demo inside

**Status**: accepted
**Date**: 2026-05-23

## Context

El proyecto tiene dos artefactos:
1. **`engine-core`** — librería agnóstica publicable en npm
2. **Demo R3F** — implementación de referencia para validar el engine

Opciones de organización:
- A: Monorepo único con `packages/` + `apps/web-demo/`
- B: Dos repos separados (engine público, demo privada/separada)
- C: Engine en repo, demo como `examples/` simple

## Decision

**Monorepo único** con `packages/engine-core/` y `apps/web-demo/` (Opción A).

Conforme la librería madure (v1.0), considerar mover demo a repo separado como "demo técnica oficial 100% desacoplada".

## Consequences

- ✅ Cambios atómicos engine + demo en un commit
- ✅ Testing inmediato del impacto en demo al tocar engine
- ✅ Un solo `npm install`, una sola CI
- ✅ Demo siempre actualizada (no stale)
- ❌ Repo más grande
- ❌ Consumidores externos no ven una librería "pura" (verán también demo)
- ❌ Cuando publicemos a npm, solo publicar `packages/engine-core` (no toda la repo)

## Alternatives considered

- **Repos separados**: friction al testear cambios — un PR en engine no valida la demo automáticamente. Rechazado.
- **examples/ simple**: pierde la realidad de tener un Next.js completo testando el engine en condiciones reales. Rechazado.

## Notes

Tras v1.0:
- Crear repo separado `pointclick-demo-r3f` 100% desacoplado, consumiendo `@pointclick/engine-core` desde npm.
- Mantener `apps/web-demo/` en el monorepo para desarrollo del engine (evaluación rápida).

La doble demo (interna para dev, externa para usuarios) no es duplicación: cumplen roles distintos.
