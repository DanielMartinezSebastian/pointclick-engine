# Library API Contract v1

Este documento define qué superficie está soportada oficialmente para consumidores externos del engine.

## 1. Objetivo

- Congelar una frontera pública estable.
- Reducir acoplamiento a detalles internos.
- Hacer explícito qué puede cambiar sin aviso y qué no.

## 2. Soportado oficialmente (v1)

### 2.1 Engine public API

Archivo fuente:

- `app/lib/engine/publicApi.ts`

Exports soportados:

- Tipos de contenido:
  - `GameVec3`
  - `GameSceneGround`
  - `GameSceneWall`
  - `GameSceneInteractionDialogKeys`
  - `GameSceneInteraction`
  - `GameSceneConfig`
  - `GameItemDropOutcome`
  - `GameItemRule`
  - `GameItemConfig`
  - `GameRuleConfig`
  - `GameRuntimeConfig`
  - `GameRuntime`
  - `GameState`
  - `GameActions`
  - `GameRuntimeEvent`
  - `GameRuntimeEventHandler`
  - `GameViewportProps`
- Funciones/componentes:
  - `registerScene`
  - `registerItem`
  - `registerRule`
  - `createGameRuntime`
  - `getGameState`
  - `getGameActions`
  - `useGameState`
  - `useGameActions`
  - `GameViewport`

### 2.2 Platform adapters

Archivo fuente:

- `app/lib/platform-web.ts`

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

## 3. No soportado para consumidores externos

No se garantiza estabilidad en:

- `app/lib/engine/runtime/*`
- `app/lib/engine/render/*`
- `app/lib/engine/movement/*`
- `app/components/*`
- `app/store/*`

Estos módulos pueden cambiar internamente sin política de compatibilidad para integradores.

## 4. Reglas de consumo

1. Consumir runtime desde `publicApi`.
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
2. Mantener tests de contrato de `publicApi` en verde.
3. Mantener tests de `platform-web` en verde.
4. Ejecutar y validar:
   - `npm run lint`
   - `npm run test`
   - `npm run build`
