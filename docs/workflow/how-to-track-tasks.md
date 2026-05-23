# Cómo Trackear Tareas

## Principio

**El `tracking.md` de la fase activa es la fuente de verdad.** Si una tarea está hecha pero no `[x]`, no cuenta.

## Workflow diario

```
Mañana:
1. Abre docs/phases/<fase-activa>/tracking.md
2. Identifica próxima tarea sin [x]
3. Abre el archivo de la tarea (link en tracking)
4. Lee Prerequisites, Action, Success Criteria

Durante:
5. Ejecuta Action
6. Valida Success Criteria

Al terminar:
7. Cambia [ ] a [x] en tracking.md
8. Commit (ver commit-convention.md)
```

## Sintaxis

```markdown
- [ ] Tarea pendiente
- [x] Tarea completada
```

En GitHub/GitLab puedes clickear el checkbox y se actualiza el MD automáticamente.

## Ver progreso

Script para ver progreso en cualquier momento:

```bash
#!/bin/bash
# scripts/check_progress.sh
PHASE=${1:-phase-2-core-extraction}
TRACKING="docs/phases/$PHASE/tracking.md"

checked=$(grep -c "^\s*- \[x\]" "$TRACKING")
unchecked=$(grep -c "^\s*- \[ \]" "$TRACKING")
total=$((checked + unchecked))
pct=$((checked * 100 / total))

echo "Phase: $PHASE"
echo "Progress: $checked/$total ($pct%)"
echo ""
echo "Next pending:"
grep "^\s*- \[ \]" "$TRACKING" | head -3
```

Uso: `./scripts/check_progress.sh phase-2-core-extraction`

## Reglas

1. **Una tarea marcada `[x]` debe tener Success Criteria validados.** No marques wishful.
2. **Si encuentras una sub-tarea no listada**: añádela al tracking + crea task file si es no-trivial.
3. **Si una tarea está bloqueada**: déjala en `[ ]`, comenta en tracking por qué está bloqueada.
4. **No edites task files una vez marcados `[x]`** — son histórico. Crea uno nuevo si hace falta.

## Convención de marcado en commit

Cuando marcas checks, el commit lo refleja:

```
feat(phase-2): complete task 04 - extract pathfinding

- [x] Marked: 04-extract-pathfinding (Success criteria validated)
```

Ver `commit-convention.md` para formato completo.

## Anti-patterns

| ❌ | ✅ |
|----|----|
| Marcar `[x]` sin validar Success Criteria | Validar primero, marcar después |
| Crear tareas en chat/Slack/Jira | Tareas en `docs/phases/*/tasks/` |
| Tracking en herramienta externa | Tracking en `.md` versionado |
| Subir múltiples checks en un commit gigante | Atomic commit por tarea (o sprint pequeño) |
