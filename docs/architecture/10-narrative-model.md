# Modelo narrativo (0.6.0)

**Estado**: implementado (Fase 17, sin publicar) | **Decisión**: [ADR-0010](../decisions/0010-declarative-narrative-model.md) | **Cómo se usa**: [`../authoring/README.md`](../authoring/README.md)

## TL;DR

El contenido narrativo es **dato serializable**, no código. Un intérprete pequeño en `engine-core` lo ejecuta despachando los comandos que ya existían y esperando eventos del bus. Nada de esto importa React ni el renderer.

## Cómo encajan las piezas

```
 contenido (datos)                  core (packages/engine-core/src/game/narrative/)
 ─────────────────                  ──────────────────────────────────────────────
 scene.hotspots / npcs ──┐
 scene.onEnter           │   evento del jugador / de escena
 transition.when/blocked ├──►  hotspot:interact · dialogue:start · inventory:combine ·
 item.combine            │     entrada a escena · transición
 dialogue nodes/choices ─┘                   │
                                             ▼
   estado de mundo ──► condiciones ──► ramas (pickBranch: gana la primera)
   (flags, visitadas,   evaluateCondition      │ guion = Action[]
    inventario, ítems                          ▼
    colocados, escena)                  secuenciador (createSequencer)
        ▲                               cola FIFO · cancelable · ClockPort
        │                                      │ una acción cada vez
        │                                      ▼
        │                         comandos  (dialog:trigger, state:setFlag,
        │                                    player:walkTo, scene:set, ...)
        │                                      │
        └──────── stores (sceneStore,         ▼
                  worldStateStore, ...)   eventos (dialog:dismissed,
                                          player:walkCompleted, state:flagChanged,
                                          script:finished, ...)  ──►  host / UI / sequencer
```

1. **Estado de mundo** (`state/worldStateStore.ts`): flags `boolean | number | string` y escenas visitadas. Junto al inventario, los ítems colocados y la escena activa forma el `ConditionContext` (`getConditionContext`).
2. **Condiciones** (`narrative/conditions.ts`): `Condition` evaluable sin efectos con `evaluateCondition`. Una forma desconocida es `false`.
3. **Ramas** (`narrative/branches.ts`): `pickBranch(branches, ctx)` devuelve el guion de la primera rama cuyo `when` se cumple. Hotspots, NPC, `useItem`, `combine` y `onEnter` son listas de ramas.
4. **Secuenciador** (`narrative/sequencer.ts`, `actionExecutors.ts`): ejecuta un guion acción a acción. Cada acción **despacha comandos existentes** y espera el evento que la completa (`say` espera `dialog:dismissed`; `walkTo`, `player:walkCompleted` o `player:walkAborted`; `wait`, el `ClockPort`). Cola FIFO; `interrupt` y `script:cancelAll` cancelan. `lockInput` bloquea la entrada del jugador.
5. **Comandos y eventos**: lo único que cruza hacia fuera. El host observa con `runtime.on(...)` y actúa con `executeCommand(...)`; los catálogos nuevos están en [05](05-bidirectional-communication.md).

## Un mismo motor para todo

`registerHotspotCommands`, `registerDialogueCommands` y `registerCombineCommands` reciben `runScript` del secuenciador: hablar con un NPC, usar un ítem y combinar son el mismo mecanismo con distinto disparador. Un diálogo es un ejecutor de la acción `startDialogue` que recorre nodos y espera el cierre del bocadillo o la elección.

`say` y las líneas de diálogo emiten `dialog:trigger` con una **clave** que se resuelve en las reglas del runtime o en un `dialogAdapter` del host (ver [`../authoring/README.md`](../authoring/README.md)).

## Quién aplica qué

| Regla | Funciones puras (core) | Las aplica |
|-------|------------------------|------------|
| `initialItems` | `resolveInitialItems` | el renderer al entrar a la escena; `createPlaythrough` en headless |
| `onEnter` | `resolveEnterScript` | ídem |
| `transition.when` / `blocked` | `evaluateTransitionGate` | ídem, antes de cambiar de escena |
| Verbos, `useItem`, `combine`, diálogos | comandos del runtime (`hotspot:interact`, `inventory:combine`, `dialogue:*`) | el core, sin renderer |

Los callbacks de 0.5.0 (`canLeaveScene`, `onSceneEnter`, `getInitialPlacedItems`) siguen disponibles como **vía avanzada** y se evalúan después de las reglas declarativas.

## Guardado

La instantánea `GameSnapshot` (`state/saveGame.ts`) serializa exactamente ese estado: escena, posición, inventario, ítems colocados, escenas sembradas, flags y escenas visitadas, más `extra` para el host. Por eso el contenido declarativo se puede guardar, validar (`validateContent`) y repetir en headless (`createPlaythrough`). Ver [`../authoring/05-saving-and-testing.md`](../authoring/05-saving-and-testing.md).

## Dónde vive cada cosa

| Capa | Qué | Ruta |
|------|-----|------|
| Core | tipos, evaluador, secuenciador, comandos narrativos, stores, guardado, validador | `packages/engine-core/src/game/{narrative,state}/` |
| Core | `ClockPort`, `HeadlessClock` | `packages/engine-core/src/ports/` |
| Core (subpath `/testing`) | `createPlaythrough` | `packages/engine-core/src/testing/` |
| Renderer | `SceneHotspots`, `SceneNpcs`, `NpcSprite`, `VerbMenu`, `DialogueChoices`, `useDialogue`, `useHotspotInteractions` | `packages/engine-renderer-r3f/src/` |
| Host | textos (`rules` o `dialogAdapter`), `characters`, UI de inventario/combinar | `apps/web-demo/` |

Cumple la [regla de oro](03-rules-core-vs-render.md): el core no importa React, R3F, `window` ni `document`.
