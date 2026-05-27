# Task 08: Validation gate (close Phase 2)

**Phase**: 2 | **Estimate**: 1h | **Owner**: —

## Context

Última task de Fase 2. Validar que todos los Success Criteria de la fase se cumplen antes de declarar la fase cerrada y pasar a Fase 3.

## Prerequisites

- [ ] Tasks 01-07 done (todas marcadas `[x]` en tracking.md)
- [ ] Branch limpio, último commit pushed

## Action

Ejecutar la batería de validaciones y guardar resultado en `docs/phases/phase-2-core-extraction/validation-report.md`.

### 1. Agnosticidad de engine-core

```bash
echo "=== Agnosticidad engine-core ===" > /tmp/gate.txt

echo "-- React imports:" >> /tmp/gate.txt
grep -rn "import.*react\|from ['\"]react" packages/engine-core/src/ >> /tmp/gate.txt 2>&1 || echo "✅ clean" >> /tmp/gate.txt

echo "-- R3F imports:" >> /tmp/gate.txt
grep -rn "@react-three" packages/engine-core/src/ >> /tmp/gate.txt 2>&1 || echo "✅ clean" >> /tmp/gate.txt

echo "-- Next imports:" >> /tmp/gate.txt
grep -rn "from ['\"]next" packages/engine-core/src/ >> /tmp/gate.txt 2>&1 || echo "✅ clean" >> /tmp/gate.txt

echo "-- Browser globals:" >> /tmp/gate.txt
grep -rn "\bwindow\.\|\bdocument\.\|\bnavigator\." packages/engine-core/src/ >> /tmp/gate.txt 2>&1 || echo "✅ clean" >> /tmp/gate.txt

cat /tmp/gate.txt
```

**Esperado**: 4 secciones marcadas `✅ clean`.

### 2. Build de todo el workspace

```bash
npm run build
```

**Esperado**: sin errores en `packages/engine-core` ni en `apps/web-demo`.

### 3. Tests

```bash
npm run test
```

**Esperado**: tests de engine-core verdes. Si web-demo tiene tests, también verdes.

### 4. Lint

```bash
npm run lint
```

**Esperado**: sin errores.

### 5. Demo funcional

```bash
npm run dev
```

Manual: abrir `http://localhost:3000` y probar golden path completo.

- [ ] Escena inicial carga
- [ ] Movimiento WASD funciona
- [ ] Click-to-move funciona
- [ ] Cambio de escena funciona
- [ ] Inventario abre/cierra
- [ ] Diálogos aparecen
- [ ] (Si debug) `/debug` con `NEXT_PUBLIC_ENABLE_DEBUG=true` funciona

### 6. Imports actualizados

```bash
grep -rn "@/app/lib/core/rules\|@/app/lib/engine/movement/findPath\|@/app/store/sceneStore" apps/web-demo/app
```

**Esperado**: nada.

### 7. Crear validation-report.md

Resumen del gate:

```markdown
# Phase 2 Validation Report

Date: <fecha>

## Agnosticidad
- React imports in core: ✅ clean
- R3F imports in core: ✅ clean
- Next imports in core: ✅ clean
- Browser globals in core: ✅ clean

## Build / Test / Lint
- `npm run build`: ✅
- `npm run test`: ✅ (N tests pass)
- `npm run lint`: ✅

## Demo funcional
- Golden path manual: ✅

## Imports updated
- Legacy paths in web-demo: ✅ none

## Conclusión
Phase 2 COMPLETED. Listo para Phase 3.
```

## Success Criteria

- [ ] Todos los chequeos del gate pasan
- [ ] `validation-report.md` creado con resultados
- [ ] Tracking.md de Phase 2 al 100% (`8/8` tareas `[x]`)

## On Complete

1. Marcar `[x]` en `../tracking.md` para `08-validation-gate`
2. Actualizar status en `../README.md`: `Estado: completed`
3. Commit:
   ```
   chore(phase-2): pass validation gate, close phase

   Phase 2 (core extraction) completed.
   - engine-core: agnostic, tested, builds clean
   - web-demo: consumes @pointclick-engine/engine-core, functional

   - [x] Marked: 08-validation-gate

   See docs/phases/phase-2-core-extraction/validation-report.md
   ```
4. Crear `docs/phases/phase-3-renderer-abstract/` con `how-to-create-plan.md`

## References

- Architecture: `docs/architecture/01-layers.md`
- Workflow: `docs/workflow/pre-commit-checklist.md`

## Notes

Si algún chequeo falla, NO marcar `[x]`. Crear task de seguimiento (`08a-fix-X.md`) y resolver antes de cerrar la fase.
