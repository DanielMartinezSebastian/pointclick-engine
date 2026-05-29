import type { GameVec3 } from "../types";

/**
 * Union exhaustiva de todos los comandos que el motor acepta.
 * Naming: <domain>:<action> (ver ADR-0006).
 */
export type GameCommand =
  // Scene
  | { type: "scene:set"; sceneId: string }
  | { type: "scene:respawn" }
  // Player
  | { type: "player:move"; position: GameVec3 }
  | { type: "player:stop" }
  // Inventory
  | { type: "inventory:toggle" }
  | { type: "inventory:pickup"; itemId: string }
  | { type: "inventory:drop"; itemId: string; slotIndex: number }
  // Dialog
  | { type: "dialog:trigger"; dialogKey: string }
  | { type: "dialog:dismiss" }
  // Transitions
  | { type: "transition:activate"; transitionId: string }
  | { type: "transition:cancel"; transitionId: string };

export type GameCommandType = GameCommand["type"];
