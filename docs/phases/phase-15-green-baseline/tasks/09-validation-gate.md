# Task 15.09 — Gate de validación

**Effort**: 1.5h | **Modelo**: opus (orquestador) | **Blocks**: Fase 16 | **Blocked by**: 01–08

---

## 🎯 Objetivo

Validar la integración de todas las tareas, cerrar los gates heredados de las fases 11–13 y dejar constancia. Nada se marca sin ejecutar el comando.

## 📝 Instructions

### 1. Revisión de cada entrega

Por tarea: leer el diff completo, comprobar que solo toca sus archivos permitidos y que ningún test se arregló relajando aserciones. Rechazar y relanzar si no cumple.

### 2. Gate técnico (desde la raíz, con `dist/` borrado antes)

```bash
npm run build:packages
npm test
npm run typecheck
npm run lint
npm run build
```

### 3. Regla de Oro

```bash
grep -rnE "from ['\"](react|react-dom|three|next|@react-three)" packages/engine-core/src   # vacío
grep -rnE "\bwindow\.|\bdocument\.|localStorage|navigator\." packages/engine-core/src | grep -v "^\S*:\d*:\s*\*"   # solo comentarios
```

### 4. Gates heredados

Recorrer el "Post-Phase Checklist" de `phase-11-audio`, `phase-12-architecture-cleanup` y `phase-13-i18n`. Para cada check: ejecutar su comando o verificación, marcar `[x]` si pasa. Si no pasa o ya no aplica, dejar `[ ]` con una nota de una línea y, si procede, abrir tarea en la Fase 16.

Conocido de antemano: el check de 11 "Demo: 1+ ítem con SFX custom vía reglas" no se cumple por la vía declarativa — `GameTouchCanvas.tsx` tiene un mapa de sonidos escrito a mano y no usa `useAudioSystem`. Se resuelve en 16.07.

### 5. Smoke en navegador

Con la skill `run-web-demo`: intro → mover con click → recoger el trofeo → pasar a la mazmorra → abrir la puerta con la llave → cambiar idioma → recargar y comprobar que persiste. Revisar la consola por errores.

### 6. Cierre

- Marcar gate final en `tracking.md` y `Estado: completed` en el README de la fase.
- Actualizar `docs/README.md` y la fila "Fase activa" de `CLAUDE.md` a la Fase 16.
- Commits atómicos por tarea según `docs/workflow/commit-convention.md`.

## ✅ Success Criteria

- [ ] Los 5 comandos del gate técnico terminan en 0.
- [ ] Greps de la Regla de Oro limpios.
- [ ] Cada check heredado está marcado o anotado.
- [ ] Smoke en navegador sin errores de consola nuevos.
