# Phase 15 — Green Baseline

**Objetivo**: dejar el repo en verde verificable (tests, type-check, lint, build, CI) y la doc alineada con el código, antes de tocar arquitectura.
**Duración estimada**: 2–3 días
**Estado**: active
**Owner**: Daniel Martínez Sebastián
**Version target**: v0.4.1 (sin cambios de API salvo un fix de tipo, ver tarea 01)

---

## Por qué

Auditoría del 2026-10-10 (medido, no estimado):

| Comprobación | Resultado |
|---|---|
| `engine-core` tests | 244/244 ✅ |
| `engine-renderer-r3f` tests | 61/66 — 5 fallan en `useAudioSystem.test.tsx` |
| `web-demo` tests | 46/50 — 4 fallan en `publicApi.test.ts` |
| `tsc --noEmit` demo | 10 errores (solo en tests) |
| `eslint` demo | 11 errores, 9 warnings |
| `next build` | ✅ |
| CI | no existe |
| `dist/` | versionado (260 archivos) y desfasado respecto a `src` en 9 |
| Docs | fases 6, 8, 10–13 con estado erróneo; 28 checks de gate sin validar |

Sin una base verde no se puede validar la Fase 16 (mover el runtime a la librería).

## Resultado esperado

Desde la raíz, todo esto termina con código 0:

```bash
npm run build -w packages/engine-core -w packages/engine-renderer-r3f
npm test
npx tsc --noEmit -p packages/engine-core
npx tsc --noEmit -p packages/engine-renderer-r3f
npx tsc --noEmit -p apps/web-demo
npm run lint
npm run build
```

Y además: CI en GitHub Actions ejecutándolo, `dist/` fuera de git, docs sincronizadas.

## Tareas y reparto

Los archivos de cada tarea son **disjuntos**: las tareas 01–06 y 08 corren en paralelo.

| # | Tarea | Modelo | Capa |
|---|---|---|---|
| 01 | [Arreglar tests de contrato de publicApi](tasks/01-fix-publicapi-contract-tests.md) | sonnet | demo |
| 02 | [Arreglar tests de useAudioSystem](tasks/02-fix-audio-system-tests.md) | sonnet | renderer |
| 03 | [Lint: errores de reglas React](tasks/03-lint-react-rules.md) | sonnet | demo |
| 04 | [Lint: `any` e imports sin usar](tasks/04-lint-trivial.md) | haiku | demo |
| 05 | [Core: guarda de `process.env`](tasks/05-core-node-env-guard.md) | haiku | core |
| 06 | [Workflow de CI](tasks/06-ci-workflow.md) | haiku | tooling |
| 07 | [Sacar `dist/` de git](tasks/07-untrack-dist.md) | opus (orquestador) | tooling |
| 08 | [Resincronizar docs](tasks/08-docs-resync.md) | haiku | docs |
| 09 | [Gate de validación](tasks/09-validation-gate.md) | opus (orquestador) | todas |

## Reglas para todas las tareas

- **No hacer commit ni tocar el índice de git** (salvo `git mv`/`git rm` que la tarea pida). El orquestador integra y commitea.
- Tocar **solo** los archivos listados en la tarea. Si hace falta otro, parar y reportarlo.
- No arreglar un test debilitando la aserción: si el test describe un comportamiento que ya no existe, se reescribe para el comportamiento actual y se explica en el reporte.
- Regla de Oro: `packages/engine-core` nunca importa React/R3F/Next/`window`/`document`.

## Fuera de alcance

Mover `createGameRuntime` a un paquete, borrar duplicados, primitivas narrativas → Fase 16 en adelante.
