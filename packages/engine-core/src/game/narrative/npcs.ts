import type { GameSceneHotspot, GameSceneNpc, GameVec3, Verb } from "../types";
import type { Branch } from "./actions";

/** Caja de interaccion de un NPC proyectado a hotspot (semi-extensiones en mundo). */
export const NPC_HOTSPOT_HALF_SIZE: GameVec3 = [0.5, 1, 0.5];

/**
 * Proyecta un NPC a hotspot para reutilizar `hotspot:interact` (verbos, ramas, approach).
 * Pura. `dialogueId` equivale a `verbs.talk = [{ do: [{ startDialogue }] }]`; un
 * `verbs.talk` explicito del NPC tiene prioridad sobre el atajo.
 */
export function npcToHotspot(npc: GameSceneNpc): GameSceneHotspot {
  let verbs: Partial<Record<Verb, Branch[]>> | undefined = npc.verbs;
  if (npc.dialogueId !== undefined && !npc.verbs?.talk) {
    verbs = { ...npc.verbs, talk: [{ do: [{ startDialogue: npc.dialogueId }] }] };
  }
  return {
    id: npc.id,
    label: npc.name,
    position: npc.position,
    halfSize: NPC_HOTSPOT_HALF_SIZE,
    ...(npc.visibleWhen !== undefined ? { visibleWhen: npc.visibleWhen } : {}),
    ...(npc.hasCollision !== undefined ? { hasCollision: npc.hasCollision } : {}),
    ...(npc.approach !== undefined ? { approach: npc.approach } : {}),
    ...(verbs !== undefined ? { verbs } : {}),
    ...(npc.useItem !== undefined ? { useItem: npc.useItem } : {}),
  };
}
