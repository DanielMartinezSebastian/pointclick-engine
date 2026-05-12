"use client";

import { useEffect, useState } from "react";
import { CursorMinimal, Pointer } from "pixelarticons/react";

const INTERACTIVE_ELEMENTS = ["button", "a", "select", "input", "textarea", "label"];

export default function MouseCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(true);
  const [isOverInteractive, setIsOverInteractive] = useState(false);
  const [isDesktopPointer, setIsDesktopPointer] = useState(false);

  useEffect(() => {
    const hoverQuery = window.matchMedia("(hover: hover)");
    const pointerQuery = window.matchMedia("(pointer: fine)");

    const updatePointerMode = () => {
      // Cursor personalizado cuando el dispositivo actual soporta hover + puntero fino
      setIsDesktopPointer(hoverQuery.matches && pointerQuery.matches);
    };

    updatePointerMode();

    hoverQuery.addEventListener("change", updatePointerMode);
    pointerQuery.addEventListener("change", updatePointerMode);
    window.addEventListener("resize", updatePointerMode);

    return () => {
      hoverQuery.removeEventListener("change", updatePointerMode);
      pointerQuery.removeEventListener("change", updatePointerMode);
      window.removeEventListener("resize", updatePointerMode);
    };
  }, []);

  useEffect(() => {
    if (!isDesktopPointer) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      // Detectar si el mouse está sobre un elemento interactivo
      const target = e.target as HTMLElement;
      
      // Búsqueda más agresiva de elementos interactivos
      let isInteractive = 
        INTERACTIVE_ELEMENTS.includes(target.tagName.toLowerCase()) ||
        target.getAttribute("role") === "button" ||
        target.classList.contains("interactive");

      // Búsqueda en padres
      if (!isInteractive && target.parentElement) {
        let parent: HTMLElement | null = target.parentElement;
        while (parent && !isInteractive) {
          isInteractive =
            INTERACTIVE_ELEMENTS.includes(parent.tagName.toLowerCase()) ||
            parent.getAttribute("role") === "button" ||
            parent.classList.contains("interactive");
          parent = parent.parentElement;
        }
      }

      setIsOverInteractive(!!isInteractive);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
      setIsOverInteractive(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isVisible, isDesktopPointer]);

  if (!isDesktopPointer) {
    return null;
  }

  const IconComponent = isOverInteractive ? Pointer : CursorMinimal;

  return (
    <div
      style={{
        position: "fixed",
        left: `${position.x}px`,
        top: `${position.y}px`,
        pointerEvents: "none",
        transform: "translate(-2px, -2px)",
        opacity: isVisible ? 1 : 0,
        transition: "opacity 0.2s",
        zIndex: 9999,
      }}
    >
      <IconComponent size={24} color="#ffffff" />
    </div>
  );
}
