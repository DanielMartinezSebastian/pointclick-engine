# Task 01: Pre-publish audit + release strategy ADR

**Phase**: 5 | **Estimate**: 2h | **Owner**: —

## Context

Antes de tocar `package.json` o publicar nada, hace falta una foto del estado actual de cada package y decidir cómo se versiona, dónde se publica y bajo qué scope. Esta task no modifica código: produce un audit report + ADR-0007.

## Prerequisites

- [ ] Phase 4 cerrada (bidirectional API estable)
- [ ] Acceso a npmjs.com para verificar disponibilidad de scope
- [ ] Leer `package.json` de cada workspace (`packages/engine-core`, `packages/engine-renderer-r3f`, `apps/web-demo`)

## Action

### 1. Auditar estado actual

Generar `docs/phases/phase-5-publish/audit-report.md` con:

```bash
echo "## Workspaces" > docs/phases/phase-5-publish/audit-report.md
echo "" >> docs/phases/phase-5-publish/audit-report.md
ls packages/ apps/ >> docs/phases/phase-5-publish/audit-report.md

echo "" >> docs/phases/phase-5-publish/audit-report.md
echo "## package.json sizes" >> docs/phases/phase-5-publish/audit-report.md
wc -l packages/engine-core/package.json packages/engine-renderer-r3f/package.json >> docs/phases/phase-5-publish/audit-report.md

echo "" >> docs/phases/phase-5-publish/audit-report.md
echo "## Source line counts" >> docs/phases/phase-5-publish/audit-report.md
find packages/engine-core/src -name "*.ts" | xargs wc -l | tail -1 >> docs/phases/phase-5-publish/audit-report.md
find packages/engine-renderer-r3f/src -name "*.ts" -o -name "*.tsx" | xargs wc -l | tail -1 >> docs/phases/phase-5-publish/audit-report.md
```

Manual: completar el reporte con:

- **Dependencias actuales** vs. peer recomendadas (¿`three` y `@react-three/fiber` deberían ser peer en renderer-r3f?)
- **Comandos no cableados** (heredados de Phase 4: lista de `executor not yet wired`)
- **Imports `file:`** en `apps/web-demo/package.json`
- **Subpath exports actuales** (hoy solo `.` — se ampliará en Task 04)
- **Disponibilidad de scope npm**: `npm view @pointclick-engine/engine-core` → 404 esperado

### 2. Decidir release strategy (ADR-0007)

Crear `docs/decisions/0007-release-strategy.md`:

```markdown
# ADR-0007: Release Strategy

## Context
Estamos listos para publicar `engine-core` y `engine-renderer-r3f`. Decidir:
- Scope npm
- Versionado (lockstep vs independiente)
- Bundle formats (ESM only vs ESM+CJS)
- Registry (npm vs GitHub Packages vs ambos)
- Tag y publish (manual vs CI)

## Decisions

### Scope
`@pointclick-engine/*` si disponible. Fallback: `@dms-pointclick/*`. Verificado en Task 01 audit.

### Versionado
Lockstep en v0.x: ambos packages comparten versión para evitar matriz de compatibilidad temprana. Cambio a independiente al llegar a v1.0 si tiene sentido.

### Bundle formats
Solo ESM inicialmente. `type: "module"` ya está. CJS solo si un consumer lo pide.

### Registry
npmjs.com (público). GitHub Packages como fallback durante alpha si scope no está libre.

### Tag y publish
Manual durante v0.x: `npm version` + `git tag` + `npm publish`. Documentar en Task 08. CI automático post-v1.0.

### Pre-release
Primer release puede ser `0.1.0-alpha.1` para reservar nombre sin comprometer API.

## Consequences
- Versionado lockstep simplifica docs pero fuerza bumps del renderer aunque no cambie.
- Solo ESM evita ambigüedad pero excluye consumers Node-CJS legacy. Aceptable: la mayoría de bundlers modernos consumen ESM.
- Publish manual reduce riesgo de leaks pero exige disciplina (ver `docs/workflow/how-to-release.md` Task 08).

## Alternatives considered
- Changesets: descartado para v0.x (overhead). Reevaluar en v1.x.
- Versionado independiente desde día 1: descartado (matriz de compat con 2 packages alpha es ruido).
- CJS dual via tsup/rollup: descartado por ahora (añade build complexity).
```

### 3. Identificar gaps que bloquean publish

Listado en `audit-report.md`:

- [ ] Phase 4 commands no cableados → Task 02
- [ ] Demo content acoplado a app → Task 03
- [ ] Subpath exports faltan → Task 04
- [ ] Sin README/LICENSE/CHANGELOG → Task 05
- [ ] Sin verificación tarball → Task 06
- [ ] Sin renderer guide → Task 07

## Success Criteria

- [ ] `docs/phases/phase-5-publish/audit-report.md` existe con secciones: workspaces, deps actuales, gaps a resolver, scope npm verificado
- [ ] `docs/decisions/0007-release-strategy.md` existe con decisiones justificadas
- [ ] `npm view @pointclick-engine/engine-core` confirmado (404 = libre, o existing = decidir alternativa)
- [ ] ADR linkado desde `docs/decisions/README.md`
- [ ] Cada gap del audit referencia la task que lo resuelve

## On Complete

1. Marca `[x]` en `../tracking.md` para `01-pre-publish-audit`
2. Commit:
   ```
   docs(phase-5): add ADR-0007 release strategy + pre-publish audit

   - [x] Marked: 01-pre-publish-audit

   See docs/phases/phase-5-publish/tasks/01-pre-publish-audit.md
   ```

## References

- Roadmap §4.4 (publicación)
- Phase 4 README (lista de commands no cableados)
- npm docs: https://docs.npmjs.com/cli/v10/commands/npm-publish

## Notes

Si `@pointclick` está ocupado en npm y no se puede reclamar, **detener cadena**: el resto de tasks dependen del scope final. Reabrir esta task con el scope alternativo escogido antes de seguir.

No comprometer scope vía publicaciones reales en esta task: solo verificación. El primer `npm publish` real ocurre en Task 08 (o nunca, si se elige dry-run).
