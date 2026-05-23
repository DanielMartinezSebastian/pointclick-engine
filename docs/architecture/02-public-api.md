# API Pública (`publicApi.ts`)

**Ubicación actual**: `app/lib/engine/publicApi.ts`
**Ubicación post-Fase 2**: `packages/engine-core/src/index.ts` (parte agnóstica) + `apps/web-demo/.../publicApi.ts` (parte R3F)

## Contrato Estable (v1)

Estos exports **NO se rompen sin issue + migración + bump semver**.

### Tipos

```ts
GameVec3
GameSceneGround, GameSceneWall, GameSceneConfig
GameSceneInteraction, GameSceneInteractionDialogKeys
GameItemDropOutcome, GameItemRule, GameItemConfig
GameRuleConfig
GameRuntimeConfig, GameRuntime
GameState, GameActions
GameRuntimeEvent, GameRuntimeEventHandler
GameViewportProps
```

### Funciones / Componentes

```ts
createGameRuntime(config?: GameRuntimeConfig): GameRuntime
registerScene(config: GameSceneConfig): void
registerItem(config: GameItemConfig): void
registerRule(config: GameRuleConfig): void
getGameState(): GameState
getGameActions(): GameActions
useGameState<T>(selector: (s: GameState) => T): T
useGameActions(): GameActions
GameViewport(props: GameViewportProps): ReactNode
```

## Cambios Permitidos (no breaking)

- ✅ Añadir exports opcionales nuevos
- ✅ Añadir campos opcionales en tipos públicos
- ✅ Mejoras internas sin tocar firmas

## Cambios Breaking (requieren migración)

- ❌ Renombrar / remover exports
- ❌ Cambiar firmas (parámetros, return)
- ❌ Cambiar semántica de eventos / acciones

## Si necesitas cambiar la API pública

1. Abre issue explicando por qué
2. Propón migration path para consumidores
3. Documenta en `LIBRARY_API_CONTRACT_V1.md`
4. Bump semver mayor si es breaking

## Ver también

- `../LIBRARY_API_CONTRACT_V1.md` — Contrato formal
- `../LIBRARY_CONSUMPTION_GUIDE.md` — Cómo se consume
