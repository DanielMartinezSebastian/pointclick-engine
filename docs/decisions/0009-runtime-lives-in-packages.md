# ADR-0009: El runtime vive en los paquetes, no en la demo

**Status**: proposed (pendiente de issue y visto bueno del owner)
**Date**: 2026-10-10

## Context

`createGameRuntime`, los registros de escenas/ítems/reglas, los executors de comandos, `useGameState`, `useGameActions` y `GameViewport` viven en `apps/web-demo/app/lib/engine/publicApi.ts`. Consecuencias medidas en la auditoría del 2026-10-10:

- `docs/LIBRARY_CONSUMPTION_GUIDE.md` documenta esos símbolos como exports de `@pointclick-engine/engine-renderer-r3f`, que no los exporta. Quien instale los paquetes publicados (0.4.0) no tiene runtime.
- `GameViewport` renderiza un `<Canvas>` vacío. El juego real lo monta `GameTouchCanvas.tsx` (526 líneas) con 9 hooks en `app/lib/engine/runtime/`, 15 archivos que importan `demo-content` directamente.
- `scene:set` copia la escena campo a campo en 4 sitios y descarta `transitions` y `music`.
- La demo mantiene copias de 7 archivos del renderer y de `inventoryRules.ts`.

## Decision

1. **`engine-core` aloja el runtime agnóstico**: `createGameRuntime`, registros, `CommandHandler` con sus executors, `EventBus`, `getGameRuntime`, `getGameState`, `getGameActions`. No depende de React. Los registros pertenecen a la instancia de runtime; `registerScene/Item/Rule` a nivel de módulo se conservan como fachada sobre un registro por defecto para no romper el contrato.
2. **`engine-renderer-r3f` aloja lo que depende de React**: `useGameState`, `useGameActions`, `GameViewport` (funcional, no un canvas vacío) y los hooks de orquestación hoy en la demo, que reciben el contenido por inyección en vez de importar `demo-content`.
3. **`apps/web-demo/.../publicApi.ts` se queda como barrel de re-export**. Todos los nombres del contrato v1 siguen importándose desde la misma ruta. Sin cambios breaking.
4. **La escena se registra entera**. Un único helper convierte la config pública en `GameScene`; desaparece la copia campo a campo.
5. **Los tipos de escena de la demo se derivan de los del core**. Lo que solo existe en la demo (`doors`) se modela como extensión explícita hasta que la Fase 7 lo promueva.

## Alternatives considered

- **Paquete nuevo `engine-runtime`**: separa mejor, pero añade un tercer paquete en lockstep (ADR-0007) sin beneficio hoy; el runtime no tiene dependencias que el core no tenga ya.
- **Todo en el renderer**: obligaría a un renderer alternativo a reimplementar comandos y registros, contra ADR-0005.
- **Dejarlo en la demo y arreglar solo la doc**: mantiene la librería inutilizable fuera del monorepo.

## Consequences

- Versión objetivo: **0.5.0** en ambos paquetes (lockstep). Solo adiciones; el contrato v1 se mantiene.
- Corrección de tipo ya aplicada en la Fase 15: `GameActions.setScene` pasa a `(sceneId: string) => void`, que es lo que la implementación y la guía hacían desde siempre.
- La demo adelgaza: pasa a ser consumidora, que es lo que `CLAUDE.md` exige.
- Riesgo: es un refactor transversal. Se mitiga con la base verde de la Fase 15, tests headless del runtime en core y smoke en navegador en cada ola.

## Requisito de proceso

`CLAUDE.md` exige issue + migración para tocar `publicApi.ts`. Borrador del issue:

> **Título**: Mover el runtime (`createGameRuntime`, hooks, `GameViewport`) de la demo a los paquetes
> **Cuerpo**: enlace a este ADR + plan `docs/phases/phase-16-runtime-in-library/`. Migración: ninguna para quien importe desde `publicApi.ts`; quien quiera consumir desde npm podrá importar desde `@pointclick-engine/engine-core` y `@pointclick-engine/engine-renderer-r3f` a partir de 0.5.0.

## References

- `docs/phases/phase-16-runtime-in-library/`
- ADR-0005 (renderer ports), ADR-0006 (commands/events), ADR-0007 (release)
