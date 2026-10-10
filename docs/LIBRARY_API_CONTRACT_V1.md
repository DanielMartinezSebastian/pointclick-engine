# Library API Contract v1

Este documento define qué superficie está soportada oficialmente para consumidores externos del engine.

## 1. Objetivo

- Congelar una frontera pública estable.
- Reducir acoplamiento a detalles internos.
- Hacer explícito qué puede cambiar sin aviso y qué no.

## 2. Soportado oficialmente (v1)

### 2.1 Engine public API

Archivos fuente:

- `packages/engine-core/src/game/runtime/` (runtime agnóstico; se re-exporta desde `packages/engine-core/src/index.ts`)
- `packages/engine-renderer-r3f/src/index.ts` (viewport, hooks y componentes R3F)
- `apps/web-demo/app/lib/engine/publicApi.ts`: barrel de compatibilidad. Re-exporta ambos paquetes con los nombres del contrato v1; ningún nombre se ha renombrado ni eliminado.

Exports soportados de `@pointclick-engine/engine-core`:

- Tipos de contenido:
  - `GameVec3`, `GameSceneGround`, `GameSceneWall`
  - `GameSceneInteractionDialogKeys`
  - `GameSceneConfig` (incluye `transitions?` y `music?`)
  - `GameItemDropOutcome`, `GameItemRule`, `GameItemConfig`, `GameRuleConfig`
  - `GameRuntimeConfig`, `GameRuntime`, `GameState`, `GameActions`
  - `GameRuntimeEvent`, `GameRuntimeEventHandler`
  - `InventoryUIAdapter`, `DialogUIAdapter`
- Funciones:
  - `registerScene`, `registerItem`, `registerRule`
  - `createGameRuntime`, `getGameRuntime`
  - `getGameState`, `getGameActions`
  - `toRuntimeScene`, `createInventoryRuleContext`
- Comandos y eventos: `GameCommand`, `GameCommandType`, `GameEvent`, `GameEventType`, `GameEventHandler`.

Exports soportados de `@pointclick-engine/engine-renderer-r3f`:

- Tipos: `GameViewportProps`, `GameViewportViewProps`, `GameViewportController`, `GameViewportControllerOptions`, `GameViewportAudioOptions`, `CharacterDefinition`, `CharacterClip`, `CharacterDirection`.
- Componentes: `GameViewport`, `GameViewportView`, `CharacterSprite`.
- Hooks: `useGameState`, `useGameActions`, `useGameViewportController`, `useSceneRuntime`, `useTransitionSystem`, `useInventoryRuntime`, `useAudioSystem`.
- Funciones: `attachAudioSystem`.

Notas de la superficie:

- `GameSceneInteraction` en el barrel de la demo es un alias de `GameSceneInteractionFull` del core. En `engine-core` el nombre `GameSceneInteraction` designa la interfaz base.
- `GameActions.setScene` es `(sceneId: string) => void` (`packages/engine-core/src/game/runtime/types.ts`).
- `GameViewportProps` = opciones de `useGameViewportController` + props de `GameViewportView` + `debug` + `onRuntimeEvent`. Todas opcionales; ver [`LIBRARY_CONSUMPTION_GUIDE.md`](LIBRARY_CONSUMPTION_GUIDE.md).
- Superficie i18n (Fase 13): ver [`architecture/02-public-api.md`](architecture/02-public-api.md).

### 2.2 Platform adapters

Archivo fuente:

- `apps/web-demo/app/lib/platform-web.ts`

Puertos soportados:

- `StoragePort`
- `ClipboardPort`
- `RoutingPort`
- `NetworkPort`
- `TimerPort`
- `EnvironmentPort`

Adapters y barrel soportados:

- `localStorageAdapter`
- `browserClipboardAdapter`
- `browserRoutingAdapter`
- `fetchNetworkAdapter`
- `browserTimerAdapter`
- `browserEnvironmentAdapter`
- `webPlatform`

### 2.3 Novedades 0.5.0

Solo adiciones, salvo la nota breaking.

- `engine-core`: runtime agnóstico (`createGameRuntime` y registros), `scene:set` con `spawnPosition?`, `player:stop` implementado, stores `useDialogStore`, `useInventoryUiStore`, `useInventoryStateStore`, `usePlacedItemsStateStore` y persistencia por puerto (`gameStatePersistence.ts`).
- `engine-renderer-r3f`: `GameViewport` jugable con valores por defecto, `useGameViewportController` + `GameViewportView`, `CharacterSprite` / `CharacterDefinition`, `attachAudioSystem`, y las props nuevas de `GameViewport` (`storage`, `canLeaveScene`, `getInitialPlacedItems`, `onSceneEnter`, `audio`, `character`, `children`, `overlay`, entre otras).
- `GameSceneConfig.transitions` y `music` se conservan al registrar la escena y al ejecutar `scene:set` (`toRuntimeScene`).
- Obsoletos (siguen exportados): `DavidSprite` y los exports de `sprite/clips.ts`.

**Cambio breaking de comportamiento**: recoger un ítem viaja por el bus como `item:pickedUp`; antes llegaba como `item:dropped` con `outcome: "pickup-success"`. Quien detectaba recogidas por `item:dropped` debe pasar a `item:pickedUp`. El callback legacy `onRuntimeEvent` no cambia. Las reglas de audio solo reproducen el sonido de soltar con `outcome: "place"`.

Limitaciones conocidas: algunos outcomes legacy siguen viajando como `item:dropped` fuera del tipo; `inventory:pickup` e `inventory:drop` siguen sin executor; `player:stop` no detiene el movimiento manual.

## 3. No soportado para consumidores externos

No se garantiza estabilidad en:

- `apps/web-demo/app/lib/engine/runtime/*` (incluye `useDoorSystem.ts`: las puertas son de la demo)
- `apps/web-demo/app/components/*`
- `apps/web-demo/app/store/*`
- `packages/engine-core/src/game/runtime/executors.ts` y `registry.ts` (internos; los registros son globales de módulo)
- Cualquier símbolo de los paquetes no listado en 2.1 o 2.3.

Estos módulos pueden cambiar internamente sin política de compatibilidad para integradores.

## 4. Reglas de consumo

1. Consumir el runtime desde `@pointclick-engine/engine-core` y el viewport desde `@pointclick-engine/engine-renderer-r3f` (o desde el barrel `publicApi`).
2. Consumir interoperabilidad desde `platform-web`.
3. No depender de comportamiento implícito de stores internos.
4. Tratar tipos/eventos públicos como contrato de integración.

## 5. Compatibilidad

Compatibilidad semántica esperada para v1:

- Mantener nombres de exports públicos.
- Mantener comportamiento de acciones/estado públicos.
- Mantener puertos de plataforma con fallback SSR en capacidades actuales.

## 6. Política de cambios

Cambios permitidos sin breaking:

- Nuevos exports opcionales.
- Campos opcionales en tipos públicos.
- Mejoras internas en runtime sin modificar contratos públicos.

Cambios breaking (requieren plan de migración):

- Remover o renombrar exports públicos.
- Cambiar firmas públicas.
- Cambiar semántica observable de eventos/acciones.
- Alterar puertos de plataforma sin compatibilidad equivalente.

## 7. Validación mínima para PRs que toquen contrato

1. Actualizar este documento si cambia la superficie pública.
2. Mantener tests de contrato de `publicApi` en verde (`apps/web-demo/app/lib/engine/publicApi.test.ts`).
3. Mantener tests de `platform-web` en verde.
4. Ejecutar y validar:
   - `npm run lint`
   - `npm run test`
   - `npm run build`
5. Con la demo en marcha: `npm run smoke` (`e2e/smoke.mjs` y `e2e/smoke-minimal.mjs`).
