# Task 16.04 — Unificar tipos de escena

**Effort**: 3h | **Modelo**: sonnet | **Blocks**: 06 | **Blocked by**: 02

**Archivos permitidos**: `apps/web-demo/demo-content/scenes/scenes.ts`, `apps/web-demo/demo-content/items/types.ts`, `apps/web-demo/demo-content/dialogs/types.ts`, y los archivos de `apps/web-demo/app/**` que solo necesiten cambiar un import de tipo o quitar un cast. Nada en `packages/`.

---

## 🎯 Objetivo

`demo-content/scenes/scenes.ts` redefine `SceneWall`, `SceneWallOpening`, `SceneInteraction`, `SceneGround` y `Scene`, casi idénticos a los del core pero no asignables (`rotationY?` opcional frente a obligatorio). De ahí salen los casts `as GameSceneConfig[]` y `as GameScene | undefined` repartidos por la demo.

## 📝 Instructions

1. En `scenes.ts`, borrar los tipos duplicados e importar los del core: `GameSceneWall`, `GameSceneWallOpening`, `GameSceneInteractionFull`, `GameSceneGround`, `GameScene`.
2. Lo que solo existe en la demo se modela como extensión explícita:
   ```ts
   export type DemoSceneInteraction = GameSceneInteractionFull & { invisible?: boolean };
   export type DemoScene = Omit<GameScene, "interactions"> & {
     interactions: DemoSceneInteraction[];
     doors?: SceneDoor[];
   };
   ```
   `SceneDoor` se queda en la demo (la Fase 7 lo promoverá).
3. Mantener alias de compatibilidad exportados (`export type Scene = DemoScene`, etc.) para no tocar más archivos de los necesarios.
4. Corregir los datos: cada muro sin `rotationY` recibe `rotationY: 0`. **No cambiar ningún otro valor numérico** de las escenas.
5. Hacer lo mismo con `items/types.ts` y `dialogs/types.ts` si duplican `ItemDefinition`, `ItemInteractionRule` o `DialogKey` del core: re-exportar en vez de redefinir.
6. Eliminar los casts que dejen de ser necesarios (`page.tsx`, `GameTouchCanvas.tsx`, `publicApi.test.ts`, `example-bridge/page.tsx`). Búscalos con `grep -rn "as GameScene" apps/web-demo`.

## ✅ Success Criteria

- [ ] `npm run typecheck` → 0 errores.
- [ ] `npm test` → 0 fallos.
- [ ] `grep -rn "as GameSceneConfig\[\]\|as GameScene | undefined" apps/web-demo/app` → vacío.
- [ ] `git diff` de `scenes.ts` no altera posiciones, tamaños ni ids (solo tipos y `rotationY: 0` añadidos).

## Reporte

Tipos eliminados, alias conservados, casts retirados y cualquier campo de la demo que no exista en el core (candidato a promover).
