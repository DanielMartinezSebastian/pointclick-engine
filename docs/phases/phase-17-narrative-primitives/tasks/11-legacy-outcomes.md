# Task 17.11 — Core: tipar los outcomes legacy

**Effort**: 1.5h | **Modelo**: haiku | **Blocks**: 19 | **Blocked by**: —

**Archivos permitidos**: `packages/engine-core/src/game/events/types.ts`, `game/events/legacyAdapter.ts`, `packages/engine-core/__tests__/gameEvents.test.ts` y `src/__tests__/legacyAdapterPickup.test.ts` (solo añadir casos), `src/__tests__/legacyOutcomes.test.ts` (nuevo).

## 🎯 Objetivo

`legacyRuntimeEventToGameEvent` convierte el evento antiguo `onDrop` en `item:dropped` con un cast, así que por el bus viajan valores de `outcome` que el tipo no declara: `rule-miss`, `on-player`, `pickup-blocked`, `item-interact` y `unknown-item`. Quien escucha `item:dropped` con TypeScript no sabe que existen.

## Decisión de diseño (ya tomada)

No se inventan eventos nuevos en esta tarea ni se cambia lo que se emite. Se **declara** lo que ya ocurre, sin cast:

```ts
| {
    type: "item:dropped";
    itemId: string;
    outcome:
      | "consume" | "place" | "return"                     // resultado de una regla de ítem
      | "rule-miss" | "unknown-item" | "on-player"         // el drop no aplicó ninguna regla
      | "pickup-blocked" | "item-interact";                // legado: no son un drop (ver nota)
    interactionId?: string;
  }
```

Añade un comentario JSDoc que marque `pickup-blocked` e `item-interact` como `@deprecated` en este evento: describen un intento de recogida y un click sobre un ítem colocado, y la tarea 06 les da eventos propios (`hotspot:*`, `inventory:*`). `pickup-success` no aparece: desde 0.5.0 viaja como `item:pickedUp`.

## 📝 Instructions

1. Lee `legacyAdapter.ts` y los emisores en `packages/engine-renderer-r3f/src/inventory/dropHandlers.ts` y `pickupHandlers.ts` (solo lectura) para confirmar la lista exacta de valores que se emiten hoy. Si encuentras alguno que no esté en la lista de arriba, añádelo al tipo y repórtalo.
2. Amplía el tipo y elimina el cast del adaptador. Si al quitarlo aparece un error de tipos en otro paquete, no lo fuerces: repórtalo.
3. Tests: un caso por cada valor, comprobando que el adaptador lo conserva tal cual.

## ✅ Success Criteria

- [ ] `grep -n " as \"consume\"" packages/engine-core/src/game/events/legacyAdapter.ts` vacío.
- [ ] `npm run build:packages && npm test && npm run typecheck` verdes.
- [ ] Ningún valor emitido cambia: `npm run smoke` 40/40 y 5/5.
