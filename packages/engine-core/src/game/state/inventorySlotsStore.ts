import type { InventorySlotsState, InventoryStackState } from "../types";

export type InventorySlotsStore = {
  getSlots: () => InventorySlotsState;
  setSlots: (slots: InventorySlotsState) => void;
  reset: () => void;
};

/**
 * Create an agnostic inventory slots store.
 * Tracks the current inventory state with add/remove operations.
 */
export function createInventorySlotsStore(): InventorySlotsStore {
  let slots: InventorySlotsState = [];

  return {
    getSlots: () => [...slots],
    setSlots: (newSlots: InventorySlotsState) => {
      slots = [...newSlots];
    },
    reset: () => {
      slots = [];
    },
  };
}
