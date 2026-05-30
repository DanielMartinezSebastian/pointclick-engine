"use client";

import { useSceneStore } from "@pointclick-engine/engine-core";
import { useState } from "react";

export function DebugCoordinatesPanel() {
  const playerPosition = useSceneStore((s) => s.playerPosition);
  const [copied, setCopied] = useState(false);

  const formatCoord = (pos: [number, number, number]) =>
    `[${pos[0].toFixed(2)}, ${pos[1].toFixed(2)}, ${pos[2].toFixed(2)}]`;

  const coordString = formatCoord(playerPosition);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(coordString);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "48px",
        background: "rgba(0, 0, 0, 0.8)",
        borderTop: "1px solid #444",
        display: "flex",
        alignItems: "center",
        paddingLeft: "16px",
        paddingRight: "16px",
        gap: "12px",
        fontFamily: "monospace",
        fontSize: "12px",
        color: "#0f0",
        zIndex: 9998,
      }}
    >
      <span>Player Pos:</span>
      <span style={{ opacity: 0.8 }}>{coordString}</span>
      <button
        onClick={copyToClipboard}
        style={{
          background: copied ? "#0f0" : "#333",
          color: copied ? "#000" : "#0f0",
          border: "1px solid #0f0",
          padding: "4px 8px",
          borderRadius: "2px",
          cursor: "pointer",
          fontSize: "11px",
          fontFamily: "monospace",
          fontWeight: copied ? "bold" : "normal",
          transition: "all 0.2s",
        }}
      >
        {copied ? "✓ Copied" : "Copy"}
      </button>
    </div>
  );
}
