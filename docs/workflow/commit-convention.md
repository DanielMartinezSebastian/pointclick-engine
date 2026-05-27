# Commit Convention

Conventional Commits + tracking-aware.

## Formato

```
<type>(<scope>): <subject>

<body>

<footer>
```

## Types

| Type | Uso |
|------|-----|
| `feat` | Nueva funcionalidad |
| `fix` | Bug fix |
| `refactor` | Cambio sin afectar comportamiento |
| `perf` | Mejora de rendimiento |
| `docs` | Solo documentación |
| `test` | Solo tests |
| `chore` | Build, deps, tooling |
| `style` | Formato (sin cambios funcionales) |

## Scopes recomendados

- `core` — `packages/engine-core/`
- `renderer` — código R3F
- `ui` — componentes UI
- `platform` — adapters
- `demo` — `apps/web-demo/`
- `phase-N` — trabajo dentro de una fase específica

## Subject

- Imperativo: `add`, `fix`, `extract` (no `added`, `fixing`)
- Sin punto final
- Lowercase
- < 70 caracteres

## Body (opcional)

- Qué y por qué, no cómo (el código dice el cómo)
- Líneas <72 chars

## Footer

Referencias a issues, tracking, breaking changes.

```
Closes #123
See docs/phases/phase-2-core-extraction/tasks/04-extract-pathfinding.md
BREAKING CHANGE: <descripción>
```

## Si marcas checks en tracking

Incluye una sección "Marked" en el body:

```
feat(phase-2): extract pathfinding to engine-core

Moved findPath.ts from app/lib/engine/movement/ to
packages/engine-core/src/game/logic/pathfinding/.
Updated imports in web-demo to consume from @pointclick-engine/engine-core.

- [x] Marked: 04-extract-pathfinding

See docs/phases/phase-2-core-extraction/tasks/04-extract-pathfinding.md
```

## Ejemplos completos

### Refactor de core

```
refactor(core): extract pathfinding module

Moved findPath() and its helpers from app/lib/engine/movement/
to packages/engine-core/src/game/logic/pathfinding/.

No behavior change. Tests pass without React mocks.

- [x] Marked: 04-extract-pathfinding

See docs/phases/phase-2-core-extraction/tracking.md
```

### Fix puntual

```
fix(renderer): prevent double-trigger of click-to-move on touch

Touch event was firing pointerdown + click. Added pointer-type
check to bail out on synthetic click after touch.

Closes #87
```

### Docs

```
docs(workflow): clarify subagent prompt format

Subagents were getting narrative prompts that re-stated tasks.
Now docs show: just point to the task file.

See docs/workflow/how-to-spawn-subagent.md
```

## Anti-patterns

| ❌ | ✅ |
|----|----|
| `wip`, `update`, `changes` | `feat(scope): describe outcome` |
| `Fixed bug` (capital, pasado) | `fix(scope): handle X edge case` |
| Commits gigantes con 50 archivos | Atomic commits por cambio lógico |
| `--no-verify` para saltarse hooks | Fix el problema, no skip |
| Falsear `[x]` en tracking | Validar Success Criteria antes |
