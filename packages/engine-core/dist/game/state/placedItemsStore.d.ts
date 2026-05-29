import type { PlacedSceneItem } from "../types";
export type PlacedItemsStore = {
    getItems: () => PlacedSceneItem[];
    setItems: (items: PlacedSceneItem[]) => void;
    addItem: (item: PlacedSceneItem) => void;
    removeItem: (itemId: string) => void;
    reset: () => void;
};
/**
 * Create an agnostic placed items store.
 * Tracks items placed in scenes with granular add/remove operations.
 */
export declare function createPlacedItemsStore(): PlacedItemsStore;
//# sourceMappingURL=placedItemsStore.d.ts.map