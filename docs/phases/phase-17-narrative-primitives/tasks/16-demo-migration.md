# Task 17.16 — Demo: migrar reglas a datos y añadir contenido de prueba

**Effort**: 5h (dividir en 16a y 16b) | **Modelo**: sonnet | **Blocks**: 18, 19 | **Blocked by**: 09, 10, 12, 13, 14, 15

**Archivos permitidos**: `apps/web-demo/demo-content/**`, `apps/web-demo/app/lib/engine/runtime/{demoSceneRules.ts,demoViewportOptions.ts}`, `apps/web-demo/app/lib/gamePersistence.ts`, `apps/web-demo/app/components/{GameTouchCanvas.tsx,InventoryUI.tsx}`, `apps/web-demo/app/{page.tsx,debug/page.tsx,example-bridge/page.tsx}`, `apps/web-demo/app/example-minimal/**`, `e2e/**`.

## 🎯 Objetivo

Demostrar que el modelo declarativo sustituye a los callbacks, y dar al smoke algo narrativo que probar. **No es la historia de la demo** (eso es la Fase 18): es contenido de prueba mínimo sobre las escenas actuales.

## 16a — Migrar lo existente (sin cambio observable)

| Hoy | Pasa a |
|---|---|
| `getDemoInitialPlacedItems` (trofeo en `personalRoom`) | `initialItems` de la escena, con su condición |
| `onDemoSceneEnter` (bienvenida) | `onEnter` de la escena |
| `canLeaveSceneDemo` (no salir sin el trofeo) | `when` + `blocked` en la transición `personalRoom → dungeon` |
| Cuatro claves de guardado + `startGamePersistence` | `game:save` sobre una instantánea única; `door-states` va en `extra`; `migrateLegacySave` al arrancar |
| `localStorage` de `clearGameProgress` | `game:reset` + `clearSave` (sigue sin tocar idioma, audio ni claves ajenas) |

Al terminar, `demoSceneRules.ts` desaparece y `DEMO_VIEWPORT_OPTIONS` no pasa `canLeaveScene`, `onSceneEnter` ni `getInitialPlacedItems`. El guardado automático se dispara al cambiar inventario, ítems colocados, flags, escena o puertas.

## 16b — Contenido de prueba nuevo

1. **Un NPC** en `town` (reutilizando el sprite de David con otro id de personaje) con un diálogo de 4–5 nodos: una opción condicionada a tener el trofeo, una opción `once`, y un efecto que pone un flag y entrega un ítem.
2. **Un hotspot** en `personalRoom` con `look` y `use`, y una regla `useItem` para el gameboy.
3. **Una combinación** de dos ítems que produce un tercero (hacen falta dos ítems nuevos sencillos; usa sprites existentes).
4. **`InventoryUI`**: soltar un ítem sobre otro slot despacha `inventory:combine`.
5. Textos en `es` y `en`.
6. **`/example-minimal`** gana un hotspot con `look`, para probar la primitiva sin código de la demo.

## Smoke

Amplía `e2e/smoke.mjs` y `e2e/smoke-minimal.mjs` con: hablar con el NPC y elegir una opción (comprobando el flag o el ítem recibido en la partida guardada), mirar el hotspot, combinar los dos ítems, y cargar una partida en el formato de 0.5.0 (inyectada en `localStorage` antes de abrir la página) comprobando que migra. Actualiza las comprobaciones que leían las claves antiguas para que lean la instantánea nueva.

## ✅ Success Criteria

- [ ] `grep -rn "canLeaveScene\|onSceneEnter\|getInitialPlacedItems" apps/web-demo/app` vacío.
- [ ] Gate técnico verde; `validateContent` sobre el contenido de la demo sin errores.
- [ ] `npm run smoke` verde con las comprobaciones nuevas; las 40 + 5 anteriores siguen pasando (adaptadas solo en cómo leen el guardado).
- [ ] Captura de `personalRoom` en partida nueva idéntica a la de antes de 16a.
