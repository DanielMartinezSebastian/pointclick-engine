'use client';

import { ReactNode, CSSProperties } from 'react';
import './CRTEffectWrapper.css';

interface CRTEffectWrapperProps {
  children: ReactNode;
  preset?: 'arcade' | 'cyberpunk' | 'fallout' | 'commodore64' | 'dos' | 'vt100' | 'atari' | 'sinclair';
  scanlineOpacity?: number;
  scanlineThickness?: number;
  scanlineGap?: number;
  enableGlow?: boolean;
  glowColor?: string;
  enableFlicker?: boolean;
  flickerIntensity?: number;
  enableSweep?: boolean;
  sweepDuration?: number;
}

const presetConfigs = {
  arcade: {
    glowColor: 'rgba(0, 255, 100, 0.1)',
    scanlineOpacity: 0.2,
  },
  cyberpunk: {
    glowColor: 'rgba(255, 0, 255, 0.15)',
    scanlineOpacity: 0.25,
  },
  fallout: {
    glowColor: 'rgba(0, 255, 0, 0.12)',
    scanlineOpacity: 0.15,
  },
  commodore64: {
    glowColor: 'rgba(0, 200, 255, 0.1)',
    scanlineOpacity: 0.3,
  },
  dos: {
    glowColor: 'rgba(0, 255, 100, 0.08)',
    scanlineOpacity: 0.18,
  },
  vt100: {
    glowColor: 'rgba(0, 200, 0, 0.12)',
    scanlineOpacity: 0.22,
  },
  atari: {
    glowColor: 'rgba(255, 100, 0, 0.1)',
    scanlineOpacity: 0.2,
  },
  sinclair: {
    glowColor: 'rgba(255, 255, 0, 0.08)',
    scanlineOpacity: 0.16,
  },
};

export function CRTEffectWrapper({
  children,
  preset = 'arcade',
  scanlineOpacity,
  scanlineThickness = 2,
  scanlineGap = 2,
  enableGlow = true,
  glowColor,
  enableFlicker = true,
  flickerIntensity = 0.1,
  enableSweep = true,
  sweepDuration = 12,
}: CRTEffectWrapperProps) {
  const config = presetConfigs[preset] || presetConfigs.arcade;
  const finalGlowColor = glowColor || config.glowColor;
  const finalScanlineOpacity = scanlineOpacity !== undefined ? scanlineOpacity : config.scanlineOpacity;

  const wrapperStyle = {
    '--crt-scanline-opacity': finalScanlineOpacity,
    '--crt-scanline-thickness': `${scanlineThickness}px`,
    '--crt-scanline-gap': `${scanlineGap}px`,
    '--crt-glow-color': finalGlowColor,
    '--crt-flicker-intensity': flickerIntensity,
    '--crt-sweep-duration': `${sweepDuration}s`,
  } as CSSProperties;

  return (
    <div
      className={`crt-wrapper ${enableFlicker ? 'flicker-on' : ''} ${enableSweep ? 'sweep-on' : ''}`}
      style={wrapperStyle}
    >
      {enableGlow && <div className="crt-glow"></div>}
      <div className="crt-scanlines"></div>
      <div className="crt-vignette"></div>
      <div className="crt-content">
        {children}
      </div>
    </div>
  );
}
