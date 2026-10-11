# Task 17.04 — Core: condiciones

**Effort**: 2.5h | **Modelo**: sonnet | **Blocks**: 05 | **Blocked by**: 03

**Archivos permitidos**: `packages/engine-core/src/game/narrative/conditions.ts`, `narrative/index.ts`, `src/index.ts` (añadir export), `src/__tests__/conditions.test.ts`.

## 🎯 Objetivo

Un tipo de dato para preguntar por el estado del juego sin efectos secundarios.

## API

```ts
export type Condition =
  | { flag: string; equals?: FlagValue; gte?: number; lte?: number } // sin operador: "es verdadero"
  | { hasItem: string; atLeast?: number }
  | { itemPlaced: string; inScene?: string; at?: string }            // at = interactionId
  | { inScene: string }
  | { visited: string }
  | { all: Condition[] }
  | { any: Condition[] }
  | { not: Condition };

/** Se construye desde los stores; inyectable en tests. */
export interface ConditionContext {
  flags: Record<string, FlagValue>;
  inventory: InventorySlotsState;
  placedItems: PlacedSceneItem[];
  sceneId: string;
  visitedSceneIds: string[];
}

/** `undefined` cuenta como verdadero. */
export function evaluateCondition(condition: Condition | undefined, ctx: ConditionContext): boolean;
/** Lee los stores actuales. */
export function getConditionContext(): ConditionContext;

// Constructores para escribir contenido legible:
//   flag("x"), flag("n", { gte: 3 }), hasItem("key"), itemPlaced("trophy", { inScene: "room" }),
//   inScene("room"), visited("town"), all(a, b), any(a, b), not(a)
```

## 📝 Instructions

1. `evaluateCondition` es pura y no lee stores; `getConditionContext` sí.
2. Casos límite: `all: []` es verdadero; `any: []` es falso. Un flag inexistente es falso para "es verdadero", y con `equals` se compara contra `undefined`.
3. Tests (≥ 25): cada variante, combinaciones anidadas, los casos límite y que los constructores producen los objetos esperados.

## ✅ Success Criteria

- [ ] Tests del core verdes; `coreAgnosticism.test.ts` verde.
- [ ] Ningún archivo nuevo por encima de 200 líneas.
