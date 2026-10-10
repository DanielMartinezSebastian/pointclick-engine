import { create } from "zustand";

/**
 * inputLockStore — bloqueo de entrada del jugador mientras corre un guion.
 *
 * Lo escribe el secuenciador (acción `lockInput`) y lo lee el renderer para
 * ignorar clics/joystick. El secuenciador lo libera siempre que termina o se
 * cancela el guion que lo activó.
 */
export type InputLockStoreState = {
  inputLocked: boolean;
  setInputLocked: (locked: boolean) => void;
};

export const useInputLockStore = create<InputLockStoreState>((set) => ({
  inputLocked: false,
  setInputLocked: (locked) => set({ inputLocked: locked }),
}));

/** Lee el bloqueo de entrada sin React. */
export function getInputLockState() {
  return useInputLockStore.getState();
}
