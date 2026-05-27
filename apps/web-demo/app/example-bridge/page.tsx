"use client";

import { useEffect } from "react";
import {
  GameViewport,
  createGameRuntime,
  type GameSceneConfig,
} from "../lib/engine/publicApi";
import { SCENES } from "../../demo-content/scenes/scenes";
import HtmlBridgePanel from "./HtmlBridgePanel";

/**
 * Página de ejemplo que demuestra la API bidireccional de Phase 4.
 *
 * El panel derecho (HTML puro) envía comandos al runtime y escucha eventos
 * del juego sin conocer React Three Fiber ni el store interno.
 *
 * Run: `npm run dev` → http://localhost:3000/example-bridge
 */
export default function ExampleBridgePage() {
  useEffect(() => {
    // Registrar escenas del demo en el runtime
    const runtime = createGameRuntime({
      scenes: Object.values(SCENES) as GameSceneConfig[],
    });

    return () => {
      runtime.dispose();
    };
  }, []);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 340px",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "relative" }}>
        <GameViewport />
      </div>
      <HtmlBridgePanel />
    </div>
  );
}
