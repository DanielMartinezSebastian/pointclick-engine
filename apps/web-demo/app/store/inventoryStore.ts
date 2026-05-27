import { create } from "zustand";

/**
 * inventoryStore — estado de visibilidad del inventario.
 *
 * Accesible desde ejecutores de comandos (`publicApi.ts`) y componentes UI.
 * Separado de `useInventoryRuntimeController` para que `inventory:toggle`
 * funcione sin acceso al scope React del componente.
 */
type InventoryStoreState = {
  isOpen: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
};

export const useInventoryStore = create<InventoryStoreState>((set) => ({
  isOpen: false,
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
