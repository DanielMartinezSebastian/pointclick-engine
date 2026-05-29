import { GameViewport } from "./lib/engine/publicApi";
import { CRTEffectWrapper } from "./lib/components/CRTEffectWrapper";

export default function Home() {
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
