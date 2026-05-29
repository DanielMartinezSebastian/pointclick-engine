/**
 * Create an agnostic placed items store.
 * Tracks items placed in scenes with granular add/remove operations.
 */
export function createPlacedItemsStore() {
    let items = [];
    return {
        getItems: () => [...items],
        setItems: (newItems) => {
            items = [...newItems];
        },
        addItem: (item) => {
            items = [...items, item];
        },
        removeItem: (itemId) => {
            items = items.filter((item) => item.id !== itemId);
        },
        reset: () => {
            items = [];
        },
    };
}
//# sourceMappingURL=placedItemsStore.js.map