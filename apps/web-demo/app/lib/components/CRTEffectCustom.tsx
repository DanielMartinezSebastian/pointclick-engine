'use client';

import { ReactNode, CSSProperties } from 'react';
import './CRTEffectCustom.css';

interface CRTEffectCustomProps {
  children: ReactNode;
  preset?: 'arcade' | 'cyberpunk' | 'vt100' | 'fallout';
  scanlineOpacity?: number;
  glowColor?: string;
  vignetteOpacity?: number;
}

export function CRTEffectCustom({
  children,
  preset = 'arcade',
  scanlineOpacity = 0.2,
  glowColor = 'rgba(0, 255, 100, 0.08)',
  vignetteOpacity = 0.3,
}: CRTEffectCustomProps) {
  const presetStyles: Record<string, CSSProperties> = {
    arcade: {
      '--crt-scanline-opacity': '0.2',
      '--crt-glow-color': 'rgba(0, 255, 100, 0.08)',
      '--crt-vignette-opacity': '0.3',
    } as CSSProperties,
    cyberpunk: {
      '--crt-scanline-opacity': '0.25',
      '--crt-glow-color': 'rgba(255, 0, 255, 0.12)',
      '--crt-vignette-opacity': '0.4',
    } as CSSProperties,
    vt100: {
      '--crt-scanline-opacity': '0.3',
      '--crt-glow-color': 'rgba(0, 200, 0, 0.1)',
      '--crt-vignette-opacity': '0.25',
    } as CSSProperties,
    fallout: {
      '--crt-scanline-opacity': '0.15',
      '--crt-glow-color': 'rgba(0, 255, 0, 0.12)',
      '--crt-vignette-opacity': '0.35',
    } as CSSProperties,
  };

  const customStyles: CSSProperties = {
    ...presetStyles[preset],
    '--crt-scanline-opacity': scanlineOpacity,
    '--crt-glow-color': glowColor,
    '--crt-vignette-opacity': vignetteOpacity,
  } as CSSProperties;

  return (
    <div className="crt-custom-wrapper" style={customStyles}>
      <div className="crt-custom-scanlines"></div>
      <div className="crt-custom-glow"></div>
      <div className="crt-custom-vignette"></div>
      <div className="crt-custom-content">
        {children}
      </div>
    </div>
  );
}
