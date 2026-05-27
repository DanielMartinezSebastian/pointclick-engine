"use client";

import { useCallback, useMemo, useState } from "react";
import { MathUtils } from "three";

import PixelSelect from "../PixelSelect";
import { type WallToolMode } from "../../lib/engine/types/gameRuntime";
import { browserClipboardAdapter, browserTimerAdapter } from "../../lib/platform-web";
import { useSceneStore } from "@pointclick-engine/engine-core";
import { useSceneEditorStore } from "../../store/sceneEditorStore";
import { DebugButton, DebugNumberInput } from "./controls";
import { WallOpeningEditor } from "./WallOpeningEditor";

export function WallEditorPanel({
  wallToolMode,
  setWallToolMode,
  onResetPointTool,
}: {
  wallToolMode: WallToolMode;
  setWallToolMode: (mode: WallToolMode) => void;
  onResetPointTool: () => void;
}) {
  const sceneId = useSceneStore((s) => s.sceneId);
  const walls = useSceneStore((s) => s.scene.walls);
  const groundY = useSceneStore((s) => s.scene.ground.y);
  const playerPosition = useSceneStore((s) => s.playerPosition);
  const selectedWallIndex = useSceneEditorStore((s) => s.selectedWallIndex);
  const selectWall = useSceneEditorStore((s) => s.selectWall);
  const addWall = useSceneEditorStore((s) => s.addWall);
  const removeSelectedWall = useSceneEditorStore((s) => s.removeSelectedWall);
  const updateSelectedWall = useSceneEditorStore((s) => s.updateSelectedWall);
  const [copyLabel, setCopyLabel] = useState("Copiar JSON");

  const addOpeningToSelectedWall = useSceneEditorStore((s) => s.addOpeningToSelectedWall);
  const removeOpeningFromSelectedWall = useSceneEditorStore((s) => s.removeOpeningFromSelectedWall);
  const updateOpeningInSelectedWall = useSceneEditorStore((s) => s.updateOpeningInSelectedWall);
  const updateSelectedWallTextureUrl = useSceneEditorStore((s) => s.updateSelectedWallTextureUrl);
  const updateSelectedWallTexturePosition = useSceneEditorStore((s) => s.updateSelectedWallTexturePosition);

  const selectedWall = selectedWallIndex == null ? null : walls[selectedWallIndex] ?? null;
  const wallOptions = useMemo(
    () => walls.map((_, index) => ({ label: `Muro ${index + 1}`, value: String(index) })),
    [walls],
  );
  const wallsJson = useMemo(() => JSON.stringify(walls, null, 2), [walls]);

  const setWallPosition = useCallback((axis: 0 | 1 | 2, value: number) => {
    updateSelectedWall((wall) => {
      const position = [...wall.position] as [number, number, number];
      position[axis] = value;
      return { ...wall, position };
    });
  }, [updateSelectedWall]);

  const setWallHalfSize = useCallback((axis: 0 | 1 | 2, value: number) => {
    updateSelectedWall((wall) => {
      const halfSize = [...wall.halfSize] as [number, number, number];
      halfSize[axis] = Math.max(0.05, value);
      return { ...wall, halfSize };
    });
  }, [updateSelectedWall]);

  const setWallRotationDeg = useCallback((value: number) => {
    updateSelectedWall((wall) => ({
      ...wall,
      rotationY: (value * Math.PI) / 180,
    }));
  }, [updateSelectedWall]);

  const moveWallToPlayer = useCallback(() => {
    updateSelectedWall((wall) => ({
      ...wall,
      position: [playerPosition[0], groundY + wall.halfSize[1], playerPosition[2]],
    }));
  }, [groundY, playerPosition, updateSelectedWall]);

  const handleCopyJson = useCallback(async () => {
    try {
      await browserClipboardAdapter.writeText(wallsJson);
      setCopyLabel("Copiado");
      browserTimerAdapter.setTimeout(() => setCopyLabel("Copiar JSON"), 1200);
    } catch {
      setCopyLabel("Sin portapapeles");
      browserTimerAdapter.setTimeout(() => setCopyLabel("Copiar JSON"), 1200);
    }
  }, [wallsJson]);

  return (
    <div style={{ display: "grid", gap: "10px", paddingTop: "6px", borderTop: "2px solid rgb(0 255 65 / 30%)" }}>
      <strong style={{ fontSize: "12px", lineHeight: "1.4" }}>Editor de muros ({sceneId})</strong>
      <span style={{ fontSize: "10px", lineHeight: "1.5", opacity: 0.85 }}>
        Edicion en vivo solo en navegador. Usa copiar JSON para pegar el resultado en scenes.ts.
      </span>
      <span style={{ fontSize: "10px", lineHeight: "1.5", opacity: 0.85 }}>
        Arrastra el wireframe amarillo para mover. Los cubos azules cambian el largo y los rosas el grosor.
      </span>

      <PixelSelect
        label="Herramienta"
        value={wallToolMode}
        onChange={(value) => setWallToolMode(value as WallToolMode)}
        options={[
          { label: "Manual", value: "manual" },
          { label: "Por puntos", value: "points" },
        ]}
      />

      {wallToolMode === "points" && (
        <>
          <span style={{ fontSize: "10px", lineHeight: "1.5", opacity: 0.85 }}>
            Click 1: punto inicial. Click 2: punto final y se crea el muro. El punto final queda como nuevo inicio.
          </span>
          <DebugButton label="Cancelar trazo" onClick={onResetPointTool} />
        </>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
        <DebugButton label="Nuevo muro" onClick={addWall} />
        <DebugButton label="Borrar muro" onClick={removeSelectedWall} disabled={selectedWall == null} />
      </div>

      {walls.length > 0 && (
        <PixelSelect
          label="Muro seleccionado"
          value={selectedWallIndex == null ? "0" : String(selectedWallIndex)}
          onChange={(value) => selectWall(Number(value))}
          options={wallOptions}
        />
      )}

      {selectedWall && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
            <DebugNumberInput label="Pos X" value={selectedWall.position[0]} onChange={(value) => setWallPosition(0, value)} />
            <DebugNumberInput label="Pos Y" value={selectedWall.position[1]} onChange={(value) => setWallPosition(1, value)} />
            <DebugNumberInput label="Pos Z" value={selectedWall.position[2]} onChange={(value) => setWallPosition(2, value)} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
            <DebugNumberInput label="Half X" value={selectedWall.halfSize[0]} onChange={(value) => setWallHalfSize(0, value)} />
            <DebugNumberInput label="Half Y" value={selectedWall.halfSize[1]} onChange={(value) => setWallHalfSize(1, value)} />
            <DebugNumberInput label="Half Z" value={selectedWall.halfSize[2]} onChange={(value) => setWallHalfSize(2, value)} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            <DebugNumberInput
              label="Rot Y deg"
              value={MathUtils.radToDeg(selectedWall.rotationY ?? 0)}
              step={1}
              onChange={setWallRotationDeg}
            />
            <div style={{ display: "grid", alignItems: "end" }}>
              <DebugButton label="Mover al jugador" onClick={moveWallToPlayer} />
            </div>
          </div>

          {/* ── Texture (Phase 6) ───────────────────────────────────────── */}
          <div style={{ borderTop: "1px solid rgb(0 255 65 / 20%)", paddingTop: "6px" }}>
            <strong style={{ fontSize: "11px" }}>Textura del muro</strong>
          </div>
          <div>
            <label style={{ fontSize: "10px", opacity: 0.85, display: "block", marginBottom: "4px" }}>
              URL textura
            </label>
            <input
              type="text"
              value={selectedWall.textureUrl ?? ""}
              placeholder="/assets/wall-textures/my-wall.png"
              onChange={(e) => updateSelectedWallTextureUrl(e.target.value || undefined)}
              style={{
                width: "100%",
                background: "rgb(8 12 32 / 90%)",
                border: "2px solid #00ff41",
                color: "#00ff41",
                padding: "4px 6px",
                fontSize: "10px",
                fontFamily: "var(--font-pixel), monospace",
                borderRadius: "2px",
                boxSizing: "border-box",
              }}
            />
          </div>

          {selectedWall.textureUrl && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
              <DebugNumberInput
                label="Tex X"
                value={selectedWall.texturePosition?.[0] ?? 0}
                onChange={(v) => updateSelectedWallTexturePosition(0, v)}
              />
              <DebugNumberInput
                label="Tex Y"
                value={selectedWall.texturePosition?.[1] ?? 0}
                onChange={(v) => updateSelectedWallTexturePosition(1, v)}
              />
              <DebugNumberInput
                label="Tex Z"
                value={selectedWall.texturePosition?.[2] ?? 0}
                onChange={(v) => updateSelectedWallTexturePosition(2, v)}
              />
            </div>
          )}

          {/* ── Openings (Phase 6) ──────────────────────────────────────── */}
          <div style={{ borderTop: "1px solid rgb(0 255 65 / 20%)", paddingTop: "6px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong style={{ fontSize: "11px" }}>
                Openings ({selectedWall.openings?.length ?? 0})
              </strong>
              <DebugButton label="+ Agregar opening" onClick={addOpeningToSelectedWall} />
            </div>
          </div>

          {(selectedWall.openings ?? []).map((opening, oi) => (
            <WallOpeningEditor
              key={opening.id}
              opening={opening}
              index={oi}
              onUpdate={(updater) => updateOpeningInSelectedWall(opening.id, updater)}
              onRemove={() => removeOpeningFromSelectedWall(opening.id)}
            />
          ))}
        </>
      )}

      <textarea
        readOnly
        value={wallsJson}
        style={{
          width: "100%",
          minHeight: "120px",
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
