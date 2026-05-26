"use client";

import { useEffect, useRef, useState } from "react";
import { browserEnvironmentAdapter } from "../lib/platform-web";
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
    () => browserEnvironmentAdapter.matchMedia("(pointer: coarse)").matches,
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
        color: "#84e6ff",
        size: 72,
        restJoystick: true,
        threshold: 0.08,
      });

      managerRef.current = manager as unknown as JoystickManager;

      const baseElement = containerRef.current.querySelector(".nipple .back");
      const nippleElement = containerRef.current.querySelector(".nipple .front");
      const nippleRoot = containerRef.current.querySelector(".nipple");

      if (baseElement instanceof HTMLElement) {
        baseElement.style.background = "radial-gradient(circle at 35% 35%, rgb(132 230 255 / 24%) 0%, rgb(10 29 45 / 10%) 45%, rgb(4 11 18 / 0%) 72%)";
        baseElement.style.border = "3px solid rgb(140 227 255 / 34%)";
        baseElement.style.boxShadow = "inset 0 0 0 2px rgb(255 255 255 / 8%), 0 0 0 4px rgb(4 11 18 / 55%)";
      }

      if (nippleElement instanceof HTMLElement) {
        nippleElement.style.background = "linear-gradient(180deg, rgb(255 255 255 / 88%) 0%, rgb(132 230 255 / 78%) 45%, rgb(42 132 175 / 100%) 100%)";
        nippleElement.style.border = "3px solid rgb(255 255 255 / 24%)";
        nippleElement.style.boxShadow = "0 0 0 3px rgb(10 29 45 / 60%), 0 6px 18px rgb(0 0 0 / 28%)";
      }

      if (nippleRoot instanceof HTMLElement) {
        nippleRoot.style.filter = "drop-shadow(0 0 8px rgb(132 230 255 / 18%))";
      }

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
        bottom: "42px",
        right: "34px",
        width: "144px",
        height: "144px",
        zIndex: 100,
        // Evita que el navegador intercepte los toques del joystick
        touchAction: "none",
      }}
    />
  );
}
