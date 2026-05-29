import { GameViewport } from "./lib/engine/publicApi";
import { CRTEffectCustom } from "./lib/components/CRTEffectCustom";

export default function Home() {
  return (
    <CRTEffectCustom preset="arcade" scanlineOpacity={0.25}>
      <GameViewport />
    </CRTEffectCustom>
  );
}
