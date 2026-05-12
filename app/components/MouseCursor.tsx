"use client";

import { useEffect, useState } from "react";
import { CursorMinimal, Pointer } from "pixelarticons/react";

const INTERACTIVE_ELEMENTS = ["button", "a", "select", "input", "textarea", "label"];

export default function MouseCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(true);
  const [isOverInteractive, setIsOverInteractive] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      // Detectar si el mouse está sobre un elemento interactivo
      const target = e.target as HTMLElement;
      const isInteractive =
        INTERACTIVE_ELEMENTS.includes(target.tagName.toLowerCase()) ||
        target.getAttribute("role") === "button" ||
        target.closest("button") ||
        target.closest("select") ||
        target.closest("a") ||
        target.closest("[role='button']");

      setIsOverInteractive(!!isInteractive);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isVisible]);

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
