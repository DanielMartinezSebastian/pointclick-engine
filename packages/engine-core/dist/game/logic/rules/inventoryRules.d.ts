import type { GameSceneInteraction, DialogKey } from "../../types";
export type ItemDefinition = {
    id: string;
    name: string;
    spriteUrl: string;
    descriptionDialogKey?: string;
    interactionRules: Record<string, ItemInteractionRule>;
    defaultRule: ItemInteractionRule;
};
export type ItemInteractionRule = {
    outcome: "place" | "consume" | "return";
    hitDialogKey?: DialogKey;
    missDialogKey?: DialogKey;
    placeCanPickup?: boolean;
    placeHasCollision?: boolean;
    placeCollisionHalfSize?: [number, number, number];
    pickupSuccessDialogKey?: DialogKey;
    pickupBlockedDialogKey?: DialogKey;
};
type InventoryStackState = {
    id: string;
    name: string;
    spriteUrl: string;
    quantity: number;
};
export type InventorySlotsState = Array<InventoryStackState | null>;
type DraggedPayloadState = {
    stack: {
        id: string;
        name: string;
        spriteUrl: string;
    };
    fromSlotIndex: number;
};
export type PlacedItemState = {
    id: string;
    itemId: string;
    interactionId: string;
    name: string;
    spriteUrl: string;
    worldPosition: [number, number, number];
    canPickup: boolean;
    hasCollision?: boolean;
    collisionHalfSize?: [number, number, number];
    pickupSuccessDialogKey?: string;
    pickupBlockedDialogKey?: string;
};
type DropHitDecision = {
    kind: "unknown-item";
    message: string;
} | {
    kind: "rule-miss";
    dialogKey: DialogKey;
} | {
    kind: "place";
    fromSlotIndex: number;
    placedItem: PlacedItemState;
    dialogKey: DialogKey;
} | {
    kind: "consume";
    fromSlotIndex: number;
    dialogKey: DialogKey;
} | {
    kind: "return";
    dialogKey: DialogKey;
};
type PickupDecision = {
    kind: "ignore";
} | {
    kind: "blocked";
    dialogKey: DialogKey;
} | {
    kind: "allow";
    placedItemId: string;
    stack: {
        id: string;
        name: string;
        spriteUrl: string;
    };
    successDialogKey: DialogKey;
};
export declare function removeOneFromSlot(slots: InventorySlotsState, slotIndex: number): InventorySlotsState;
export declare function addOneToInventory(slots: InventorySlotsState, stack: {
    id: string;
    name: string;
    spriteUrl: string;
}): {
    slots: InventorySlotsState;
    added: boolean;
};
type InventoryRuleContext = {
    getItemDefinition: (itemId: string) => ItemDefinition | null;
    resolveItemRule: (itemId: string, interactionId: string) => ItemInteractionRule | null;
};
export declare function resolveInventoryDropHitDecision(context: InventoryRuleContext, { interaction, payload, now, }: {
    interaction: GameSceneInteraction & {
        dialogKeys?: Record<string, DialogKey>;
        id?: string;
    };
    payload: DraggedPayloadState;
    now: number;
}): DropHitDecision;
export declare function resolveInventoryDropMissDialogKey(context: InventoryRuleContext, { payload, interaction, sceneInteractions, }: {
    payload: DraggedPayloadState;
    interaction?: GameSceneInteraction & {
        dialogKeys?: Record<string, DialogKey>;
        id?: string;
    };
    sceneInteractions: (GameSceneInteraction & {
        dialogKeys?: Record<string, DialogKey>;
        id?: string;
        kind?: string;
    })[];
}): DialogKey;
export declare function resolveInventoryDropOnPlayerMessage(context: InventoryRuleContext, { payload, }: {
    payload: DraggedPayloadState;
}): {
    kind: "text";
    text: string;
} | {
    kind: "dialog-key";
    dialogKey: DialogKey;
};
export declare function resolvePickupPlacedItemDecision(context: InventoryRuleContext, { placedItem, }: {
    placedItem: PlacedItemState;
}): PickupDecision;
export declare const inventoryRuleMessages: {
    unknownItem: string;
    inventoryFull: string;
};
export {};
//# sourceMappingURL=inventoryRules.d.ts.map