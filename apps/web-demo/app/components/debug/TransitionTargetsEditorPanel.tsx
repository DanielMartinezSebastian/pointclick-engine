"use client";

import { useCallback, useMemo, useState } from "react";
import { browserClipboardAdapter, browserTimerAdapter } from "../../lib/platform-web";
import type { GameSceneTransition } from "@pointclick-engine/engine-core";
import PixelSelect from "../PixelSelect";
import { DebugButton, DebugNumberInput } from "./controls";

export function TransitionTargetsEditorPanel({
  transitions,
  onSetPosition,
  onSetHalfSize,
  onSetTargetScene,
  onMoveToPlayer,
  onAddTransition,
  onRemoveTransition,
  sceneOptions,
}: {
  transitions: GameSceneTransition[];
  onSetPosition: (id: string, axis: 0 | 1 | 2, value: number) => void;
  onSetHalfSize: (id: string, axis: 0 | 1 | 2, value: number) => void;
  onSetTargetScene: (id: string, targetSceneId: string) => void;
  onMoveToPlayer: (id: string) => void;
  onAddTransition: (transition: GameSceneTransition) => void;
  onRemoveTransition: (id: string) => void;
  sceneOptions: Array<{ label: string; value: string }>;
}) {
  const [selectedTransitionId, setSelectedTransitionId] = useState<string>("");
  const effectiveSelectedTransitionId = useMemo(() => {
    if (transitions.length === 0) return "";
    const stillExists = transitions.some((t) => t.id === selectedTransitionId);
    return stillExists ? selectedTransitionId : transitions[0].id;
  }, [transitions, selectedTransitionId]);

  const selectedTransition = useMemo(
    () => transitions.find((t) => t.id === effectiveSelectedTransitionId) ?? null,
    [effectiveSelectedTransitionId, transitions],
  );

  const transitionOptions = useMemo(
    () => transitions.map((t, index) => ({ label: `${index + 1}. ${t.targetSceneId}`, value: t.id })),
    [transitions],
  );

  const transitionsJson = useMemo(() => JSON.stringify(transitions, null, 2), [transitions]);
  const [copyLabel, setCopyLabel] = useState("Copiar JSON transiciones");

  const handleCopyJson = useCallback(async () => {
    try {
      await browserClipboardAdapter.writeText(transitionsJson);
      setCopyLabel("Copiado");
      browserTimerAdapter.setTimeout(
        () => setCopyLabel("Copiar JSON transiciones"),
        1200,
      );
    } catch {
      setCopyLabel("Sin portapapeles");
      browserTimerAdapter.setTimeout(
        () => setCopyLabel("Copiar JSON transiciones"),
        1200,
      );
    }
  }, [transitionsJson]);

  const handleAddTransition = useCallback(() => {
    const newId = `transition-${Date.now()}`;
    const newTransition: GameSceneTransition = {
      id: newId,
      kind: "collision",
      position: [0, 0, 0],
      halfSize: [1, 1, 1],
      targetSceneId: sceneOptions[0]?.value ?? "scene1",
    };
    onAddTransition(newTransition);
    setSelectedTransitionId(newId);
  }, [onAddTransition, sceneOptions]);

  return (
    <div style={{ display: "grid", gap: "10px" }}>
      <span style={{ fontSize: "10px", lineHeight: "1.5", opacity: 0.85 }}>
        Define zonas de colisión que disparan cambios de escena. El jugador entra automáticamente al cruzar.
      </span>
      <DebugButton label="Agregar nueva transición" onClick={handleAddTransition} />
      <DebugButton label={copyLabel} onClick={handleCopyJson} />

      {transitions.length === 0 && (
        <span style={{ fontSize: "10px", lineHeight: "1.5", opacity: 0.85 }}>
          No hay transiciones de escena en esta escena.
        </span>
      )}

      {transitions.length > 0 && (
        <>
          <PixelSelect
            label="Transición seleccionada"
            value={effectiveSelectedTransitionId}
            onChange={(value) => setSelectedTransitionId(value)}
            options={transitionOptions}
          />

          {selectedTransition && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                <DebugNumberInput
                  label="Pos X"
                  value={selectedTransition.position[0]}
                  onChange={(value) => onSetPosition(selectedTransition.id, 0, value)}
                />
                <DebugNumberInput
                  label="Pos Y"
                  value={selectedTransition.position[1]}
                  onChange={(value) => onSetPosition(selectedTransition.id, 1, value)}
                />
                <DebugNumberInput
                  label="Pos Z"
                  value={selectedTransition.position[2]}
                  onChange={(value) => onSetPosition(selectedTransition.id, 2, value)}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                <DebugNumberInput
                  label="Half X"
                  value={selectedTransition.halfSize[0]}
                  onChange={(value) => onSetHalfSize(selectedTransition.id, 0, value)}
                />
                <DebugNumberInput
                  label="Half Y"
                  value={selectedTransition.halfSize[1]}
                  onChange={(value) => onSetHalfSize(selectedTransition.id, 1, value)}
                />
                <DebugNumberInput
                  label="Half Z"
                  value={selectedTransition.halfSize[2]}
                  onChange={(value) => onSetHalfSize(selectedTransition.id, 2, value)}
                />
              </div>

              <PixelSelect
                label="Escena destino"
                value={selectedTransition.targetSceneId}
                onChange={(value) => onSetTargetScene(selectedTransition.id, value)}
                options={sceneOptions}
              />

              <DebugButton label="Mover a posición del jugador" onClick={() => onMoveToPlayer(selectedTransition.id)} />
              <DebugButton label="Eliminar transición" onClick={() => onRemoveTransition(selectedTransition.id)} />
            </>
          )}
        </>
      )}
    </div>
  );
}
