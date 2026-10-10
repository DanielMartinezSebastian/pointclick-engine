import type { Condition } from "./conditions";
import type { Script } from "./actions";

/**
 * Arboles de dialogo: dato serializable. `dialog*` es el bocadillo de una frase;
 * `dialogue*` es la conversacion con varios turnos y opciones.
 */
export interface DialogueChoice {
  /** Clave de i18n del texto de la opcion. */
  text: string;
  /** Opcion oculta si no se cumple. */
  when?: Condition;
  /** Desaparece tras elegirla (se recuerda con el flag `dlg.<dialogue>.<node>.<indice>`). */
  once?: boolean;
  do?: Script;
  next?: string;
}

export interface DialogueNode {
  id: string;
  /** Id de NPC o "player". */
  speaker?: string;
  /** Clave de i18n; sin linea, el nodo solo ejecuta `do`. */
  line?: string;
  /** Efectos al entrar en el nodo (se esperan antes de seguir). */
  do?: Script;
  /** Sin opciones visibles, avanza a `next`. */
  choices?: DialogueChoice[];
  /** Sin next ni opciones visibles, el dialogo termina. */
  next?: string;
}

export interface DialogueDefinition {
  id: string;
  start: string;
  nodes: DialogueNode[];
}

/** Motivo del fin de una conversacion. */
export type DialogueEndReason = "finished" | "ended" | "cancelled";

/** Constructores opcionales (como `cond` / `act`): devuelven objetos planos. */
export const dialogue = {
  define: (id: string, start: string, ...nodes: DialogueNode[]): DialogueDefinition => ({
    id,
    start,
    nodes,
  }),
  node: (id: string, props: Omit<DialogueNode, "id"> = {}): DialogueNode => ({ id, ...props }),
  choice: (text: string, props: Omit<DialogueChoice, "text"> = {}): DialogueChoice => ({
    text,
    ...props,
  }),
};
