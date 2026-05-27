# Task 08: Validation gate (close Phase 4)

**Phase**: 4 | **Estimate**: 1h | **Owner**: —

## Context

Última task de Phase 4. Validar que los criterios de salida se cumplen antes de declarar la fase cerrada y abrir Phase 5 (publicación).

## Prerequisites

- [ ] Tasks 01-07 done (todas marcadas `[x]` en tracking.md)
- [ ] Branch limpio, último commit pushed

## Action

Ejecutar la batería y guardar resultado en `docs/phases/phase-4-bidirectional-web-game/validation-report.md`.

### 1. Agnosticidad de engine-core (regresión-check)

```bash
echo "=== Agnosticidad engine-core ===" > /tmp/gate4.txt

echo "-- React imports:" >> /tmp/gate4.txt
grep -rn "import.*react\|from ['\"]react" packages/engine-core/src/ >> /tmp/gate4.txt 2>&1 || echo "✅ clean" >> /tmp/gate4.txt

echo "-- R3F imports:" >> /tmp/gate4.txt
grep -rn "@react-three" packages/engine-core/src/ >> /tmp/gate4.txt 2>&1 || echo "✅ clean" >> /tmp/gate4.txt

echo "-- Three.js imports:" >> /tmp/gate4.txt
grep -rn "from ['\"]three" packages/engine-core/src/ >> /tmp/gate4.txt 2>&1 || echo "✅ clean" >> /tmp/gate4.txt

echo "-- Browser globals (commands/events):" >> /tmp/gate4.txt
grep -rn "\bwindow\.\|\bdocument\.\|\bnavigator\." packages/engine-core/src/game/commands packages/engine-core/src/game/events >> /tmp/gate4.txt 2>&1 || echo "✅ clean" >> /tmp/gate4.txt

cat /tmp/gate4.txt
```

**Esperado**: todas las secciones marcadas `✅ clean`.

### 2. API pública verificable desde test

```bash
npm run test -w apps/web-demo -- publicApi
```

Asserts mínimos esperados en los tests existentes:

- `createGameRuntime()` retorna handle con `executeCommand`, `on`, `emit`, `dispose`
- `executeCommand({ type: "scene:set", sceneId })` produce evento `scene:changed`
- `runtime.dispose()` deja al store sin emitter (verificable con un nuevo `setScene` que no notifica)

### 3. Build de todo el workspace

```bash
npm run build
```

**Esperado**: sin errores en engine-core, engine-renderer-r3f, web-demo.

### 4. Tests

```bash
npm run test
```

**Esperado**: ≥ 60 tests verdes (29 base + nuevos de Phase 4: ≥4 commandHandler, ≥4 sceneStoreEvents, ≥4 gameEvents, ≥3 publicApi).

### 5. Lint

```bash
npm run lint
```

### 6. Demo principal funcional (no regresión)

```bash
npm run dev
```

Manual en `http://localhost:3000`:

- [ ] Escena inicial carga
- [ ] WASD funciona
- [ ] Click-to-move funciona
- [ ] Cambio de escena funciona
- [ ] Inventario funciona
- [ ] Diálogos aparecen
- [ ] No hay warnings nuevos en consola

### 7. Ejemplo `/example-bridge` funcional

Manual en `http://localhost:3000/example-bridge`:

- [ ] Canvas carga
- [ ] Botón "Goto town" cambia escena
- [ ] Botón "Respawn" reinicia player
- [ ] Log muestra al menos `scene:changed` y un evento más

### 8. Catálogo de docs

Verificar que existe y enlaza:

- `docs/architecture/05-bidirectional-communication.md`
- `docs/decisions/0006-command-event-architecture.md`
- `apps/web-demo/app/example-bridge/README.md`

### 9. Crear validation-report.md

```markdown
# Phase 4 Validation Report

Date: <fecha>

## Agnosticidad engine-core
- React/R3F/Three/browser globals en `commands` y `events`: ✅ clean

## API
- `createGameRuntime` expone `executeCommand`, `on`, `emit`, `dispose`: ✅
- Comandos cableados: scene:set, scene:respawn, player:move
- Comandos no-op con warning: player:stop, inventory:*, dialog:*

## Build / Test / Lint
- `npm run build`: ✅
- `npm run test`: ✅ (N tests pass)
- `npm run lint`: ✅

## Demo funcional
- Golden path principal: ✅
- `/example-bridge` smoke test: ✅

## Docs
- `architecture/05-bidirectional-communication.md`: ✅
- `decisions/0006-command-event-architecture.md`: ✅

## Conclusión
Phase 4 COMPLETED. Listo para Phase 5 (publicación npm).
```

## Success Criteria

- [ ] Todos los chequeos del gate pasan
- [ ] `validation-report.md` creado con resultados
- [ ] `tracking.md` de Phase 4 al 100% (`8/8` tareas `[x]`)
- [ ] `README.md` de Phase 4 actualizado a `Estado: completed`
- [ ] Memoria de usuario actualizada (entrada `phase4-progress.md`)

## On Complete

1. Marca `[x]` en `../tracking.md` para `08-validation-gate`
2. Actualiza status en `../README.md`: `Estado: completed`
3. Commit:
   ```
   chore(phase-4): pass validation gate, close phase

   Phase 4 (bidirectional web ↔ game) completed.
   - engine-core: CommandHandler + GameEvent taxonomy + store emitter
   - runtime: executeCommand / on / emit / dispose expuestos
   - web-demo: /example-bridge demuestra integración no-React
   - docs: architecture/05 + ADR-0006

   - [x] Marked: 08-validation-gate

   See docs/phases/phase-4-bidirectional-web-game/validation-report.md
   ```
4. Crear `docs/phases/phase-5-publish/` con `how-to-create-plan.md` cuando se inicie la siguiente fase

## References

- Architecture: `docs/architecture/05-bidirectional-communication.md`
- Phase 3 gate (referencia de estilo): `docs/phases/phase-3-renderer-abstract/tasks/08-validation-gate.md`
- Workflow: `docs/workflow/pre-commit-checklist.md`

## Notes

Si un chequeo falla: NO marcar `[x]`. Crear `08a-fix-X.md` y resolver antes de cerrar la fase.

**Punto especial**: el `executeCommand` debe seguir siendo sync. Si algún test del gate revela necesidad de async, no parchear con `setTimeout`: reabrir ADR-0006 o crear ADR-0007.

**Regresión común**: si añadiste un import accidental de React en `game/commands` o `game/events`, la sección 1 del gate falla. Mover esa lógica al runtime (publicApi.ts) en lugar del core.
