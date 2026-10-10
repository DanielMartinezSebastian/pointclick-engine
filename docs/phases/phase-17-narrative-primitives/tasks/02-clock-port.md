# Task 17.02 — Core: `ClockPort`

**Effort**: 1h | **Modelo**: haiku | **Blocks**: 05 | **Blocked by**: 01

**Archivos permitidos**: `packages/engine-core/src/ports/clock.ts`, `ports/headlessClock.ts`, `ports/index.ts` (añadir exports), `src/__tests__/clockPort.test.ts`.

## 🎯 Objetivo

El secuenciador de guiones (tarea 05) necesita esperar ("wait 500 ms") sin usar `setTimeout` directamente, para que los tests no dependan del tiempo real.

## API

```ts
export interface ClockPort {
  now(): number;                                      // ms
  setTimeout(fn: () => void, ms: number): () => void; // devuelve la cancelación
}
/** Implementación por defecto sobre globalThis.setTimeout y Date.now. */
export const systemClock: ClockPort;
/** Reloj manual para tests: el tiempo solo avanza con advance(ms). */
export class HeadlessClock implements ClockPort {
  advance(ms: number): void;   // dispara, en orden, los temporizadores vencidos
  pending(): number;
}
```

## 📝 Instructions

1. Mira `ports/gameLoop.ts` y `ports/headlessGameLoop.ts` para copiar el estilo.
2. `systemClock` usa `globalThis.setTimeout`, `globalThis.clearTimeout` y `Date.now` (no `window`).
3. `HeadlessClock.advance` dispara los temporizadores en orden de vencimiento, incluidos los que un callback programe dentro del mismo `advance` si vencen dentro del intervalo.
4. Tests (≥ 8): orden, cancelación, temporizadores anidados, `advance(0)`, `pending()`.

## ✅ Success Criteria

- [ ] `cd packages/engine-core && npx vitest run` verde, incluido `coreAgnosticism.test.ts`.
- [ ] `npx tsc --noEmit -p packages/engine-core` sin errores.
- [ ] `git diff --stat` solo muestra los archivos permitidos.
