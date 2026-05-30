import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PlacedSceneItem } from "@pointclick-engine/engine-core";

type PlacedItemsStoreState = {
  items: PlacedSceneItem[];
  setItems: (items: PlacedSceneItem[]) => void;
  initialItemsCreated: boolean;
  markInitialItemsCreated: () => void;
};

const STORAGE_KEY = "placed-items-state";

export const usePlacedItemsStore = create<PlacedItemsStoreState>()(
  persist(
    (set) => ({
      items: [],
      setItems: (items: PlacedSceneItem[]) => set({ items }),
      initialItemsCreated: false,
      markInitialItemsCreated: () => set({ initialItemsCreated: true }),
    }),
    {
      name: STORAGE_KEY,
    },
  ),
);
