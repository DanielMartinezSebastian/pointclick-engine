import { create } from "zustand";

/**
 * editorModeStore — estado transversal del modo debug/editor.
 *
 * Responsabilidades:
 * - `interactionMode`: `game` permite mover al jugador con clics, inspeccionar
 *   targets y recoger items. `edit` bloquea todas las interacciones del mouse
 *   con elementos del juego para poder editar muros/items/targets sin
 *   condiciones de carrera ni colisiones.
 * - `cameraMode`: `fixed` usa la cámara ortográfica seguidora; `free` libera
 *   los controles para orbitar/zoom/pan (también bloquea interacciones).
 * - `wallOpacityMode`: `wireframe` (default) o `opaque` (muros sólidos en debug).
 * - `activePanels`: conjunto de pestañas abiertas en la barra superior.
 * - `panelPositions`: posición (x, y) por panel para drag-and-drop.
 *
 * No usa middleware persist para mantenerlo simple — la posición de paneles
 * se mantiene mientras dura la sesión del navegador.
 */

export type EditorTabId =
  | "scene"
  | "walls"
  | "ground"
  | "items"
  | "targets"
  | "speech";

export type InteractionMode = "game" | "edit";
export type CameraMode = "fixed" | "free";
export type WallOpacityMode = "wireframe" | "opaque";

export type PanelPosition = { x: number; y: number };

type EditorModeStore = {
  interactionMode: InteractionMode;
  cameraMode: CameraMode;
  wallOpacityMode: WallOpacityMode;
  activePanels: Set<EditorTabId>;
  panelPositions: Record<EditorTabId, PanelPosition | undefined>;

  setInteractionMode: (mode: InteractionMode) => void;
  toggleInteractionMode: () => void;
  setCameraMode: (mode: CameraMode) => void;
  toggleCameraMode: () => void;
  setWallOpacityMode: (mode: WallOpacityMode) => void;
  toggleWallOpacity: () => void;

  togglePanel: (id: EditorTabId) => void;
  openPanel: (id: EditorTabId) => void;
  closePanel: (id: EditorTabId) => void;
  setPanelPosition: (id: EditorTabId, position: PanelPosition) => void;
};

export const useEditorModeStore = create<EditorModeStore>((set) => ({
  interactionMode: "game",
  cameraMode: "fixed",
  wallOpacityMode: "wireframe",
  activePanels: new Set<EditorTabId>(),
  panelPositions: {
    scene: undefined,
    walls: undefined,
    ground: undefined,
    items: undefined,
    targets: undefined,
    speech: undefined,
  },

  setInteractionMode: (mode) => set({ interactionMode: mode }),
  toggleInteractionMode: () =>
    set((s) => ({ interactionMode: s.interactionMode === "game" ? "edit" : "game" })),
  setCameraMode: (mode) => set({ cameraMode: mode }),
  toggleCameraMode: () =>
    set((s) => ({ cameraMode: s.cameraMode === "fixed" ? "free" : "fixed" })),
  setWallOpacityMode: (mode) => set({ wallOpacityMode: mode }),
  toggleWallOpacity: () =>
    set((s) => ({
      wallOpacityMode: s.wallOpacityMode === "wireframe" ? "opaque" : "wireframe",
    })),

  togglePanel: (id) =>
    set((s) => {
      const next = new Set(s.activePanels);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { activePanels: next };
    }),
  openPanel: (id) =>
    set((s) => {
      if (s.activePanels.has(id)) return s;
      const next = new Set(s.activePanels);
      next.add(id);
      return { activePanels: next };
    }),
  closePanel: (id) =>
    set((s) => {
      if (!s.activePanels.has(id)) return s;
      const next = new Set(s.activePanels);
      next.delete(id);
      return { activePanels: next };
    }),
  setPanelPosition: (id, position) =>
    set((s) => ({ panelPositions: { ...s.panelPositions, [id]: position } })),
}));

/**
 * Selector helper para saber si las interacciones de juego (clic-mover, recoger
 * items, inspeccionar targets) deben estar deshabilitadas.
 *
 * Se considera deshabilitado siempre que el usuario haya entrado en modo
 * edición o modo cámara libre — ambos contextos podrían generar condiciones
 * de carrera con el pathfinding o colisiones del runtime.
 */
export const selectGameInteractionsDisabled = (
  state: EditorModeStore,
): boolean => state.interactionMode === "edit" || state.cameraMode === "free";
