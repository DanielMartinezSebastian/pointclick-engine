# Task 17.18 — Guía de autoría, docs y changelog

**Effort**: 3h | **Modelo**: haiku (con verificación del orquestador) | **Blocks**: 19 | **Blocked by**: 16, 17

**Archivos permitidos**: `docs/authoring/{README.md,01-scenes-and-hotspots.md,02-conditions-and-actions.md,03-dialogues-and-npcs.md,04-items-and-combining.md,05-saving-and-testing.md}` (nuevos), `docs/architecture/10-narrative-model.md` (nuevo), `docs/LIBRARY_CONSUMPTION_GUIDE.md`, `docs/LIBRARY_API_CONTRACT_V1.md`, `docs/architecture/05-bidirectional-communication.md`, `docs/README.md`, `packages/*/README.md`, `packages/*/CHANGELOG.md`. Ningún archivo de código.

## 🎯 Objetivo

Que alguien que no ha visto el código pueda escribir una escena con un puzzle y un diálogo siguiendo la documentación.

## Contenido

- **`docs/authoring/`** — una guía por tema, cada una con un ejemplo completo y corto:
  1. Escenas, transiciones, hotspots y verbos.
  2. Flags, condiciones y acciones; ramas; cuándo usar `call`.
  3. Diálogos con opciones y NPCs.
  4. Ítems, reglas de drop y combinaciones.
  5. Guardado, validación de contenido y test de recorrido con `createPlaythrough`.
- **`docs/architecture/10-narrative-model.md`** — cómo encajan las piezas (estado de mundo → condiciones → ramas → secuenciador → comandos y eventos), con un diagrama de texto.
- **Contrato y guía de consumo** — exports nuevos de 0.6.0, comandos y eventos nuevos, props nuevas de `GameViewport`.
- **CHANGELOG 0.6.0** de ambos paquetes: Added, Changed, Deprecated (los callbacks `canLeaveScene`, `onSceneEnter` y `getInitialPlacedItems` no se eliminan; se marcan como vía avanzada).

## 📝 Instructions

1. **Los ejemplos se copian de código que existe y se ejecuta**: el fixture `packages/engine-core/src/__tests__/fixtures/miniAdventure.ts` y el contenido de `apps/web-demo/demo-content/`. No escribas ejemplos de memoria.
2. Para cada símbolo que aparezca en un `import` de un bloque de código, comprueba con grep que el paquete indicado lo exporta. Pega la tabla en el reporte.
3. Para cada tipo que documentes (campos de `GameSceneHotspot`, variantes de `Condition` y `Action`…), copia la lista del archivo de tipos real y cita la ruta.
4. Ningún documento por encima de 200 líneas. Español, mismo tono que el resto de `docs/`.
5. No describas nada como disponible si la tarea que lo implementa no está marcada en `tracking.md`.

## ✅ Success Criteria

- [ ] Tabla de verificación de símbolos sin faltas.
- [ ] `wc -l` de cada documento ≤ 200.
- [ ] Todos los enlaces relativos apuntan a archivos que existen.
- [ ] `docs/README.md` enlaza la guía de autoría.
