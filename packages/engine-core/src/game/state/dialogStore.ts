import { create } from "zustand";

/**
 * dialogStore — estado del diálogo/speech bubble activo.
 *
 * Destino por defecto de `dialog:trigger`/`dialog:dismiss` cuando el runtime
 * no recibe `dialogAdapter`. Misma forma que el store de la demo.
 */
export type DialogStoreState = {
  text: string;
  key: string | undefined;
  visible: boolean;
  /** Incrementado en cada `show()` para forzar re-animación del speech bubble. */
  triggerCount: number;
  show: (text: string, key?: string) => void;
  dismiss: () => void;
};

export const useDialogStore = create<DialogStoreState>((set) => ({
  text: "",
  key: undefined,
  visible: false,
  triggerCount: 0,
  show: (text, key) =>
    set((s) => ({
      text,
      key,
      visible: true,
      triggerCount: s.triggerCount + 1,
    })),
  dismiss: () => set({ visible: false }),
}));

/** Lee el estado del diálogo sin React. */
export function getDialogState() {
  return useDialogStore.getState();
}
