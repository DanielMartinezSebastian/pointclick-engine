# Task 16.02 — Core: `createGameRuntime` agnóstico

**Effort**: 4h | **Modelo**: sonnet | **Blocks**: 03, 04, 10 | **Blocked by**: 01

**Archivos permitidos**:
- `packages/engine-core/src/game/runtime/**` (nuevo)
- `packages/engine-core/src/index.ts` (añadir export)
- `packages/engine-core/src/__tests__/gameRuntime*.test.ts` (nuevo)

`apps/web-demo/app/lib/engine/publicApi.ts` es **solo lectura** en esta tarea (lo adapta la 03).

---

## 🎯 Objetivo

Llevar a `engine-core` la parte de `publicApi.ts` que no depende de React: tipos de config, registros, factoría, executors y accesores sin hooks. La demo sigue funcionando con su copia hasta la tarea 03.

## Alcance

Mover (copiando el comportamiento actual, líneas ~100–590 de `publicApi.ts`):

- Tipos: `GameSceneConfig`, `GameItemConfig`, `GameItemRule`, `GameItemDropOutcome`, `GameRuleConfig`, `GameRuntime`, `GameRuntimeConfig`, `InventoryUIAdapter`, `DialogUIAdapter`, `GameState`, `GameActions`, `GameRuntimeEvent`, `GameRuntimeEventHandler`.
- Funciones: `registerScene`, `registerItem`, `registerRule`, `createGameRuntime`, `getGameRuntime`, `getGameState`, `getGameActions`.

No mover: `useGameState`, `useGameActions`, `GameViewport` (usan React).

## Cambios funcionales (los únicos permitidos)

1. **Escena completa**: un único helper `toRuntimeScene(config): GameScene` sustituye las 4 copias campo a campo. Debe conservar `transitions` y `music`. `GameSceneConfig` gana `transitions?: GameSceneTransition[]` (campo opcional, no breaking).
2. **Sin `console.log`** en el camino feliz de `player:walkTo` (hoy hay uno en "no path found"); usar el logger inyectable del `sceneStore` o nada.
3. Estructura: `runtime/types.ts`, `runtime/registry.ts`, `runtime/executors.ts`, `runtime/createGameRuntime.ts`, `runtime/index.ts`. Ningún archivo > 250 líneas.

## 📝 Instructions

1. Leer `publicApi.ts` entero y `publicApi.test.ts` (referencia de comportamiento esperado).
2. Crear los módulos. Sin imports de React, `zustand/react`, ni nada del navegador.
3. Tests headless nuevos (≥ 15), incluyendo obligatoriamente:
   - `scene:set` conserva `transitions` y `music` en `useSceneStore.getState().scene`.
   - `transition:activate` cambia de escena y emite `transition:started` y `transition:completed`.
   - `player:walkTo` con destino alcanzable activa `playerWalkingState`; con destino inalcanzable emite `player:walkAborted`.
   - `dialog:trigger` sin adapter no lanza y emite el evento.
   - `dispose()` limpia bus, comandos y singleton.

## ✅ Success Criteria

- [ ] `cd packages/engine-core && npx vitest run` → 0 fallos.
- [ ] `npx tsc --noEmit -p packages/engine-core` → 0 errores.
- [ ] `coreAgnosticism.test.ts` sigue verde.
- [ ] `import { createGameRuntime } from "@pointclick-engine/engine-core"` resuelve (comprobado en un test que importa desde `../index`).
- [ ] `git diff --stat` solo muestra archivos permitidos.

## Reporte

API exportada, diferencias de comportamiento respecto a `publicApi.ts` (deben ser solo las 2 listadas) y dudas de diseño para el orquestador.
