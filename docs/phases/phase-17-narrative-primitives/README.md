# Phase 17 — Narrative Primitives

**Objetivo**: que una aventura completa se pueda describir con datos y jugarse de principio a fin, también en headless.
**Duración estimada**: 2–3 semanas
**Estado**: completed (2026-10-11; 0.6.0 lista, sin publicar)
**Owner**: Daniel Martínez Sebastián
**Version target**: v0.6.0 (solo adiciones sobre 0.5.0)

---

## Por qué

Ver [ADR-0010](../../decisions/0010-declarative-narrative-model.md). El motor ya es consumible (Fase 16), pero solo sabe mover, recoger, colocar y cambiar de escena. Falta todo lo que hace una aventura: recordar lo ocurrido, mirar, usar, hablar, elegir, encadenar acciones y guardar.

## Resultado esperado

1. Un test headless en `engine-core` carga una mini-aventura de fixture (3 escenas, 2 NPCs, 5 ítems, 4 puzzles) y la resuelve solo con comandos, comprobando el estado final.
2. La demo expresa con datos sus reglas actuales (trofeo, bienvenida, ítems iniciales) y deja de usar `canLeaveScene`, `onSceneEnter` y `getInitialPlacedItems`. `npm run smoke` sigue en verde.
3. La demo incluye al menos un NPC con un diálogo con opciones, un hotspot con "mirar" y "usar", y una combinación de ítems, cubiertos por el smoke.
4. Guardar y cargar restaura la partida completa desde una sola clave versionada; las partidas de 0.5.0 migran.
5. Guía de autoría: cómo escribir una escena, un puzzle y un diálogo.

## Tareas y reparto

| # | Tarea | Modelo | Depende de |
|---|---|---|---|
| 01 | [ADR-0010: visto bueno](tasks/01-adr-approval.md) | opus | — |
| 02 | [Core: `ClockPort`](tasks/02-clock-port.md) | haiku | 01 |
| 03 | [Core: estado de mundo (flags)](tasks/03-world-state.md) | sonnet | 01 |
| 04 | [Core: condiciones](tasks/04-conditions.md) | sonnet | 03 |
| 05 | [Core: acciones y secuenciador](tasks/05-actions-and-sequencer.md) | sonnet | 02, 04 |
| 05b | [Renderer: avisar del fin de una caminata](tasks/05b-renderer-walk-completed.md) | sonnet | 05 |
| 06 | [Core: hotspots con verbos](tasks/06-hotspots.md) | sonnet | 05 |
| 07 | [Core: árboles de diálogo](tasks/07-dialogue-trees.md) | sonnet | 05 |
| 08 | [Core: combinar ítems](tasks/08-item-combine.md) | haiku | 05 |
| 09 | [Core: reglas de escena declarativas](tasks/09-declarative-scene-rules.md) | sonnet | 05 |
| 10 | [Core: guardado único y migración](tasks/10-save-load.md) | sonnet | 03 |
| 11 | [Core: tipar los outcomes legacy](tasks/11-legacy-outcomes.md) | haiku | — |
| 12 | [Core: validador de contenido](tasks/12-content-validator.md) | sonnet | 06, 07, 08, 09 |
| 13 | [Renderer: hotspots y verbos](tasks/13-renderer-hotspots.md) | sonnet | 06 |
| 14 | [NPCs (core + renderer)](tasks/14-renderer-npcs.md) | sonnet | 06, 07 |
| 15 | [Renderer: UI de diálogo con opciones](tasks/15-renderer-dialogue-ui.md) | sonnet | 07 |
| 16 | [Demo: migrar reglas a datos y añadir contenido de prueba](tasks/16-demo-migration.md) | sonnet | 09, 10, 12, 13, 14, 15 |
| 17 | [Recorrido headless de una mini-aventura](tasks/17-headless-walkthrough.md) | sonnet | 06–10, 12 |
| 18 | [Guía de autoría, docs y changelog](tasks/18-authoring-docs.md) | haiku | 16, 17 |
| 19 | [Gate de validación y 0.6.0](tasks/19-validation-gate.md) | opus | todas |

Olas: **A** = 02, 03, 11 · **B** = 04, 10 · **C** = 05 · **D** = 06, 07, 08, 09 · **E** = 12, 13, 14, 15 · **F** = 16, 17 · **G** = 18, 19.

## Principios

- Regla de Oro intacta: todo el intérprete vive en `engine-core`, sin React ni navegador; `coreAgnosticism.test.ts` sigue verde.
- Aditivo: ningún export, comando ni evento de 0.5.0 cambia de forma. Lo nuevo es opcional.
- El contenido es serializable: sin funciones dentro de escenas, ítems ni diálogos. Excepción única y explícita: la acción `call`.
- Cada primitiva llega con tests headless antes de tener cara en el renderer.
- Validación tras cada tarea: gate técnico y `npm run smoke`. El smoke se amplía cuando una tarea añade comportamiento visible.

## Fuera de alcance

- Puertas como primitiva del motor → Fase 7 (los flags de esta fase la simplifican).
- Historia, arte y contenido definitivo de la demo → [Fase 18](../phase-18-story-demo/).
- Cinemáticas con cámara, editor visual de contenido, adaptador de Ink/Yarn.
- Multijugador → Fase 14, después de esta.

## Retrospectiva (2026-10-11)

**Resultado**: las 20 tareas integradas. Una mini-aventura de tres escenas escrita solo con datos se resuelve en un test sin renderer, y la demo usa NPC, hotspot con verbos, diálogo con opciones y combinación de ítems, cubiertos por el smoke (69 + 8 comprobaciones). Evidencia del gate en [tracking.md](tracking.md).

**Lo que destapó la integración** (ningún test unitario lo veía):
- Nadie emitía `player:walkCompleted`; un `walkTo` de guion se habría colgado en el navegador (tarea 05b).
- El bocadillo se cerraba sin emitir `dialog:dismissed`; un `say` de guion se habría colgado igual.
- La caja clicable de un NPC solo cubría los pies, y el menú de verbos mostraba claves sin traducir.
- El validador daba por error la etiqueta libre `interactionId` de un ítem colocado.

**Qué quedó fuera o como deuda** (entrada para la Fase 18):
- Las reglas declarativas de escena (`initialItems`, `onEnter`, `when`/`blocked`) las cablean por separado el renderer y `createPlaythrough`; deberían vivir en el core.
- El texto de `say` se resuelve por reglas registradas o por un `dialogAdapter` del host; el viewport no lo traduce solo con su i18n.
- `validateContent` no avisa de un `speaker` que no es el id de ningún NPC.
- Combinar ítems arrastrando solo existe en la `InventoryUI` de la demo, no en el renderer.
- Un host con `resolveScene` propio debe proyectar él los NPCs a hotspots.
- Los NPCs no caminan ni tienen clip de habla obligatorio; no hay cámara que siga al jugador (el fondo Sci Fi Level completo la necesitaría).
- Sigue habiendo dos sistemas de movimiento (click en el suelo y `player:walkTo`) y registros globales de módulo.
- Sin verificar en móvil real: la corrección del temblor del sprite al caminar y la UI de opciones de diálogo en táctil.
