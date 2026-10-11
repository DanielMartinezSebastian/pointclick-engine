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
  /** Quien habla (opcional; solo lo fija el secuenciador de guiones). */
  speaker?: string;
  visible: boolean;
  /** Incrementado en cada `show()` para forzar re-animación del speech bubble. */
  triggerCount: number;
  show: (text: string, key?: string, speaker?: string) => void;
  dismiss: () => void;
};

export const useDialogStore = create<DialogStoreState>((set) => ({
  text: "",
  key: undefined,
  visible: false,
  triggerCount: 0,
  show: (text, key, speaker) =>
    set((s) => ({
      text,
      key,
      speaker,
      visible: true,
      triggerCount: s.triggerCount + 1,
    })),
  dismiss: () => set({ visible: false }),
}));

/** Lee el estado del diálogo sin React. */
export function getDialogState() {
  return useDialogStore.getState();
}
