/**
 * Create an agnostic inventory slots store.
 * Tracks the current inventory state with add/remove operations.
 */
export function createInventorySlotsStore() {
    let slots = [];
    return {
        getSlots: () => [...slots],
        setSlots: (newSlots) => {
            slots = [...newSlots];
        },
        reset: () => {
            slots = [];
        },
    };
}
//# sourceMappingURL=inventorySlotsStore.js.map