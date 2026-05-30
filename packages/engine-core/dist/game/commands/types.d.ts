import type { GameVec3 } from "../types";
/**
 * Union exhaustiva de todos los comandos que el motor acepta.
 * Naming: <domain>:<action> (ver ADR-0006).
 */
export type GameCommand = {
    type: "scene:set";
    sceneId: string;
} | {
    type: "scene:respawn";
} | {
    type: "player:move";
    position: GameVec3;
} | {
    type: "player:stop";
} | {
    type: "player:walkTo";
    position: GameVec3;
} | {
    type: "inventory:toggle";
} | {
    type: "inventory:pickup";
    itemId: string;
} | {
    type: "inventory:drop";
    itemId: string;
    slotIndex: number;
} | {
    type: "dialog:trigger";
    dialogKey: string;
} | {
    type: "dialog:dismiss";
} | {
    type: "transition:activate";
    transitionId: string;
} | {
    type: "transition:cancel";
    transitionId: string;
};
export type GameCommandType = GameCommand["type"];
//# sourceMappingURL=types.d.ts.map