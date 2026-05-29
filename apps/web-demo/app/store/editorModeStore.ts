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
 * - `wallAllowBelowGround`: si es `false` (default), el editor mantiene la
 *   base de cualquier muro pegada a `ground.y` automáticamente. Cambia a
 *   `true` solo cuando quieras que un muro atraviese el suelo a propósito.
 * - `showPlayerCollider`: dibuja un wireframe sobre el cuerpo del personaje
 *   para inspeccionar dimensiones y posición del CuboidCollider en escena.
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
  | "transitions"
  | "speech";

export type InteractionMode = "game" | "edit";
/**
 * - `fixed`: camera follows the player as in normal gameplay.
 * - `free`: OrbitControls active — user can rotate / pan / zoom the world.
 *   While in this mode, pointer events on movable scene elements (walls,
 *   resize handles, items) are suppressed so the camera drag never picks
 *   anything up by accident.
 * - `locked`: camera frozen at its current pose. No OrbitControls, no
 *   follow. Movable scene elements ARE interactive — this is the mode to
 *   use after orbiting somewhere comfortable when you want to start editing
 *   from that angle.
 */
export type CameraMode = "fixed" | "free" | "locked";
export type WallOpacityMode = "wireframe" | "opaque";

export type PanelPosition = { x: number; y: number };

type EditorModeStore = {
  interactionMode: InteractionMode;
  cameraMode: CameraMode;
  wallOpacityMode: WallOpacityMode;
  wallAllowBelowGround: boolean;
  showPlayerCollider: boolean;
  activePanels: Set<EditorTabId>;
  panelPositions: Record<EditorTabId, PanelPosition | undefined>;

  setInteractionMode: (mode: InteractionMode) => void;
  toggleInteractionMode: () => void;
  setCameraMode: (mode: CameraMode) => void;
  toggleCameraMode: () => void;
  setWallOpacityMode: (mode: WallOpacityMode) => void;
  toggleWallOpacity: () => void;
  setWallAllowBelowGround: (allow: boolean) => void;
  toggleWallAllowBelowGround: () => void;
  setShowPlayerCollider: (show: boolean) => void;
  toggleShowPlayerCollider: () => void;

  togglePanel: (id: EditorTabId) => void;
  openPanel: (id: EditorTabId) => void;
  closePanel: (id: EditorTabId) => void;
  setPanelPosition: (id: EditorTabId, position: PanelPosition) => void;
};

export const useEditorModeStore = create<EditorModeStore>((set) => ({
  interactionMode: "game",
  cameraMode: "fixed",
  wallOpacityMode: "wireframe",
  wallAllowBelowGround: false,
  showPlayerCollider: false,
  activePanels: new Set<EditorTabId>(),
  panelPositions: {
    scene: undefined,
    walls: undefined,
    ground: undefined,
    items: undefined,
    targets: undefined,
    transitions: undefined,
    speech: undefined,
  },

  setInteractionMode: (mode) => set({ interactionMode: mode }),
  toggleInteractionMode: () =>
    set((s) => ({ interactionMode: s.interactionMode === "game" ? "edit" : "game" })),
  setCameraMode: (mode) => set({ cameraMode: mode }),
  toggleCameraMode: () =>
    set((s) => {
      // Cycle: fixed → free → locked → fixed.
      const next: CameraMode =
        s.cameraMode === "fixed"
          ? "free"
          : s.cameraMode === "free"
            ? "locked"
            : "fixed";
      return { cameraMode: next };
    }),
  setWallOpacityMode: (mode) => set({ wallOpacityMode: mode }),
  toggleWallOpacity: () =>
    set((s) => ({
      wallOpacityMode: s.wallOpacityMode === "wireframe" ? "opaque" : "wireframe",
    })),
  setWallAllowBelowGround: (allow) => set({ wallAllowBelowGround: allow }),
  toggleWallAllowBelowGround: () =>
    set((s) => ({ wallAllowBelowGround: !s.wallAllowBelowGround })),
  setShowPlayerCollider: (show) => set({ showPlayerCollider: show }),
  toggleShowPlayerCollider: () =>
    set((s) => ({ showPlayerCollider: !s.showPlayerCollider })),

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
 * edición, o el modo cámara libre/bloqueada — los tres contextos podrían
 * generar condiciones de carrera con el pathfinding o colisiones del runtime.
 */
export const selectGameInteractionsDisabled = (
  state: EditorModeStore,
): boolean =>
  state.interactionMode === "edit" || state.cameraMode !== "fixed";

/**
 * Selector helper para saber si los elementos movibles de la escena (muros,
 * handles de resize, items colocados) deben ignorar los pointer events.
 *
 * Solo se bloquea durante el modo cámara `free` (OrbitControls activo) para
 * que el drag de la cámara no seleccione/mueva un muro al pasar por encima.
 * En modo `locked` la cámara está congelada y los elementos sí son editables.
 */
export const selectSceneEditingBlocked = (
  state: EditorModeStore,
): boolean => state.cameraMode === "free";
