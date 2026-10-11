// Conversacion de prueba con el guia de `town` (contenido de la demo, no del motor).
//
// Cubre: una opcion condicionada a tener el trofeo, opciones `once` y un efecto que pone un
// flag y entrega un item (`key-handle`, que se combina con `key-bit`).
import { act, cond, dialogue, type DialogueDefinition } from "@pointclick-engine/engine-core";

export const GUIDE_DIALOGUE_ID = "guide-talk";

export const guideDialogue: DialogueDefinition = dialogue.define(
  GUIDE_DIALOGUE_ID,
  "root",
  dialogue.node("root", {
    speaker: "guide",
    line: "guide.hello",
    choices: [
      // 0: solo si se lleva el trofeo encima.
      dialogue.choice("guide.c.trophy", {
        when: cond.hasItem("trophy"),
        do: [act.setFlag("guide.trophyShown")],
        next: "trophy",
      }),
      // 1: una sola vez.
      dialogue.choice("guide.c.who", { once: true, next: "who" }),
      // 2: una sola vez; pone un flag y entrega el mango de la llave.
      dialogue.choice("guide.c.help", {
        once: true,
        do: [act.setFlag("guide.helped"), act.giveItem("key-handle")],
        next: "help",
      }),
      // 3: despedida.
      dialogue.choice("guide.c.bye", { next: "bye" }),
    ],
  }),
  dialogue.node("who", { speaker: "guide", line: "guide.who", next: "root" }),
  dialogue.node("trophy", { speaker: "guide", line: "guide.trophy", next: "root" }),
  dialogue.node("help", { speaker: "guide", line: "guide.help", next: "root" }),
  dialogue.node("bye", { speaker: "guide", line: "guide.bye" }),
);

export const demoDialogues: DialogueDefinition[] = [guideDialogue];
