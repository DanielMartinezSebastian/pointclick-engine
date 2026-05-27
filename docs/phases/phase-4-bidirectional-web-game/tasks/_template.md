# Task NN: <Título imperativo>

**Phase**: 4 | **Estimate**: <Xh> | **Owner**: —

## Context

<3-5 líneas. Qué existe hoy, por qué hay que hacer este cambio.>

## Prerequisites

- [ ] Task XX done (si aplica)
- [ ] Otra precondición verificable

## Action

```bash
# Comandos exactos a ejecutar
<command 1>
<command 2>
```

Cambios manuales necesarios:
- En `<archivo>`: cambiar `<antes>` por `<después>`
- ...

## Success Criteria

Todos verificables con un comando o test:

- [ ] `<comando>` devuelve `<resultado esperado>`
- [ ] Tests pasan: `npm run test -- <filtro>`
- [ ] `grep <pattern>` returns nothing
- [ ] Demo R3F sigue funcionando: `npm run dev` + golden path

## On Complete

1. Marca `[x]` en `../tracking.md` para esta task
2. Commit:
   ```
   <type>(<scope>): <subject>

   - [x] Marked: NN-<task-slug>

   See docs/phases/phase-4-bidirectional-web-game/tasks/NN-<task-slug>.md
   ```

## References

- Architecture: `docs/architecture/<archivo>.md` (si aplica)
- Related task: `NN-<otra>.md`
- ADR: `docs/decisions/<adr>.md`

## Notes

(Cualquier gotcha, edge case, o cosa a recordar — opcional)
