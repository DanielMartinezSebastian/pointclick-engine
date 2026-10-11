import { create } from "zustand";

import type { PlacedSceneItem } from "../types";

/**
 * placedItemsReactiveStore — ítems colocados de TODAS las escenas como store reactivo,
 * más el conjunto genérico de escenas ya "sembradas" (equivale al antiguo
 * `initialItemsCreated`, pero por escena). Qué se siembra y cuándo lo decide quien llama.
 *
 * No confundir con `createPlacedItemsStore` (lista mutable sin suscripción).
 */
export type PlacedItemsStateStoreState = {
  items: PlacedSceneItem[];
  seededSceneIds: string[];
  setItems: (items: PlacedSceneItem[]) => void;
  addItem: (item: PlacedSceneItem) => void;
  removeItem: (id: string) => void;
  /** Sustituye un eje (0=x,1=y,2=z) de la posición del ítem. */
  updateItemPosition: (id: string, axis: 0 | 1 | 2, value: number) => void;
  /** Sustituye la posición completa del ítem. */
  setItemPosition: (id: string, position: [number, number, number]) => void;
  setSeededSceneIds: (sceneIds: string[]) => void;
  markSceneSeeded: (sceneId: string) => void;
  isSceneSeeded: (sceneId: string) => boolean;
  reset: () => void;
};

/** Selector/función pura: ítems de una escena (los que no tienen sceneId no se incluyen). */
export function selectPlacedItemsForScene(
  items: readonly PlacedSceneItem[],
  sceneId: string,
): PlacedSceneItem[] {
  return items.filter((item) => item.sceneId === sceneId);
}

export const usePlacedItemsStateStore = create<PlacedItemsStateStoreState>((set, get) => ({
  items: [],
  seededSceneIds: [],
  setItems: (items) => set({ items }),
  addItem: (item) => set((s) => ({ items: [...s.items, item] })),
  removeItem: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
  updateItemPosition: (id, axis, value) =>
    set((s) => ({
      items: s.items.map((item) => {
        if (item.id !== id) return item;
        const worldPosition = [...item.worldPosition] as [number, number, number];
        worldPosition[axis] = value;
        return { ...item, worldPosition };
      }),
    })),
  setItemPosition: (id, position) =>
    set((s) => ({
      items: s.items.map((item) =>
        item.id === id ? { ...item, worldPosition: [...position] as [number, number, number] } : item,
      ),
    })),
  setSeededSceneIds: (sceneIds) => set({ seededSceneIds: [...new Set(sceneIds)] }),
  markSceneSeeded: (sceneId) =>
    set((s) =>
      s.seededSceneIds.includes(sceneId) ? s : { seededSceneIds: [...s.seededSceneIds, sceneId] },
    ),
  isSceneSeeded: (sceneId) => get().seededSceneIds.includes(sceneId),
  reset: () => set({ items: [], seededSceneIds: [] }),
}));

/** Lee el estado de ítems colocados sin React. */
export function getPlacedItemsState() {
  return usePlacedItemsStateStore.getState();
}
