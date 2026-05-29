import { GameViewport } from "./lib/engine/publicApi";
import { CRTEffectWrapper } from "./lib/components/CRTEffectWrapper";

export default function Home() {
  return (
    <CRTEffectWrapper>
      <GameViewport />
    </CRTEffectWrapper>
  );
}
