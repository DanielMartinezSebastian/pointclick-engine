# Task 16.10 — Comando `player:stop`

**Effort**: 1h | **Modelo**: haiku | **Blocks**: 13 | **Blocked by**: 02

**Archivos permitidos**:
- `packages/engine-core/src/game/runtime/executors.ts`
- `packages/engine-core/src/__tests__/gameRuntimePlayerStop.test.ts` (nuevo)
- `apps/web-demo/app/example-bridge/HtmlBridgePanel.tsx` (solo el texto "deferred v0.2.0" del botón)

---

## 🎯 Objetivo

`player:stop` está declarado en `GameCommand` pero su executor solo imprime un aviso ("deferred to v0.2.0"). Con el sistema de caminata por ruta de la Fase 10 ya se puede implementar sin tocar el renderer: el estado de caminata vive en `sceneStore.playerWalkingState`.

## 📝 Instructions

1. Leer en `packages/engine-core/src/game/state/sceneStore.ts` cómo se define y se limpia `playerWalkingState` (busca `setPlayerWalkingState`).
2. Implementar el executor:
   - Si hay una caminata activa (`playerWalkingState?.isActive`): limpiarla con la acción del store y emitir `{ type: "player:walkAborted", reason: "user-input" }`.
   - Si no hay caminata activa: no hacer nada y no emitir.
3. Tests (≥ 3):
   - Tras `player:walkTo` a un destino alcanzable, `player:stop` deja `playerWalkingState` inactivo o nulo.
   - Se emite `player:walkAborted` con `reason: "user-input"` exactamente una vez.
   - `player:stop` sin caminata activa no emite nada.
4. En `HtmlBridgePanel.tsx`, quitar el sufijo "(deferred v0.2.0)" de la etiqueta del botón.
5. **No tocar** `inventory:pickup` ni `inventory:drop`: siguen aplazados (dependen de los hotspots de la fase narrativa).

## ✅ Success Criteria

- [ ] `cd packages/engine-core && npx vitest run` → 0 fallos.
- [ ] `npx tsc --noEmit -p packages/engine-core` → 0 errores.
- [ ] `grep -n "player:stop" packages/engine-core/src/game/runtime/executors.ts` no contiene `console.warn`.

## Reporte

Implementación y salida de los tests. Si el movimiento por teclado/joystick no pasa por `playerWalkingState` (y por tanto `player:stop` no lo detiene), dilo: es una limitación a documentar, no a arreglar aquí.
