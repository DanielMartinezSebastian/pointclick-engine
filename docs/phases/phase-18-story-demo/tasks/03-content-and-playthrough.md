# Task 18.03 — Contenido de la aventura como datos y recorrido headless

**Modelo**: sonnet | **Blocks**: 04 | **Blocked by**: 01, 02

**Archivos permitidos**: `apps/web-demo/adventure-content/**` (nuevo), tests junto al contenido. Ningún archivo de `packages/`.

## 🎯 Objetivo

Escribir la aventura de [design.md](../design.md) entera como datos y demostrar con un test sin renderer que se puede terminar.

## 📝 Instructions

1. Estructura: `adventure-content/{scenes.ts,items.ts,dialogues.ts,characters.ts,texts.ts,index.ts}`. `index.ts` exporta `ADVENTURE_CONTENT` (escenas, ítems, diálogos, claves de texto), `ADVENTURE_INITIAL_SCENE_ID`, `ADVENTURE_CHARACTERS` y los diccionarios `es`/`en`.
2. Sigue el diseño al pie de la letra: ids de escenas, ítems, flags y el grafo de puzzles. Las líneas clave del diseño se usan tal cual; el resto de textos los escribes tú en el mismo tono, en `es` y `en`.
3. Modelo de contenido bien formado: `packages/engine-core/src/__tests__/fixtures/miniAdventure.ts` y la guía `docs/authoring/`.
4. Geometría provisional: reutiliza suelo, spawn y muros de la escena de la demo que comparte fondo (`apps/web-demo/demo-content/scenes/scenes.ts`), sin puertas ni interacciones de la demo. Las posiciones de hotspots, NPCs e ítems se afinan con capturas en la tarea 04; aquí basta con que sean plausibles y distintas entre sí.
5. Sprites: ítems en `/assets/adventure/items/<id>.png`; `glitch` usa los frames de `/assets/sprites/david-glitch/` (mismos nombres que `sprites/david`); `helix` reutiliza la definición de `demo-content/characters/helix.ts`; `programmer` no tiene sprite (ver nota).
6. Test `adventure.playthrough.test.ts` con `createPlaythrough` (`@pointclick-engine/engine-core/testing`): recorrido completo; 6 antes que 7 y 7 antes que 6; cada puzzle intentado antes de tiempo no cambia flags ni inventario; guardar a mitad y terminar desde la instantánea; `validateContent` sin errores ni avisos (pasando `dialogKeys` con todas las claves de texto y `handlers` con `credits`).

## Nota sobre el Programador

Sus líneas llevan `speaker: "programmer"`. Para que el bocadillo no salga sobre David, es un NPC sin verbos colocado en un punto alto de cada escena, fuera del alcance del click. Comprueba en el renderer qué ocurre con un `characterId` sin registrar; si el bocadillo no se pinta en ese caso, la tarea 04 usará un personaje con un PNG transparente. Aquí deja el dato preparado y documenta lo que encuentres.

## ✅ Success Criteria

- [ ] `npm test`, `npm run typecheck` y `npm run lint` verdes.
- [ ] El test resuelve la aventura de `intro.done` a `game.finished` sin tiempo real.
- [ ] `validateContent`: 0 errores y 0 avisos.
