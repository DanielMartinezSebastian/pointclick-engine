import type { InventorySlotsState } from "../types";
export type InventorySlotsStore = {
    getSlots: () => InventorySlotsState;
    setSlots: (slots: InventorySlotsState) => void;
    reset: () => void;
};
/**
 * Create an agnostic inventory slots store.
 * Tracks the current inventory state with add/remove operations.
 */
export declare function createInventorySlotsStore(): InventorySlotsStore;
//# sourceMappingURL=inventorySlotsStore.d.ts.map