# Task 16.11 — Troceo en pasos (tras el inventario de dependencias)

Complementa [11-functional-game-viewport.md](11-functional-game-viewport.md). Sale del inventario de dependencias del 2026-10-10. Regla: **tras cada paso el juego sigue funcionando**: el orquestador ejecuta el gate técnico y `npm run smoke` (recorrido headless con Playwright: partida nueva, bloqueo de salida sin trofeo, recogida, transición, recarga y registro de los sonidos reproducidos; requiere la demo en marcha).

## Decisiones de diseño (orquestador)

1. **Spawn al cambiar de escena**: `scene:set` gana `spawnPosition?` opcional (aditivo). Los hooks movidos dejan de llamar al store con una escena resuelta a mano.
2. **Lógica propia del juego fuera del paquete**, como datos o callbacks de `GameViewport`:
   - `initialSceneId`, `initialInventory`, `slotCount`
   - `getInitialPlacedItems(sceneId, all)` — hoy el trofeo de `personalRoom`
   - `onSceneEnter(sceneId, api)` — hoy la bienvenida de `personalRoom`
   - `canLeaveScene(transition)` — hoy "no salgas sin el trofeo". No se modela como regla del core: eso es la fase narrativa.
3. **Persistencia por puerto**: `storage?: GameProgressStorage`. Sin él no se guarda. La demo lo implementa sobre `gamePersistence.ts`, mismas claves y formato.
4. **Estado de UI del juego al core**: store de diálogo y de visibilidad de inventario, cableados por defecto en `createGameRuntime` cuando no se pasan adapters. Slots e ítems colocados pasan a stores reactivos del core y desaparece la copia duplicada (estado local + `placedItemsStore`).
5. **Puertas se quedan en la demo** (ADR-0009 §5): `SceneDoors` entra por `children`, `useDoorSystem` compone `onRuntimeEvent` y `getEffectiveClickGoal`.
6. **La UI de la demo lee del viewport por un hook** (`useGameViewportApi`), no por render prop: `InventoryUI` y el panel de debug necesitan slots, arrastre e ítems colocados.

## Pasos

| Paso | Qué | Modelo | Ola |
|---|---|---|---|
| 11.1 | Borrar `AnimatedSprite.tsx` (código muerto). Mover al renderer `PlacedSceneItems`, `SceneDropTargets`, `SceneBackgroundPlane` (+`preloadSceneBackground`), `SceneCameraControllers` y `useProximityHintController`; exportar constantes de cámara | sonnet | D1 |
| 11.2 | Core: `spawnPosition?` en `scene:set`; stores de diálogo y de visibilidad de inventario con cableado por defecto; tests headless | sonnet | D1 |
| 11.3 | Demo adopta los stores de UI del core; registrar ítems en el runtime y resolver reglas desde él | sonnet | D2 |
| 11.4 | Mover `useSceneRuntimeController` (store + siembra + persistencia) con `initialSceneId` y `storage` | sonnet | D2 |
| 11.5 | Mover `useTransitionSystem` con `canLeaveScene` inyectado | sonnet | D3 |
| 11.6 | Core: stores reactivos de slots e ítems colocados con persistencia por puerto | sonnet | D3 |
| 11.7 | Mover `useInventoryRuntimeController` (a: stores y persistencia; b: siembra y bienvenida) | sonnet | D4 |
| 11.8 | `GameViewport` en el renderer + `useGameViewportApi`; `GameTouchCanvas` lo compone | sonnet | D5 |
| 11.9 | Ruta `/example-minimal` solo con imports de paquetes | haiku | D5 |

## Riesgos y prueba manual por ola

- **Orden de montaje / escena inicial**: recargar con almacenamiento vacío y con `current-scene-id` guardado.
- **Ítems colocados duplicados o perdidos**: recoger el trofeo, recargar; colocarlo en `town`, recargar.
- **Bloqueo de salida y espera al diálogo**: salir de `personalRoom` con y sin trofeo.
- **Puertas**: llave en la verja, recargar, click al otro lado con la puerta cerrada.
- **Partidas guardadas**: cargar una partida anterior y "reiniciar partida".

## Deuda anotada (no se resuelve aquí)

- `zustand` `create` en el core arrastra el binding de React; valorar `zustand/vanilla` antes de 1.0.
- Outcomes legacy (`rule-miss`, `on-player`, `pickup-blocked`, `item-interact`, `unknown-item`) siguen viajando como `item:dropped` fuera del tipo.
- `/debug` monta el canvas sin runtime: no tiene audio por bus ni diccionarios i18n.
