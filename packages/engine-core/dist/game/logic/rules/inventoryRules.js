const UNKNOWN_ITEM_MESSAGE = "No conozco este item todavía.";
const DEFAULT_DROP_MISS_DIALOG_KEY = "inventoryDropMiss";
function getDefaultPickupDialogKey(itemId, type) {
    return `item.${itemId}.pickup.${type}`;
}
export function removeOneFromSlot(slots, slotIndex) {
    const slot = slots[slotIndex];
    if (!slot)
        return slots;
    const next = [...slots];
    if (slot.quantity <= 1) {
        next[slotIndex] = null;
    }
    else {
        next[slotIndex] = { ...slot, quantity: slot.quantity - 1 };
    }
    return next;
}
export function addOneToInventory(slots, stack) {
    const existingIndex = slots.findIndex((current) => current?.id === stack.id);
    if (existingIndex >= 0) {
        const next = [...slots];
        const existing = next[existingIndex];
        if (!existing)
            return { slots, added: false };
        next[existingIndex] = { ...existing, quantity: existing.quantity + 1 };
        return { slots: next, added: true };
    }
    const emptyIndex = slots.findIndex((current) => current == null);
    if (emptyIndex < 0) {
        return { slots, added: false };
    }
    const next = [...slots];
    next[emptyIndex] = { ...stack, quantity: 1 };
    return { slots: next, added: true };
}
export function resolveInventoryDropHitDecision(context, { interaction, payload, now, }) {
    const itemDefinition = context.getItemDefinition(payload.stack.id);
    if (!itemDefinition) {
        return {
            kind: "unknown-item",
            message: UNKNOWN_ITEM_MESSAGE,
        };
    }
    const interactionId = interaction.id || "";
    const rule = context.resolveItemRule(itemDefinition.id, interactionId);
    if (!rule) {
        return {
            kind: "rule-miss",
            dialogKey: interaction.dialogKeys?.miss || DEFAULT_DROP_MISS_DIALOG_KEY,
        };
    }
    if (rule.outcome === "place") {
        return {
            kind: "place",
            fromSlotIndex: payload.fromSlotIndex,
            placedItem: {
                id: `${itemDefinition.id}-${interactionId}-${now}`,
                itemId: itemDefinition.id,
                interactionId,
                name: itemDefinition.name,
                spriteUrl: itemDefinition.spriteUrl,
                worldPosition: [
                    interaction.position[0],
                    interaction.position[1] + interaction.halfSize[1] + 0.175,
                    interaction.position[2],
                ],
                canPickup: rule.placeCanPickup ?? false,
                hasCollision: rule.placeHasCollision ?? false,
                collisionHalfSize: rule.placeCollisionHalfSize,
                pickupSuccessDialogKey: rule.pickupSuccessDialogKey,
                pickupBlockedDialogKey: rule.pickupBlockedDialogKey,
            },
            dialogKey: rule.hitDialogKey || interaction.dialogKeys?.hit || DEFAULT_DROP_MISS_DIALOG_KEY,
        };
    }
    if (rule.outcome === "consume") {
        return {
            kind: "consume",
            fromSlotIndex: payload.fromSlotIndex,
            dialogKey: rule.hitDialogKey || interaction.dialogKeys?.hit || DEFAULT_DROP_MISS_DIALOG_KEY,
        };
    }
    return {
        kind: "return",
        dialogKey: rule.hitDialogKey || rule.missDialogKey || interaction.dialogKeys?.miss || DEFAULT_DROP_MISS_DIALOG_KEY,
    };
}
export function resolveInventoryDropMissDialogKey(context, { payload, interaction, sceneInteractions, }) {
    const interactionId = interaction?.id;
    const itemRule = interactionId ? context.resolveItemRule(payload.stack.id, interactionId) : null;
    return (itemRule?.missDialogKey ||
        interaction?.dialogKeys?.miss ||
        sceneInteractions.find((currentInteraction) => currentInteraction.kind === "drop-target")?.dialogKeys?.miss ||
        DEFAULT_DROP_MISS_DIALOG_KEY);
}
export function resolveInventoryDropOnPlayerMessage(context, { payload, }) {
    const itemDefinition = context.getItemDefinition(payload.stack.id);
    if (!itemDefinition) {
        return {
            kind: "text",
            text: UNKNOWN_ITEM_MESSAGE,
        };
    }
    if (itemDefinition.descriptionDialogKey) {
        return {
            kind: "dialog-key",
            dialogKey: itemDefinition.descriptionDialogKey,
        };
    }
    return {
        kind: "text",
        text: `Es ${itemDefinition.name}.`,
    };
}
export function resolvePickupPlacedItemDecision(context, { placedItem, }) {
    const itemDefinition = context.getItemDefinition(placedItem.itemId);
    if (!itemDefinition) {
        return { kind: "ignore" };
    }
    if (!placedItem.canPickup) {
        return {
            kind: "blocked",
            dialogKey: placedItem.pickupBlockedDialogKey || getDefaultPickupDialogKey(placedItem.itemId, "blocked"),
        };
    }
    return {
        kind: "allow",
        placedItemId: placedItem.id,
        stack: {
            id: itemDefinition.id,
            name: itemDefinition.name,
            spriteUrl: itemDefinition.spriteUrl,
        },
        successDialogKey: placedItem.pickupSuccessDialogKey || getDefaultPickupDialogKey(placedItem.itemId, "allowed"),
    };
}
export const inventoryRuleMessages = {
    unknownItem: UNKNOWN_ITEM_MESSAGE,
    inventoryFull: "Inventario lleno.",
};
//# sourceMappingURL=inventoryRules.js.map