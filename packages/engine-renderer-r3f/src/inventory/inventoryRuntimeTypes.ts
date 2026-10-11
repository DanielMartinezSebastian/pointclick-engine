import type {
  GameSceneInteractionFull,
  InventoryRuleContext,
  InventoryStackState,
  RuntimeEventHandler,
} from "@pointclick-engine/engine-core";

export type DraggedInventoryPayload = {
  stack: InventoryStackState;
  fromSlotIndex: number;
};

export type RuntimeDraggedStack = DraggedInventoryPayload & {
  pointerX: number;
  pointerY: number;
};

export type SpeechMeta = { source?: "inventory" | "debug"; dialogKey?: string };
export type ShowSpeechBubble = (text: string, meta?: SpeechMeta) => void;

/** Dependencias comunes de los manejadores de drop/pickup (puros, sin React). */
export type InventoryHandlerEnv = {
  ctx: InventoryRuleContext;
  getPhrase: (key: string) => string;
  showSpeechBubble: ShowSpeechBubble;
  onRuntimeEvent?: RuntimeEventHandler;
  clearDrag: () => void;
};

export type DropInteraction = GameSceneInteractionFull;
