# Cómo Delegar Tareas a Subagentes

## Principio

Cada task file (`docs/phases/*/tasks/NN-*.md`) es **autocontenido**. Un subagente puede ejecutarlo leyendo solo ese archivo (~50L) + 1-2 archivos de `architecture/` referenciados.

**Contexto típico de un subagente**: 3-5k tokens (vs 30k+ si tuviera que leer toda la doc).

## Cuándo delegar a subagente

✅ **Sí delegar** cuando:
- La tarea es claramente acotada (un task file)
- Tiene Success Criteria objetivos (comandos, tests)
- No requiere decisiones arquitectónicas
- Puede ejecutarse en paralelo con otras

❌ **No delegar** cuando:
- Requiere decisiones de diseño
- Toca código en múltiples capas
- No hay task file definido (créalo primero)

## Cómo invocar un subagente

### Para una tarea simple (Explore agent)

```
Agent({
  subagent_type: "Explore",
  description: "Audit React imports in core",
  prompt: "Read docs/phases/phase-2-core-extraction/tasks/01-audit-react-imports.md and execute it. Report findings. No code changes — research only."
})
```

### Para una tarea con cambios (general-purpose)

```
Agent({
  subagent_type: "general-purpose",
  description: "Extract pathfinding to engine-core",
  prompt: "Execute docs/phases/phase-2-core-extraction/tasks/04-extract-pathfinding.md completely. Follow Action steps, validate Success Criteria, mark [x] in tracking.md, report back."
})
```

### Para paralelismo (varios subagentes a la vez)

Una sola message con varios `Agent` calls cuando las tareas son **independientes**:

```
- Agent 1: task 02-audit-r3f (read-only)
- Agent 2: task 03-audit-nextjs (read-only)
- Agent 3: task 04-audit-window-apis (read-only)
```

Todas devuelven hallazgos. Tú consolidas.

## Briefing del subagente

El task file ya tiene todo: Context, Action, Success Criteria. El prompt al agente debe:

1. Apuntar al archivo: `"Execute task at docs/phases/.../NN-task.md"`
2. Especificar modo: `"Research only"` o `"Implement and validate"`
3. Indicar entregable: `"Report findings"` o `"Mark [x] and commit"`

**Briefing mínimo, no re-narres la tarea.**

## Tras el subagente

1. Revisa el reporte
2. Verifica que el `[x]` se marcó (si era de implementación)
3. Verifica el commit (si lo hizo)
4. Si dejó algo a medias: crea task de seguimiento

## Anti-patterns

| ❌ | ✅ |
|----|----|
| Spawn agente para tarea sin task file | Crea task file primero |
| Prompt narrativo "haz esto, luego aquello" | Apunta al task file |
| Spawn agente para decisión arquitectónica | Tú decides, agente ejecuta |
| Spawn agente sin Success Criteria claro | Define criterio antes de delegar |
| Olvidar que el agente no ve esta conversación | Briefing autocontenido en el prompt |

## Ejemplo de task file ideal para subagente

Ver `docs/phases/phase-2-core-extraction/tasks/_template.md` y task files existentes — son el contrato de delegación.
