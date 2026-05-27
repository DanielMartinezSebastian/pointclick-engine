# Task 02: Wire pending commands

**Phase**: 5 | **Estimate**: 3h | **Owner**: —

## Context

En Phase 4 (Task 05) se registraron executors **no-op con warning** para `player:stop`, `inventory:toggle`, `inventory:pickup`, `inventory:drop`, `dialog:trigger`, `dialog:dismiss`. Aceptable para alpha interna, pero un consumer externo que llame a `executeCommand({ type: "inventory:pickup", ... })` verá `[runtime] executor not yet wired` y no entenderá. Hay que cablearlos o documentar formalmente que están pending.

## Prerequisites

- [ ] Task 01 done (ADR-0007 decide si v0.1.0 los incluye o quedan para v0.2.0)
- [ ] Leer `apps/web-demo/app/lib/engine/publicApi.ts` para identificar dónde se registran los executors

## Action

### 1. Identificar el store/canal de cada comando

Para cada comando pendiente, mapear:

| Comando | Estado afectado | Store/módulo |
|---------|-----------------|--------------|
| `player:stop` | flag interno de "cancel target" | `useSceneStore` o renderer-r3f (click controller) |
| `inventory:toggle` | flag de UI inventario | `apps/web-demo/.../store/inventoryStore.ts` (o crear) |
| `inventory:pickup` | inventario + escena | inventoryStore + sceneStore |
| `inventory:drop` | inventario + escena | inventoryStore |
| `dialog:trigger` | diálogo activo | `apps/web-demo/.../store/dialogStore.ts` (o crear) |
| `dialog:dismiss` | diálogo activo | dialogStore |

Buscar stores existentes:

```bash
grep -rn "create<.*Store\|useInventoryStore\|useDialogStore" apps/web-demo/app/
```

### 2. Cablear executors reales en `createGameRuntime`

En `apps/web-demo/app/lib/engine/publicApi.ts`, reemplazar el bucle de no-ops por executors reales. Ejemplo:

```ts
commands.register("inventory:toggle", () => {
  useInventoryStore.getState().toggle();
});

commands.register("inventory:pickup", (cmd) => {
  const ok = useInventoryStore.getState().pickup(cmd.itemId);
  if (ok) bus.emit("item:pickedUp", { type: "item:pickedUp", itemId: cmd.itemId, quantity: 1 });
});

commands.register("inventory:drop", (cmd) => {
  const outcome = useInventoryStore.getState().drop(cmd.itemId, cmd.slotIndex);
  bus.emit("item:dropped", { type: "item:dropped", itemId: cmd.itemId, outcome, interactionId: undefined });
});

commands.register("dialog:trigger", (cmd) => {
  const text = lookupDialogText(cmd.dialogKey); // helper que mire _ruleRegistry
  useDialogStore.getState().show(text, cmd.dialogKey);
  bus.emit("dialog:triggered", { type: "dialog:triggered", text, dialogKey: cmd.dialogKey, source: "command" });
});

commands.register("dialog:dismiss", () => {
  const current = useDialogStore.getState().active;
  useDialogStore.getState().dismiss();
  bus.emit("dialog:dismissed", { type: "dialog:dismissed", dialogKey: current?.dialogKey });
});

commands.register("player:stop", () => {
  // Cancelar target del click-to-move. Si el renderer ya tiene un store/flag:
  useSceneStore.getState().cancelMoveTarget();
  // O alternativamente, exponer un signal/atom que el renderer escuche.
});
```

### 3. Si un comando requiere refactor mayor

Si cablear `player:stop` exige cambios profundos en el renderer (ej. acceso a refs del controller), **documentar y aplazar**:

- Marcar el executor como `console.warn("[runtime] inventory:pickup deferred to v0.2.0 — see docs/phases/phase-5-publish/tasks/02-wire-pending-commands.md#aplazados")`
- Añadir sección "Aplazados" en este task con motivo concreto
- Reflejar en `docs/architecture/05-bidirectional-communication.md` ("commands marked 'pending' in v0.1.0")

**Criterio de aplazamiento**: si cablear un comando requiere >1h adicional o tocar el renderer-r3f, se aplaza.

### 4. Tests

En `apps/web-demo/__tests__/publicApi.test.ts` añadir un test por cada comando cableado:

```ts
test("inventory:pickup updates store and emits event", () => {
  const runtime = createGameRuntime({ ... });
  const spy = vi.fn();
  runtime.on("item:pickedUp", spy);
  runtime.executeCommand({ type: "inventory:pickup", itemId: "key" });
  expect(useInventoryStore.getState().contains("key")).toBe(true);
  expect(spy).toHaveBeenCalledWith(expect.objectContaining({ itemId: "key" }));
  runtime.dispose();
});
```

### 5. Actualizar el ejemplo bridge

En `apps/web-demo/app/example-bridge/HtmlBridgePanel.tsx`, añadir botones para los comandos cableados (al menos `inventory:toggle`, `dialog:dismiss`, `player:stop`). Verificar visualmente que funcionan.

## Success Criteria

- [ ] `grep "executor not yet wired" apps/web-demo/app/lib/engine/publicApi.ts` devuelve solo comandos formalmente aplazados (idealmente 0)
- [ ] Tests `publicApi.test.ts` cubren todos los comandos cableados (≥1 test por comando)
- [ ] `npm run test -w apps/web-demo` pasa
- [ ] `npm run build` pasa
- [ ] Demo principal `/`: golden path verde (ningún comando rompe flujos existentes)
- [ ] `/example-bridge`: nuevos botones disparan los comandos correctamente
- [ ] Si hay aplazados, este task documenta cuáles y por qué (sección "Aplazados")

## On Complete

1. Marca `[x]` en `../tracking.md` para `02-wire-pending-commands`
2. Commit:
   ```
   feat(runtime): wire pending commands (inventory, dialog, player:stop)

   - [x] Marked: 02-wire-pending-commands

   See docs/phases/phase-5-publish/tasks/02-wire-pending-commands.md
   ```

## References

- ADR-0006: command/event architecture
- Phase 4 Task 05: donde se registraron los no-ops
- Architecture: `docs/architecture/05-bidirectional-communication.md`

## Notes

**Riesgo**: emitir eventos desde el executor (paso 2) puede crear duplicación si el store ya tiene su propio bridge a eventos en Task 04 de Phase 4. Verificar que cada evento se emite **una sola vez** por mutación. Si hay doble emisión, mantener solo la del executor y quitar la del store.

## Aplazados

- **`player:stop`**: Requiere una DI prop nueva en `GameTouchSpriteRuntime` (paquete `engine-renderer-r3f`) para que el renderer suscriba un signal de stop. Modificar el renderer-r3f en Phase 5 viola la regla de "no tocar renderer si el cambio es >1h". Postpuesto a v0.2.0.
- **`inventory:pickup`**: Requiere extraer la máquina de estado del inventario de `useInventoryRuntimeController` a un store Zustand completo con la lógica de `resolveInventoryDropHitDecision`, items colocados, etc. Refactor mayor de >3h. Postpuesto a v0.2.0.
- **`inventory:drop`**: Mismo motivo que `inventory:pickup`. Postpuesto a v0.2.0.
