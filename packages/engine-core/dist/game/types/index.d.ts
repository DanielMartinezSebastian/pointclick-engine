export type GameVec3 = [x: number, y: number, z: number];
export type GameVec2 = [x: number, y: number];
export interface GameSceneGround {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
    y: number;
}
export interface GameSceneWall {
    position: GameVec3;
    halfSize: GameVec3;
    rotationY: number;
}
export interface GameSceneInteraction {
    position: GameVec3;
    halfSize: GameVec3;
    rotationY?: number;
    hasCollision?: boolean;
}
export type PlacedSceneItem = {
    id: string;
    itemId: string;
    interactionId: string;
    name: string;
    spriteUrl: string;
    worldPosition: GameVec3;
    canPickup: boolean;
    hasCollision?: boolean;
    collisionHalfSize?: GameVec3;
    pickupSuccessDialogKey?: string;
    pickupBlockedDialogKey?: string;
};
export type DialogKey = string;
export interface GameSceneInteractionDialogKeys {
    hit: DialogKey;
    miss: DialogKey;
}
export interface GameSceneInteractionHintDialogKeys {
    empty: DialogKey;
    occupied: DialogKey;
}
export interface GameSceneInteractionFull extends GameSceneInteraction {
    id: string;
    kind: "drop-target";
    hasCollision?: boolean;
    acceptsItemIds?: string[];
    dialogKeys: GameSceneInteractionDialogKeys;
    hintDialogKeys?: GameSceneInteractionHintDialogKeys;
    label: string;
}
export interface GameScene {
    id: string;
    label: string;
    background: string;
    playerSpawn: GameVec3;
    ground: GameSceneGround;
    walls: GameSceneWall[];
    interactions: GameSceneInteractionFull[];
}
export type WallToolMode = "manual" | "points";
export type DebugEditorMode = "walls" | "ground" | "items" | "targets";
export type RuntimeMoveEvent = {
    type: "onMove";
    position: GameVec3;
    action: "idle" | "north" | "south" | "west" | "east";
};
export type RuntimeCollideEvent = {
    type: "onCollide";
    reason: "boundary" | "stuck";
    position: GameVec3;
};
export type RuntimeDropEvent = {
    type: "onDrop";
    outcome: "place" | "consume" | "return" | "rule-miss" | "unknown-item" | "on-player" | "pickup-blocked" | "pickup-success";
    itemId: string;
    interactionId?: string;
};
export type RuntimeDialogEvent = {
    type: "onDialog";
    text: string;
    dialogKey?: string;
    source: "boundary" | "inventory" | "debug";
};
export type RuntimeEvent = RuntimeMoveEvent | RuntimeCollideEvent | RuntimeDropEvent | RuntimeDialogEvent;
export type RuntimeEventHandler = (event: RuntimeEvent) => void;
//# sourceMappingURL=index.d.ts.map