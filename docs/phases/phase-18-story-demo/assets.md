# Phase 18 — Arte: packs candidatos

Investigación del 2026-10-10 para la premisa B ("No es un bug, es una feature"). Uso previsto: demo no comercial, de momento solo en local. **Nada descargado todavía.**

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
- Los packs sin documento de licencia (Danger Goose) son de bajo riesgo para pruebas, pero no equivalen a CC0.

## Siguiente paso

Con el visto bueno del owner: descargar los dos packs CC0 de ítems, elegir los iconos en el documento de diseño de la Fase 18 y añadirlos a `apps/web-demo/public/assets/items/` con su entrada en un `LICENSES.md` de arte.
