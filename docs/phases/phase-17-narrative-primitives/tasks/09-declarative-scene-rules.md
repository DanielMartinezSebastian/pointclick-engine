# Task 17.09 — Core: reglas de escena declarativas

**Effort**: 3.5h | **Modelo**: sonnet | **Blocks**: 12, 16 | **Blocked by**: 05

**Archivos permitidos**: `packages/engine-core/src/game/types/index.ts` (solo añadir), `game/runtime/{types,registry,executors,createGameRuntime}.ts`, `game/narrative/sceneRules.ts`, `narrative/index.ts`, `game/logic/rules/transitionRules.ts` (solo añadir), `src/__tests__/sceneRules.test.ts`; y en el renderer `src/hooks/useTransitionSystem.ts`, `src/hooks/useInventoryRuntime.ts`, `src/inventory/seedScene.ts` (para leer las reglas declarativas cuando existan).

## 🎯 Objetivo

Tres reglas que la demo escribe hoy como callbacks de TypeScript deben poder ser datos de la escena:

| Hoy (callback, Fase 16) | Pasa a ser (dato) |
|---|---|
| `getInitialPlacedItems(sceneId, all)` | `scene.initialItems` con condición |
| `onSceneEnter(sceneId, api)` | `scene.onEnter` (ramas) |
| `canLeaveScene(transition)` | `transition.when` + `transition.blocked` (guion) |

## API

```ts
// GameScene y GameSceneConfig ganan:
//   initialItems?: Array<{ item: PlacedSceneItem; when?: Condition }>;
//   onEnter?: Branch[];
// BaseSceneTransition gana:
//   when?: Condition;        // si no se cumple, la transición no ocurre
//   blocked?: Script;        // guion que se ejecuta al intentarlo sin cumplir `when`
```

## 📝 Instructions

1. `initialItems`: se siembran una vez por escena (mecanismo de escenas sembradas del core) evaluando `when` en el momento de entrar. La regla actual del trofeo ("solo si no existe ya un trofeo en ninguna escena") debe poder escribirse con `not(itemPlaced("trophy"))` combinado con `not(hasItem("trophy"))`: comprueba que el vocabulario de condiciones lo cubre y, si no, repórtalo antes de ampliar.
2. `onEnter`: se evalúa en cada entrada a la escena, incluida la inicial y tras recargar, con la misma temporización que hoy tiene la bienvenida (lee el efecto en `useInventoryRuntime.ts`). "Solo la primera vez" se expresa con `not(visited(...))` o con un flag.
3. `when` y `blocked` en transiciones: aplican a todos los tipos de transición.
4. Convivencia: si el host pasa además los callbacks de la Fase 16, se evalúan después de las reglas declarativas y pueden vetar. Documenta el orden en el JSDoc.
5. Tests headless en core (≥ 18) para la lógica; el renderer solo cablea.

## ✅ Success Criteria

- [ ] Tests de core y renderer verdes; `coreAgnosticism.test.ts` verde.
- [ ] Una escena sin estos campos se comporta exactamente como en 0.5.0.
- [ ] `npm run smoke` 40/40 y 5/5 (la demo aún usa los callbacks; se migra en la tarea 16).
