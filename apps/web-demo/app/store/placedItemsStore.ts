import { create } from "zustand";
import type { PlacedSceneItem } from "../lib/engine/types/gameRuntime";

type PlacedItemsStoreState = {
  items: PlacedSceneItem[];
  setItems: (items: PlacedSceneItem[]) => void;
  initialItemsCreated: boolean;
  markInitialItemsCreated: () => void;
};

export const usePlacedItemsStore = create<PlacedItemsStoreState>((set) => ({
  items: [],
  setItems: (items: PlacedSceneItem[]) => set({ items }),
  initialItemsCreated: false,
  markInitialItemsCreated: () => set({ initialItemsCreated: true }),
}));
