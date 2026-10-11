import type { GameEvent } from "./types";
import type { RuntimeEvent } from "../types";

/**
 * Deuda conocida: el resto de outcomes legacy de `onDrop` ("rule-miss",
 * "on-player", "pickup-blocked", "item-interact", "unknown-item") siguen
 * viajando como `item:dropped` con un `outcome` fuera del tipo (cast abajo).
 * Los consumidores deben filtrar por `outcome`.
 *
 * Mapea un RuntimeEvent legacy (onMove/onCollide/onDrop/onDialog)
 * al nuevo GameEvent equivalente. Permite mantener el callback
 * `onRuntimeEvent` mientras el bus es la fuente de verdad.
 */
export function legacyRuntimeEventToGameEvent(ev: RuntimeEvent): GameEvent {
  switch (ev.type) {
    case "onMove":
      return { type: "player:moved", position: ev.position, action: ev.action };
    case "onCollide":
      return {
        type: "player:collided",
        reason: ev.reason,
        position: ev.position,
      };
    case "onDrop":
      // Recoger un ítem no es soltarlo: el outcome legacy "pickup-success"
      // viaja por el bus como `item:pickedUp` (el callback legacy no cambia).
      if (ev.outcome === "pickup-success") {
        return { type: "item:pickedUp", itemId: ev.itemId, quantity: 1 };
      }
      return {
        type: "item:dropped",
        itemId: ev.itemId,
        outcome: ev.outcome,
        interactionId: ev.interactionId,
      };
    case "onDialog":
      return {
        type: "dialog:triggered",
        text: ev.text,
        dialogKey: ev.dialogKey,
        source: ev.source,
      };
  }
}

/**
 * Inverso: GameEvent → RuntimeEvent (solo los 4 legacy soportados).
 * Retorna null para eventos sin equivalente legacy (ej. scene:changed).
 */
export function gameEventToLegacyRuntimeEvent(ev: GameEvent): RuntimeEvent | null {
  switch (ev.type) {
    case "player:moved":
      return { type: "onMove", position: ev.position, action: ev.action };
    case "player:collided":
      return { type: "onCollide", reason: ev.reason, position: ev.position };
    case "item:dropped":
      return {
        type: "onDrop",
        itemId: ev.itemId,
        outcome: ev.outcome,
        interactionId: ev.interactionId,
      };
    case "dialog:triggered":
      return {
        type: "onDialog",
        text: ev.text,
        dialogKey: ev.dialogKey,
        source: ev.source as "boundary" | "inventory" | "debug",
      };
    default:
      return null;
  }
}
