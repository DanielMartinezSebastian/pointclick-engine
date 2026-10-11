import { create } from "zustand";

/**
 * dialogueStore — estado de la conversacion (arbol de dialogo) activa.
 *
 * No confundir con dialogStore (bocadillo de una frase). Las escrituras las hace
 * el motor de dialogo (narrative/dialogue.ts); el store no contiene logica.
 */
export type DialogueChoiceView = {
  /** Posicion ORIGINAL en `node.choices` (estable aunque se oculten otras). */
  index: number;
  /** Clave de i18n del texto. */
  textKey: string;
};

export type DialogueStoreState = {
  activeDialogueId: string | null;
  nodeId: string | null;
  speaker?: string;
  lineKey?: string;
  /** Opciones visibles (ya filtradas por `when` y `once`). */
  choices: DialogueChoiceView[];
  enterNode: (dialogueId: string, nodeId: string, speaker?: string, lineKey?: string) => void;
  setChoices: (choices: DialogueChoiceView[]) => void;
  clear: () => void;
};

export const useDialogueStore = create<DialogueStoreState>((set) => ({
  activeDialogueId: null,
  nodeId: null,
  choices: [],
  enterNode: (dialogueId, nodeId, speaker, lineKey) =>
    set({ activeDialogueId: dialogueId, nodeId, speaker, lineKey, choices: [] }),
  setChoices: (choices) => set({ choices }),
  clear: () =>
    set({
      activeDialogueId: null,
      nodeId: null,
      speaker: undefined,
      lineKey: undefined,
      choices: [],
    }),
}));

/** Lee el estado de la conversacion sin React. */
export function getDialogueState() {
  return useDialogueStore.getState();
}
