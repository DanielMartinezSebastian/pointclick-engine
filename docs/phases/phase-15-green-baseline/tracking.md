# Phase 15 — Tracking

> Marca `[x]` solo con Success Criteria validados. Ver `docs/workflow/how-to-track-tasks.md`.

## Ola 1 — en paralelo (archivos disjuntos)

- [x] [01-fix-publicapi-contract-tests](tasks/01-fix-publicapi-contract-tests.md) — sonnet
- [x] [02-fix-audio-system-tests](tasks/02-fix-audio-system-tests.md) — sonnet
- [x] [03-lint-react-rules](tasks/03-lint-react-rules.md) — sonnet
- [x] [04-lint-trivial](tasks/04-lint-trivial.md) — haiku
- [x] [05-core-node-env-guard](tasks/05-core-node-env-guard.md) — haiku
- [x] [06-ci-workflow](tasks/06-ci-workflow.md) — haiku
- [x] [08-docs-resync](tasks/08-docs-resync.md) — haiku

## Ola 2 — orquestador, tras integrar la ola 1

- [x] [07-untrack-dist](tasks/07-untrack-dist.md) — opus
- [ ] [09-validation-gate](tasks/09-validation-gate.md) — opus — _pendiente: falta completar el smoke en navegador_

## Gate final

- [x] `npm test` verde en los 3 workspaces
- [x] `tsc --noEmit` limpio en los 3 workspaces
- [x] `npm run lint` con 0 errores
- [x] `npm run build` verde
- [x] Regla de Oro: grep de imports prohibidos en core vacío
- [x] `git ls-files packages | grep /dist/` vacío
- [x] Gates heredados de las fases 11, 12 y 13 revisados y marcados (o anotados como bloqueados)
- [ ] Smoke manual en navegador: mover, recoger ítem, cambiar de escena — _parcial: intro, click-to-move, recoger trofeo y persistencia tras recargar OK; la transición personalRoom→dungeon no se disparó bajo automatización (tampoco con el código previo a la fase); falta prueba manual de transición, puerta, audio e idioma_
