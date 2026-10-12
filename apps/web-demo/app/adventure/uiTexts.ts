// Textos de la interfaz de /adventure (intro, mochila, créditos) y del motor (verbos del menú).
// Los textos de la historia viven en `adventure-content/texts.ts`; aquí solo lo que es de la ruta.
import type { LocaleDictionaries } from "@pointclick-engine/engine-core";

type Pair = readonly [es: string, en: string];

const UI: Record<string, Pair> = {
  // Textos del motor para hotspots: el menú calcula sus etiquetas en el primer render.
  "engine.verb.look": ["Mirar", "Look"],
  "engine.verb.use": ["Usar", "Use"],
  "engine.verb.talk": ["Hablar", "Talk"],
  "engine.hotspot.noAction": ["No sé qué hacer con eso.", "I don't know what to do with that."],

  // Intro
  "adv.title": ["No es un bug, es una feature", "It's not a bug, it's a feature"],
  "adv.intro.1": [
    "David se despierta dentro de la demo de un motor de juegos. La demo está rota. El Programador, una voz agotada que habla desde fuera de la pantalla, necesita que alguien la arregle antes de publicar.",
    "David wakes up inside the demo of a game engine. The demo is broken. The Programmer, an exhausted voice speaking from outside the screen, needs someone to fix it before shipping.",
  ],
  "adv.intro.2": [
    "Haz click para caminar, mira y usa lo que encuentres, y arrastra objetos de la mochila sobre otros para combinarlos.",
    "Click to walk, look at and use what you find, and drag backpack items onto each other to combine them.",
  ],
  "adv.intro.start": ["EMPEZAR", "START"],
  "adv.intro.continue": ["CONTINUAR", "CONTINUE"],
  "adv.intro.aria": ["Introducción", "Introduction"],

  // Mochila
  "adv.inventory": ["Mochila", "Backpack"],
  "adv.inventory.open": ["Abrir mochila", "Open backpack"],
  "adv.inventory.close": ["Cerrar mochila", "Close backpack"],
  "adv.slot.empty": ["Ranura {{n}} vacía", "Slot {{n}} empty"],
  "adv.newGame": ["Nueva partida", "New game"],
  "adv.newGame.confirm": [
    "¿Seguro? Se borrará todo el progreso de la aventura.",
    "Are you sure? All adventure progress will be erased.",
  ],
  "adv.cancel": ["Cancelar", "Cancel"],
  "adv.language": ["Idioma", "Language"],
  "adv.sound": ["Sonido", "Sound"],
  "adv.sound.off": ["Sonido off", "Sound off"],
  "adv.combineFailed": [
    "Eso no se puede combinar con eso.",
    "Those can't be combined.",
  ],

  // Créditos
  "adv.credits.title": ["Build correcto", "Build succeeded"],
  "adv.credits.subtitle": [
    "La demo compila. El Programador se ha ido a dormir.",
    "The demo compiles. The Programmer has gone to sleep.",
  ],
  "adv.credits.made": [
    "Una aventura de demostración del Point & Click Engine.",
    "A demo adventure for the Point & Click Engine.",
  ],
  "adv.credits.art": ["Arte de terceros", "Third-party art"],
  "adv.credits.art.lab": [
    "Fondo de la sala de máquinas: «Sci Fi Level», de Jeremy Gooch (CC-BY 3.0).",
    "Engine room background: \"Sci Fi Level\" by Jeremy Gooch (CC-BY 3.0).",
  ],
  "adv.credits.art.helix": [
    "Sprites de Helix: «8 Directional 2D Point and Click Male Character», de DeMoNiCaTeD (CC-BY-SA 4.0), recortados y escalados; la obra derivada se distribuye también bajo CC-BY-SA 4.0.",
    "Helix sprites: \"8 Directional 2D Point and Click Male Character\" by DeMoNiCaTeD (CC-BY-SA 4.0), cropped and scaled; the derived work is also distributed under CC-BY-SA 4.0.",
  ],
  "adv.credits.art.icons": [
    "Iconos de objetos (CC0): «496 pixel art icons for medieval/fantasy RPG», de Henrique Lazarini (7Soul1), e «Idylwild's Inventory», de Idylwild. Escalados ×2.",
    "Item icons (CC0): \"496 pixel art icons for medieval/fantasy RPG\" by Henrique Lazarini (7Soul1), and \"Idylwild's Inventory\" by Idylwild. Scaled ×2.",
  ],
  "adv.credits.art.more": [
    "El resto del arte y la música: ver el repositorio del motor.",
    "The rest of the art and the music: see the engine repository.",
  ],
  "adv.credits.back": ["Seguir explorando", "Keep exploring"],
};

function dictionaryFor(index: 0 | 1): Record<string, { phrases: string[] }> {
  return Object.fromEntries(Object.entries(UI).map(([key, pair]) => [key, { phrases: [pair[index]] }]));
}

export const adventureUiDictionaries: LocaleDictionaries = {
  es: dictionaryFor(0),
  en: dictionaryFor(1),
};
