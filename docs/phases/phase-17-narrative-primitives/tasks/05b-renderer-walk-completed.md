# Task 17.05b — Renderer: avisar del fin de una caminata

**Effort**: 1.5h | **Modelo**: sonnet | **Blocks**: 13, 16 | **Blocked by**: 05

**Archivos permitidos**: `packages/engine-renderer-r3f/src/hooks/usePlayerWalkAnimation.ts`, `src/GameTouchSpriteRuntime.tsx` (solo el punto donde termina o se interrumpe una caminata por ruta), tests en `src/__tests__/`.

## 🎯 Objetivo

La acción `walkTo` del secuenciador (tarea 05) espera a `player:walkCompleted` o `player:walkAborted`. El tipo de evento existe desde la Fase 10, pero **nadie lo emite**: el core solo emite `player:walkAborted` cuando no hay ruta, y el renderer, que es quien sabe cuándo el personaje llega, no emite nada. En el navegador, un guion con `walkTo` se quedaría esperando para siempre. En headless no ocurre porque `instantWalk` lo resuelve.

## Comportamiento

- Cuando una caminata por ruta (`playerWalkingState` activo) llega a su destino: emitir `{ type: "player:walkCompleted", position }` por el bus del runtime, una sola vez.
- Cuando una caminata por ruta se interrumpe antes de llegar:
  - por entrada del jugador (teclado, joystick o un click nuevo) → `{ type: "player:walkAborted", reason: "user-input" }`;
  - por colisión o bloqueo que la detiene → `reason: "collision"`.
- El comando `player:stop` ya emite `walkAborted` desde el core: no duplicarlo.
- El movimiento manual (teclado o joystick sin ruta) no emite ninguno de los dos.

## 📝 Instructions

1. Lee `usePlayerWalkAnimation.ts` y cómo `GameTouchSpriteRuntime.tsx` detecta el fin y la interrupción de una caminata y limpia `playerWalkingState`. Lee también el executor de `player:walkTo` y de `player:stop` en `packages/engine-core/src/game/runtime/executors.ts` (solo lectura).
2. Emite por `getGameRuntime()?.emit(...)`. Sin runtime no pasa nada.
3. Cuidado con el doble aviso: un click nuevo durante una caminata sustituye la ruta; debe emitirse un `walkAborted` de la antigua y, al llegar, un `walkCompleted` de la nueva.
4. Extrae a una función pura la decisión "¿qué evento toca emitir en esta transición de estado?" y pruébala (llegada, interrupción por entrada, por colisión, sustitución de ruta, sin caminata).
5. No cambies la animación, la velocidad ni la lógica de llegada: solo se añade el aviso.

## ✅ Success Criteria

- [ ] Gate técnico verde; `npm run smoke` 40/40 y 5/5.
- [ ] Comprobación en navegador con un script temporal de Playwright: tras un click en el suelo se recibe exactamente un `player:walkCompleted`; con un segundo click a mitad, un `walkAborted` y después un `walkCompleted`.
- [ ] Ningún archivo del paquete referencia la demo.
