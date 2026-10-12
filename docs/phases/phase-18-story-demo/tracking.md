# Phase 18 — Tracking

> Marca `[x]` solo con Success Criteria validados. Tras cada tarea: gate técnico y `npm run smoke`.

- [x] [01-design](design.md) — opus — _pendiente de la lectura del owner (tono)_
- [x] 02-art — opus — iconos de los packs CC0 y copia con glitch de David
- [x] [03-content-and-playthrough](tasks/03-content-and-playthrough.md) — sonnet
- [x] [04-adventure-route](tasks/04-adventure-route.md) — sonnet
- [x] [05-validation-gate](tasks/05-validation-gate.md) — opus

## Gate final (ejecutado el 2026-10-12)

- [x] Gate técnico verde; `validateContent` de la aventura sin errores ni avisos — tests: core 720, renderer 159, demo 66; typecheck y lint sin errores
- [x] Test headless: recorrido completo, órdenes alternativos e intentos fuera de orden — 19 tests del contenido
- [x] Smoke de navegador de `/adventure` por el camino principal, de la intro a los créditos — 57/57
- [x] `/` y `/adventure` no comparten partida guardada (comprobado por el smoke); `npm run smoke` de la demo sigue en 69/69 y 8/8
- [x] Textos en `es` y `en`, con el mismo conjunto de claves (test)
- [x] Créditos con las atribuciones de arte (captura revisada)

No verificado: el orden alternativo de los puzzles 6 y 7 en el navegador (sí en headless); móvil y táctil; la lectura de tono del owner.
