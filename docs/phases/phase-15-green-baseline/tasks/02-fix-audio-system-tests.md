# Task 15.02 — Arreglar tests de useAudioSystem

**Effort**: 2h | **Modelo**: sonnet | **Blocks**: 09, 16.07 | **Blocked by**: —

**Archivos permitidos** (ningún otro):
- `packages/engine-renderer-r3f/src/hooks/useAudioSystem.ts`
- `packages/engine-renderer-r3f/src/hooks/attachAudioSystem.ts` (nuevo)
- `packages/engine-renderer-r3f/src/__tests__/useAudioSystem.test.tsx` (puede renombrarse a `attachAudioSystem.test.ts`)
- `packages/engine-renderer-r3f/src/index.ts` (solo añadir el export nuevo)

---

## 🎯 Objetivo

Los 5 tests de `useAudioSystem.test.tsx` fallan con `Cannot read properties of null (reading 'useRef')`: el test invoca el hook como función normal, fuera de un render de React. No hay `@testing-library/react` ni `jsdom` en el paquete, y no se van a añadir.

## Decisión de diseño (ya tomada)

Separar la lógica del hook. Todo lo que hoy ocurre dentro del `useEffect` pasa a una función pura sin React:

```ts
// hooks/attachAudioSystem.ts — sin imports de "react"
export interface AttachAudioSystemOpts { /* los mismos campos que UseAudioSystemOpts */ }
/** Suscribe el puerto de audio a los eventos del runtime. Devuelve la función de limpieza. */
export function attachAudioSystem(opts: AttachAudioSystemOpts): () => void
```

`useAudioSystem` queda como envoltorio fino: `useEffect(() => attachAudioSystem(opts), [...])`. El estado que hoy vive en `previousMusicRef` pasa a ser una variable del closure de `attachAudioSystem`.

## 📝 Instructions

1. Leer `useAudioSystem.ts` completo y `packages/engine-core/src/game/logic/rules/audioRules.ts` (solo lectura) para entender `resolveAudioEvents`.
2. Crear `attachAudioSystem.ts` moviendo la lógica. Mismo comportamiento observable: mismas suscripciones, mismas llamadas al `AudioPort`, misma limpieza.
3. Reducir `useAudioSystem.ts` al envoltorio. Conservar su firma pública y sus dependencias de efecto.
4. Reescribir los tests contra `attachAudioSystem` (sin React). Conservar los 5 escenarios actuales y sus aserciones; añadir uno que verifique que la función de limpieza desuscribe (tras llamarla, emitir un evento no genera llamadas al adapter).
5. Exportar `attachAudioSystem` y su tipo de opciones desde `src/index.ts`.
6. De paso, quitar los `as any` del test si el tipado lo permite sin forzar.

## ✅ Success Criteria

- [ ] `cd packages/engine-renderer-r3f && npx vitest run` → 0 fallos, ≥ 67 tests.
- [ ] `npx tsc --noEmit -p packages/engine-renderer-r3f` → 0 errores.
- [ ] `grep -n "from \"react\"" packages/engine-renderer-r3f/src/hooks/attachAudioSystem.ts` → vacío.
- [ ] `useAudioSystem` sigue exportado con la misma firma.
- [ ] `git diff --stat` solo muestra archivos permitidos.

## Reporte

Cambios, salida de los comandos, y si detectas que algún escenario del test original nunca pudo pasar por un bug real del hook (no del test), descríbelo sin arreglarlo fuera de alcance.
