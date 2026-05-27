"use client";

import { useEffect, useState } from "react";
import { getGameRuntime } from "../lib/engine/publicApi";
import type { GameCommand } from "../lib/engine/publicApi";

/**
 * Panel HTML/CSS puro que interactúa con el runtime via `executeCommand` / `on`.
 *
 * Este componente NO conoce React Three Fiber, el store interno ni ningún
 * tipo de R3F. Solo usa el handle `GameRuntime` — la misma API que usaría
 * un script JS externo, un iframe o un preload de Electron.
 */
export default function HtmlBridgePanel() {
  const [log, setLog] = useState<string[]>([]);

  useEffect(() => {
    const rt = getGameRuntime();
    if (!rt) return; // runtime not ready — subscriptions will attach on next render

    const unsubs = [
      rt.on("scene:changed", (e) =>
        setLog((l) => [...l.slice(-9), `→ scene: ${e.sceneId}`]),
      ),
      rt.on("scene:respawnRequested", (e) =>
        setLog((l) => [...l.slice(-9), `↺ respawn in: ${e.sceneId}`]),
      ),
      rt.on("player:collided", (e) =>
        setLog((l) => [...l.slice(-9), `× collision (${e.reason})`]),
      ),
      rt.on("item:dropped", (e) =>
        setLog((l) => [...l.slice(-9), `↓ dropped: ${e.itemId} (${e.outcome})`]),
      ),
      rt.on("dialog:triggered", (e) =>
        setLog((l) => [...l.slice(-9), `💬 ${e.text.slice(0, 45)}`]),
      ),
    ];

    return () => unsubs.forEach((u) => u());
  }, []);

  function dispatch(cmd: GameCommand) {
    const rt = getGameRuntime();
    if (!rt) {
      setLog((l) => [...l.slice(-9), `⚠️ no runtime`]);
      return;
    }
    rt.executeCommand(cmd);
  }

  const btnStyle: React.CSSProperties = {
    display: "block",
    width: "100%",
    padding: "8px 12px",
    marginBottom: 8,
    fontFamily: "monospace",
    fontSize: 13,
    cursor: "pointer",
    border: "1px solid #555",
    borderRadius: 4,
    background: "#1a1a2e",
    color: "#e0e0ff",
  };

  return (
    <aside
      style={{
        padding: 16,
        fontFamily: "monospace",
        fontSize: 13,
        background: "#0d0d1a",
        color: "#c8c8e8",
        borderLeft: "1px solid #333",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      <h3 style={{ margin: "0 0 12px", color: "#fff", fontSize: 14 }}>
        Bridge panel (HTML → game)
      </h3>

      <p style={{ margin: "0 0 12px", color: "#888", fontSize: 11 }}>
        Buttons below call <code>runtime.executeCommand()</code> without any React
        state — the same way a plain JS script, Vue app, or Electron preload would.
      </p>

      <strong style={{ color: "#aaa", fontSize: 11 }}>Scene commands</strong>
      <button style={btnStyle} onClick={() => dispatch({ type: "scene:set", sceneId: "town" })}>
        scene:set → town
      </button>
      <button
        style={btnStyle}
        onClick={() => dispatch({ type: "scene:set", sceneId: "personalRoom" })}
      >
        scene:set → personalRoom
      </button>
      <button style={btnStyle} onClick={() => dispatch({ type: "scene:set", sceneId: "lavaAnimated" })}>
        scene:set → lavaAnimated
      </button>
      <button style={btnStyle} onClick={() => dispatch({ type: "scene:respawn" })}>
        scene:respawn
      </button>

      <strong style={{ color: "#aaa", fontSize: 11, marginTop: 8 }}>Player commands</strong>
      <button
        style={btnStyle}
        onClick={() => dispatch({ type: "player:move", position: [0, 0, 5] })}
      >
        player:move → [0, 0, 5]
      </button>
      <button
        style={btnStyle}
        onClick={() => dispatch({ type: "player:stop" })}
      >
        player:stop (not yet wired)
      </button>

      <strong style={{ color: "#aaa", fontSize: 11, marginTop: 8 }}>
        Event log (game → HTML)
      </strong>
      <div
        style={{
          flex: 1,
          marginTop: 4,
          padding: 8,
          background: "#050510",
          border: "1px solid #333",
          borderRadius: 4,
          minHeight: 140,
        }}
      >
        {log.length === 0 ? (
          <span style={{ color: "#555" }}>No events yet — interact with the game.</span>
        ) : (
          <ul style={{ margin: 0, padding: "0 0 0 14px" }}>
            {log.map((entry, i) => (
              <li key={i} style={{ marginBottom: 2, color: "#a0ffb0" }}>
                {entry}
              </li>
            ))}
          </ul>
        )}
      </div>

      <p style={{ margin: "8px 0 0", color: "#555", fontSize: 10 }}>
        Unrelated to R3F/React internals — just <code>getGameRuntime().on()</code> and
        <code>.executeCommand()</code>
      </p>
    </aside>
  );
}
