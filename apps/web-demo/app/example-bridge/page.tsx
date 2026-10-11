"use client";

import { useEffect, useState } from "react";
import {
  createGameRuntime,
  type GameRuntime,
} from "../lib/engine/publicApi";
import { DEMO_RUNTIME_CONFIG } from "../lib/engine/runtime/demoViewportOptions";
import GameTouchCanvas from "../components/GameTouchCanvas";
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
  // Mismo patrón que app/page.tsx: el canvas se monta cuando el runtime ya
  // existe, para que reciba los eventos desde el primer scene:changed.
  const [runtime, setRuntime] = useState<GameRuntime | null>(null);

  useEffect(() => {
    const created = createGameRuntime(DEMO_RUNTIME_CONFIG);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- publishes the external runtime handle so children mount only once it exists
    setRuntime(created);

    return () => {
      created.dispose();
      setRuntime(null);
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
        {runtime ? <GameTouchCanvas runtime={runtime} /> : null}
      </div>
      <HtmlBridgePanel />
    </div>
  );
}
