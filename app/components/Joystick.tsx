"use client";

import { useEffect, useRef, useState } from "react";
import { useMobileInputStore } from "../store/mobileInputStore";

type JoystickMoveEvent = {
  data?: {
    vector?: {
      x: number;
      y: number;
    };
  };
};

type JoystickManager = {
  on: (eventName: string, handler: (event: JoystickMoveEvent) => void) => void;
  destroy: () => void;
};

/**
 * Joystick virtual estático usando nipplejs (importado dinámicamente para
 * evitar que nipplejs acceda a `window` durante SSR).
 *
 * Convención de ejes:
 *   nipplejs vector.x  > 0  → derecha  → gameX = +1 (east)
 *   nipplejs vector.y  > 0  → arriba   → gameZ = -1 (north, lejos de cámara)
 *   nipplejs vector.y  < 0  → abajo    → gameZ = +1 (south, hacia cámara)
 */
export default function Joystick() {
  const containerRef = useRef<HTMLDivElement>(null);
  const managerRef = useRef<JoystickManager | null>(null);

  // window está garantizado: este componente solo se monta en cliente
  // gracias al dynamic import con ssr:false en GameTouchCanvas.
  // Solo `pointer: coarse` identifica dispositivos táctiles reales;
  // `maxTouchPoints > 0` puede ser true en Windows/Chrome con ratón.
  const [isTouchDevice] = useState(
    () => window.matchMedia("(pointer: coarse)").matches,
  );

  useEffect(() => {
    if (!isTouchDevice) return;
    const el = containerRef.current;
    if (!el) return;

    let cancelled = false;

    // Importación dinámica: nipplejs accede a `window` en module load,
    // por lo que no se puede importar estáticamente en un entorno SSR.
    void import("nipplejs").then(({ create }) => {
      if (cancelled || !containerRef.current) return;

      const manager = create({
        zone: containerRef.current,
        mode: "static",
        position: { right: "20%", bottom: "20%" },
        color: "skyblue",
        size: 50,
        restJoystick: true,
        threshold: 0.08,
      });

      managerRef.current = manager as unknown as JoystickManager;

      // trigger() llama al handler con { type, target, data: JoystickEventData }
      // JoystickEventData.vector: { x, y } normalizados en [-1, 1]
      manager.on("move", (evt: JoystickMoveEvent) => {
        const vector = evt?.data?.vector;
        if (!vector) return;
        // nipplejs y positivo = pantalla arriba = norte en el juego = z negativo
        useMobileInputStore.getState().setAxes(vector.x, -vector.y);
      });

      manager.on("end", () => {
        useMobileInputStore.getState().deactivate();
      });
    });

    return () => {
      cancelled = true;
      if (managerRef.current) {
        managerRef.current.destroy();
        managerRef.current = null;
      }
      useMobileInputStore.getState().deactivate();
    };
  }, [isTouchDevice]);

  // Nada que renderizar si no es un dispositivo táctil
  if (!isTouchDevice) return null;

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        bottom: "48px",
        right: "40px",
        width: "120px",
        height: "120px",
        zIndex: 100,
        // Evita que el navegador intercepte los toques del joystick
        touchAction: "none",
      }}
    />
  );
}
