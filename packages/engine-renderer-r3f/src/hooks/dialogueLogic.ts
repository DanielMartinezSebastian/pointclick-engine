/**
 * Decisiones puras de la UI de dialogo (sin React ni DOM), para poder probarlas aparte.
 *
 * Contrato con el core (`dialogue.ts`): un nodo sin opciones espera el cierre del bocadillo
 * (`dialog:dismissed`); un nodo con opciones espera `dialogue:choose`.
 */

/** El bocadillo no debe cerrarse solo cuando el nodo activo ofrece opciones. */
export function shouldHoldBubble(active: boolean, choiceCount: number): boolean {
  return active && choiceCount > 0;
}

export interface ShowChoicesInput {
  active: boolean;
  choiceCount: number;
  /** El nodo tiene linea (bocadillo). Sin linea las opciones salen de inmediato. */
  hasLine: boolean;
  /** `triggerCount` del bocadillo cuya linea ya termino de escribirse (-1 si ninguno). */
  typedTrigger: number;
  /** `triggerCount` actual del bocadillo. */
  triggerCount: number;
}

/** Las opciones aparecen cuando termina de escribirse la linea del nodo (o ya, si no hay linea). */
export function shouldShowChoices(i: ShowChoicesInput): boolean {
  if (!i.active || i.choiceCount === 0) return false;
  return !i.hasLine || i.typedTrigger === i.triggerCount;
}

/**
 * Que hacer cuando el bocadillo se cierra solo o por click: con dialogo activo se avanza
 * por el comando del core (que emite `dialog:dismissed`); si no, solo se oculta como siempre.
 */
export function resolveSpeechDismiss(dialogueActive: boolean): "advance" | "hide" {
  return dialogueActive ? "advance" : "hide";
}

export type ChoiceKeyAction =
  | { kind: "focus"; position: number }
  | { kind: "choose"; position: number }
  | { kind: "none" };

const NONE: ChoiceKeyAction = { kind: "none" };

/**
 * Navegacion por teclado de la lista de opciones. `current` y el resultado son posiciones
 * en la lista visible (no el `index` original de la opcion). Flechas con vuelta, Inicio/Fin,
 * Enter/Espacio eligen la actual, 1-9 eligen esa posicion si existe.
 */
export function navigateChoices(key: string, current: number, count: number): ChoiceKeyAction {
  if (count <= 0) return NONE;
  const cur = Math.min(Math.max(current, 0), count - 1);
  switch (key) {
    case "ArrowDown":
    case "ArrowRight":
      return { kind: "focus", position: (cur + 1) % count };
    case "ArrowUp":
    case "ArrowLeft":
      return { kind: "focus", position: (cur - 1 + count) % count };
    case "Home":
      return { kind: "focus", position: 0 };
    case "End":
      return { kind: "focus", position: count - 1 };
    case "Enter":
    case " ":
      return { kind: "choose", position: cur };
    default:
      if (/^[1-9]$/.test(key) && Number(key) <= count) return { kind: "choose", position: Number(key) - 1 };
      return NONE;
  }
}
