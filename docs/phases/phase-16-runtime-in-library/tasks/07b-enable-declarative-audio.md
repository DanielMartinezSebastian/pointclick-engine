# Task 16.07b — Desbloquear el audio declarativo

**Effort**: 3h | **Modelo**: sonnet | **Blocks**: 11 | **Blocked by**: — (owner eligió la opción A el 2026-10-10)

---

## 🎯 Objetivo

La tarea 16.07 dejó los sonidos declarados en datos, pero la demo sigue cableando el audio a mano porque `attachAudioSystem` + `resolveAudioEvents` no reproducen hoy lo mismo que suena. Tres causas, verificadas leyendo el código:

1. **Orden de creación del runtime.** `createGameRuntime` se llama en un `useEffect` de `app/page.tsx`, posterior al efecto de `useSceneRuntimeController` que fija la escena inicial. El `scene:changed` inicial no llega al bus (música inicial perdida) y `GameTouchCanvas.tsx` necesita un `setInterval` de 50 ms para esperar al runtime.
2. **Nadie emite `item:pickedUp`.** La recogida viaja como `item:dropped` con `outcome: "pickup-success"`, valor que el tipo `GameEvent` no declara (`legacyRuntimeEventToGameEvent` lo cuela con un cast).
3. **`resolveAudioEvents` no mira `outcome`.** Para cualquier `item:dropped` devuelve el sonido de soltar: sonaría al recoger, al devolver y en intentos bloqueados, que hoy son silenciosos.

## Decisión (owner, 2026-10-10): opción A

- **Opción A (elegida)**: emitir `item:pickedUp` al recoger y dejar de enviar `pickup-success` como `item:dropped`; `resolveAudioEvents` reproduce el sonido de soltar solo con `outcome: "place"`. Corrige el tipo en vez de ampliarlo. Cambia la semántica observable de `item:dropped` para quien escuche recogidas por ese evento → nota de migración en el CHANGELOG de 0.5.0.
- **Opción B (descartada)**: declarar `"pickup-success"` (y el resto de outcomes legacy) en el tipo de `item:dropped` y filtrar por `outcome` en las reglas. No rompe a nadie, pero consolida un evento con doble significado.

## 📝 Instructions

1. `app/page.tsx`: crear el runtime antes del primer render de `GameTouchCanvas` (estado inicial perezoso o `useMemo`) y exponerlo por contexto o prop; `dispose` en el cleanup. Eliminar el `setInterval`.
2. Aplicar la opción elegida en el emisor (`useInventoryRuntimeController.ts`), en `legacyAdapter.ts` y en `audioRules.ts`, con tests en core para cada outcome.
3. Sustituir en `GameTouchCanvas.tsx` el cableado manual de SFX y el efecto de música por `useAudioSystem` con `DEMO_AUDIO_DEFAULTS` e `ITEMS`.
4. Registrar los ítems en el runtime (`createGameRuntime({ scenes, items })`) para que `useInventoryRuntimeController` resuelva reglas desde `getGameRuntime().getItems()` en vez de importar `demo-content/items`.

## ✅ Success Criteria

- [ ] `grep -n "setInterval" apps/web-demo/app/components/GameTouchCanvas.tsx` → vacío.
- [ ] Gate técnico verde.
- [ ] En navegador suena igual que antes: música de la escena inicial y al cambiar de escena, recoger gameboy (sonido propio), recoger otro ítem, colocar, transición; silencio al devolver un ítem y en recogida bloqueada.
- [ ] Checks de audio pendientes de `phase-11-audio/tracking.md` marcados.
