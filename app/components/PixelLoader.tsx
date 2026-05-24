"use client";

import { useEffect, useState } from "react";

type PixelLoaderProps = {
  /** Cuando ready=true la barra completa al 100% y el overlay hace fade-out. */
  ready: boolean;
};

/**
 * Pantalla de carga pixel-art que cubre todo el viewport.
 *
 * - Mientras carga: barra avanza en pasos discretos (chunky pixel step) hasta ~78%.
 * - Cuando ready=true: barra salta a 100% y el overlay desaparece con fade-out.
 * - Se desmonta automáticamente tras el fade para no ocupar DOM.
 */
export function PixelLoader({ ready }: PixelLoaderProps) {
  const [visible, setVisible] = useState(true);
  // "filling" arranca con un delay mínimo para que la transición CSS se active
  const [filling, setFilling] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setFilling(true), 60);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => setVisible(false), 750);
    return () => clearTimeout(t);
  }, [ready]);

  if (!visible) return null;

  const barWidth = ready ? "100%" : filling ? "78%" : "0%";
  const barTransition = ready
    ? "width 0.18s steps(5, end)"
    : filling
      ? "width 3s steps(22, end)"
      : "none";

  return (
    <div
        aria-label="Cargando…"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          background: "#070d1f",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "2rem",
          opacity: ready ? 0 : 1,
          transition: "opacity 0.65s ease",
          pointerEvents: ready ? "none" : "all",
          fontFamily: "var(--font-pixel), 'Courier New', monospace",
          imageRendering: "pixelated",
        }}
      >

        {/* ── Título ──────────────────────────────────────────────── */}
        <div style={{ textAlign: "center", lineHeight: 1.3, userSelect: "none" }}>
          <p style={{
            margin: 0,
            fontSize: "clamp(1.8rem, 6vw, 2.8rem)",
            color: "#84e6ff",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            textShadow: "0 0 24px rgba(132,230,255,0.55), 0 0 48px rgba(132,230,255,0.2)",
          }}>
            POINT &amp; CLICK
          </p>
          <p style={{
            margin: "4px 0 0",
            fontSize: "0.72rem",
            color: "rgba(132,230,255,0.45)",
            letterSpacing: "0.42em",
            textTransform: "uppercase",
          }}>
            ENGINE DEMO
          </p>
        </div>

        {/* ── Barra de carga ───────────────────────────────────────── */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "10px",
          width: "clamp(200px, 48vw, 320px)",
        }}>

          {/* Contenedor exterior — borde pixel */}
          <div style={{
            width: "100%",
            height: "20px",
            background: "rgb(8 18 36)",
            border: "3px solid rgba(132,230,255,0.72)",
            boxShadow: [
              "inset 0 2px 0 rgba(0,0,0,0.55)",
              "inset 0 -1px 0 rgba(255,255,255,0.06)",
              "0 4px 0 rgba(0,0,0,0.55)",
              "0 0 14px rgba(132,230,255,0.12)",
            ].join(","),
            padding: "3px",
            boxSizing: "border-box",
          }}>
            {/* Relleno animado */}
            <div style={{
              height: "100%",
              width: barWidth,
              background: [
                "linear-gradient(90deg,",
                "  rgb(16 56 90) 0%,",
                "  rgb(32 108 160) 40%,",
                "  rgb(84 190 235) 75%,",
                "  rgb(132 230 255) 100%",
                ")",
              ].join(""),
              transition: barTransition,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.28), inset 0 -1px 0 rgba(0,0,0,0.3)",
            }} />
          </div>

          {/* Etiqueta "CARGANDO ..." con puntos animados */}
          <p style={{
            margin: 0,
            fontSize: "0.82rem",
            color: "rgba(132,230,255,0.65)",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            userSelect: "none",
          }}>
            {ready ? "LISTO" : (
              <>
                CARGANDO
                <span className="px-dot1">.</span>
                <span className="px-dot2">.</span>
                <span className="px-dot3">.</span>
              </>
            )}
          </p>
        </div>

        {/* ── Scanlines — textura pixel art ───────────────────────── */}
        <div style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)",
          pointerEvents: "none",
        }} />

        {/* ── Glow ambiental animado ───────────────────────────────── */}
        <div className="px-glow" style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(132,230,255,0.04) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

      </div>
  );
}
