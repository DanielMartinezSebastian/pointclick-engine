import type { DialogLocales } from "./types";

export const dialogs: DialogLocales = {
  es: {
    boundaryHit: {
      phrases: [
        "¡Aquí hay una pared invisible y yo sin gafas!",
        "¿Ves ese borde? Yo tampoco, pero duele.",
        "El mapa termina aquí. El programador fue muy vago.",
        "¡No hay nada más allá! Solo oscuridad y bugs.",
        "Mis piernas dicen que sí, el motor dice que no.",
        "He encontrado el fin del mundo. Sin spoilers.",
        "Prohibido el paso. Firma: El motor de físicas.",
        "¡Límite alcanzado! Esto no es un bug, es una feature.",
        "Aquí termina mi aventura... y mi dignidad.",
        "Esto es como intentar salir de Google Maps.",
      ],
    },
    personalRoomWelcome: {
      phrases: [
        "¡Bienvenido a tu habitación personal! No olvides limpiar.",
        "Este es tu espacio. Hazlo tuyo, pero sin romper nada.",
        "¡Qué acogedor! ¿Es nueva la decoración?",
        "Tu habitación, tus reglas. Pero no te pases.",
        "¡Bienvenido! Aquí puedes ser tú mismo, o alguien más.",
      ],
    },
    inventoryDropHit: {
      phrases: [
        "¡Exacto! El Gameboy va ahí.",
        "Perfecto, ese era el sitio.",
        "Bien colocado. Queda mejor ahí.",
        "Sí, ahí estaba esperando ese objeto.",
      ],
    },
    inventoryDropMiss: {
      phrases: [
        "No, ese no es el sitio correcto.",
        "Casi, pero no va ahí.",
        "Eso no encaja en ese soporte.",
        "Prueba a soltarlo un poco más cerca del objetivo.",
      ],
    },
    "item.gameboy.drop.personal-room-gameboy-drop-target.hit": {
      phrases: [
        "Perfecto, la Gameboy se queda colocada.",
        "Encaja de lujo. Queda puesta en el soporte.",
      ],
    },
    "item.gameboy.drop.personal-room-gameboy-drop-target.miss": {
      phrases: [
        "No encaja en ese soporte.",
        "Ese no es el sitio de la Gameboy.",
      ],
    },
    "item.gameboy.drop.default.miss": {
      phrases: [
        "La Gameboy vuelve al inventario.",
        "No se puede colocar ahí. La guardo otra vez.",
      ],
    },
    "item.gameboy.pickup.personal-room-gameboy-drop-target.allowed": {
      phrases: [
        "Recogida. La Gameboy vuelve al inventario.",
        "La guardo en la mochila otra vez.",
      ],
    },
    "item.gameboy.pickup.personal-room-gameboy-drop-target.blocked": {
      phrases: [
        "Esta Gameboy está fija. No se puede recoger.",
        "No sale del soporte, está bloqueada.",
      ],
    },
    "item.gameboy.description": {
      phrases: [
        "Una Gameboy clásica. Pantalla monocroma, nostalgia instantánea y pilas que duran menos de lo que recuerdas.",
        "Mi Gameboy: portátil, retro y perfecta para perder la tarde en pixel-art.",
      ],
    },
    "interaction.gameboy-base.empty": {
      phrases: [
        "Aquí falta algo. Un hueco con forma de nostalgia.",
        "Este soporte parece vacío... como mi agenda.",
        "Hmm, aquí debería haber algo. Lo noto en los píxeles.",
        "El soporte está solo. Igual que yo los domingos.",
        "Hay algo que encajaría perfectamente aquí.",
        "El soporte espera pacientemente. Tiene más paciencia que yo.",
      ],
    },
    "interaction.gameboy-base.occupied": {
      phrases: [
        "La Gameboy descansa en su soporte. Como debe ser.",
        "Ahí está, bien colocada. El orden tiene su magia.",
        "La Gameboy en reposo. Lista para la próxima partida.",
        "Perfectamente colocada. Casi da pena moverla.",
        "Mira eso. Todo en su sitio. No suele pasar.",
      ],
    },
    "item.gold-key.description": {
      phrases: [
        "Una llave dorada y pesada. Algo seguro la espera al otro lado de una puerta.",
        "Llave de oro. No se gastan así en serrajeros baratos.",
      ],
    },
    "item.gold-key.drop.dungeon-gate-door.hit": {
      phrases: [
        "La llave gira con un clic seco. ¡La puerta cede!",
        "Click. Cling. La puerta de la mazmorra se abre.",
        "Encajó. La cerradura no opuso resistencia.",
      ],
    },
    "item.gold-key.drop.dungeon-gate-door.miss": {
      phrases: [
        "La llave gira... pero algo va mal. Vuelve al bolsillo.",
        "No es esta puerta. Aún no.",
      ],
    },
    "item.gold-key.drop.default.miss": {
      phrases: [
        "Aquí esta llave no hace nada. La guardo de nuevo.",
        "Esto no es una cerradura. La llave vuelve al inventario.",
      ],
    },
    "interaction.dungeon-gate-door.empty": {
      phrases: [
        "Una puerta cerrada con candado. Necesito una llave para abrirla.",
        "Esta puerta está cerrada. Hay una cerradura dorada — quizá tengo algo que encaje.",
        "Cerrada. La llave dorada debería servir.",
      ],
    },
    "interaction.dungeon-gate-door.occupied": {
      phrases: [
        "La puerta está abierta. Adelante.",
        "Camino libre. La cerradura ya no es un problema.",
      ],
    },
  },
  en: {
    boundaryHit: {
      phrases: [
        "There's an invisible wall here and I forgot my glasses!",
        "See that edge? Me neither, but it hurts.",
        "The map ends here. The developer was very lazy.",
        "Nothing beyond this point! Just darkness and bugs.",
        "My legs say yes, the engine says no.",
        "I found the edge of the world. No spoilers.",
        "No trespassing. Signed: The physics engine.",
        "Limit reached! This is not a bug, it's a feature.",
        "My adventure ends here... and so does my dignity.",
        "This is like trying to leave Google Maps.",
      ],
    },
    personalRoomWelcome: {
      phrases: [
        "Welcome to your personal room! Don't forget to clean up.",
        "This is your space. Make it yours, but don't break anything.",
        "So cozy! Is that new decor?",
        "Your room, your rules. But don't go overboard.",
        "Welcome! Be yourself here, or someone else.",
      ],
    },
    inventoryDropHit: {
      phrases: [
        "Perfect. The Gameboy goes there.",
        "Exactly, that was the spot.",
        "Nicely placed. It fits there.",
        "Yes, that is where it wanted to be.",
      ],
    },
    inventoryDropMiss: {
      phrases: [
        "No, that is not the right spot.",
        "Close, but it does not go there.",
        "That does not fit that support.",
        "Try dropping it a little closer to the target.",
      ],
    },
    "item.gameboy.drop.personal-room-gameboy-drop-target.hit": {
      phrases: [
        "Perfect. The Gameboy stays placed there.",
        "Great fit. The Gameboy is now on the stand.",
      ],
    },
    "item.gameboy.drop.personal-room-gameboy-drop-target.miss": {
      phrases: [
        "That does not fit this stand.",
        "That is not the correct spot for the Gameboy.",
      ],
    },
    "item.gameboy.drop.default.miss": {
      phrases: [
        "The Gameboy goes back to the inventory.",
        "Cannot place it there. Returning it to the bag.",
      ],
    },
    "item.gameboy.pickup.personal-room-gameboy-drop-target.allowed": {
      phrases: [
        "Picked up. The Gameboy is back in inventory.",
        "Got it. Putting the Gameboy back in the bag.",
      ],
    },
    "item.gameboy.pickup.personal-room-gameboy-drop-target.blocked": {
      phrases: [
        "This Gameboy is fixed here. Cannot pick it up.",
        "It is locked to the stand.",
      ],
    },
    "item.gameboy.description": {
      phrases: [
        "A classic Gameboy. Monochrome screen, instant nostalgia, and batteries that fade faster than you remember.",
        "My Gameboy: portable, retro, and perfect for a pixel-art afternoon.",
      ],
    },
    "interaction.gameboy-base.empty": {
      phrases: [
        "Something is missing here. A gap shaped like nostalgia.",
        "This stand looks empty... like my schedule.",
        "Hmm, something should go here. I can feel it in the pixels.",
        "The stand is lonely. Just like me on Sundays.",
        "There is something that would fit perfectly here.",
        "The stand waits patiently. More patience than I have.",
      ],
    },
    "interaction.gameboy-base.occupied": {
      phrases: [
        "The Gameboy rests on its stand. As it should.",
        "There it is, neatly placed. Order has its magic.",
        "The Gameboy at rest. Ready for the next session.",
        "Perfectly placed. Almost a shame to move it.",
        "Look at that. Everything in its place. Doesn't happen often.",
      ],
    },
    "item.gold-key.description": {
      phrases: [
        "A heavy gold key. Something safe waits behind a door.",
        "Solid gold. Definitely not from a cheap locksmith.",
      ],
    },
    "item.gold-key.drop.dungeon-gate-door.hit": {
      phrases: [
        "The key turns with a sharp click. The door swings open!",
        "Click. Clang. The dungeon gate unlocks.",
        "Perfect fit. The lock gave way without protest.",
      ],
    },
    "item.gold-key.drop.dungeon-gate-door.miss": {
      phrases: [
        "The key turns... but something is off. Back to the pocket.",
        "Not this door. Not yet.",
      ],
    },
    "item.gold-key.drop.default.miss": {
      phrases: [
        "This key does nothing here. Putting it away.",
        "That is no lock. The key returns to the inventory.",
      ],
    },
    "interaction.dungeon-gate-door.empty": {
      phrases: [
        "A locked door. I need a key to open it.",
        "This door is locked. There is a golden lock — maybe I have something that fits.",
        "Locked. The golden key should do the trick.",
      ],
    },
    "interaction.dungeon-gate-door.occupied": {
      phrases: [
        "The door is open. Go through.",
        "Path's clear. The lock isn't an issue anymore.",
      ],
    },
  },
};
