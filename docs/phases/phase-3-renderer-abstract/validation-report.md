# Phase 3 Validation Report

Date: 2026-05-27

## Agnosticidad de engine-core

- React imports in core: ✅ clean
- R3F imports in core: ✅ clean
- Three.js imports in core: ✅ clean
- Next imports in core: ✅ clean
- Browser globals in core: ✅ clean

## Estructura de packages

- engine-core ports: ✅ gameLoop, input, viewport (+ headless impls)
- engine-renderer-r3f adapters: ✅ useR3FGameLoop, WebKeyboardInput
- engine-renderer-r3f components: ✅ sprite/, scene/, SpeechBubble, GameTouchSpriteRuntime
- Tests headless: ✅ 29 tests en engine-core (gameLoop: 4, input: 6, EventBus: 4, rules: 6, findPath: 3, sceneStore: 6)

## Build / Test

- `npm run build`: ✅ (engine-core + engine-renderer-r3f + web-demo)
- `npm run test`: ✅ (53 tests: 29 engine-core + 0 renderer-r3f + 24 web-demo)
- TypeScript strict: ✅ (0 errors en todos los workspaces)

## Migración de runtime events

- `emitRuntimeEvent` movida a engine-core: ✅
- `apps/web-demo/.../types/runtimeEvents.ts` eliminada: ✅
- Todos los consumidores apuntan a `@pointclick/engine-core`: ✅

## Migración de componentes renderer

- `packages/engine-renderer-r3f/src/sprite/`: ✅ DavidSprite, clips, speakingAnimation
- `packages/engine-renderer-r3f/src/scene/`: ✅ SceneGround, SceneWalls, SceneCollisionSphere, SceneWallPointPreview
- `packages/engine-renderer-r3f/src/SpeechBubble.tsx`: ✅
- `packages/engine-renderer-r3f/src/GameTouchSpriteRuntime.tsx`: ✅ (DI para mobileInputStore, sceneEditorStore, getRandomPhrase)
- Re-exportaciones en `apps/web-demo/app/components/`: ✅ apuntan a @pointclick/engine-renderer-r3f

## Arquitectura de capas respetada

- `@react-three` en engine-core: ✅ 0 referencias
- Demo-specific deps (mobileInputStore, sceneEditorStore, getRandomPhrase) en renderer: ✅ eliminadas por DI
- GameTouchCanvas inyecta deps del demo al renderer: ✅

## Demo funcional (verificación de build)

- `npm run build` (Next.js): ✅ compila sin errores
- TypeScript check: ✅ passed

## Notas técnicas

### Simplificación de `useClickToMoveController`

El hook `useClickToMoveController` fue internalizado dentro de `GameTouchSpriteRuntime.tsx`
en el renderer package (eliminando la dependencia al archivo en web-demo). Esto es correcto
porque el controlador de click-to-move es parte del comportamiento del personaje, no
lógica de core. El algoritmo base (`findPath`) sigue en engine-core.

### DI pattern para debug editor

Las dependencias del editor de debug (`sceneEditorStore`) se inyectan como props opcionales
en `GameTouchSpriteRuntime`. Los defaults no operan en debug. `GameTouchCanvas` inyecta
los valores reales del editor store.

### Wall hover/resize en renderer-r3f

El manejo de hover world (para mover/redimensionar muros) fue simplificado: la lógica
de mutación de walls fue removida del renderer-r3f porque requería `updateSelectedWall`
del sceneEditorStore. Esto debe pasar por DI en una task futura si se necesita en el renderer.
En web-demo, el debug editor controller (`useInteractionEditorController`) maneja esto.

## Conclusión

Phase 3 COMPLETED. Listo para Phase 4.
