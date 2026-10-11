// Textos de "No es un bug, es una feature" en es y en. Contenido de la aventura, no del motor.
//
// Cada clave se escribe una vez con sus dos idiomas (`[es, en]`) y de ahi salen los dos
// diccionarios, asi nunca divergen. Los chistes que dependen del idioma estan adaptados, no
// traducidos. Las lineas clave del diseno (docs/phases/phase-18-story-demo/design.md) van tal
// cual en `es`.
import type { LocaleDictionaries } from "@pointclick-engine/engine-core";

type Pair = readonly [es: string, en: string];

const TEXTS: Record<string, Pair> = {
  // --- Escenas ---------------------------------------------------------------------------
  "scene.adv-room": ["Habitación", "Room"],
  "scene.adv-town": ["Pueblo", "Town"],
  "scene.adv-backlog": ["El backlog", "The backlog"],
  "scene.adv-engine": ["Sala de máquinas", "Engine room"],
  "scene.adv-heap": ["El heap", "The heap"],

  // --- Nombres de objetos y su descripcion ------------------------------------------------
  "item.duck-beak": ["Pico de pato de goma", "Rubber duck beak"],
  "item.duck-beak.description": [
    "El resto del pato no entró en el presupuesto de arte. Sirve para depurar.",
    "The rest of the duck didn't make the art budget. Great for debugging.",
  ],
  "item.semicolon": ["Punto y coma", "Semicolon"],
  "item.semicolon.description": [
    "O un colmillo. En este motor es lo mismo.",
    "Or a fang. In this engine it's the same thing.",
  ],
  "item.sticky-note": ["Pergamino adhesivo", "Sticky scroll"],
  "item.sticky-note.description": [
    "La contraseña, donde siempre: bajo el monitor. Pone 0xC0FFEE.",
    "The password, where it always is: under the monitor. It reads 0xC0FFEE.",
  ],
  "item.empty-mug": ["Taza vacía", "Empty mug"],
  "item.empty-mug.description": [
    "Ha conocido tiempos mejores. Y más líquidos.",
    "It has seen better days. And more liquid.",
  ],
  "item.coffee-beans": ["Saco de café", "Sack of coffee beans"],
  "item.coffee-beans.description": ["Huele a lunes.", "Smells like Monday."],
  "item.coffee": ["Café frío", "Cold coffee"],
  "item.coffee.description": [
    "Como le gusta al Programador: tarde y frío.",
    "Just how the Programmer likes it: late and cold.",
  ],
  "item.null-pointer": ["Puntero nulo", "Null pointer"],
  "item.null-pointer.description": ["Un palo que no señala nada.", "A stick that points at nothing."],
  "item.valid-pointer": ["Puntero válido", "Valid pointer"],
  "item.valid-pointer.description": [
    "Ahora señala. Da un poco de miedo.",
    "It points somewhere now. Slightly scary.",
  ],
  "item.break": ["Un break", "A break"],
  "item.break.description": [
    "Rompe bucles. Tiene forma de pico.",
    "Breaks loops. Shaped like a pickaxe.",
  ],
  "item.bucket": ["Cubo", "Bucket"],
  "item.bucket.description": ["Para goteras. Y para fugas.", "For drips. And for leaks."],

  // --- Nombres de hotspots y personajes ---------------------------------------------------
  "hotspot.computer": ["Ordenador", "Computer"],
  "hotspot.bed": ["Cama", "Bed"],
  "hotspot.mine-door": ["Puerta de la mina", "Mine door"],
  "hotspot.console": ["Consola de build", "Build console"],
  "hotspot.intercom": ["Interfono", "Intercom"],
  "hotspot.leak": ["Fuga de memoria", "Memory leak"],
  "npc.programmer.name": ["El Programador", "The Programmer"],
  "npc.glitch.name": ["Glitch", "Glitch"],
  "npc.helix.name": ["Helix", "Helix"],

  // --- Habitacion: intro, puerta, ordenador y cama ----------------------------------------
  "intro.1": [
    "¿Hola? ¿Hay alguien en la demo? Mira, no te voy a engañar: está rota. Y publico mañana.",
    "Hello? Anyone in the demo? Look, I won't lie to you: it's broken. And I ship tomorrow.",
  ],
  "intro.2": [
    "La puerta no hace nada. Mira el ordenador, a ver qué dice el log.",
    "The door does nothing. Check the computer, see what the log says.",
  ],
  "door.blocked": [
    "La puerta no tiene transición. Literalmente no lleva a ninguna parte.",
    "The door has no transition. It literally leads nowhere.",
  ],
  "computer.log": [
    "LOG: door.ts, línea 42. Falta un ; en la línea 42. Seguro que anda por la habitación.",
    "LOG: door.ts, line 42. Missing ; on line 42. It must be lying around the room somewhere.",
  ],
  "computer.note": [
    "Bajo el monitor hay un pergamino adhesivo. Contraseña: 0xC0FFEE. Seguridad ante todo.",
    "There's a sticky scroll under the monitor. Password: 0xC0FFEE. Security first.",
  ],
  "computer.idle": [
    "El log sigue igual. El ordenador me mira con desgana.",
    "The log hasn't changed. The computer stares back, unimpressed.",
  ],
  "computer.use": [
    "Lo uso un rato... Nada. Quizá le falte algo que teclear.",
    "I use it for a while... nothing. Maybe it needs something typed in.",
  ],
  "computer.fixed": [
    "Escribo el ; en la línea 42. La puerta hace un ruidito de transición. Creo que ya lleva a algún sitio.",
    "I type the ; on line 42. The door makes a little transition noise. I think it leads somewhere now.",
  ],
  "computer.alreadyFixed": [
    "Ya tiene su ;. No lo toco: funciona y no sé por qué.",
    "It already has its ;. I'm not touching it: it works and I don't know why.",
  ],
  "computer.nothing": [
    "Eso no se teclea en ningún sitio de este ordenador.",
    "That doesn't get typed in anywhere on this computer.",
  ],
  "bed.look": [
    "Bajo la almohada hay un punto y coma. O un colmillo. En este motor es lo mismo. Me lo quedo.",
    "Under the pillow there's a semicolon. Or a fang. In this engine it's the same thing. I'll keep it.",
  ],
  "bed.empty": [
    "Una cama. No hay nada más debajo; ya lo he mirado.",
    "A bed. Nothing else under it; I already checked.",
  ],
  "bed.nothing": [
    "No voy a dejar eso en la cama. Ya hay bastante desorden.",
    "I'm not leaving that on the bed. There's enough mess already.",
  ],

  // --- Pueblo: el glitch, la mina ---------------------------------------------------------
  "glitch.loop": [
    "¡Bienvenido al pueblo! ¡Bienvenido al pueblo! ¡Bienvenido al…!",
    "Welcome to town! Welcome to town! Welcome to…!",
  ],
  "glitch.welcome": ["¡Bienvenido al pueblo!", "Welcome to town!"],
  "glitch.c.fine": ["¿Estás bien?", "Are you okay?"],
  "glitch.c.stop": ["¿Puedes parar?", "Can you stop?"],
  "glitch.c.bye": ["Mejor te dejo.", "I'll leave you to it."],
  "glitch.nobreak": [
    "No tengo break. ¡Bienvenido al pueblo!",
    "I don't have a break. Welcome to town!",
  ],
  "glitch.duck.david": ["A ver, cuéntaselo al pato.", "Go on, tell it to the duck."],
  "glitch.duck.reveal": [
    "Pues resulta que entro al bucle, saludo, y… oh. La contraseña del backlog está en un pergamino bajo el monitor. No sé por qué he dicho eso.",
    "So I enter the loop, I say hello, and… oh. The backlog password is on a scroll under the monitor. I don't know why I said that.",
  ],
  "glitch.duck.again": [
    "Ya te lo he contado todo. Y ahora vuelvo a… ¡Bienvenido al pueblo!",
    "I've told you everything. And now I go back to… Welcome to town!",
  ],
  "glitch.nothing": [
    "Se lo enseño. El glitch lo mira, saluda y sigue a lo suyo.",
    "I show it. The glitch looks at it, says hello and carries on.",
  ],
  "glitch.look": [
    "Una copia de mí, con el color mal y un fantasma al lado. Lleva un rato diciendo lo mismo.",
    "A copy of me, with the wrong colours and a ghost next to it. It has been saying the same thing for a while.",
  ],
  "glitch.freed": [
    "…al pueblo. Oh. Se acabó. ¡Qué silencio! Me aparto, que estoy en medio.",
    "…to town. Oh. It's over. What a silence! I'll step aside, I'm in the way.",
  ],
  "glitch.blocked.david": [
    "No me deja pasar. Está ocupando el hilo principal.",
    "It won't let me through. It's hogging the main thread.",
  ],
  "glitch.free.line": [
    "Estoy bien. Estoy… ¿bien? Pasa, pasa, que no cuente como bucle.",
    "I'm fine. I'm… fine? Go ahead, don't let it count as a loop.",
  ],
  "mine.locked": ["403. Prohibido. Pide contraseña.", "403. Forbidden. Password required."],
  "mine.open": [
    "La puerta de la mina está abierta. Dentro hay un backlog enorme.",
    "The mine door is open. There's a huge backlog inside.",
  ],
  "mine.unlock": [
    "Tecleo 0xC0FFEE en el panel de la puerta. Clic. Adiós, 403.",
    "I type 0xC0FFEE on the door's keypad. Click. Goodbye, 403.",
  ],
  "mine.already": [
    "La puerta ya está abierta. El pergamino sigue pegajoso.",
    "The door is already open. The scroll is still sticky.",
  ],
  "mine.nothing": [
    "La puerta de la mina responde 403 a eso también.",
    "The mine door answers 403 to that too.",
  ],

  // --- Backlog: Helix ---------------------------------------------------------------------
  "helix.hello": [
    "Soy de otro juego. Me importaron por error y nadie vino a recogerme.",
    "I'm from another game. They imported me by mistake and nobody came to pick me up.",
  ],
  "helix.c.home": ["¿Y por qué no vuelves?", "Why don't you go back?"],
  "helix.c.here": ["¿Qué se hace en el backlog?", "What do you do in the backlog?"],
  "helix.c.bye": ["Suerte.", "Good luck."],
  "helix.null": [
    "Volvería, pero mi puntero de vuelta es nulo. Toma, mira.",
    "I'd go back, but my return pointer is null. Here, look.",
  ],
  "helix.here": [
    "Esperar. Lo que nadie mira envejece aquí con dignidad.",
    "Wait. Whatever nobody looks at ages with dignity down here.",
  ],
  "helix.bye": ["Estaré por aquí. Probablemente.", "I'll be around. Probably."],
  "helix.home": [
    "0xC0FFEE. Es mi casa. Quédate esto, yo no rompo bucles.",
    "0xC0FFEE. That's my home. Keep this, I don't break loops.",
  ],
  "helix.nothing": [
    "Helix lo mira y se encoge de hombros. No es su puntero de vuelta.",
    "Helix looks at it and shrugs. It's not his return pointer.",
  ],
  "helix.look": [
    "Un tipo de otro juego, con otra paleta de colores y mucha paciencia.",
    "A guy from another game, with a different colour palette and a lot of patience.",
  ],
  "combine.valid-pointer": [
    "Pego el pergamino al palo. Ahora el puntero señala a 0xC0FFEE. Hasta tiene sentido.",
    "I stick the scroll to the stick. Now the pointer points at 0xC0FFEE. It even makes sense.",
  ],
  "combine.coffee": [
    "Echo el café en la taza. Frío, amargo y a deshoras: perfecto.",
    "I pour the coffee into the mug. Cold, bitter and untimely: perfect.",
  ],

  // --- Sala de maquinas: consola e interfono ----------------------------------------------
  "console.look": [
    "La consola de build. Un cursor parpadea con aire acusador.",
    "The build console. A cursor blinks accusingly.",
  ],
  "console.fail": [
    "Build fallido. 2 errores: ProgramadorDormidoException y fuga de memoria en el heap.",
    "Build failed. 2 errors: SleepingProgrammerException and a memory leak in the heap.",
  ],
  "console.fail.sleep": [
    "Build fallido. 1 error: ProgramadorDormidoException.",
    "Build failed. 1 error: SleepingProgrammerException.",
  ],
  "console.fail.heap": [
    "Build fallido. 1 error: fuga de memoria en el heap.",
    "Build failed. 1 error: memory leak in the heap.",
  ],
  "console.compiling": ["Compilando…", "Compiling…"],
  "console.ok": [
    "Build correcto. 0 errores, 147 avisos.",
    "Build succeeded. 0 errors, 147 warnings.",
  ],
  "console.done": [
    "El build ya compilaba. Mejor no tocar nada, como dijo el Programador.",
    "The build already compiled. Best not to touch anything, as the Programmer said.",
  ],
  "console.nothing": [
    "La consola no sabe qué hacer con eso.",
    "The console doesn't know what to do with that.",
  ],
  "intercom.look": [
    "Un interfono que da al despacho del Programador. Se oyen ronquidos.",
    "An intercom to the Programmer's office. Snoring can be heard.",
  ],
  "intercom.use": [
    "Pulso el botón. Solo ronquidos. Hace falta algo más fuerte que un timbre.",
    "I press the button. Only snoring. It takes something stronger than a buzzer.",
  ],
  "intercom.coffee": [
    "…¿eh? ¿Café? ¿Frío? Perfecto. Estoy despierto. Estoy despierto.",
    "…huh? Coffee? Cold? Perfect. I'm awake. I'm awake.",
  ],
  "intercom.already": [
    "El Programador ya está despierto. Más o menos. Mejor no insistir.",
    "The Programmer is awake. More or less. Best not to push it.",
  ],
  "intercom.nothing": [
    "El interfono no admite eso. Ni siquiera de broma.",
    "The intercom doesn't take that. Not even as a joke.",
  ],

  // --- Heap: la fuga ----------------------------------------------------------------------
  "leak.look": [
    "Lava goteando de un agujero del techo. Es una fuga de memoria; la memoria, por lo visto, está caliente.",
    "Lava dripping from a hole in the ceiling. It's a memory leak; memory, apparently, runs hot.",
  ],
  "leak.use": [
    "No puedo tapar la fuga con las manos. Necesito algo que recoja.",
    "I can't plug the leak with my hands. I need something to catch it.",
  ],
  "leak.bucket.david": ["No es una solución. Es un cubo.", "That's not a solution. It's a bucket."],
  "leak.bucket.programmer": [
    "Es un recolector de basura manual. Lo documento como feature.",
    "It's a manual garbage collector. I'll document it as a feature.",
  ],
  "leak.already": [
    "El cubo ya recoge la fuga. Plic, plic, plic.",
    "The bucket is already catching the leak. Drip, drip, drip.",
  ],
  "leak.nothing": [
    "Eso no tapa una fuga de memoria.",
    "That won't plug a memory leak.",
  ],

  // --- Final ------------------------------------------------------------------------------
  "ending.programmer": [
    "Compila. COMPILA. Gracias. Me voy a dormir. No toques nada.",
    "It compiles. IT COMPILES. Thank you. I'm going to sleep. Don't touch anything.",
  ],
};

function dictionaryFor(index: 0 | 1): Record<string, { phrases: string[] }> {
  return Object.fromEntries(Object.entries(TEXTS).map(([key, pair]) => [key, { phrases: [pair[index]] }]));
}

export const adventureDictionaries: LocaleDictionaries = {
  es: dictionaryFor(0),
  en: dictionaryFor(1),
};

/** Todas las claves de texto de la aventura (las mismas en es y en). */
export const ADVENTURE_DIALOG_KEYS: ReadonlySet<string> = new Set(Object.keys(adventureDictionaries.es));
