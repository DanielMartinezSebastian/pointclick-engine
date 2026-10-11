# Task 17.17 — Recorrido headless de una mini-aventura

**Effort**: 4h | **Modelo**: sonnet | **Blocks**: 18, 19 | **Blocked by**: 06, 07, 08, 09, 10, 12

**Archivos permitidos**: `packages/engine-core/src/testing/{playthrough.ts,index.ts}`, `packages/engine-core/package.json` (subpath export `./testing`), `packages/engine-core/src/__tests__/fixtures/miniAdventure.ts`, `src/__tests__/miniAdventure.playthrough.test.ts`.

## 🎯 Objetivo

La prueba de que el modelo alcanza: una aventura pequeña pero completa, escrita solo con datos, que un test resuelve de principio a fin sin renderer. Y una utilidad para que cualquier juego hecho con el motor tenga su propio test de recorrido.

## La mini-aventura de fixture

Tres escenas, dos NPCs, cinco ítems y cuatro puzzles encadenados, que entre todos ejercitan cada primitiva al menos una vez:

1. **Recoger y usar**: un ítem del suelo abre un hotspot cerrado (`useItem`, flag).
2. **Conversación con condición**: un NPC solo da una pista si ya se miró un objeto (`look` pone un flag; opción con `when`).
3. **Combinar**: dos ítems producen un tercero.
4. **Intercambio y final**: entregar el ítem combinado a otro NPC desbloquea la transición final (`transition.when`), que ejecuta un guion de cierre y pone el flag `game.finished`.

Debe incluir además: una transición bloqueada con guion `blocked`, un `onEnter` que solo se dispara la primera vez, una opción `once`, y un `call` a un manejador registrado.

## API de la utilidad

```ts
// @pointclick-engine/engine-core/testing
export function createPlaythrough(content: GameContent, opts?: { initialSceneId: string }): {
  runtime: GameRuntime;
  clock: HeadlessClock;
  look(id: string): Promise<void>;
  use(id: string): Promise<void>;
  talk(id: string): Promise<void>;
  useItemOn(itemId: string, id: string): Promise<void>;
  combine(a: string, b: string): Promise<void>;
  pickUp(placedItemId: string): Promise<void>;
  choose(index: number): Promise<void>;
  goThrough(transitionId: string): Promise<void>;
  /** Avanza el reloj y descarta bocadillos hasta que no quede ningún guion en curso. */
  settle(): Promise<void>;
  state(): { sceneId: string; inventory: string[]; flags: Record<string, FlagValue>; dialogueActive: boolean };
  save(): GameSnapshot;
  dispose(): void;
};
```

## 📝 Instructions

1. `createPlaythrough` usa `HeadlessClock` y un almacenamiento en memoria, valida el contenido al crear (lanza si hay errores) y resuelve el pathfinding de forma instantánea: en headless caminar termina de inmediato.
2. Tests: (a) el recorrido completo de principio a fin; (b) cada puzzle intentado en el orden equivocado no avanza; (c) guardar a mitad, crear una partida nueva desde la instantánea y terminar; (d) `validateContent` del fixture sin errores ni avisos.
3. Ningún test usa tiempo real ni `setTimeout`.

## ✅ Success Criteria

- [ ] Tests del core verdes; `coreAgnosticism.test.ts` verde.
- [ ] El recorrido completo tarda menos de 1 s.
- [ ] `import { createPlaythrough } from "@pointclick-engine/engine-core/testing"` resuelve tras `npm run build:packages`.
