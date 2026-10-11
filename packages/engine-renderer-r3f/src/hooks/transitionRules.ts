import type { GameScene, GameVec3 } from "@pointclick-engine/engine-core";

export type LeaveSceneTransition = {
  transitionId: string;
  fromSceneId: string;
  targetSceneId: string;
};

export type LeaveSceneBlock = { text: string; dialogKey?: string };

/** Regla opcional del juego: `true` deja salir; un objeto bloquea y muestra ese dialogo. */
export type CanLeaveScene = (transition: LeaveSceneTransition) => true | LeaveSceneBlock;

/**
 * Decide si la transicion puede continuar. Pura, sin React.
 * Sin regla -> se puede salir.
 */
export function decideLeaveScene(
  canLeaveScene: CanLeaveScene | undefined,
  transition: LeaveSceneTransition,
): { allowed: true } | { allowed: false; text: string; dialogKey?: string } {
  const result = canLeaveScene?.(transition) ?? true;
  if (result === true) return { allowed: true };
  return { allowed: false, text: result.text, dialogKey: result.dialogKey };
}

/**
 * Resuelve spawn y destino de caminata de la transicion usada, a partir de la
 * escena de origen. Pura, sin React.
 */
export function resolveUsedTransition(
  fromScene: Pick<GameScene, "transitions">,
  transitionId: string,
): { spawnPosition: GameVec3 | undefined; walkTarget: GameVec3 | undefined } {
  const used = fromScene.transitions?.find((t) => t.id === transitionId);
  if (!used) return { spawnPosition: undefined, walkTarget: undefined };
  const spawnPosition = "spawnPosition" in used ? used.spawnPosition : undefined;
  const walkTarget =
    "targetPosition" in used && used.targetPosition ? used.targetPosition : undefined;
  return { spawnPosition, walkTarget };
}
