"use client";

import { useCallback, useMemo, useState } from "react";
import { MathUtils } from "three";

import { browserClipboardAdapter, browserTimerAdapter } from "../../lib/platform-web";
import type { SceneInteraction } from "../../../demo-content/scenes/scenes";
import PixelSelect from "../PixelSelect";
import { DebugButton, DebugNumberInput } from "./controls";

export function InteractionTargetsEditorPanel({
  interactions,
  onSetPosition,
  onSetHalfSize,
  onSetRotationDeg,
  onMoveToPlayer,
  onResetFromSceneConfig,
}: {
  interactions: SceneInteraction[];
  onSetPosition: (id: string, axis: 0 | 1 | 2, value: number) => void;
  onSetHalfSize: (id: string, axis: 0 | 1 | 2, value: number) => void;
  onSetRotationDeg: (id: string, value: number) => void;
  onMoveToPlayer: (id: string) => void;
  onResetFromSceneConfig: () => void;
}) {
  const [selectedInteractionId, setSelectedInteractionId] = useState<string>("");
  const effectiveSelectedInteractionId = useMemo(() => {
    if (interactions.length === 0) return "";
    const stillExists = interactions.some((interaction) => interaction.id === selectedInteractionId);
    return stillExists ? selectedInteractionId : interactions[0].id;
  }, [interactions, selectedInteractionId]);

  const selectedInteraction = useMemo(
    () => interactions.find((interaction) => interaction.id === effectiveSelectedInteractionId) ?? null,
    [effectiveSelectedInteractionId, interactions],
  );

  const interactionOptions = useMemo(
    () => interactions.map((interaction, index) => ({ label: `${index + 1}. ${interaction.label}`, value: interaction.id })),
    [interactions],
  );

  const interactionsJson = useMemo(() => JSON.stringify(interactions, null, 2), [interactions]);
  const [copyLabel, setCopyLabel] = useState("Copiar JSON targets");

  const handleCopyJson = useCallback(async () => {
    try {
      await browserClipboardAdapter.writeText(interactionsJson);
      setCopyLabel("Copiado");
      browserTimerAdapter.setTimeout(
        () => setCopyLabel("Copiar JSON targets"),
        1200,
      );
    } catch {
      setCopyLabel("Sin portapapeles");
      browserTimerAdapter.setTimeout(
        () => setCopyLabel("Copiar JSON targets"),
        1200,
      );
    }
  }, [interactionsJson]);

  return (
    <div style={{ display: "grid", gap: "10px", paddingTop: "6px", borderTop: "2px solid rgb(0 255 65 / 30%)" }}>
      <strong style={{ fontSize: "12px", lineHeight: "1.4" }}>Editor de targets de drop</strong>
      <span style={{ fontSize: "10px", lineHeight: "1.5", opacity: 0.85 }}>
        Ajusta la zona donde se detecta y se permite colocar el item (posicion y tamano del detector).
      </span>
      <span style={{ fontSize: "10px", lineHeight: "1.5", opacity: 0.85 }}>
        Con hasCollision activo, el editor limita automaticamente la Y minima para evitar perder colision con el jugador.
      </span>
      <DebugButton label="Reiniciar targets (scenes.ts)" onClick={onResetFromSceneConfig} />

      {interactions.length === 0 && (
        <span style={{ fontSize: "10px", lineHeight: "1.5", opacity: 0.85 }}>
          No hay targets de drop en esta escena.
        </span>
      )}

      {interactions.length > 0 && (
        <>
          <PixelSelect
            label="Target seleccionado"
            value={effectiveSelectedInteractionId}
            onChange={(value) => setSelectedInteractionId(value)}
            options={interactionOptions}
          />

          {selectedInteraction && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                <DebugNumberInput
                  label="Pos X"
                  value={selectedInteraction.position[0]}
                  onChange={(value) => onSetPosition(selectedInteraction.id, 0, value)}
                />
                <DebugNumberInput
                  label="Pos Y"
                  value={selectedInteraction.position[1]}
                  onChange={(value) => onSetPosition(selectedInteraction.id, 1, value)}
                />
                <DebugNumberInput
                  label="Pos Z"
                  value={selectedInteraction.position[2]}
                  onChange={(value) => onSetPosition(selectedInteraction.id, 2, value)}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                <DebugNumberInput
                  label="Half X"
                  value={selectedInteraction.halfSize[0]}
                  onChange={(value) => onSetHalfSize(selectedInteraction.id, 0, value)}
                />
                <DebugNumberInput
                  label="Half Y"
                  value={selectedInteraction.halfSize[1]}
                  onChange={(value) => onSetHalfSize(selectedInteraction.id, 1, value)}
                />
                <DebugNumberInput
                  label="Half Z"
                  value={selectedInteraction.halfSize[2]}
                  onChange={(value) => onSetHalfSize(selectedInteraction.id, 2, value)}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <DebugNumberInput
                  label="Rot Y deg"
                  value={MathUtils.radToDeg(selectedInteraction.rotationY ?? 0)}
                  step={1}
                  onChange={(value) => onSetRotationDeg(selectedInteraction.id, value)}
                />
                <div style={{ display: "grid", alignItems: "end" }}>
                  <DebugButton label="Mover al jugador" onClick={() => onMoveToPlayer(selectedInteraction.id)} />
                </div>
              </div>
            </>
          )}

          <textarea
            readOnly
            value={interactionsJson}
            style={{
              width: "100%",
              minHeight: "90px",
              borderRadius: "2px",
              border: "2px solid #00ff41",
              background: "rgb(8 12 32 / 90%)",
              color: "#00ff41",
              padding: "0.6rem",
              fontSize: "11px",
              fontFamily: "var(--font-pixel), monospace",
              letterSpacing: "0.5px",
              resize: "vertical",
              cursor: "auto",
            }}
          />

          <DebugButton label={copyLabel} onClick={() => { void handleCopyJson(); }} />
        </>
      )}
    </div>
  );
}
