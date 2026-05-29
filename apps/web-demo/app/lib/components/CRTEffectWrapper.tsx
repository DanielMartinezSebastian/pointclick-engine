'use client';

import CRTEffect from 'vault66-crt-effect';
import 'vault66-crt-effect/dist/vault66-crt-effect.css';
import { ReactNode } from 'react';

interface CRTEffectWrapperProps {
  children: ReactNode;
}

export function CRTEffectWrapper({ children }: CRTEffectWrapperProps) {
  return (
    <CRTEffect
      preset="arcade"
      enabled={true}
      scanlineOpacity={0.6}
      scanlineThickness={3}
      scanlineGap={2}
      enableGlow={true}
      glowColor="rgba(0, 255, 100, 0.5)"
      enableFlicker={true}
      flickerIntensity={0.15}
      enableSweep={true}
      sweepDuration={8}
    >
      {children}
    </CRTEffect>
  );
}
