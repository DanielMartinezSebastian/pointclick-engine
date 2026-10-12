# Phase 18 — Story Demo

**Objetivo**: una aventura corta, completa y con historia, jugable de principio a fin en la demo.
**Duración estimada**: 2 semanas de contenido, más el tiempo del arte
**Estado**: primera versión jugable (2026-10-12); pendiente de la lectura del owner y de la prueba con jugadores. Diseño en [design.md](design.md), seguimiento en [tracking.md](tracking.md)
**Owner**: Daniel Martínez Sebastián
**Version target**: demo 1.0 sobre los paquetes 0.6.x

---

## Por qué

La demo actual enseña mecánicas sueltas: mover, recoger, una puerta, tres escenas. No tiene principio, objetivo ni final. Una aventura de 10–15 minutos es la mejor prueba del motor y su mejor escaparate.

## Resultado esperado

- Se juega de principio a fin en 10–15 minutos: intro, 6–8 puzzles encadenados, final y créditos.
- 4–5 escenas, 2–3 NPCs con conversaciones, 8–10 ítems, al menos dos combinaciones.
- En español e inglés.
- Un test headless la resuelve entera (`createPlaythrough`), y el smoke recorre su camino principal en el navegador.
- Todo el contenido es dato: ningún callback propio del juego fuera de `call`.

## Decisiones del owner (2026-10-10)

1. **Premisa**: B, "No es un bug, es una feature".
2. **Arte**: ítems de dos packs CC0 ya descargados; los NPCs no llevan arte nuevo (el NPC atascado es una copia con glitch de David y el Programador es una voz sin sprite). Detalle en [assets.md](assets.md). De momento la demo solo se ejecuta en local, para pruebas. Antes de enseñarla fuera hay que revisar la licencia de cada asset, incluidos los fondos actuales.
3. **Ruta**: convive con la demo actual en una ruta propia (`/adventure`), para poder enseñarla en beta cerrada a colaboradores y revisores sin tocar `/`.

## Propuestas de premisa

Las tres reutilizan los fondos que ya existen (`personalRoom`, `town`, `mazmorra`, `volcanico`, `lava`) y el tono de los diálogos actuales.

### A. "Partida guardada"

David está a un jefe de terminar su juego cuando el cartucho del gameboy desaparece dentro de la pantalla. Entra tras él. El pueblo, la mazmorra y el volcán son los niveles del juego, y sus habitantes saben que son personajes. Para recuperar el cartucho hay que resolver lo que el juego dejó a medias.
*Arte nuevo*: 2 NPCs, unos 6 ítems. *A favor*: encaja con el gameboy y el trofeo actuales; objetivo claro desde el minuto uno.

### B. "No es un bug, es una feature" *(elegida)*

La demo del motor está rota y David lo sabe: paredes invisibles, una puerta sin llave, un NPC atascado repitiendo una frase. El Programador, agotado, le pide ayuda desde fuera de la pantalla. Cada puzzle es arreglar un fallo con las herramientas del propio mundo, y el final es conseguir que la demo "compile".
*Arte nuevo*: 1–2 NPCs, unos 6 ítems; el Programador puede ser solo una voz. *A favor*: continúa el humor que ya tienen los textos ("El programador fue muy vago", "Esto no es un bug, es una feature"), necesita el mínimo de arte y enseña el motor hablando de sí mismo.

### C. "El trofeo de la abuela"

El trofeo de la estantería no es de David: su abuela lo ganó en el concurso de tapas del pueblo en 1987 y alguien lo ha cambiado por una copia. Una investigación pequeña por el pueblo, con sospechosos, coartadas y un sótano que resulta ser una mazmorra.
*Arte nuevo*: 3 NPCs, unos 8 ítems, quizá un interior más. *A favor*: la más clásica como aventura gráfica; da más juego a los diálogos. *En contra*: la que más arte pide.

## Plan (se detalla en tareas al desbloquearse)

| # | Paso | Quién |
|---|---|---|
| 1 | Documento de diseño: sinopsis, personajes, grafo de dependencias de puzzles, lista de escenas, ítems, flags y arte necesario | opus, con el owner |
| 2 | Recorrido en papel validado contra el grafo: sin callejones sin salida ni ítems huérfanos | opus |
| 3 | Guion completo en `es` y `en` | sonnet, revisado por opus y el owner |
| 4 | Contenido como datos, con arte provisional (cajas y sprites actuales) | sonnet |
| 5 | Test headless del recorrido completo y de los órdenes alternativos | sonnet |
| 6 | Integración del arte y el audio definitivos | owner + sonnet |
| 7 | Geometría fina de escenas con el editor de debug (muros, hotspots sobre el fondo) | owner, o sonnet con capturas |
| 8 | Intro, final, créditos, menú de pausa y "nueva partida" | sonnet |
| 9 | Prueba con jugadores reales: dónde se atascan, qué no se entiende | owner |
| 10 | Pulido, smoke ampliado y gate | opus |

Los pasos 1–5 no dependen del arte: el juego puede estar completo y probado con arte provisional antes de que exista el definitivo.

## Qué puede hacer Opus 5.5 y qué no

| Trabajo | ¿Ejecutable? |
|---|---|
| Diseño de puzzles, grafo de dependencias, guion y diálogos en `es`/`en` | Sí; el tono y la premisa los valida el owner |
| Contenido como datos, tests de recorrido, smoke | Sí, completo |
| Geometría de escenas sobre un fondo dado | Parcial: se puede escribir y revisar con capturas; el ajuste fino es más rápido a mano con el editor |
| Fondos, sprites, animaciones | No |
| Música y efectos | No |
| Saber si es divertido | No: hace falta gente jugando |

## Fuera de alcance

Multijugador (Fase 14), puertas como primitiva (Fase 7), cinemáticas con cámara, voces.

## Estado al 2026-10-12

La aventura se juega de la intro a los créditos en `/adventure`, con partida guardada propia, en `es` y `en`. Pasos 1–5 y 7–8 del plan hechos con arte provisional (iconos CC0 y la copia con glitch de David); quedan el 6 (arte y audio definitivos), el 9 (jugadores reales) y el 10 tras ellos.

**Fallos del motor que destapó el contenido**

- Corregido: un `say` dentro del `do` de una opción de diálogo dejaba la conversación colgada en el navegador.
- Corregido: los NPCs no admitían `useItemDefault`.
- Sin corregir: `approach` de un hotspot. El `walkTo` devuelve al jugador al punto de aparición de la escena. La aventura no usa `approach`.
- Sin corregir: `spawnPosition` de una transición se ignora en el renderer; siempre se llega al `playerSpawn` de la escena destino.
- Sin corregir: el jugador no pasa de z ≈ 23.8 aunque `ground.maxZ` sea mayor.

Los tres sin corregir tocan el movimiento, que tiene dos sistemas distintos (deuda anotada en la Fase 17): conviene tratarlos juntos en una tarea propia.

**Primitivas que echó en falta el contenido**

- Una voz sin personaje: el Programador es un NPC sin sprite colocado en lo alto de la escena, y provoca un aviso por consola.
- Que una frase salga sobre un NPC que desaparece en la misma rama, sin depender de poner el flag después del `say`.
- Cerrar un bocadillo con un click (hoy el click solo salta la escritura): el smoke tarda unos 8 minutos por esas esperas.
- Una transición bloqueada no aparta al jugador de la zona de forma consistente.
