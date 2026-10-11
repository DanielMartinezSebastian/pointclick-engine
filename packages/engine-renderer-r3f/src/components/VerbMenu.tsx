"use client";

import { useEffect, useRef, type KeyboardEvent } from "react";
import type { GameSceneHotspot, Verb } from "@pointclick-engine/engine-core";

import { clampMenuPosition } from "../scene/hotspotLogic";

export interface VerbMenuProps {
  hotspot: GameSceneHotspot;
  verbs: Verb[];
  /** Pixeles de pantalla. */
  position: { x: number; y: number };
  /** Etiquetas ya traducidas. */
  labels: Record<Verb, string>;
  onSelect(verb: Verb): void;
  onClose(): void;
}

const ITEM_HEIGHT = 36;
const MENU_WIDTH = 150;

/** Menu de verbos por defecto: HTML sin estilos de la demo, accesible por teclado. */
export function VerbMenu({ hotspot, verbs, position, labels, onSelect, onClose }: VerbMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    menuRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
  }, []);

  // Click fuera cierra. Se registra tras el evento actual para no cerrarse con el click que lo abrio.
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) onClose();
    };
    const handle = window.setTimeout(() => window.addEventListener("pointerdown", onDown), 0);
    return () => {
      window.clearTimeout(handle);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [onClose]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
      return;
    }
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const items = Array.from(menuRef.current?.querySelectorAll<HTMLButtonElement>("button") ?? []);
    if (items.length === 0) return;
    const current = items.indexOf(document.activeElement as HTMLButtonElement);
    const step = e.key === "ArrowDown" ? 1 : -1;
    items[(current + step + items.length) % items.length]?.focus();
  };

  const viewport =
    typeof window === "undefined"
      ? { width: 1024, height: 768 }
      : { width: window.innerWidth, height: window.innerHeight };
  const { x, y } = clampMenuPosition(
    position,
    { width: MENU_WIDTH, height: verbs.length * ITEM_HEIGHT },
    viewport,
  );

  return (
    <div
      ref={menuRef}
      role="menu"
      aria-label={hotspot.id}
      data-hotspot-id={hotspot.id}
      onKeyDown={onKeyDown}
      style={{
        position: "fixed",
        left: x,
        top: y,
        width: MENU_WIDTH,
        zIndex: 400,
        display: "flex",
        flexDirection: "column",
        background: "#101826",
        border: "1px solid #3a4f75",
        borderRadius: 6,
        padding: 2,
      }}
    >
      {verbs.map((verb) => (
        <button
          key={verb}
          type="button"
          role="menuitem"
          data-verb={verb}
          onClick={() => onSelect(verb)}
          style={{
            height: ITEM_HEIGHT,
            background: "transparent",
            color: "#e8f1ff",
            border: 0,
            textAlign: "left",
            padding: "0 12px",
            cursor: "pointer",
            font: "inherit",
          }}
        >
          {labels[verb]}
        </button>
      ))}
    </div>
  );
}
