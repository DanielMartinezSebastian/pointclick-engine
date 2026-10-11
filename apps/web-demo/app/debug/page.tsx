"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { createGameRuntime, type GameRuntime } from "../lib/engine/publicApi";
import { DEMO_RUNTIME_CONFIG } from "../lib/engine/runtime/demoViewportOptions";
import GameTouchCanvas from "../components/GameTouchCanvas";

// Mismo patron que app/page.tsx: el runtime se crea en un efecto (con dispose en
// el cleanup) y el canvas se monta cuando ya existe. Asi /debug resuelve items,
// emite eventos y tiene audio, igual que el juego.
function DebugGame() {
  const [runtime, setRuntime] = useState<GameRuntime | null>(null);

  useEffect(() => {
    const created = createGameRuntime(DEMO_RUNTIME_CONFIG);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- publishes the external runtime handle so children mount only once it exists (children effects run before the parent's)
    setRuntime(created);

    return () => {
      created.dispose();
      setRuntime(null);
    };
  }, []);

  return runtime ? <GameTouchCanvas runtime={runtime} /> : null;
}

export default function DebugPage() {
  const isDebugEnabled = process.env.NEXT_PUBLIC_ENABLE_DEBUG === "true";
  const isProduction = process.env.NODE_ENV === "production";

  if (!isDebugEnabled || isProduction) {
    notFound();
  }

  return <DebugGame />;
}
