# Task 08: Validation gate (close Phase 3)

**Phase**: 3 | **Estimate**: 1h | **Owner**: —

## Context

Última task de Fase 3. Validar que todos los Success Criteria de la fase se cumplen antes de declarar la fase cerrada y pasar a Fase 4.

## Prerequisites

- [ ] Tasks 01-07 done (todas marcadas `[x]` en tracking.md)
- [ ] Branch limpio, último commit pushed

## Action

Ejecutar la batería de validaciones y guardar resultado en `docs/phases/phase-3-renderer-abstract/validation-report.md`.

### 1. Agnosticidad de engine-core (más estricta que Fase 2)

```bash
echo "=== Agnosticidad engine-core ===" > /tmp/gate3.txt

echo "-- React imports:" >> /tmp/gate3.txt
grep -rn "import.*react\|from ['\"]react" packages/engine-core/src/ >> /tmp/gate3.txt 2>&1 || echo "✅ clean" >> /tmp/gate3.txt

echo "-- R3F imports:" >> /tmp/gate3.txt
grep -rn "@react-three" packages/engine-core/src/ >> /tmp/gate3.txt 2>&1 || echo "✅ clean" >> /tmp/gate3.txt

echo "-- Three.js imports:" >> /tmp/gate3.txt
grep -rn "from ['\"]three" packages/engine-core/src/ >> /tmp/gate3.txt 2>&1 || echo "✅ clean" >> /tmp/gate3.txt

echo "-- Next imports:" >> /tmp/gate3.txt
grep -rn "from ['\"]next" packages/engine-core/src/ >> /tmp/gate3.txt 2>&1 || echo "✅ clean" >> /tmp/gate3.txt

echo "-- Browser globals:" >> /tmp/gate3.txt
grep -rn "\bwindow\.\|\bdocument\.\|\bnavigator\." packages/engine-core/src/ >> /tmp/gate3.txt 2>&1 || echo "✅ clean" >> /tmp/gate3.txt

cat /tmp/gate3.txt
```

**Esperado**: 5 secciones marcadas `✅ clean`.

### 2. Estructura de packages

Verificar que existen:
- ✅ `packages/engine-core/` con ports definidos (gameLoop, input, viewport)
- ✅ `packages/engine-renderer-r3f/` con adapters R3F
- ✅ Tests headless en `packages/engine-core/__tests__/`

### 3. Build de todo el workspace

```bash
npm run build
```

**Esperado**: sin errores en ningún package ni app.

### 4. Tests

```bash
npm run test
```

**Esperado**: engine-core verde (con nuevos tests de ports), web-demo verde.

### 5. Lint

```bash
npm run lint
```

**Esperado**: sin errores.

### 6. Demo funcional

```bash
npm run dev
```

Manual: abrir `http://localhost:3000` y probar golden path completo (mismo que Phase 2).

- [ ] Escena inicial carga
- [ ] WASD funciona
- [ ] Click-to-move funciona
- [ ] Cambio de escena funciona
- [ ] Inventario funciona
- [ ] Diálogos aparecen
- [ ] (Si debug) `/debug` con `NEXT_PUBLIC_ENABLE_DEBUG=true` funciona

### 7. Performance check

Comparar FPS antes/después si hay framework de medición. Si no, observar visualmente que no hay stutter perceptible.

### 8. Crear validation-report.md

```markdown
# Phase 3 Validation Report

Date: <fecha>

## Agnosticidad
- React imports in core: ✅ clean
- R3F imports in core: ✅ clean
- Three.js imports in core: ✅ clean
- Next imports in core: ✅ clean
- Browser globals in core: ✅ clean

## Structure
- engine-core ports: ✅ gameLoop, input, viewport
- engine-renderer-r3f adapters: ✅ useR3FGameLoop, WebKeyboardInput
- Tests headless: ✅ N tests

## Build / Test / Lint
- `npm run build`: ✅
- `npm run test`: ✅ (N tests pass)
- `npm run lint`: ✅

## Demo funcional
- Golden path manual: ✅

## Performance
- FPS estable: ✅ (sin regresión perceptible)

## Conclusión
Phase 3 COMPLETED. Listo para Phase 4.
```

## Success Criteria

- [ ] Todos los chequeos del gate pasan
- [ ] `validation-report.md` creado con resultados
- [ ] Tracking.md de Phase 3 al 100% (`8/8` tareas `[x]`)
- [ ] README.md de Phase 3 actualizado a `Estado: completed`

## On Complete

1. Marca `[x]` en `../tracking.md` para `08-validation-gate`
2. Actualiza status en `../README.md`: `Estado: completed`
3. Commit:
   ```
   chore(phase-3): pass validation gate, close phase

   Phase 3 (renderer abstraction) completed.
   - engine-core: ports defined, fully agnostic (no React/R3F/Three)
   - engine-renderer-r3f: implements ports, demo functional
   - web-demo: consumes both packages cleanly

   - [x] Marked: 08-validation-gate

   See docs/phases/phase-3-renderer-abstract/validation-report.md
   ```
4. Crear `docs/phases/phase-4-bidirectional-web-game/` con `how-to-create-plan.md`

## References

- Architecture: `docs/architecture/01-layers.md`
- Workflow: `docs/workflow/pre-commit-checklist.md`
- Phase 2 gate (referencia): `docs/phases/phase-2-core-extraction/tasks/08-validation-gate.md`

## Notes

Si algún chequeo falla, NO marcar `[x]`. Crear task de seguimiento (`08a-fix-X.md`) y resolver antes de cerrar la fase.

Punto especial: la verificación de `three` imports en core es nueva (Fase 2 solo verificaba React/R3F/Next). Si Three.js aparece en core, es regresión grave de Phase 3 — investigar y mover al renderer.
