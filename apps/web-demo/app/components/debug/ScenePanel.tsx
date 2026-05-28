"use client";

import PixelSelect from "../PixelSelect";
import { DebugButton } from "./controls";

export function ScenePanel({
  sceneId,
  sceneOptions,
  onSceneChange,
  readyMessage,
  onRespawn,
  isDebugGroundVisible,
  onToggleGround,
  isDebugWallsVisible,
  onToggleWalls,
}: {
  sceneId: string;
  sceneOptions: Array<{ label: string; value: string }>;
  onSceneChange: (value: string) => void;
  readyMessage: string;
  onRespawn: () => void;
  isDebugGroundVisible: boolean;
  onToggleGround: () => void;
  isDebugWallsVisible: boolean;
  onToggleWalls: () => void;
}) {
  return (
    <>
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

      <DebugButton label="Reaparecer en spawn" onClick={onRespawn} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
        <DebugButton
          label={isDebugGroundVisible ? "Ocultar suelo" : "Mostrar suelo"}
          onClick={onToggleGround}
        />
        <DebugButton
          label={isDebugWallsVisible ? "Ocultar paredes" : "Mostrar paredes"}
          onClick={onToggleWalls}
        />
      </div>
    </>
  );
}
