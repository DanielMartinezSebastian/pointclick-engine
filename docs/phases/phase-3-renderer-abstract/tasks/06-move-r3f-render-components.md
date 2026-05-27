# Task 06: Move R3F render components to engine-renderer-r3f

**Phase**: 3 | **Estimate**: 4h | **Owner**: —

## Context

Mover los componentes R3F genéricos (no específicos de la demo) desde `apps/web-demo/app/lib/engine/render/` y `runtime/` al package `packages/engine-renderer-r3f/src/`. Las cosas específicas de demo (dialogs content, mobileInputStore, sceneEditorStore) se quedan.

**Mover**:
- `lib/engine/render/scene/*` → renderer-r3f
- `lib/engine/render/sprite/*` → renderer-r3f
- `lib/engine/render/SpeechBubble.tsx` → renderer-r3f
- `lib/engine/runtime/GameTouchSpriteRuntime.tsx` → renderer-r3f
- `lib/engine/runtime/use*Controller.ts` agnósticos → renderer-r3f

**NO mover**:
- `components/InventoryUI.tsx`, `Joystick.tsx` (UI específica)
- `store/mobileInputStore.ts`, `sceneEditorStore.ts` (demo state)
- `demo/content/*` (contenido)
- `lib/platform-web.ts` (platform adapter)

## Prerequisites

- [ ] Task 02 done (renderer-r3f package existe)
- [ ] Task 04 done (GameLoopPort + R3F adapter)
- [ ] Task 05 done (InputPort + adapter)

## Action

### 1. Inventario detallado

```bash
ls -la apps/web-demo/app/lib/engine/render/
ls -la apps/web-demo/app/lib/engine/runtime/
```

Decidir uno por uno si va o no va. Documentar en commit message.

### 2. Mover archivos por categoría

**Sprite components**:
```bash
git mv apps/web-demo/app/lib/engine/render/sprite \
       packages/engine-renderer-r3f/src/sprite
```

**Scene render components**:
```bash
git mv apps/web-demo/app/lib/engine/render/scene \
       packages/engine-renderer-r3f/src/scene
```

**Standalone components**:
```bash
git mv apps/web-demo/app/lib/engine/render/SpeechBubble.tsx \
       packages/engine-renderer-r3f/src/SpeechBubble.tsx
```

**Runtime** (agnósticos):
```bash
git mv apps/web-demo/app/lib/engine/runtime/GameTouchSpriteRuntime.tsx \
       packages/engine-renderer-r3f/src/GameTouchSpriteRuntime.tsx
```

Los `use*Controller.ts` van uno a uno tras analizar si son agnósticos o específicos de demo:
- `useSceneRuntimeController` — específico de demo (importa SCENES) → SE QUEDA
- `useInventoryRuntimeController` — analizar
- `useInteractionEditorController` — analizar
- `useDebugPanelController` — específico de debug demo → SE QUEDA
- `useDebugModeEffects` — específico de demo → SE QUEDA
- `useProximityHintController` — analizar

### 3. Actualizar imports dentro de archivos movidos

Cada archivo movido ahora vive en `packages/engine-renderer-r3f/src/`. Sus imports deben ajustarse:

- Imports relativos a otros archivos movidos → mantienen rutas relativas internas
- Imports a `@pointclick-engine/engine-core` → ya correctos
- Imports a `apps/web-demo/...` → **PROBLEMA**: invierten dirección. Refactorizar para que el caller pase la dependencia (DI) o aceptar acoplamiento temporal (documentar)

### 4. Barrel exports en renderer

`packages/engine-renderer-r3f/src/index.ts`:

```ts
export { useR3FGameLoop } from "./adapters/gameLoopR3F";
export { WebKeyboardInput } from "./adapters/keyboardInput";

// Sprite
export { default as DavidSprite } from "./sprite/DavidSprite";
export * from "./sprite/clips";

// Scene
export { SceneGround } from "./scene/SceneGround";
export { SceneWalls } from "./scene/SceneWalls";
// ...

// Runtime
export { default as GameTouchSpriteRuntime } from "./GameTouchSpriteRuntime";
export { default as SpeechBubble } from "./SpeechBubble";
```

### 5. Build renderer-r3f

```bash
npm run build -w packages/engine-renderer-r3f
```

Iterar hasta que compile. Esperar errores de imports, fixearlos.

### 6. Web-demo importará desde renderer-r3f en Task 07

Por ahora, dejar imports rotos en web-demo. Task 07 los arregla.

## Success Criteria

- [ ] `packages/engine-renderer-r3f/src/` contiene sprite/, scene/, SpeechBubble, GameTouchSpriteRuntime
- [ ] `npm run build -w packages/engine-renderer-r3f` pasa
- [ ] `apps/web-demo/app/lib/engine/render/` ya no existe (o solo contiene archivos demo-específicos justificados)
- [ ] Renderer-r3f barrel exporta lo necesario
- [ ] (Web-demo puede estar roto temporalmente — se arregla en Task 07)

## On Complete

1. Marca `[x]` en `../tracking.md` para `06-move-r3f-render-components`
2. Commit:
   ```
   refactor(renderer): move R3F components to engine-renderer-r3f

   Moved sprite/, scene/, SpeechBubble, GameTouchSpriteRuntime from
   apps/web-demo to packages/engine-renderer-r3f. Demo-specific
   controllers (sceneRuntime, debugPanel, debugMode) stay in web-demo.

   Note: web-demo imports broken until Task 07.

   - [x] Marked: 06-move-r3f-render-components

   See docs/phases/phase-3-renderer-abstract/tasks/06-move-r3f-render-components.md
   ```

## References

- Architecture: `docs/architecture/03-rules-core-vs-render.md`
- Reference: `apps/web-demo/app/components/GameTouchCanvas.tsx` (consumer)

## Notes

Esta es la task más arriesgada de la fase. Hacerla en una sola sesión enfocada. Si compilación tarda >2h en estabilizar, dividir en sub-tasks (`06a-move-sprite`, `06b-move-scene`, etc.) y mergear incrementalmente.
