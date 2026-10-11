import type { GameVec3 } from "@pointclick-engine/engine-core";

/** Motivos con los que el renderer puede avisar de una caminata interrumpida. */
export type WalkInterruptionReason = "user-input" | "collision";

/** Evento que toca emitir en una transición (o `null` si ninguno). */
export type WalkEventDecision =
  | { type: "player:walkCompleted"; position: GameVec3 }
  | { type: "player:walkAborted"; reason: WalkInterruptionReason }
  | null;

export interface WalkTransitionInput {
  /** Identidad de la caminata que se seguía en el fotograma anterior (`null` si ninguna). */
  tracked: string | null;
  /** Identidad de la caminata por ruta activa ahora (`null` si no hay). */
  current: string | null;
  /** La caminata actual ha alcanzado progreso 1 en este fotograma. */
  reached: boolean;
  /** Último punto de la ruta; posición reportada al llegar. */
  endPosition: GameVec3 | null;
  /** El core ya avisó de la interrupción (p. ej. `player:stop` emite `walkAborted`). */
  abortedByCore: boolean;
  /** Causa de una interrupción detectada por el renderer. Por defecto, `user-input`. */
  interruption?: WalkInterruptionReason;
}

export interface WalkTransitionResult {
  event: WalkEventDecision;
  /** Caminata a seguir a partir de ahora. */
  tracked: string | null;
}

/**
 * Decide qué evento toca emitir al pasar de la caminata seguida a la actual.
 * Pura: sin bus, sin store, sin React.
 *
 * - llegada de la caminata seguida -> `walkCompleted` (una sola vez; se deja de seguir);
 * - caminata seguida que desaparece o es sustituida por otra ruta -> `walkAborted`,
 *   salvo que el core ya lo haya emitido (`player:stop`);
 * - sin caminata seguida no se emite nada (el movimiento manual nunca avisa).
 */
export function decideWalkEvent(input: WalkTransitionInput): WalkTransitionResult {
  const { tracked, current, reached, endPosition, abortedByCore } = input;
  const reason = input.interruption ?? "user-input";

  if (tracked === null) {
    return { event: null, tracked: current };
  }

  if (current === tracked) {
    if (reached && endPosition) {
      return { event: { type: "player:walkCompleted", position: endPosition }, tracked: null };
    }
    return { event: null, tracked };
  }

  // La caminata seguida ya no está (parada) o fue sustituida por otra ruta.
  return {
    event: abortedByCore ? null : { type: "player:walkAborted", reason },
    tracked: current,
  };
}
