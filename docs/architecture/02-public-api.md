# API Pública

**Ubicación**: el runtime agnóstico vive en `packages/engine-core/src/game/runtime/` y el viewport/hooks R3F en `packages/engine-renderer-r3f/src/index.ts`. `apps/web-demo/app/lib/engine/publicApi.ts` es un **barrel de compatibilidad** que re-exporta ambos con los nombres del contrato v1.

## Contrato Estable (v1)

Estos exports **NO se rompen sin issue + migración + bump semver**. La lista completa y separada por paquete está en [`../LIBRARY_API_CONTRACT_V1.md`](../LIBRARY_API_CONTRACT_V1.md) (fuente única; no se duplica aquí).

Resumen:

| Paquete | Contenido |
|---------|-----------|
| `@pointclick-engine/engine-core` | `createGameRuntime`, `getGameRuntime`, `registerScene/Item/Rule`, `getGameState`, `getGameActions`, tipos `Game*Config`, `GameRuntime`, `GameState`, `GameActions`, `GameCommand`, `GameEvent` |
| `@pointclick-engine/engine-renderer-r3f` | `GameViewport`, `GameViewportView`, `useGameViewportController`, `useGameState`, `useGameActions`, `CharacterSprite`, `attachAudioSystem` |

Cómo se usa, paso a paso: [`../LIBRARY_CONSUMPTION_GUIDE.md`](../LIBRARY_CONSUMPTION_GUIDE.md).

## i18n (v0.4.0+, Phase 13)

Core (`@pointclick-engine/engine-core`): `registerDictionary`, `registerDictionaries`, `getDictionary`, `translate`, `getRandomPhrase`, `matchLocale`, `createI18nStore`, `getI18nStore`, `resetI18nStore`, `subscribeI18n`, `setI18nStoreEmitter`, `HeadlessI18nAdapter`, `registerI18nExecutors`; tipos `Locale`, `DialogEntry`, `DialogDictionary`, `LocaleDictionaries`, `I18nConfig`, `I18nState`, `I18nPort`, `I18nStore`.

Renderer (`@pointclick-engine/engine-renderer-r3f`): `useI18n`, `useLocaleDetection`, `I18nProvider`, `LocaleSwitcher`; tipos `UseI18nResult`, `UseLocaleDetectionOptions`, `LocaleSwitcherProps`, `LocaleSwitcherRenderOption`, `I18nProviderProps`.

Adapter web (no es parte de los paquetes; vive en `apps/web-demo/app/lib/platform-web-i18n.ts`): `createWebI18nAdapter`, `bindI18nPersistence`.

Recetas Next.js: ver [`../integrations/nextjs-i18n.md`](../integrations/nextjs-i18n.md).

## Cambios Permitidos (no breaking)

- ✅ Añadir exports opcionales nuevos
- ✅ Añadir campos opcionales en tipos públicos
- ✅ Mejoras internas sin tocar firmas

## Cambios Breaking (requieren migración)

- ❌ Renombrar / remover exports
- ❌ Cambiar firmas (parámetros, return)
- ❌ Cambiar semántica de eventos / acciones (p. ej. 0.5.0: recoger un ítem pasó de `item:dropped` con `outcome: "pickup-success"` a `item:pickedUp`)

## Si necesitas cambiar la API pública

1. Abre issue explicando por qué
2. Propón migration path para consumidores
3. Documenta en `LIBRARY_API_CONTRACT_V1.md`
4. Bump semver mayor si es breaking

## Commands & Events (Phase 4)

`createGameRuntime()` devuelve un handle con `executeCommand`, `on`, `emit`, `dispose`, además de `getScenes`, `getItems`, `getRules`:

```ts
const runtime = createGameRuntime({ scenes });
runtime.on("scene:changed", handler);      // suscribirse a eventos
runtime.executeCommand({ type: "scene:set", sceneId: "town" }); // enviar comandos
const rt = getGameRuntime();               // handle activo (null antes de crearlo o tras dispose)
```

Ver catálogo completo en [`05-bidirectional-communication.md`](05-bidirectional-communication.md).

## Ver también

- `../LIBRARY_API_CONTRACT_V1.md` — Contrato formal
- `../LIBRARY_CONSUMPTION_GUIDE.md` — Cómo se consume
- [`05-bidirectional-communication.md`](05-bidirectional-communication.md) — Commands & Events API (web ↔ juego)
