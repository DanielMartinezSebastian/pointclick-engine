# Task 01: Design renderer ports (research + ADR)

**Phase**: 3 | **Estimate**: 2h | **Owner**: —

## Context

Fase 3 requiere abstraer el renderer R3F detrás de interfaces (ports) en `engine-core`. Antes de codificar nada, decidir qué interfaces crear y con qué granularidad. Resultado: ADR-0005 + esqueleto de tipos en core.

**No mover código todavía**. Esta task es solo diseño.

## Prerequisites

- [ ] Phase 2 cerrada (engine-core agnóstico)
- [ ] Leer `docs/architecture/01-layers.md` y `03-rules-core-vs-render.md`

## Action

### 1. Auditar el renderer R3F actual

Lista todos los puntos donde el renderer toca el core:

```bash
grep -rn "useFrame\|useThree\|@react-three\|Vector2\|Vector3" apps/web-demo/app/lib/engine/ | wc -l
```

Inventario mínimo a producir:
- **Game loop**: dónde se invoca `useFrame` y qué hace cada uno
- **Input**: dónde se lee keyboard/mouse/touch
- **Physics**: dónde se usan Rapier colliders
- **Viewport**: dónde se monta el Canvas

### 2. Diseñar las interfaces

Crear `docs/decisions/0005-renderer-ports-design.md` con:

```markdown
# ADR-0005: Renderer Ports Design

## Context
<por qué abstraer el renderer>

## Decision
Definimos 4 ports en engine-core:

- `GameLoopPort`: subscribe(callback: (delta: number) => void) → unsubscribe
- `InputPort`: keyboard/mouse/touch events as RxJS-like observables o callbacks
- `ViewportPort`: dimensions, camera position queries
- `PhysicsPort`: opcional (decidir si abstraer Rapier o dejarlo en renderer)

## Consequences
<trade-offs, qué facilita, qué complica>

## Alternatives considered
<otras opciones evaluadas y por qué descartadas>
```

### 3. Crear esqueleto de tipos en core

En `packages/engine-core/src/ports/` crear:

- `index.ts` — barrel
- `gameLoop.ts` — interface `GameLoopPort` (solo signatures, no implementation)
- `input.ts` — interface `InputPort`
- `viewport.ts` — interface `ViewportPort`

**Importante**: solo interfaces TypeScript, sin implementación. Las implementaciones viven en `engine-renderer-r3f`.

### 4. Re-exportar desde engine-core

En `packages/engine-core/src/index.ts`:

```ts
export * from "./ports";
```

## Success Criteria

- [ ] `docs/decisions/0005-renderer-ports-design.md` existe con decisión justificada
- [ ] `packages/engine-core/src/ports/` existe con 4 archivos (index, gameLoop, input, viewport)
- [ ] `npm run build -w packages/engine-core` pasa
- [ ] `grep "react\|three" packages/engine-core/src/ports/` devuelve nada
- [ ] ADR linked desde `docs/decisions/README.md`

## On Complete

1. Marca `[x]` en `../tracking.md` para `01-design-renderer-ports`
2. Commit:
   ```
   docs(phase-3): add ADR-0005 renderer ports design + skeleton

   - [x] Marked: 01-design-renderer-ports

   See docs/phases/phase-3-renderer-abstract/tasks/01-design-renderer-ports.md
   ```

## References

- Architecture: `docs/architecture/01-layers.md`, `docs/architecture/03-rules-core-vs-render.md`
- ADR template: `docs/decisions/README.md`

## Notes

No abstraer Physics en esta task — Rapier es complejo y específico. Decidir en ADR si entra en Fase 3 o se queda en renderer.
