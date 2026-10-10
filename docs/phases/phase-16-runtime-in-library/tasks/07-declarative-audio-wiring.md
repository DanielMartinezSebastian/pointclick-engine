# Task 16.07 — Audio declarativo

**Effort**: 2.5h | **Modelo**: sonnet | **Blocks**: 11 | **Blocked by**: 15.02, 03

**Archivos permitidos**:
- `apps/web-demo/app/components/GameTouchCanvas.tsx` (solo los bloques de audio, líneas ~167–283)
- `apps/web-demo/demo-content/items/index.ts`
- `apps/web-demo/demo-content/scenes/scenes.ts` (solo campos `triggerSoundUrl` de transiciones)
- `apps/web-demo/app/lib/engine/runtime/useDemoAudio.ts` (nuevo, opcional)

---

## 🎯 Objetivo

La Fase 11 creó la vía declarativa (`pickupSoundUrl`/`dropSoundUrl` en ítems, `triggerSoundUrl` en transiciones, `resolveAudioEvents` en core, `useAudioSystem` en el renderer), pero la demo no la usa. `GameTouchCanvas.tsx` tiene en su lugar:

- un `setInterval` de 50 ms esperando a que exista el runtime,
- un mapa de sonidos por `itemId` escrito a mano,
- un efecto propio para la música de escena,
- varios `console.log("[audio] …")`.

## 📝 Instructions

1. Leer `packages/engine-renderer-r3f/src/hooks/attachAudioSystem.ts` y `packages/engine-core/src/game/logic/rules/audioRules.ts`.
2. Declarar los sonidos en datos: `pickupSoundUrl` del gameboy en `ITEMS`; defaults (`pickup-default`, `drop-default`, `transition-default`) en un `AudioDefaultsConfig`.
3. Sustituir en `GameTouchCanvas.tsx` el `setInterval`, el mapa y el efecto de música por una llamada a `useAudioSystem`. Si el runtime puede no existir en el primer render, resolverlo con estado/suscripción, no con polling.
4. Conservar tal cual lo que no cubre el sistema declarativo: sincronización de ajustes de mute/volumen, click de UI al abrir inventario, click al empezar a caminar, sonido de letras del bocadillo.
5. Quitar los `console.log` de audio.
6. Atención a un desajuste conocido: el código actual reacciona a `item:dropped` con `outcome === "pickup-success"`, valor que el tipo `GameEvent` no declara. Comprueba qué evento emite hoy realmente la recogida y repórtalo; si `resolveAudioEvents` no dispara el sonido de recogida por ese motivo, **no parchees el core**: describe el problema para el orquestador.

## ✅ Success Criteria

- [ ] `grep -n "setInterval\|soundMap\|console.log(\"\[audio\]" apps/web-demo/app/components/GameTouchCanvas.tsx` → vacío.
- [ ] `npm run typecheck`, `npm run lint`, `npm test` → verdes.
- [ ] Mismos sonidos que antes en: recoger gameboy, recoger otro ítem, colocar ítem, transición, música por escena.

## Reporte

Qué eventos disparan cada sonido ahora, y la lista exacta de pruebas de audio para el smoke en navegador.
