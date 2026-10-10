import { create } from "zustand";

import { addOneToInventory, removeOneFromSlot } from "../logic/rules/inventoryRules";
import type { InventorySlotsState } from "../types";

/** Número de slots por defecto del inventario reactivo. */
export const DEFAULT_INVENTORY_SLOT_COUNT = 9;

/**
 * inventoryStore — slots del inventario como store reactivo (suscribible desde React
 * con `useInventoryStateStore(selector)` y desde fuera con `subscribe`).
 *
 * No confundir con `createInventorySlotsStore` (lista mutable sin suscripción) ni con
 * `useInventoryUiStore` (visibilidad del panel).
 */
export type InventoryStateStoreState = {
  slots: InventorySlotsState;
  slotCount: number;
  /** Sustituye todos los slots (p. ej. al hidratar desde persistencia). */
  setSlots: (slots: InventorySlotsState) => void;
  /**
   * Añade una unidad: apila si ya existe el id, si no usa el primer hueco.
   * Devuelve `false` (sin cambiar el estado) si el inventario está lleno.
   */
  addItem: (stack: { id: string; name: string; spriteUrl: string }) => boolean;
  /** Quita una unidad del slot (lo vacía al llegar a 0). Slot vacío/inexistente: no-op. */
  removeOne: (slotIndex: number) => void;
  /** Cambia el número de slots, rellenando con null o recortando por el final. */
  setSlotCount: (slotCount: number) => void;
  /** Vacía el inventario; opcionalmente fija un nuevo número de slots. */
  reset: (slotCount?: number) => void;
};

export function createEmptySlots(slotCount: number): InventorySlotsState {
  const n = Math.max(0, Math.floor(slotCount));
  return Array.from({ length: n }, () => null);
}

export const useInventoryStateStore = create<InventoryStateStoreState>((set, get) => ({
  slots: createEmptySlots(DEFAULT_INVENTORY_SLOT_COUNT),
  slotCount: DEFAULT_INVENTORY_SLOT_COUNT,
  setSlots: (slots) => set({ slots }),
  addItem: (stack) => {
    const result = addOneToInventory(get().slots, stack);
    if (!result.added) return false;
    set({ slots: result.slots });
    return true;
  },
  removeOne: (slotIndex) => {
    const current = get().slots;
    const next = removeOneFromSlot(current, slotIndex);
    if (next !== current) set({ slots: next });
  },
  setSlotCount: (slotCount) => {
    const n = Math.max(0, Math.floor(slotCount));
    const current = get().slots;
    const slots =
      n >= current.length
        ? [...current, ...createEmptySlots(n - current.length)]
        : current.slice(0, n);
    set({ slots, slotCount: n });
  },
  reset: (slotCount) => {
    const n = Math.max(0, Math.floor(slotCount ?? get().slotCount));
    set({ slots: createEmptySlots(n), slotCount: n });
  },
}));

/** Lee el estado del inventario sin React. */
export function getInventoryState() {
  return useInventoryStateStore.getState();
}
