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
export function createPlacedItemsStore(): PlacedItemsStore {
  let items: PlacedSceneItem[] = [];

  return {
    getItems: () => [...items],
    setItems: (newItems: PlacedSceneItem[]) => {
      items = [...newItems];
    },
    addItem: (item: PlacedSceneItem) => {
      items = [...items, item];
    },
    removeItem: (itemId: string) => {
      items = items.filter((item) => item.id !== itemId);
    },
    reset: () => {
      items = [];
    },
  };
}
