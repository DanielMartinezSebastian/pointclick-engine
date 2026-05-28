"use client";

import { DebugButton, DebugNumberInput } from "./controls";

export function SpeechPanel({
  speechDraft,
  onSpeechDraftChange,
  speechCharsPerSecond,
  onSpeechCharsPerSecondChange,
  onRunSpeech,
  onHideSpeech,
  speechVisible,
}: {
  speechDraft: string;
  onSpeechDraftChange: (value: string) => void;
  speechCharsPerSecond: number;
  onSpeechCharsPerSecondChange: (value: number) => void;
  onRunSpeech: () => void;
  onHideSpeech: () => void;
  speechVisible: boolean;
}) {
  return (
    <>
      <strong style={{ fontSize: "12px", lineHeight: "1.4" }}>
        Bocadillo de diálogo
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
          boxSizing: "border-box",
        }}
      />

      <DebugNumberInput
        label="Velocidad (chars/seg)"
        value={speechCharsPerSecond}
        step={1}
        onChange={onSpeechCharsPerSecondChange}
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
        <DebugButton
          label="Hablar"
          onClick={onRunSpeech}
          disabled={speechDraft.trim().length === 0}
        />
        <DebugButton
          label="Ocultar"
          onClick={onHideSpeech}
          disabled={!speechVisible}
        />
      </div>
    </>
  );
}
