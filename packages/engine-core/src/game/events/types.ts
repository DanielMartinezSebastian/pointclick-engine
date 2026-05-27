import type { GameVec3, GameScene } from "../types";

/**
 * Union exhaustiva de todos los eventos que el motor puede emitir.
 * Naming: <domain>:<action> (ver ADR-0006).
 */
export type GameEvent =
  // Scene
  | { type: "scene:changed"; sceneId: string; scene: GameScene }
  | { type: "scene:respawnRequested"; sceneId: string }
  // Player
  | {
      type: "player:moved";
      position: GameVec3;
      action: "idle" | "north" | "south" | "west" | "east";
    }
  | { type: "player:collided"; reason: "boundary" | "stuck"; position: GameVec3 }
  // Inventory
  | { type: "item:pickedUp"; itemId: string; quantity: number }
  | {
      type: "item:dropped";
      itemId: string;
      outcome: "consume" | "place" | "return";
      interactionId?: string;
    }
  // Dialog
  | { type: "dialog:triggered"; text: string; dialogKey?: string; source: string }
  | { type: "dialog:dismissed"; dialogKey?: string };

export type GameEventType = GameEvent["type"];

export type GameEventHandler<T extends GameEventType = GameEventType> = (
  event: Extract<GameEvent, { type: T }>,
) => void;
