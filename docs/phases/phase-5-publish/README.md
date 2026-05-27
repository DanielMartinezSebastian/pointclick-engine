# Phase 5: Publish to npm

**Objetivo**: Dejar `@pointclick/engine-core` y `@pointclick/engine-renderer-r3f` listos para consumirse desde proyectos externos vía `npm install`, con metadatos completos, exports limpios, ejemplos de consumo y un proceso de release documentado.
**Duración estimada**: 3-4 semanas
**Estado**: `completed` (cerrado 2026-05-27)
**Owner**: Daniel Martínez Sebastián
**Progress**: 8/8 tareas

## Por qué

Phases 2-4 entregaron una librería técnicamente sólida (core agnóstico, renderer abstracto, bus bidireccional). Pero hoy:

- Los packages usan `file:../../packages/*` en lugar de versionado real.
- `apps/web-demo/app/{scenes,items,dialogs}` mezcla **demo content** con el código de la app, dificultando que un consumer entienda qué pertenece al engine y qué a la demo.
- No hay README por package, ni LICENSE, ni CHANGELOG.
- El `exports` map es plano: no permite `import { GameCommand } from "@pointclick/engine-core/commands"`.
- Phase 4 dejó comandos no cableados (`inventory:*`, `dialog:*`, `player:stop`) como no-op con warning — aceptable para una alpha interna, **no aceptable para publicar**.
- No existe guía de "cómo implementar tu propio renderer" pese a que la abstracción de Phase 3 lo permite.

Phase 5 cierra estos huecos y publica las primeras versiones (`v0.1.0` reales, no `file:` symlinks).

## Resultado esperado

- ✅ `engine-core` y `engine-renderer-r3f` instalables vía `npm pack` + `npm install ./pkg.tgz` en un proyecto vacío
- ✅ `apps/web-demo` consume las versiones empaquetadas, no `file:` (verificable opcionalmente con un toggle)
- ✅ Demo content (`scenes`, `items`, `dialogs`) movido a `apps/web-demo/demo-content/` con su propio README
- ✅ Todos los comandos definidos en `GameCommand` tienen executor real (cero warnings de "executor not wired")
- ✅ Cada package tiene `README.md`, `LICENSE`, `CHANGELOG.md`
- ✅ Subpath exports funcionan: `@pointclick/engine-core/commands`, `/events`, `/types`, `/ports`
- ✅ `sideEffects: false` en engine-core (verificado: no hay side-effects al importar)
- ✅ `docs/architecture/06-renderer-implementation-guide.md` explica cómo escribir un renderer alternativo
- ✅ `docs/workflow/how-to-release.md` documenta el proceso de release (versionado, tag, publish)
- ✅ Validation gate: tarball instalable, tests verdes, demo funcional sobre tarball

## Tareas

Ver [`tracking.md`](tracking.md) para progreso.

| #  | Task | Estimación | Bloqueado por |
|----|------|-----------|--------------|
| 01 | [Pre-publish audit + release ADR](tasks/01-pre-publish-audit.md) | 2h | — |
| 02 | [Wire pending commands](tasks/02-wire-pending-commands.md) | 3h | 01 |
| 03 | [Separate demo content from app](tasks/03-separate-demo-content.md) | 3h | — |
| 04 | [Package exports + metadata](tasks/04-package-exports-and-metadata.md) | 2h | 01 |
| 05 | [READMEs, LICENSE, CHANGELOG](tasks/05-readmes-licenses-changelogs.md) | 2h | 04 |
| 06 | [Publish dry-run via tarball](tasks/06-publish-dry-run.md) | 3h | 04, 05 |
| 07 | [Renderer implementation guide + consumption refresh](tasks/07-final-docs-and-renderer-guide.md) | 3h | 04 |
| 08 | [Validation gate + tag v0.1.0](tasks/08-validation-gate.md) | 2h | 02, 03, 06, 07 |

**Total**: ~20 horas de trabajo efectivo, distribuido en 3-4 semanas.

## Decisiones

- ADR-0007 (a crear en Task 01): Release Strategy — versionado (semver vs. lockstep), scope npm, public vs. restricted, registry (npm.js o GitHub Packages), proceso de tag y publish.

## Si una tarea se complica

Si una task estimada en 3h tarda >5h, crear sub-tasks (`NNa-`, `NNb-`) antes de seguir empujando.

## Riesgos

| Riesgo | Mitigación |
|--------|-----------|
| `@pointclick` scope ocupado en npm | Task 01 verifica disponibilidad antes; fallback a `@dms-pointclick` u otro |
| `engine-renderer-r3f` arrastra `three`/`@react-three/*` como deps directas en lugar de peer | Task 04 audita y mueve a peerDependencies con rango amplio |
| Tarball de engine-core no incluye los `.d.ts` necesarios | Task 06 valida con `npm pack --dry-run` + install real |
| Breaking changes accidentales en `publicApi.ts` durante limpieza | Task 02/03 no tocan firmas, solo internals; gate verifica diff de `publicApi.ts` |
| Bundle de demo crece tras separar content | Medir bundle Next.js antes/después en Task 03 |
| Comandos inventory/dialog requieren stores adicionales no expuestos | Task 02 evalúa: cablear vía DI o documentar como "next:phase" si requiere refactor mayor |
| Tags `v0.1.0` + push pueden disparar CI inesperado | Task 08 hace dry-run primero; el publish real es opcional/manual |

## Out of Scope (futuro)

- Crear renderer alternativo real (PixiJS, Canvas 2D) — fuera del scope, queda como ejercicio guiado por el doc 06
- Bundle ESM + CJS dual — empezamos solo ESM (ver ADR-0007)
- Auto-publish vía CI (GitHub Actions) — se documenta el proceso manual; CI puede venir en post-1.0
- Tree-shaking bundle visualization (`source-map-explorer`) — opcional, Task 06 nota si hay anomalías
- Versionado vía Changesets o similar — empezar con tags manuales

## Tras esta fase

`v0.1.0` publicado (o publicable). El motor entra en **mantenimiento + iteración pública**: bugs, mejoras, nuevos renderers contribuidos. Próximos hitos sugeridos (post-v0.1.0, no fases formales):

- `v0.2.x`: cablear `dialog:*` y `inventory:*` si quedaron stubs en Task 02
- `v0.3.x`: renderer adicional (PixiJS o Canvas 2D) por terceros
- `v1.0.0`: API congelada tras feedback de consumers reales

## Referencias

- Roadmap general: [`../../ROADMAP_FRAMEWORK_AGNOSTIC_REFACTORING.md`](../../ROADMAP_FRAMEWORK_AGNOSTIC_REFACTORING.md) sección 4.4
- Phase 4 (anterior): [`../phase-4-bidirectional-web-game/README.md`](../phase-4-bidirectional-web-game/README.md)
- Contrato público: [`../../architecture/02-public-api.md`](../../architecture/02-public-api.md)
- ADRs previos: [`../../decisions/`](../../decisions/) (0001-0006)
