# Phase 18 — Arte: packs candidatos

Investigación del 2026-10-10 para la premisa B ("No es un bug, es una feature"). Uso previsto: demo no comercial, de momento solo en local.

**Estado (2026-10-10)**: el owner aprobó la recomendación. Los dos packs CC0 de ítems están descargados sin modificar en `apps/web-demo/assets-src/items/` (fuera de `public/`, no se sirven), con su tabla de origen y licencia en `apps/web-demo/assets-src/README.md`. Los NPCs no llevan arte nuevo.

## Qué arte hace falta

| Necesidad | Formato actual de referencia |
|---|---|
| 6–8 ítems de inventario | PNG 64×64 con transparencia (`trophy.png`) |
| 1–2 NPCs en escena | David mide 93×255 px, con paseo en 4 direcciones y clip de habla |
| Cursor y menú de verbos | HTML; iconos de 32 px bastan |
| Fondos | Ya existen 5; la premisa B no pide más |

## Recomendación

1. **Ítems: packs CC0.** Dominio público: se pueden usar, modificar y subir al repo sin condiciones.
   - *496 pixel art icons for medieval/fantasy RPG*, de Henrique Lazarini (7Soul1). 496 iconos de 34×34. CC0. https://opengameart.org/node/39455
   - *Idylwild's Inventory*, de Idylwild. 50 iconos de 32×32 (llave, cuerda, cadena, libro, pergamino, cubo, saco…). CC0. https://opengameart.org/content/idylwilds-inventory

   Se escalan ×2 sin suavizado para igualar los 64×64 actuales.
2. **NPCs: no usar un pack; reutilizar a David.** Ningún pack gratuito encontrado se parece a David (alto, detallado, 93×255); un NPC de 32–48 px a su lado se vería de otro juego. La premisa B lo resuelve sola:
   - El NPC atascado es **una copia con glitch de David**: sus mismos frames con un tinte y un parpadeo. Cero arte nuevo, y es un chiste coherente con la historia.
   - **El Programador es una voz** fuera de pantalla: un bocadillo sin sprite.
3. **Cursores**: cualquiera de los packs de abajo, o iconos propios de 32 px.

## Otros candidatos vistos

| Pack | Qué trae | Licencia declarada | Nota |
|---|---|---|---|
| *Point and Click Adventure Game Sprite Template*, Danger Goose — https://danger-goose.itch.io/point-and-click-adventure-game-sprite-template | Plantilla de personaje con proporciones de aventura clásica: idle, paseo, correr, empujar, usar, sentarse. PNG y Aseprite | "100% free… personal and commercial projects. Credit is not necessary" (dicho por el autor en un comentario; no hay documento de licencia) | La mejor base si más adelante se dibujan NPCs propios |
| *Character Animation Asset Pack*, Mucho Pixels — https://muchopixels.itch.io/character-animation-asset-pack | 2 personajes, 3 atuendos, 15 animaciones, entre ellas hablar, usar y recoger | Uso comercial permitido; **prohíbe redistribuir los assets directamente** | Vista lateral, pensado para plataformas. No subir al repo público |
| *Lenore – Point and Click Character*, Danger Goose — https://danger-goose.itch.io/lenore-point-and-click-character | Un personaje de 36×46 con paseo en 4 direcciones | Sin licencia declarada | Descartado mientras no haya licencia |
| *Mouse Cursor Pack* (Megabyte Games), *154 Mouse Cursors* (KabGames), *Point and Click* (Kicked-in-Teeth) — https://itch.io/game-assets/free/tag-point-and-click | Cursores | Sin comprobar | Comprobar la licencia antes de usar |

## Avisos de licencia que afectan a lo que ya hay

- **El repositorio es público y cada PR se despliega en Vercel.** "Solo en local" no describe la situación real: lo que se sube al repo se distribuye. Por eso la recomendación para todo lo que se commitee es CC0.
- **`town.jpg` lleva la marca de agua "DanielThomasArt.com"** y no hay constancia de su licencia en el repo. `LICENSES.md` solo cubre el audio. Antes de enseñar la demo a colaboradores conviene documentar el origen y la licencia de los cinco fondos, del sprite de David y de los tres ítems, o sustituirlos.
- **Decisión del owner (2026-10-10)**: `town.jpg` se mantiene tal cual, con la marca de agua visible. No recortarla, taparla ni retocarla. La firma acredita al autor pero no es una licencia: revisar si la demo sale de la beta cerrada.
- Los packs sin documento de licencia (Danger Goose) son de bajo riesgo para pruebas, pero no equivalen a CC0.

## Escenario aportado por el owner (2026-10-11)

*Sci Fi Level*, de Jeremy Gooch — https://opengameart.org/content/sci-fi-level. CC-BY 3.0: exige acreditar "Jeremy Gooch (jeremygooch.blogspot.com)". Nivel lateral de ciencia ficción de 5121×841 en dos capas (fondo y primer plano), oscurecido a propósito para que destaquen los personajes. Descargado sin modificar en `apps/web-demo/assets-src/backgrounds/sci-fi-level/`.

Uso previsto: escena candidata para la aventura (encaja con la premisa B como "el interior del motor") y escena de pruebas seleccionable en el modo debug. Es mucho más ancho que los fondos actuales: hay que trocearlo en varias pantallas o usarlo con cámara que siga al personaje.

## Personaje aportado por el owner (2026-10-11)

*8 Directional 2D Point and Click Male Character*, de DeMoNiCaTeD — https://opengameart.org/content/8-directional-2d-point-and-click-male-character. CC-BY-SA 4.0 (o GPL 3.0): atribución y misma licencia para las versiones modificadas. Una hoja de sprites con reposo y paseo en 8 direcciones a 64×64. Descargado sin modificar en `apps/web-demo/assets-src/characters/helix-male/`.

Para usarlo como NPC hay que recortar la hoja en frames sueltos (el motor carga un PNG por frame) y no trae clip de habla. A 64 px de alto, junto a David (255 px) se verá de otra resolución: sirve para probar NPCs y como personaje lejano o "de otro juego", que en la premisa B puede ser un chiste a favor.

## Siguiente paso

En el documento de diseño de la Fase 18: elegir los iconos concretos de entre los descargados, copiarlos escalados ×2 a `apps/web-demo/public/assets/items/` y anotarlos en un `LICENSES.md` de arte junto al de audio.
