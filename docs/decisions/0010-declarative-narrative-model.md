# ADR-0010: Modelo narrativo declarativo (flags, condiciones, acciones)

**Status**: proposed (pendiente de visto bueno del owner)
**Date**: 2026-10-10

## Context

Tras la Fase 16 el motor mueve un personaje, gestiona inventario, ítems colocados, transiciones, audio e i18n, y es consumible desde los paquetes. Pero no puede expresar una aventura:

- La única interacción de escena es `kind: "drop-target"`. No hay "mirar", "usar" ni "hablar".
- No hay estado de mundo: nada recuerda que algo ya ocurrió, salvo el inventario y los ítems colocados.
- Los diálogos son frases sueltas elegidas al azar por clave. No hay conversación con opciones ni personajes con los que hablar.
- No hay forma de encadenar "di esto, camina allí, entrega esto, cambia de escena".
- Las reglas propias de un juego se escriben como callbacks de TypeScript (`canLeaveScene`, `onSceneEnter`, `getInitialPlacedItems` en la demo). Funcionan, pero no se pueden guardar, inspeccionar, validar ni replicar por red.
- El guardado son cuatro claves sueltas sin versión.

## Decision

1. **El contenido narrativo es dato, no código.** Escenas, hotspots, NPCs, diálogos y reglas se describen con objetos serializables. Un intérprete pequeño en `engine-core` los ejecuta. Ningún `eval`, ninguna función dentro del contenido.
2. **Tres piezas base en el core**:
   - **Estado de mundo**: flags con nombre (`boolean | number | string`) en un store reactivo.
   - **Condiciones**: un tipo `Condition` evaluable sin efectos (`flag`, `hasItem`, `itemPlaced`, `inScene`, `visited`, `all`, `any`, `not`).
   - **Acciones**: un tipo `Action` (`say`, `setFlag`, `giveItem`, `removeItem`, `placeItem`, `removePlacedItem`, `changeScene`, `walkTo`, `wait`, `playSfx`, `startDialogue`, `lockInput`, `emit`, `call`). Un **guion** es `Action[]`; una **rama** es `{ when?: Condition; do: Action[] }` y gana la primera que cumple.
3. **Un secuenciador** ejecuta guiones paso a paso: espera al cierre de un diálogo o al final de una caminata antes de seguir, es cancelable y usa un `ClockPort` inyectado, para que los tests sean deterministas y sin temporizadores reales.
4. **Hotspots con verbos** como elemento nuevo de escena (`scene.hotspots`), separado de `interactions` para no romper las dianas de arrastre existentes. Verbos: `look`, `use`, `talk` y `useItem[itemId]`, cada uno con ramas.
5. **NPCs** como elemento de escena (`scene.npcs`): personaje, posición, condición de visibilidad y diálogo. Se pintan con `CharacterSprite`.
6. **Árboles de diálogo** con nodos, opciones condicionadas y efectos, sobre las claves de i18n existentes.
7. **Combinación de ítems** declarada en el ítem.
8. **Guardado único y versionado**: una instantánea (`escena`, posición, inventario, ítems colocados, flags, escenas visitadas y sembradas) bajo una sola clave, con migración desde las cuatro claves actuales.
9. **Vía de escape explícita**: la acción `call` invoca por nombre un manejador que el host registra. Los callbacks de la Fase 16 se conservan como opciones avanzadas, pero la demo deja de usarlos.
10. **Todo es aditivo** sobre 0.5.0. Versión objetivo 0.6.0.

## Alternatives considered

- **Seguir con callbacks de TypeScript**: máxima flexibilidad, pero el estado del juego queda repartido en cierres que no se guardan ni se replican (bloquea el guardado fiable y la Fase 14 de multijugador), y cada juego reimplementa lo mismo.
- **Integrar un lenguaje narrativo externo (Ink, Yarn Spinner)**: resuelve muy bien los diálogos, pero no los hotspots, el inventario ni las transiciones, añade una dependencia y un formato que no es TypeScript. Se puede añadir más adelante como adaptador que genere estos mismos datos.
- **Un lenguaje de scripting propio en texto**: más cómodo de escribir, pero exige parser, mensajes de error y herramientas. Los objetos tipados dan autocompletado y validación gratis.

## Consequences

- El contenido se puede validar al arrancar (referencias a ítems, escenas, flags y claves de diálogo inexistentes) y probar en headless: un test puede resolver una aventura entera con comandos.
- El guardado y, más adelante, el multijugador operan sobre un estado explícito.
- Escribir contenido es más verboso que un callback. Se mitiga con funciones constructoras (`say("clave")`, `when(flag("x"), …)`), igual que ya existe `sceneTransitionOnCollision`.
- Los casos que el vocabulario no cubra caen en `call`. Si un `call` se repite en varios juegos, es candidato a acción nueva.
- Fuera de alcance: puertas como primitiva (Fase 7, aunque los flags la simplifican), cinemáticas con cámara, y editor visual.

## References

- `docs/phases/phase-17-narrative-primitives/`
- ADR-0006 (commands/events), ADR-0008 (multiplayer), ADR-0009 (runtime en los paquetes)
