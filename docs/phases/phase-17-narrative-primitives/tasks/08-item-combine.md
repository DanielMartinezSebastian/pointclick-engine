# Task 17.08 — Core: combinar ítems

**Effort**: 1.5h | **Modelo**: haiku | **Blocks**: 12, 16 | **Blocked by**: 05

**Archivos permitidos**: `packages/engine-core/src/game/types/index.ts` (solo añadir un campo opcional), `game/runtime/types.ts` (ídem en `GameItemConfig`), `game/narrative/combine.ts`, `narrative/index.ts`, `game/commands/types.ts`, `game/events/types.ts`, `game/runtime/executors.ts`, `src/__tests__/itemCombine.test.ts`.

## 🎯 Objetivo

Usar un ítem del inventario sobre otro: "cuerda + gancho = garfio".

## API

```ts
// ItemDefinition y GameItemConfig ganan:
//   combine?: Record<string, Branch[]>;   // por id del otro ítem

// Comando: { type: "inventory:combine"; itemId: string; withItemId: string }
// Eventos: item:combined { itemId, withItemId }, item:combineFailed { itemId, withItemId }

/** Busca la regla en `a.combine[b]` y, si no existe, en `b.combine[a]`. */
export function resolveCombine(
  a: ItemDefinition, b: ItemDefinition, ctx: ConditionContext,
): Script | null;
```

## 📝 Instructions

1. Lee `game/narrative/branches.ts` (`pickBranch`) y cómo el executor de `hotspot:interact` (tarea 06) lanza un guion con el secuenciador: haz lo mismo.
2. La combinación es simétrica: basta declararla en uno de los dos ítems.
3. El guion decide el resultado con acciones normales (`removeItem`, `giveItem`, `say`). El executor no quita ni añade ítems por su cuenta.
4. Si alguno de los dos ítems no está en el inventario, o no hay regla aplicable, emite `item:combineFailed` y no ejecuta nada.
5. Tests (≥ 10): regla en el primero, regla en el segundo, sin regla, ítem ausente, rama condicionada, combinación de un ítem consigo mismo (falla).

## ✅ Success Criteria

- [ ] Tests del core verdes; `coreAgnosticism.test.ts` verde.
- [ ] Un ítem sin `combine` se comporta exactamente como en 0.5.0.
- [ ] `git diff --stat` solo muestra los archivos permitidos.
