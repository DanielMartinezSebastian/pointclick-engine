import type {
  CanLeaveScene,
  GetInitialPlacedItems,
  SceneEnterApi,
} from "@pointclick-engine/engine-renderer-r3f";
import { getPlacedItemsState } from "@pointclick-engine/engine-core";

// Escena que siembra el trofeo inicial (la que sembraba el antiguo flag initialItemsCreated).
const SEED_SCENE_ID = "personalRoom";

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

/**
 * Siembra del trofeo: solo en personalRoom y solo si el trofeo no existe ya en ninguna
 * escena (recogido o movido). En personalRoom la escena se marca sembrada aunque no se
 * anada nada (`[]`); en el resto de escenas devuelve null (no se siembra ni se marca).
 */
export const getDemoInitialPlacedItems: GetInitialPlacedItems = (sceneId, allItems) => {
  if (sceneId !== SEED_SCENE_ID) return null;
  const trophyTakenOrMovedElsewhere = allItems.some((i) => i.itemId === "trophy");
  if (trophyTakenOrMovedElsewhere) return [];
  return [
    {
      id: "trophy-ground",
      itemId: "trophy",
      interactionId: "trophy-ground-pickup",
      name: "Trophy",
      spriteUrl: "/assets/trophy/trophy.png",
      worldPosition: [5.5, -1.3, 22.0],
      canPickup: true,
      hasCollision: true,
      collisionHalfSize: [0.5, 0.8, 0.5],
      sceneId, // Track which scene this item belongs to
      // No dialog keys for ground pickup - will use defaults from resolvePickupPlacedItemDecision
    },
  ];
};

/** Bienvenida: cada vez que se dispara el efecto de entrada en personalRoom. */
export function onDemoSceneEnter(sceneId: string, api: SceneEnterApi): void {
  if (sceneId !== SEED_SCENE_ID) return;
  api.showDialog("personalRoomWelcome");
}
