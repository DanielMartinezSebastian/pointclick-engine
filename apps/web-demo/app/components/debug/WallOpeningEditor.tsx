"use client";

import { useCallback } from "react";

import type { GameSceneWallOpening } from "@pointclick-engine/engine-core";
import { DebugButton, DebugNumberInput } from "./controls";

/**
 * WallOpeningEditor – edits a single opening (door/window) within a wall.
 *
 * Shows position [X,Y,Z] and halfSize [SX,SY,SZ] inputs, plus a remove button.
 * All mutations are lifted up via callbacks (no direct store access here).
 */
export function WallOpeningEditor({
  opening,
  index,
  onUpdate,
  onRemove,
}: {
  opening: GameSceneWallOpening;
  index: number;
  onUpdate: (updater: (o: GameSceneWallOpening) => GameSceneWallOpening) => void;
  onRemove: () => void;
}) {
  const setPosition = useCallback(
    (axis: 0 | 1 | 2, value: number) => {
      onUpdate((o) => {
        const position = [...o.position] as [number, number, number];
        position[axis] = value;
        return { ...o, position };
      });
    },
    [onUpdate],
  );

  const setHalfSize = useCallback(
    (axis: 0 | 1 | 2, value: number) => {
      onUpdate((o) => {
        const halfSize = [...o.halfSize] as [number, number, number];
        halfSize[axis] = Math.max(0.05, value);
        return { ...o, halfSize };
      });
    },
    [onUpdate],
  );

  return (
    <div
      style={{
        display: "grid",
        gap: "6px",
        padding: "6px",
        border: "1px solid rgb(0 255 65 / 30%)",
        borderRadius: "2px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: "10px", opacity: 0.85 }}>
          Opening {index + 1} <span style={{ opacity: 0.5 }}>({opening.id})</span>
        </span>
        <DebugButton label="Eliminar" onClick={onRemove} />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "6px",
        }}
      >
        <DebugNumberInput
          label="Pos X"
          value={opening.position[0]}
          onChange={(v) => setPosition(0, v)}
        />
        <DebugNumberInput
          label="Pos Y"
          value={opening.position[1]}
          onChange={(v) => setPosition(1, v)}
        />
        <DebugNumberInput
          label="Pos Z"
          value={opening.position[2]}
          onChange={(v) => setPosition(2, v)}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "6px",
        }}
      >
        <DebugNumberInput
          label="Half X"
          value={opening.halfSize[0]}
          onChange={(v) => setHalfSize(0, v)}
        />
        <DebugNumberInput
          label="Half Y"
          value={opening.halfSize[1]}
          onChange={(v) => setHalfSize(1, v)}
        />
        <DebugNumberInput
          label="Half Z"
          value={opening.halfSize[2]}
          onChange={(v) => setHalfSize(2, v)}
        />
      </div>
    </div>
  );
}
