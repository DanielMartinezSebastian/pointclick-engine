// Conversaciones de la aventura: el glitch en bucle, el glitch ya libre y Helix.
// El `speaker` es exactamente el id del NPC para que el bocadillo salga sobre el.
import { act, dialogue, type DialogueDefinition } from "@pointclick-engine/engine-core";

export const GLITCH_DIALOGUE_ID = "glitch-loop";
export const GLITCH_FREE_DIALOGUE_ID = "glitch-free-talk";
export const HELIX_DIALOGUE_ID = "helix-talk";

/** El glitch atrapado: las dos preguntas devuelven al mismo saludo infinito. */
const glitchLoop = dialogue.define(
  GLITCH_DIALOGUE_ID,
  "root",
  dialogue.node("root", {
    speaker: "glitch",
    line: "glitch.loop",
    choices: [
      // 0: "¿Estas bien?" -> repite.
      dialogue.choice("glitch.c.fine", { next: "root" }),
      // 1: "¿Puedes parar?" -> no tiene `break`.
      dialogue.choice("glitch.c.stop", { next: "nobreak" }),
      // 2: despedida.
      dialogue.choice("glitch.c.bye"),
    ],
  }),
  dialogue.node("nobreak", { speaker: "glitch", line: "glitch.nobreak", next: "root" }),
);

/** El glitch tras salir del bucle (otro NPC: `glitch-free`). */
const glitchFree = dialogue.define(
  GLITCH_FREE_DIALOGUE_ID,
  "root",
  dialogue.node("root", { speaker: "glitch-free", line: "glitch.free.line" }),
);

/**
 * Helix: el puntero nulo se consigue una sola vez, hablando. Las respuestas son nodos con `line`
 * y no un `say` dentro del `do` de la opcion: mientras el nodo activo ofrece opciones el renderer
 * mantiene el bocadillo abierto (no se cierra solo), asi que un `say` ahi dentro dejaria la
 * conversacion colgada. Un nodo sin opciones se cierra solo y vuelve a `root`.
 */
const helixTalk = dialogue.define(
  HELIX_DIALOGUE_ID,
  "root",
  dialogue.node("root", {
    speaker: "helix",
    line: "helix.hello",
    choices: [
      // 0: da el puntero nulo (una sola vez; el item se entrega antes de la frase).
      dialogue.choice("helix.c.home", {
        once: true,
        do: [act.giveItem("null-pointer")],
        next: "null",
      }),
      // 1: charla.
      dialogue.choice("helix.c.here", { next: "here" }),
      // 2: despedida.
      dialogue.choice("helix.c.bye", { next: "bye" }),
    ],
  }),
  dialogue.node("null", { speaker: "helix", line: "helix.null", next: "root" }),
  dialogue.node("here", { speaker: "helix", line: "helix.here", next: "root" }),
  dialogue.node("bye", { speaker: "helix", line: "helix.bye" }),
);

export const adventureDialogues: DialogueDefinition[] = [glitchLoop, glitchFree, helixTalk];

