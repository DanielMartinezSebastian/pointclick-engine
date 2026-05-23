# Task 01: Audit core agnosticism

**Phase**: 2 | **Estimate**: 1h | **Owner**: —

## Context

Antes de mover `app/lib/core/`, `app/lib/engine/movement/`, `app/store/sceneStore.ts` a `packages/engine-core/`, hay que verificar que no contienen imports de React/R3F/Next.js/navegador. Si tienen, hay que limpiarlos primero o documentarlos.

## Prerequisites

Ninguno. Tarea read-only.

## Action

Ejecutar las 4 búsquedas y guardar resultados en `docs/phases/phase-2-core-extraction/audit-findings.md`:

```bash
# 1. React imports
echo "=== React imports ===" > /tmp/audit.txt
grep -rn "import.*react" app/lib/core/ app/lib/engine/movement/ app/store/sceneStore.ts 2>/dev/null >> /tmp/audit.txt
echo "" >> /tmp/audit.txt

# 2. R3F imports
echo "=== R3F imports ===" >> /tmp/audit.txt
grep -rn "import.*@react-three\|useFrame\|useThree\|useLoader" app/lib/core/ app/lib/engine/movement/ app/store/sceneStore.ts 2>/dev/null >> /tmp/audit.txt
echo "" >> /tmp/audit.txt

# 3. Next.js imports
echo "=== Next.js imports ===" >> /tmp/audit.txt
grep -rn "import.*next" app/lib/core/ app/lib/engine/movement/ app/store/sceneStore.ts 2>/dev/null >> /tmp/audit.txt
echo "" >> /tmp/audit.txt

# 4. Browser globals
echo "=== Browser globals ===" >> /tmp/audit.txt
grep -rn "window\.\|document\.\|navigator\.\|localStorage" app/lib/core/ app/lib/engine/movement/ app/store/sceneStore.ts 2>/dev/null >> /tmp/audit.txt

cat /tmp/audit.txt
```

Copiar el output a `docs/phases/phase-2-core-extraction/audit-findings.md` con análisis: cada match → ¿es OK (en string, comentario) o es violación?

## Success Criteria

- [ ] Archivo `audit-findings.md` creado con resultado de las 4 búsquedas
- [ ] Cada match clasificado como `OK` o `VIOLATION`
- [ ] Si hay VIOLATIONS: crear tasks de seguimiento `01a-fix-violation-*.md` ANTES de avanzar a task 02
- [ ] Si no hay violations: documentar "Core verified agnostic" en findings

## On Complete

1. Marcar `[x]` en `../tracking.md` para `01-audit-core-agnosticism`
2. Commit:
   ```
   docs(phase-2): audit core agnosticism

   N matches found, classified as OK / VIOLATION.

   - [x] Marked: 01-audit-core-agnosticism

   See docs/phases/phase-2-core-extraction/audit-findings.md
   ```

## References

- Architecture: `docs/architecture/03-rules-core-vs-render.md`

## Notes

Esta tarea NO mueve código. Solo audita. Si hay violations, el plan se ajusta antes de task 02.
