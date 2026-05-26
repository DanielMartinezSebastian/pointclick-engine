import type {
  GameSceneInteraction,
} from "../../types";

export type DialogKey = string;

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

type DropHitDecision =
  | {
      kind: "unknown-item";
      message: string;
    }
  | {
      kind: "rule-miss";
      dialogKey: DialogKey;
    }
  | {
      kind: "place";
      fromSlotIndex: number;
      placedItem: PlacedItemState;
      dialogKey: DialogKey;
    }
  | {
      kind: "consume";
      fromSlotIndex: number;
      dialogKey: DialogKey;
    }
  | {
      kind: "return";
      dialogKey: DialogKey;
    };

type PickupDecision =
  | {
      kind: "ignore";
    }
  | {
      kind: "blocked";
      dialogKey: DialogKey;
    }
  | {
      kind: "allow";
      placedItemId: string;
      stack: {
        id: string;
        name: string;
        spriteUrl: string;
      };
      successDialogKey: DialogKey;
    };

const UNKNOWN_ITEM_MESSAGE = "No conozco este item todavía.";
const DEFAULT_DROP_MISS_DIALOG_KEY: DialogKey = "inventoryDropMiss";
const DEFAULT_PICKUP_ALLOWED_DIALOG_KEY: DialogKey =
  "item.gameboy.pickup.personal-room-gameboy-drop-target.allowed";
const DEFAULT_PICKUP_BLOCKED_DIALOG_KEY: DialogKey =
  "item.gameboy.pickup.personal-room-gameboy-drop-target.blocked";

export function removeOneFromSlot(
  slots: InventorySlotsState,
  slotIndex: number,
): InventorySlotsState {
  const slot = slots[slotIndex];
  if (!slot) return slots;

  const next = [...slots];
  if (slot.quantity <= 1) {
    next[slotIndex] = null;
  } else {
    next[slotIndex] = { ...slot, quantity: slot.quantity - 1 };
  }
  return next;
}

export function addOneToInventory(
  slots: InventorySlotsState,
  stack: {
    id: string;
    name: string;
    spriteUrl: string;
  },
): { slots: InventorySlotsState; added: boolean } {
  const existingIndex = slots.findIndex((current) => current?.id === stack.id);
  if (existingIndex >= 0) {
    const next = [...slots];
    const existing = next[existingIndex];
    if (!existing) return { slots, added: false };
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

type InventoryRuleContext = {
  getItemDefinition: (itemId: string) => ItemDefinition | null;
  resolveItemRule: (itemId: string, interactionId: string) => ItemInteractionRule | null;
};

export function resolveInventoryDropHitDecision(
  context: InventoryRuleContext,
  {
    interaction,
    payload,
    now,
  }: {
    interaction: GameSceneInteraction & { dialogKeys?: Record<string, DialogKey>; id?: string };
    payload: DraggedPayloadState;
    now: number;
  },
): DropHitDecision {
  const itemDefinition = context.getItemDefinition(payload.stack.id);
  if (!itemDefinition) {
    return {
      kind: "unknown-item",
      message: UNKNOWN_ITEM_MESSAGE,
    };
  }

  const interactionId = (interaction as any).id || "";
  const rule = context.resolveItemRule(itemDefinition.id, interactionId);
  if (!rule) {
    return {
      kind: "rule-miss",
      dialogKey: (interaction as any).dialogKeys?.miss || DEFAULT_DROP_MISS_DIALOG_KEY,
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
      dialogKey: rule.hitDialogKey || (interaction as any).dialogKeys?.hit || DEFAULT_DROP_MISS_DIALOG_KEY,
    };
  }

  if (rule.outcome === "consume") {
    return {
      kind: "consume",
      fromSlotIndex: payload.fromSlotIndex,
      dialogKey: rule.hitDialogKey || (interaction as any).dialogKeys?.hit || DEFAULT_DROP_MISS_DIALOG_KEY,
    };
  }

  return {
    kind: "return",
    dialogKey:
      rule.hitDialogKey || rule.missDialogKey || (interaction as any).dialogKeys?.miss || DEFAULT_DROP_MISS_DIALOG_KEY,
  };
}

export function resolveInventoryDropMissDialogKey(
  context: InventoryRuleContext,
  {
    payload,
    interaction,
    sceneInteractions,
  }: {
    payload: DraggedPayloadState;
    interaction?: GameSceneInteraction & { dialogKeys?: Record<string, DialogKey>; id?: string };
    sceneInteractions: (GameSceneInteraction & { dialogKeys?: Record<string, DialogKey>; id?: string; kind?: string })[];
  },
): DialogKey {
  const interactionId = (interaction as any)?.id;
  const itemRule = interactionId ? context.resolveItemRule(payload.stack.id, interactionId) : null;

  return (
    itemRule?.missDialogKey ||
    (interaction as any)?.dialogKeys?.miss ||
    sceneInteractions.find((currentInteraction) => currentInteraction.kind === "drop-target")?.dialogKeys?.miss ||
    DEFAULT_DROP_MISS_DIALOG_KEY
  );
}

export function resolveInventoryDropOnPlayerMessage(
  context: InventoryRuleContext,
  {
    payload,
  }: {
    payload: DraggedPayloadState;
  },
):
  | {
      kind: "text";
      text: string;
    }
  | {
      kind: "dialog-key";
      dialogKey: DialogKey;
    } {
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

export function resolvePickupPlacedItemDecision(
  context: InventoryRuleContext,
  {
    placedItem,
  }: {
    placedItem: PlacedItemState;
  },
): PickupDecision {
  const itemDefinition = context.getItemDefinition(placedItem.itemId);
  if (!itemDefinition) {
    return { kind: "ignore" };
  }

  if (!placedItem.canPickup) {
    return {
      kind: "blocked",
      dialogKey:
        placedItem.pickupBlockedDialogKey || DEFAULT_PICKUP_BLOCKED_DIALOG_KEY,
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
    successDialogKey:
      placedItem.pickupSuccessDialogKey || DEFAULT_PICKUP_ALLOWED_DIALOG_KEY,
  };
}

export const inventoryRuleMessages = {
  unknownItem: UNKNOWN_ITEM_MESSAGE,
  inventoryFull: "Inventario lleno.",
};
