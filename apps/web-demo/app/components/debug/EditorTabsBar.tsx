"use client";

import { type CSSProperties } from "react";

import {
  useEditorModeStore,
  type EditorTabId,
} from "../../store/editorModeStore";

type TabDescriptor = {
  id: EditorTabId;
  label: string;
};

const TABS: TabDescriptor[] = [
  { id: "scene", label: "Escena" },
  { id: "walls", label: "Paredes" },
  { id: "ground", label: "Suelo" },
  { id: "items", label: "Items" },
  { id: "targets", label: "Targets" },
  { id: "transitions", label: "Transiciones" },
  { id: "speech", label: "Diálogo" },
];

function TabChip({
  label,
  active,
  onClick,
  variant = "default",
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  variant?: "default" | "primary" | "warning";
}) {
  const palette =
    variant === "primary"
      ? { accent: "#ffaa00", glow: "rgba(255, 170, 0, 0.45)" }
      : variant === "warning"
        ? { accent: "#ff66aa", glow: "rgba(255, 102, 170, 0.45)" }
        : { accent: "#00ff41", glow: "rgba(0, 255, 65, 0.45)" };

  const style: CSSProperties = {
    border: `2px solid ${palette.accent}`,
    background: active
      ? `${palette.accent}33`
      : "rgb(8 12 32 / 88%)",
    color: palette.accent,
    padding: "0.45rem 0.75rem",
    fontSize: "11px",
    fontFamily: "var(--font-pixel), monospace",
    letterSpacing: "1px",
    cursor: "pointer",
    borderRadius: "2px",
    textShadow: `0 0 10px ${palette.glow}`,
    boxShadow: active ? `0 0 12px ${palette.glow}` : "none",
    textTransform: "uppercase",
  };

  return (
    <button type="button" style={style} onClick={onClick}>
      {label}
    </button>
  );
}

export function EditorTabsBar() {
  const activePanels = useEditorModeStore((s) => s.activePanels);
  const togglePanel = useEditorModeStore((s) => s.togglePanel);
  const interactionMode = useEditorModeStore((s) => s.interactionMode);
  const toggleInteractionMode = useEditorModeStore((s) => s.toggleInteractionMode);
  const cameraMode = useEditorModeStore((s) => s.cameraMode);
  const toggleCameraMode = useEditorModeStore((s) => s.toggleCameraMode);

  const barStyle: CSSProperties = {
    position: "fixed",
    top: "12px",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 10003,
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    padding: "6px 8px",
    borderRadius: "3px",
    border: "2px solid rgb(0 255 65 / 40%)",
    background: "rgb(12 19 48 / 92%)",
    backdropFilter: "blur(4px)",
    boxShadow: "0 0 14px rgba(0, 255, 65, 0.2)",
    pointerEvents: "auto",
    maxWidth: "calc(100vw - 24px)",
    justifyContent: "center",
  };

  const separatorStyle: CSSProperties = {
    width: "2px",
    background: "rgb(0 255 65 / 25%)",
    margin: "2px 4px",
  };

  return (
    <div style={barStyle}>
      {TABS.map((tab) => (
        <TabChip
          key={tab.id}
          label={tab.label}
          active={activePanels.has(tab.id)}
          onClick={() => togglePanel(tab.id)}
        />
      ))}
      <div style={separatorStyle} />
      <TabChip
        label={interactionMode === "edit" ? "Modo: Edición" : "Modo: Juego"}
        active={interactionMode === "edit"}
        onClick={toggleInteractionMode}
        variant="warning"
      />
      <TabChip
        label={
          cameraMode === "free"
            ? "Cámara: Libre"
            : cameraMode === "locked"
              ? "Cámara: Bloqueada"
              : "Cámara: Fija"
        }
        active={cameraMode !== "fixed"}
        onClick={toggleCameraMode}
        variant="primary"
      />
    </div>
  );
}
