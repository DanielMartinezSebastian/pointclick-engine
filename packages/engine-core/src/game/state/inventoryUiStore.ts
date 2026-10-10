import { create } from "zustand";

/**
 * inventoryUiStore — visibilidad del inventario.
 *
 * Destino por defecto de `inventory:toggle` cuando el runtime no recibe
 * `inventoryAdapter`. Misma forma que `inventoryStore` de la demo.
 */
export type InventoryUiStoreState = {
  isOpen: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
};

export const useInventoryUiStore = create<InventoryUiStoreState>((set) => ({
  isOpen: false,
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));

/** Lee el estado de visibilidad del inventario sin React. */
export function getInventoryUiState() {
  return useInventoryUiStore.getState();
}
