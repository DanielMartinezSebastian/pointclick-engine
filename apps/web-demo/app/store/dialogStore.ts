import { create } from "zustand";

/**
 * dialogStore — estado del diálogo/speech bubble activo.
 *
 * Accesible desde ejecutores de comandos (`publicApi.ts`) y componentes UI.
 * Reemplaza el estado local de speech en `useInventoryRuntimeController` para
 * que `dialog:trigger` y `dialog:dismiss` funcionen sin acceso al scope React.
 */
type DialogStoreState = {
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
