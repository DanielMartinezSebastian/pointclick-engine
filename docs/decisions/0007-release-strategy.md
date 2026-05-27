# ADR-0007: Release Strategy

**Status**: accepted
**Date**: 2026-05-27

## Context

`engine-core` y `engine-renderer-r3f` están listos para publicarse. Hay que decidir
scope npm, versionado, formatos de bundle, registry, y proceso de tag/publish antes de
ejecutar ningún `npm publish`.

## Decision

### Scope

`@pointclick-engine/*` — verificado como libre en npm (Task 01 audit). Fallback documentado:
`@dms-pointclick/*` si por cualquier razón el scope fuera ocupado antes del publish.

### Versionado

**Lockstep** durante v0.x: ambos packages comparten versión para evitar
una matriz de compatibilidad temprana. Migración a versiones independientes si fuera
necesario al llegar a v1.0.

### Bundle formats

**Solo ESM** inicialmente. `"type": "module"` ya está en ambos packages. CJS solo
si un consumer real lo solicita con justificación. Evita la complejidad de dual-bundle
con tsup/rollup en esta etapa.

### Registry

**npmjs.com** público. GitHub Packages como fallback únicamente durante alpha si
hubiera problemas con el scope. El objetivo final es npm público.

### Tag y publish

**Manual** durante v0.x:
1. `npm version` en cada workspace
2. `git tag -a vX.Y.Z`
3. `npm publish --access public`

Documentado en `docs/workflow/how-to-release.md` (Task 08).
CI automático (GitHub Actions) aplazado a post-v1.0.

### Pre-release

El primer publish puede ser `0.1.0-alpha.1` para reservar nombre sin comprometer API.
Phase 5 deja todo preparado para un `0.1.0` estable o un alpha, decisión del owner.

## Consequences

- ✅ Versionado lockstep simplifica docs y consumer upgrades en v0.x.
- ✅ Solo ESM reduce complejidad del build y el output es limpio.
- ✅ npmjs.com público da máxima visibilidad y no requiere token especial.
- ❌ Lockstep fuerza bumps del renderer aunque no cambie (aceptable en v0.x).
- ❌ Sin CJS puede excluir consumers Node-legacy; evaluable si hay demanda real.
- ❌ Publish manual requiere disciplina; mitigado por `how-to-release.md`.

## Alternatives considered

- **Changesets**: descartado para v0.x (overhead mayor de lo que aporta). Reevaluar en v1.x.
- **Versionado independiente desde día 1**: descartado (matriz de compat 2-packages alpha es ruido innecesario).
- **CJS dual via tsup/rollup**: descartado por ahora (añade build complexity sin consumer identificado).
- **GitHub Packages como primary**: descartado (requiere token para instalar, peor DX para consumers externos).
