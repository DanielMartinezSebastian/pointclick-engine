# Phase 18 — Diseño: "No es un bug, es una feature"

Documento de diseño de la aventura. Fuente de verdad del contenido: lo que aquí se describe se escribe como datos en `apps/web-demo/adventure-content/` y lo resuelve un test headless.

**Estado**: borrador de opus del 2026-10-11, pendiente de la lectura del owner (tono y chistes). La implementación avanza con arte provisional; cambiar un texto o un puzzle después es barato.

## Sinopsis

David se despierta dentro de la demo del motor, y la demo está rota. El Programador, una voz agotada que habla desde fuera de la pantalla, le pide ayuda: no puede publicar hasta que la demo "compile". Cada fallo se arregla con objetos del propio mundo, que es de fantasía medieval porque el pack de iconos era gratis. Al final David arranca el build, la demo compila y el Programador se va a dormir.

Duración objetivo: 10–15 minutos. Tono: el de los textos actuales ("El programador fue muy vago"), sin romper nunca la cuarta pared hacia el jugador real: la rompe hacia el Programador.

## Personajes

| Id | Quién | Sprite |
|---|---|---|
| `player` | David | `sprites/david` |
| `programmer` | El Programador. Solo voz: sus líneas salen de un punto alto de la escena | sin sprite (o PNG transparente) |
| `glitch` | Copia de David atrapada en un bucle infinito en el pueblo | `sprites/david-glitch` (David con el tono girado y un fantasma desplazado) |
| `helix` | Personaje de otro juego, importado por error y olvidado en el backlog | `sprites/helix` (CC-BY-SA 4.0) |

## Escenas

| Id | Fondo | Papel en la historia |
|---|---|---|
| `adv-room` | `personalRoom.png` | Tutorial. La puerta no tiene transición |
| `adv-town` | `town.jpg` | Nudo. El NPC en bucle bloquea el paso |
| `adv-backlog` | `mazmorra.jpg` | "El backlog": donde acaba lo que nadie mira |
| `adv-engine` | `sciFiLab.jpg` (CC-BY 3.0) | La sala de máquinas del motor. Consola de build |
| `adv-heap` | `volcanico.jpg` | "El heap": la lava es una fuga de memoria |

Conexiones: `adv-room ↔ adv-town`, `adv-town ↔ adv-backlog`, `adv-town ↔ adv-engine`, `adv-engine ↔ adv-heap`.

## Ítems

Iconos ya generados en `apps/web-demo/public/assets/adventure/items/<id>.png` (packs CC0, escalados ×2).

| Id | Nombre | Qué es | Dónde se consigue |
|---|---|---|---|
| `duck-beak` | Pico de pato de goma | El resto del pato no entró en el presupuesto de arte. Sirve para depurar | Suelo de `adv-room` |
| `semicolon` | Punto y coma | O un colmillo. En este motor es lo mismo | Mirar la cama en `adv-room` |
| `sticky-note` | Pergamino adhesivo | La contraseña, donde siempre: bajo el monitor. Pone `0xC0FFEE` | Mirar el ordenador tras la pista del pico |
| `empty-mug` | Taza vacía | | Suelo de `adv-town` |
| `coffee-beans` | Saco de café | | Suelo de `adv-backlog` |
| `coffee` | Café frío | Como le gusta al Programador | Combinar taza + saco |
| `null-pointer` | Puntero nulo | Un palo que no señala nada | Lo da Helix |
| `valid-pointer` | Puntero válido | Ahora señala | Combinar puntero nulo + pergamino |
| `break` | Un `break` | Rompe bucles. Tiene forma de pico | Lo da Helix a cambio del puntero válido |
| `bucket` | Cubo | Para goteras. Y para fugas | Suelo de `adv-backlog` |

## Puzzles

| # | Puzzle | Escena | Requiere | Resultado |
|---|---|---|---|---|
| 1 | Mirar el ordenador: "Falta un `;` en la línea 42". Mirar la cama da el punto y coma. Usarlo en el ordenador repara la puerta | `adv-room` | — | flag `door.fixed`; se abre `adv-room → adv-town` |
| 2 | Hablar con el glitch: está en bucle. Usar el pico de pato sobre él (depuración con pato de goma): al explicarle su problema, suelta dónde está la contraseña | `adv-town` | `duck-beak` | flag `hint.postit` |
| 3 | Volver a la habitación y mirar el ordenador: aparece el pergamino. Usarlo en la puerta de la mina (403 Forbidden) | `adv-room`, `adv-town` | 2 | `sticky-note`; flag `backlog.open`; se abre `adv-town → adv-backlog`. El pergamino no se consume |
| 4 | Helix no puede volver a su juego: su puntero de vuelta es nulo, y te lo da. Combinar puntero nulo + pergamino. Darle el puntero válido | `adv-backlog` | 3 | `null-pointer` → `valid-pointer`; flag `helix.home`; Helix da el `break` y desaparece |
| 5 | Usar el `break` sobre el glitch: sale del bucle y se aparta | `adv-town` | 4 | flag `glitch.fixed`; se abre `adv-town → adv-engine` |
| 6 | Usar la consola: el build falla con dos errores. (a) El Programador se ha dormido: combinar taza + saco y usar el café en el interfono | `adv-engine` | 5, `empty-mug`, `coffee-beans` | flag `programmer.awake` |
| 7 | (b) Fuga de memoria en el heap: poner el cubo bajo la fuga | `adv-heap` | 5, `bucket` | flag `leak.fixed` |
| 8 | Usar la consola con los dos errores resueltos: compila | `adv-engine` | 6, 7 | flag `game.finished`; `call "credits"` |

Grafo de dependencias: `1 → 2 → 3 → 4 → 5 → {6, 7} → 8`. Los puzzles 6 y 7 se resuelven en cualquier orden; la taza, el saco y el cubo se pueden recoger en cuanto se llega a su escena.

## Sin callejones sin salida

- Ningún ítem se consume antes de su último uso. `semicolon` se consume en 1; `duck-beak` nunca; `sticky-note` se consume al combinarlo en 4, y la puerta de la mina (3) queda abierta por flag; `empty-mug` y `coffee-beans` en la combinación; `coffee` en 6; `null-pointer` en la combinación; `valid-pointer` en 4; `break` en 5; `bucket` en 7.
- El pergamino no se puede combinar antes de abrir la mina: el puntero nulo solo se consigue dentro.
- Todo ítem del suelo es `initialItems` de su escena: sigue ahí si el jugador se va sin recogerlo.
- Cada intento equivocado tiene respuesta propia (`useItemDefault` en los hotspots clave) y ninguna cambia estado.

## Guion de cada momento (líneas clave, `es`)

- **Entrada, primera vez** (`adv-room`, flag `intro.done`): Programador: "¿Hola? ¿Hay alguien en la demo? Mira, no te voy a engañar: está rota. Y publico mañana." / "La puerta no hace nada. Mira el ordenador, a ver qué dice el log."
- **Puerta bloqueada**: David: "La puerta no tiene transición. Literalmente no lleva a ninguna parte."
- **Glitch, en bucle**: "¡Bienvenido al pueblo! ¡Bienvenido al pueblo! ¡Bienvenido al…!" Opciones: "¿Estás bien?" → repite; "¿Puedes parar?" → "No tengo `break`. ¡Bienvenido al pueblo!"
- **Pico sobre el glitch**: David: "A ver, cuéntaselo al pato." Glitch: "Pues resulta que entro al bucle, saludo, y… oh. La contraseña del backlog está en un pergamino bajo el monitor. No sé por qué he dicho eso."
- **Mina cerrada**: David: "403. Prohibido. Pide contraseña."
- **Helix**: "Soy de otro juego. Me importaron por error y nadie vino a recogerme." / "Volvería, pero mi puntero de vuelta es nulo. Toma, mira." Tras el puntero válido: "`0xC0FFEE`. Es mi casa. Quédate esto, yo no rompo bucles." Y desaparece.
- **Paso al motor bloqueado**: Glitch: "¡Bienvenido al pueblo!" David: "No me deja pasar. Está ocupando el hilo principal."
- **Consola, primer uso**: "Build fallido. 2 errores: `ProgramadorDormidoException` y fuga de memoria en el heap."
- **Interfono con café**: Programador: "…¿eh? ¿Café? ¿Frío? Perfecto. Estoy despierto. Estoy despierto."
- **Cubo en la fuga**: David: "No es una solución. Es un cubo." Programador: "Es un recolector de basura manual. Lo documento como feature."
- **Final**: "Compilando…" / "Build correcto. 0 errores, 147 avisos." / Programador: "Compila. COMPILA. Gracias. Me voy a dormir. No toques nada."

Los textos completos, en `es` y `en`, se escriben con el contenido. Los chistes que dependan del idioma se adaptan, no se traducen.

## Requisitos técnicos

- Ruta propia `/adventure`, con su propio runtime y **su propia partida guardada** (almacenamiento con prefijo): no comparte progreso con `/`.
- Todo el contenido es dato. Únicos `call`: `credits`.
- Intro mínima, final con créditos (incluyen las atribuciones de `public/assets/LICENSES-art.md`) y botón de nueva partida.
- Un test headless (`createPlaythrough`) resuelve la aventura entera, prueba los órdenes alternativos de 6 y 7 y los intentos fuera de orden.
- `validateContent` sin errores ni avisos.
- Un smoke de navegador recorre el camino principal.

## Qué falta por decidir con el owner

- El tono de las líneas de arriba.
- Si el final debe enlazar con la demo técnica (`/`) o quedarse en los créditos.
- Música: se reutilizan las pistas actuales por escena salvo que se aporten otras.
