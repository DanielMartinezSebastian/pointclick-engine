import type { GameSceneHotspot, GameSceneNpc, GameVec3, Verb } from "../types";
import type { Branch } from "./actions";

/**
 * Caja de interaccion por defecto de un NPC proyectado a hotspot (semi-extensiones en mundo).
 * Cubre de los pies a la cabeza un sprite del tamano por defecto; `npc.clickBox` la sustituye.
 */
export const NPC_HOTSPOT_HALF_SIZE: GameVec3 = [1.1, 2.9, 0.5];
/** Desplazamiento por defecto del centro de la caja respecto a `npc.position` (que esta a la altura de la cadera). */
export const NPC_HOTSPOT_OFFSET: GameVec3 = [0, 2, 0];

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
  const offset = npc.clickBox?.offset ?? NPC_HOTSPOT_OFFSET;
  return {
    id: npc.id,
    label: npc.name,
    position: [npc.position[0] + offset[0], npc.position[1] + offset[1], npc.position[2] + offset[2]],
    halfSize: npc.clickBox?.halfSize ?? NPC_HOTSPOT_HALF_SIZE,
    ...(npc.visibleWhen !== undefined ? { visibleWhen: npc.visibleWhen } : {}),
    ...(npc.hasCollision !== undefined ? { hasCollision: npc.hasCollision } : {}),
    ...(npc.approach !== undefined ? { approach: npc.approach } : {}),
    ...(verbs !== undefined ? { verbs } : {}),
    ...(npc.useItem !== undefined ? { useItem: npc.useItem } : {}),
  };
}
