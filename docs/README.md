# Documentación del Proyecto

Índice maestro. **Punto de entrada para subagentes y humanos.**

---

## 🏛️ Architecture (estable — cambia poco)

Diseño del sistema. Lee antes de tocar arquitectura.

- [`architecture/01-layers.md`](architecture/01-layers.md) — Las 4 capas y su responsabilidad
- [`architecture/02-public-api.md`](architecture/02-public-api.md) — API pública (contrato v1; `publicApi.ts` es barrel de los paquetes)
- [`architecture/03-rules-core-vs-render.md`](architecture/03-rules-core-vs-render.md) — Decisión: ¿este código va en core o renderer?
- [`architecture/04-platform-ports.md`](architecture/04-platform-ports.md) — Adapters web (storage, clipboard, timer)
- [`architecture/05-bidirectional-communication.md`](architecture/05-bidirectional-communication.md) — Commands & Events API (web ↔ juego)
- [`architecture/06-renderer-implementation-guide.md`](architecture/06-renderer-implementation-guide.md) — Cómo escribir un renderer alternativo
- [`architecture/07-walls-with-openings.md`](architecture/07-walls-with-openings.md) — Walls with openings: pathfinding & rendering
- [`architecture/08-scene-transitions.md`](architecture/08-scene-transitions.md) — Scene transitions as first-class primitives
- [`architecture/09-multiplayer.md`](architecture/09-multiplayer.md) — Multijugador agnóstico (port + partición world/presence/private)
- [`architecture/10-narrative-model.md`](architecture/10-narrative-model.md) — Modelo narrativo: estado de mundo → condiciones → ramas → secuenciador → comandos y eventos (0.6.0)

---

## ✍️ Authoring (guía para escribir una aventura)

Escenas, puzzles y diálogos como datos. Empieza por el índice y sigue el orden.

- [`authoring/README.md`](authoring/README.md) — Índice, ejemplos ejecutables y textos (`say`)
- [`authoring/01-scenes-and-hotspots.md`](authoring/01-scenes-and-hotspots.md) — Escenas, transiciones, hotspots y verbos
- [`authoring/02-conditions-and-actions.md`](authoring/02-conditions-and-actions.md) — Flags, condiciones, acciones, ramas y `call`
- [`authoring/03-dialogues-and-npcs.md`](authoring/03-dialogues-and-npcs.md) — Diálogos con opciones y NPCs
- [`authoring/04-items-and-combining.md`](authoring/04-items-and-combining.md) — Ítems, reglas de drop y combinaciones
- [`authoring/05-saving-and-testing.md`](authoring/05-saving-and-testing.md) — Guardado, validación y `createPlaythrough`

---

## 🔧 Workflow (estable — guías reutilizables)

Cómo trabajar en este repo.

- [`workflow/how-to-create-plan.md`](workflow/how-to-create-plan.md) — Crear un nuevo plan modular
- [`workflow/how-to-track-tasks.md`](workflow/how-to-track-tasks.md) — Marcar checks en tracking
- [`workflow/how-to-spawn-subagent.md`](workflow/how-to-spawn-subagent.md) — Delegar tareas autocontenidas
- [`workflow/pre-commit-checklist.md`](workflow/pre-commit-checklist.md) — Validación antes de commit
- [`workflow/commit-convention.md`](workflow/commit-convention.md) — Formato de commits
- Smoke headless: `npm run smoke` (`e2e/smoke.mjs` + `e2e/smoke-minimal.mjs`; requiere la demo en marcha)

---

## 🚀 Phases (activo — fases en curso)

Trabajo actual y futuro. Una fase = un directorio con tareas modulares.

- [`phases/phase-2-core-extraction/`](phases/phase-2-core-extraction/) — ✅ Completed: Extracción de core a `packages/engine-core/`
- [`phases/phase-3-renderer-abstract/`](phases/phase-3-renderer-abstract/) — ✅ Completed: Abstracción del renderer
- [`phases/phase-4-bidirectional-web-game/`](phases/phase-4-bidirectional-web-game/) — ✅ Completed: Comunicación web ↔ juego
- [`phases/phase-5-publish/`](phases/phase-5-publish/) — ✅ Completed: Publicación en npm (v0.1.0 publishable)
- [`phases/phase-6-walls-with-openings/`](phases/phase-6-walls-with-openings/) — ✅ Completed: Walls with openings & pathfinding
- [`phases/phase-7-walls-first-class/`](phases/phase-7-walls-first-class/) — 📋 Planned (not started)
- [`phases/phase-8-scene-transitions/`](phases/phase-8-scene-transitions/) — ✅ Completed: Scene transitions (collision + item-drop)
- [`phases/phase-9-placed-items-agnóstic/`](phases/phase-9-placed-items-agnóstic/) — ✅ Phases A-C: Placed items refactoring to core (types, dialog keys, stores)
- [`phases/phase-10-scene-entry-positions-and-pathwalking/`](phases/phase-10-scene-entry-positions-and-pathwalking/) — ✅ Completed: Player spawn positions and pathwalking
- [`phases/phase-11-audio/`](phases/phase-11-audio/) — ✅ Completed: Audio system (música + SFX + mute)
- [`phases/phase-12-architecture-cleanup/`](phases/phase-12-architecture-cleanup/) — ✅ Completed: Core agnosticism & library boundaries
- [`phases/phase-13-i18n/`](phases/phase-13-i18n/) — ✅ Completed: Localization system (i18n)
- [`phases/phase-14-multiplayer/`](phases/phase-14-multiplayer/) — 📋 Planning: Multijugador en tiempo real, agnóstico de transporte
- [`phases/phase-15-green-baseline/`](phases/phase-15-green-baseline/) — ✅ Completed: Base verde (tests, tipos, lint, CI) y docs resincronizadas
- [`phases/phase-16-runtime-in-library/`](phases/phase-16-runtime-in-library/) — ✅ Completed: Runtime en los paquetes (core + renderer); la demo es consumidora (0.5.0)
- [`phases/phase-17-narrative-primitives/`](phases/phase-17-narrative-primitives/) — 🚧 Active: Flags, condiciones, acciones, hotspots con verbos, NPCs, diálogos con opciones, guardado único (0.6.0)
- [`phases/phase-18-story-demo/`](phases/phase-18-story-demo/) — 📋 Outline: Aventura corta con historia, de principio a fin

---

## 🧩 Components (demo R3F)

Documentación por componente. **Una página por componente.**

- [`components/README.md`](components/README.md) — Lista de componentes
- [`components/_template.md`](components/_template.md) — Template para nuevos

---

## 🔌 Integraciones

Recetas para enchufar el engine con frameworks externos.

- [`integrations/nextjs-i18n.md`](integrations/nextjs-i18n.md) — 3 patrones de i18n con Next.js (browser auto, native routing, next-intl)

---

## 📋 Decisions (ADRs ligeros)

Decisiones arquitectónicas registradas.

- [`decisions/README.md`](decisions/README.md) — Índice de ADRs
- [`decisions/0001-zustand-for-state.md`](decisions/0001-zustand-for-state.md)
- [`decisions/0002-useframe-for-loop.md`](decisions/0002-useframe-for-loop.md)
- [`decisions/0003-monorepo-with-demo.md`](decisions/0003-monorepo-with-demo.md)
- [`decisions/0004-modular-docs-strategy.md`](decisions/0004-modular-docs-strategy.md)
- [`decisions/0005-renderer-ports-design.md`](decisions/0005-renderer-ports-design.md)
- [`decisions/0006-command-event-architecture.md`](decisions/0006-command-event-architecture.md)
- [`decisions/0007-release-strategy.md`](decisions/0007-release-strategy.md)
- [`decisions/0008-multiplayer-architecture.md`](decisions/0008-multiplayer-architecture.md)
- [`decisions/0009-runtime-lives-in-packages.md`](decisions/0009-runtime-lives-in-packages.md)
- [`decisions/0010-declarative-narrative-model.md`](decisions/0010-declarative-narrative-model.md)

---

## 📚 Otros

- [`ROADMAP_FRAMEWORK_AGNOSTIC_REFACTORING.md`](ROADMAP_FRAMEWORK_AGNOSTIC_REFACTORING.md) — Plan high-level de 5 fases
- [`LIBRARY_API_CONTRACT_V1.md`](LIBRARY_API_CONTRACT_V1.md) — Contrato v1 de API pública
- [`LIBRARY_CONSUMPTION_GUIDE.md`](LIBRARY_CONSUMPTION_GUIDE.md) — Cómo consumir la librería
- [`authoring/README.md`](authoring/README.md) — Cómo escribir escenas, puzzles y diálogos
- [`_archive/`](_archive/) — Documentos reemplazados (referencia histórica)

---

## Para subagentes

Si vas a ejecutar una tarea específica:

1. Lee **solo** el archivo de la tarea: `docs/phases/<fase>/tasks/NN-*.md`
2. Si necesitas contexto, lee el archivo de arquitectura referenciado en la tarea
3. **No leas todos los docs**: cada tarea es autocontenida

Si vas a crear un nuevo plan:

1. Lee `docs/workflow/how-to-create-plan.md`
2. Sigue el template
