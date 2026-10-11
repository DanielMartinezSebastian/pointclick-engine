# Guía de autoría

Cómo escribir una aventura con el motor (0.6.0): escenas, puzzles y diálogos como **datos** TypeScript, sin callbacks. Modelo y motivación: [`../architecture/10-narrative-model.md`](../architecture/10-narrative-model.md) y [ADR-0010](../decisions/0010-declarative-narrative-model.md).

> La versión de los paquetes todavía es 0.5.0: lo de esta guía es la 0.6.0 sin publicar (ver los `CHANGELOG.md`).

## Orden de lectura

1. [`01-scenes-and-hotspots.md`](01-scenes-and-hotspots.md) — escenas, transiciones, hotspots y verbos.
2. [`02-conditions-and-actions.md`](02-conditions-and-actions.md) — flags, condiciones, acciones, ramas y `call`.
3. [`03-dialogues-and-npcs.md`](03-dialogues-and-npcs.md) — árboles de diálogo con opciones y NPCs.
4. [`04-items-and-combining.md`](04-items-and-combining.md) — ítems, reglas de drop y combinaciones.
5. [`05-saving-and-testing.md`](05-saving-and-testing.md) — guardado, validación y test de recorrido.

## Ejemplos que se ejecutan

Los fragmentos de la guía están copiados de código que corre:

- `packages/engine-core/src/__tests__/fixtures/miniAdventure.ts`: "El faro", una mini-aventura completa (3 escenas, 2 NPC, 5 ítems, 4 puzzles encadenados). Su test `miniAdventure.playthrough.test.ts` la resuelve sin renderer.
- `apps/web-demo/demo-content/`: escenas, ítems y el diálogo `dialogues/guide.ts` de la demo.
- `apps/web-demo/app/example-minimal/page.tsx`: un hotspot y un ítem inicial en una escena, montados con `GameViewport`.

## Lo mínimo: un hotspot que habla

Tomado de `example-minimal/page.tsx`. Una escena con un hotspot `notice` cuyo verbo `look` pone un flag y dice una frase:

```ts
import { act, otherwise, type GameSceneConfig } from "@pointclick-engine/engine-core";

const SCENE_A: GameSceneConfig = {
  id: "minimal-a",
  label: "Minimal Scene A",
  background: "/assets/background/town.jpg",
  playerSpawn: [3.08, 1.05, 13.44],
  ground: { minX: -12, maxX: 17, minZ: -15, maxZ: 30, y: -3.25 },
  walls: [],
  interactions: [],
  hotspots: [
    {
      id: "notice",
      label: "notice.label",
      position: [6.0, 2.6, 13.4],
      halfSize: [0.7, 1.2, 0.5],
      verbs: {
        look: [otherwise(act.setFlag("notice.seen"), act.say("notice.look"))],
      },
    },
  ],
};
```

Con un solo verbo, un click lo ejecuta directamente; con varios sale un menú de verbos.

## Textos: `say` y las líneas resuelven una clave

`say`, `line`, `text` y `label` son **claves**, no texto. Se resuelven así (`dialog:trigger`, `packages/engine-core/src/game/runtime/executors.ts`):

- Con reglas registradas: `rules: [{ key, phrases }]` en `createGameRuntime` (o `registerRule`). Se elige una frase al azar.
- O con un `dialogAdapter` propio que traduzca la clave, como hace la demo (`apps/web-demo/app/lib/engine/runtime/demoViewportOptions.ts`).
- Sin ninguno de los dos se muestra la clave literal.

```ts
const created = createGameRuntime({
  scenes: [SCENE_A, SCENE_B],
  items: [TROPHY_ITEM],
  rules: [{ key: "notice.look", phrases: ["Un cartel de la plaza: 'SE BUSCA... un buen guía.'"] }],
});
```

## Dónde mirar cuando algo no funciona

| Síntoma | Causa habitual | Guía |
|---------|----------------|------|
| El bocadillo sale sobre el jugador y no sobre el NPC | `speaker` no es exactamente el `id` del NPC | [03](03-dialogues-and-npcs.md) |
| El `onEnter` de "solo la primera vez" no se dispara nunca | Se usó `not(visited(...))` | [02](02-conditions-and-actions.md) |
| El cambio de estado tarda en aplicarse | Va después de un `say`, que espera al cierre del bocadillo | [02](02-conditions-and-actions.md) |
| Aparece la clave en lugar del texto | Faltan `rules` o `dialogAdapter` | esta página |
| El NPC no se puede clicar | El host usa su propio `resolveScene` y no proyecta NPC | [03](03-dialogues-and-npcs.md) |
| Avisos en consola al arrancar | `validateContent` encontró referencias rotas | [05](05-saving-and-testing.md) |
