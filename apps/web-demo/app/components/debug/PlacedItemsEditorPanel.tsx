"use client";

import { useCallback, useMemo, useState } from "react";

import { browserClipboardAdapter, browserTimerAdapter } from "../../lib/platform-web";
import type { PlacedSceneItem } from "../../lib/engine/types/gameRuntime";
import PixelSelect from "../PixelSelect";
import { DebugButton, DebugNumberInput } from "./controls";

export function PlacedItemsEditorPanel({
  items,
  onSetPosition,
  onMoveToPlayer,
  onRemove,
}: {
  items: PlacedSceneItem[];
  onSetPosition: (id: string, axis: 0 | 1 | 2, value: number) => void;
  onMoveToPlayer: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const effectiveSelectedItemId = useMemo(() => {
    if (items.length === 0) return "";
    const stillExists = items.some((item) => item.id === selectedItemId);
    return stillExists ? selectedItemId : items[0].id;
  }, [items, selectedItemId]);

  const selectedItem = useMemo(
    () => items.find((item) => item.id === effectiveSelectedItemId) ?? null,
    [effectiveSelectedItemId, items],
  );

  const itemOptions = useMemo(
    () => items.map((item, index) => ({ label: `${index + 1}. ${item.name}`, value: item.id })),
    [items],
  );

  const itemsJson = useMemo(() => JSON.stringify(items, null, 2), [items]);
  const [copyLabel, setCopyLabel] = useState("Copiar JSON items");

  const handleCopyJson = useCallback(async () => {
    try {
      await browserClipboardAdapter.writeText(itemsJson);
      setCopyLabel("Copiado");
      browserTimerAdapter.setTimeout(
        () => setCopyLabel("Copiar JSON items"),
        1200,
      );
    } catch {
      setCopyLabel("Sin portapapeles");
      browserTimerAdapter.setTimeout(
        () => setCopyLabel("Copiar JSON items"),
        1200,
      );
    }
  }, [itemsJson]);

  return (
    <div style={{ display: "grid", gap: "10px" }}>
      <span style={{ fontSize: "10px", lineHeight: "1.5", opacity: 0.85 }}>
        Reubica items ya colocados en vivo para ajustar su encaje exacto en la escena.
      </span>

      {items.length === 0 && (
        <span style={{ fontSize: "10px", lineHeight: "1.5", opacity: 0.85 }}>
          No hay items colocados en esta escena todavia.
        </span>
      )}

      {items.length > 0 && (
        <>
          <PixelSelect
            label="Item seleccionado"
            value={effectiveSelectedItemId}
            onChange={(value) => setSelectedItemId(value)}
            options={itemOptions}
          />

          {selectedItem && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                <DebugNumberInput
                  label="Pos X"
                  value={selectedItem.worldPosition[0]}
                  onChange={(value) => onSetPosition(selectedItem.id, 0, value)}
                />
                <DebugNumberInput
                  label="Pos Y"
                  value={selectedItem.worldPosition[1]}
                  onChange={(value) => onSetPosition(selectedItem.id, 1, value)}
                />
                <DebugNumberInput
                  label="Pos Z"
                  value={selectedItem.worldPosition[2]}
                  onChange={(value) => onSetPosition(selectedItem.id, 2, value)}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <DebugButton label="Mover al jugador" onClick={() => onMoveToPlayer(selectedItem.id)} />
                <DebugButton label="Borrar item" onClick={() => onRemove(selectedItem.id)} />
              </div>
            </>
          )}

          <textarea
            readOnly
            value={itemsJson}
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
