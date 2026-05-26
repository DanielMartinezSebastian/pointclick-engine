import { create } from "zustand";

type MobileInputState = {
  /** Eje horizontal normalizado: -1 (izquierda) a 1 (derecha) */
  x: number;
  /** Eje de profundidad normalizado: -1 (norte/lejos) a 1 (sur/cerca) */
  z: number;
  /** true mientras el joystick esté activo */
  active: boolean;
  setAxes: (x: number, z: number) => void;
  deactivate: () => void;
};

export const useMobileInputStore = create<MobileInputState>((set) => ({
  x: 0,
  z: 0,
  active: false,
  setAxes: (x, z) => set({ x, z, active: true }),
  deactivate: () => set({ x: 0, z: 0, active: false }),
}));
