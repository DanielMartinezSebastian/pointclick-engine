import type { CanLeaveScene } from "@pointclick-engine/engine-renderer-r3f";
import { getPlacedItemsState } from "@pointclick-engine/engine-core";

/**
 * Regla propia de la demo: no se sale de personalRoom hacia dungeon mientras
 * el trofeo siga colocado en la habitacion (puede estar en inventario u otra sala).
 * Lee el estado actual del store en el momento de evaluarse.
 */
export const canLeaveSceneDemo: CanLeaveScene = ({ fromSceneId, targetSceneId }) => {
  if (fromSceneId === "personalRoom" && targetSceneId === "dungeon") {
    const trophyStillInRoom = getPlacedItemsState()
      .items.some((item) => item.itemId === "trophy" && item.sceneId === "personalRoom");
    if (trophyStillInRoom) {
      return {
        text: "Sería mejor recoger todo lo que pueda del cuarto antes de irme...",
        dialogKey: "interaction.trophy-pedestal.empty",
      };
    }
  }
  return true;
};
