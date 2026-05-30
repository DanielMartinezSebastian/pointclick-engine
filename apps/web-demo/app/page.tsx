"use client";

import { useEffect } from "react";
import {
  GameViewport,
  createGameRuntime,
  type GameSceneConfig,
} from "./lib/engine/publicApi";
import { CRTEffectWrapper } from "./lib/components/CRTEffectWrapper";
import { SCENES } from "../demo-content/scenes/scenes";

export default function Home() {
  useEffect(() => {
    // Initialize game runtime with scenes
    const runtime = createGameRuntime({
      scenes: Object.values(SCENES) as GameSceneConfig[],
    });

    return () => {
      runtime.dispose();
    };
  }, []);

  return (
    <CRTEffectWrapper
      preset="atari"
      scanlineOpacity={0.1}
      // scanlineThickness={2}
      // scanlineGap={2}
      // enableGlow={true}
      // glowColor="rgba(0, 255, 100, 0.15)"
      // enableFlicker={true}
      // flickerIntensity={0.8}
      // enableSweep={true}
      // sweepDuration={12}
    >
      <GameViewport />
    </CRTEffectWrapper>
  );
}
