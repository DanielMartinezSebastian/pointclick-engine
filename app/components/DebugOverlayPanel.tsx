"use client";

import type { ReactNode } from "react";

import PixelSelect from "./PixelSelect";

function OverlayButton({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        borderRadius: "2px",
        border: "2px solid #00ff41",
        background: disabled ? "rgb(8 12 32 / 40%)" : "rgb(8 12 32 / 90%)",
        color: disabled ? "rgb(0 255 65 / 45%)" : "#00ff41",
        padding: "0.55rem 0.7rem",
        fontSize: "11px",
        fontFamily: "var(--font-pixel), monospace",
        letterSpacing: "1px",
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {label}
    </button>
  );
}

function OverlayNumberInput({
  label,
  value,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  return (
    <label
      style={{
        display: "grid",
        gap: "4px",
        fontSize: "11px",
        textTransform: "uppercase",
      }}
    >
      <span>{label}</span>
      <input
        type="number"
        value={Number.isFinite(value) ? value : 1}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          width: "100%",
          borderRadius: "2px",
          border: "2px solid #00ff41",
          background: "rgb(8 12 32 / 90%)",
          color: "#00ff41",
          padding: "0.5rem 0.6rem",
          fontSize: "12px",
          fontFamily: "var(--font-pixel), monospace",
          letterSpacing: "1px",
          outline: "none",
          cursor: "auto",
        }}
      />
    </label>
  );
}

export function DebugOverlayPanel({
  isDebug,
  debugPanelSide,
  onTogglePanelSide,
  isDebugGroundVisible,
  onToggleGround,
  isDebugWallsVisible,
  onToggleWalls,
  sceneId,
  onSceneChange,
  sceneOptions,
  readyMessage,
  onRespawn,
  editorMode,
  onEditorModeChange,
  speechDraft,
  onSpeechDraftChange,
  speechCharsPerSecond,
  onSpeechCharsPerSecondChange,
  onRunSpeech,
  onHideSpeech,
  speechVisible,
  editorContent,
}: {
  isDebug: boolean;
  debugPanelSide: "left" | "right";
  onTogglePanelSide: () => void;
  isDebugGroundVisible: boolean;
  onToggleGround: () => void;
  isDebugWallsVisible: boolean;
  onToggleWalls: () => void;
  sceneId: string;
  onSceneChange: (value: string) => void;
  sceneOptions: Array<{ label: string; value: string }>;
  readyMessage: string;
  onRespawn: () => void;
  editorMode: "walls" | "ground" | "items" | "targets";
  onEditorModeChange: (value: "walls" | "ground" | "items" | "targets") => void;
  speechDraft: string;
  onSpeechDraftChange: (value: string) => void;
  speechCharsPerSecond: number;
  onSpeechCharsPerSecondChange: (value: number) => void;
  onRunSpeech: () => void;
  onHideSpeech: () => void;
  speechVisible: boolean;
  editorContent: ReactNode;
}) {
  if (!isDebug) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "16px",
        left: debugPanelSide === "left" ? "16px" : undefined,
        right: debugPanelSide === "right" ? "16px" : undefined,
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        zIndex: 10001,
        padding: "1rem 1.2rem",
        borderRadius: "2px",
        border: "3px solid #00ff41",
        background: "rgb(12 19 48 / 95%)",
        color: "#00ff41",
        backdropFilter: "blur(4px)",
        minWidth: "260px",
        maxWidth: "420px",
        maxHeight: "calc(100vh - 32px)",
        overflowY: "auto",
        boxShadow:
          "0 0 16px rgba(0, 255, 65, 0.3), inset 0 0 8px rgba(0, 255, 65, 0.1)",
        fontFamily: "var(--font-pixel), monospace",
        fontSize: "13px",
        letterSpacing: "1px",
        textShadow: "0 0 10px rgba(0, 255, 65, 0.4)",
        pointerEvents: "auto",
      }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
        <OverlayButton
          label={isDebugGroundVisible ? "Ocultar suelo" : "Mostrar suelo"}
          onClick={onToggleGround}
        />
        <OverlayButton
          label={isDebugWallsVisible ? "Ocultar paredes" : "Mostrar paredes"}
          onClick={onToggleWalls}
        />
      </div>

      <OverlayButton
        label={debugPanelSide === "left" ? "Panel a derecha" : "Panel a izquierda"}
        onClick={onTogglePanelSide}
      />

      <PixelSelect
        label="Escenario"
        value={sceneId}
        onChange={onSceneChange}
        options={sceneOptions}
      />

      <strong
        style={{
          fontSize: "12px",
          fontWeight: "bold",
          letterSpacing: "1px",
          lineHeight: "1.6",
        }}
      >
        {readyMessage}
      </strong>

      <OverlayButton label="Reaparecer en spawn" onClick={onRespawn} />

      <PixelSelect
        label="Modo editor"
        value={editorMode}
        onChange={(value) => onEditorModeChange(value as "walls" | "ground" | "items" | "targets")}
        options={[
          { label: "Editar paredes", value: "walls" },
          { label: "Editar suelo", value: "ground" },
          { label: "Editar items", value: "items" },
          { label: "Editar targets", value: "targets" },
        ]}
      />

      <div
        style={{
          display: "grid",
          gap: "8px",
          paddingTop: "6px",
          borderTop: "2px solid rgb(0 255 65 / 30%)",
        }}
      >
        <strong style={{ fontSize: "12px", lineHeight: "1.4" }}>
          Bocadillo de dialogo
        </strong>
        <textarea
          value={speechDraft}
          onChange={(e) => onSpeechDraftChange(e.target.value)}
          placeholder="Escribe el texto para el personaje"
          rows={4}
          style={{
            width: "100%",
            minHeight: "84px",
            borderRadius: "2px",
            border: "2px solid #00ff41",
            background: "rgb(8 12 32 / 90%)",
            color: "#00ff41",
            padding: "0.6rem",
            fontSize: "11px",
            fontFamily: "var(--font-pixel), monospace",
            letterSpacing: "0.5px",
            resize: "vertical",
            outline: "none",
            cursor: "auto",
          }}
        />

        <OverlayNumberInput
          label="Velocidad (chars/seg)"
          value={speechCharsPerSecond}
          onChange={onSpeechCharsPerSecondChange}
        />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          <OverlayButton
            label="Hablar"
            onClick={onRunSpeech}
            disabled={speechDraft.trim().length === 0}
          />
          <OverlayButton
            label="Ocultar"
            onClick={onHideSpeech}
            disabled={!speechVisible}
          />
        </div>
      </div>

      {editorContent}
    </div>
  );
}
