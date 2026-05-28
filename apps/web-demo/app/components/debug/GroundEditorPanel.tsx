"use client";

import { useCallback, useMemo, useState } from "react";

import { browserClipboardAdapter, browserTimerAdapter } from "../../lib/platform-web";
import { useSceneStore } from "@pointclick-engine/engine-core";
import { useSceneEditorStore } from "../../store/sceneEditorStore";
import { DebugButton, DebugNumberInput } from "./controls";

export function GroundEditorPanel() {
  const sceneId = useSceneStore((s) => s.sceneId);
  const ground = useSceneStore((s) => s.scene.ground);
  const updateGround = useSceneEditorStore((s) => s.updateGround);
  const [copyLabel, setCopyLabel] = useState("Copiar JSON suelo");

  const setGroundValue = useCallback((key: keyof typeof ground, value: number) => {
    updateGround((currentGround) => {
      const nextGround = { ...currentGround, [key]: value };

      if (nextGround.minX >= nextGround.maxX) {
        if (key === "minX") nextGround.minX = nextGround.maxX - 0.1;
        if (key === "maxX") nextGround.maxX = nextGround.minX + 0.1;
      }
      if (nextGround.minZ >= nextGround.maxZ) {
        if (key === "minZ") nextGround.minZ = nextGround.maxZ - 0.1;
        if (key === "maxZ") nextGround.maxZ = nextGround.minZ + 0.1;
      }

      return nextGround;
    });
  }, [updateGround]);

  const groundJson = useMemo(() => JSON.stringify(ground, null, 2), [ground]);

  const handleCopyJson = useCallback(async () => {
    try {
      await browserClipboardAdapter.writeText(groundJson);
      setCopyLabel("Copiado");
      browserTimerAdapter.setTimeout(() => setCopyLabel("Copiar JSON suelo"), 1200);
    } catch {
      setCopyLabel("Sin portapapeles");
      browserTimerAdapter.setTimeout(() => setCopyLabel("Copiar JSON suelo"), 1200);
    }
  }, [groundJson]);

  const width = (ground.maxX - ground.minX).toFixed(2);
  const depth = (ground.maxZ - ground.minZ).toFixed(2);

  return (
    <div style={{ display: "grid", gap: "10px" }}>
      <span style={{ fontSize: "10px", lineHeight: "1.5", opacity: 0.85 }}>
        Escena: <strong>{sceneId}</strong>. Cambios en vivo para ajustar el plano. Incluye límites y altura Y.
      </span>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px" }}>
        <DebugNumberInput label="minX" value={ground.minX} onChange={(value) => setGroundValue("minX", value)} />
        <DebugNumberInput label="maxX" value={ground.maxX} onChange={(value) => setGroundValue("maxX", value)} />
        <DebugNumberInput label="minZ" value={ground.minZ} onChange={(value) => setGroundValue("minZ", value)} />
        <DebugNumberInput label="maxZ" value={ground.maxZ} onChange={(value) => setGroundValue("maxZ", value)} />
      </div>

      <DebugNumberInput label="Y suelo" value={ground.y} onChange={(value) => setGroundValue("y", value)} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
        <span style={{ fontSize: "10px", opacity: 0.85 }}>Ancho: {width}</span>
        <span style={{ fontSize: "10px", opacity: 0.85 }}>Fondo: {depth}</span>
      </div>

      <textarea
        readOnly
        value={groundJson}
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
    </div>
  );
}
