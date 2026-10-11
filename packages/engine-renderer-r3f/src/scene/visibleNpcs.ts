import { evaluateCondition, type ConditionContext, type GameSceneNpc } from "@pointclick-engine/engine-core";

/** NPCs cuyo `visibleWhen` se cumple en `ctx` (sin `visibleWhen`, siempre). Puro. */
export function filterVisibleNpcs(
  npcs: readonly GameSceneNpc[] | undefined,
  ctx: ConditionContext,
): GameSceneNpc[] {
  return (npcs ?? []).filter((npc) => evaluateCondition(npc.visibleWhen, ctx));
}

/**
 * Id del NPC visible que habla ahora, o `null` si el bocadillo es del jugador
 * (sin `speaker`, "player", un id desconocido o un NPC oculto).
 */
export function resolveSpeakingNpcId(
  visibleNpcs: readonly GameSceneNpc[],
  speaker: string | undefined,
  speechVisible: boolean,
): string | null {
  if (!speechVisible || speaker === undefined || speaker === "player") return null;
  return visibleNpcs.some((npc) => npc.id === speaker) ? speaker : null;
}
