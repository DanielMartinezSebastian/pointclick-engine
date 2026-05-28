import { create } from "zustand";

/**
 * doorStore — estado abierto/cerrado de las puertas de la escena.
 *
 * Stays in the demo (not in engine-core) while the door mechanic is still
 * being prototyped. Once the API stabilises we can promote it to core or to
 * a renderer-agnostic plugin.
 *
 * Key = `SceneDoor.id` (matches the `id` of a wall opening in the same
 * scene). When a door's id is missing from the map, it is treated as
 * "closed" — the same default used by `SceneDoors` if a scene declares the
 * door without a starting state.
 */
type DoorStoreState = {
  doorOpenStates: Record<string, boolean>;
  isOpen: (id: string) => boolean;
  setOpen: (id: string, isOpen: boolean) => void;
  toggle: (id: string) => void;
  /**
   * Reset all doors. Useful when a scene resets — opens take the explicit
   * `openByDefault` value or close (false) otherwise.
   */
  reset: (initial: Record<string, boolean>) => void;
};

export const useDoorStore = create<DoorStoreState>((set, get) => ({
  doorOpenStates: {},
  isOpen: (id) => Boolean(get().doorOpenStates[id]),
  setOpen: (id, isOpen) =>
    set((s) => ({
      doorOpenStates: { ...s.doorOpenStates, [id]: isOpen },
    })),
  toggle: (id) =>
    set((s) => ({
      doorOpenStates: {
        ...s.doorOpenStates,
        [id]: !s.doorOpenStates[id],
      },
    })),
  reset: (initial) => set({ doorOpenStates: { ...initial } }),
}));
