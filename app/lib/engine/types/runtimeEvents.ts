export type RuntimeMoveEvent = {
  type: "onMove";
  position: [number, number, number];
  action: "idle" | "north" | "south" | "west" | "east";
};

export type RuntimeCollideEvent = {
  type: "onCollide";
  reason: "boundary" | "stuck";
  position: [number, number, number];
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

export type RuntimeEvent =
  | RuntimeMoveEvent
  | RuntimeCollideEvent
  | RuntimeDropEvent
  | RuntimeDialogEvent;

export type RuntimeEventHandler = (event: RuntimeEvent) => void;

export function emitRuntimeEvent(
  handler: RuntimeEventHandler | undefined,
  event: RuntimeEvent,
) {
  if (!handler) return;
  handler(event);
}
