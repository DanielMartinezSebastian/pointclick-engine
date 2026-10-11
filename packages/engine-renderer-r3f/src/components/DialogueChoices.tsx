"use client";

import { useEffect, useRef, useState } from "react";

import { navigateChoices } from "../hooks/dialogueLogic";

export interface DialogueChoicesProps {
  choices: Array<{ index: number; text: string }>;
  onChoose(index: number): void;
}

/**
 * Lista de opciones por defecto: HTML sin estilos de la demo, `role="listbox"`.
 * Flechas mueven la seleccion, Enter/Espacio eligen, 1-9 eligen directamente.
 * Escucha el teclado en `window` porque con el dialogo activo la entrada del juego esta
 * bloqueada y el foco puede haber quedado en el canvas.
 */
export function DialogueChoices({ choices, onChoose }: DialogueChoicesProps) {
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const latest = useRef({ choices, active, onChoose });
  latest.current = { choices, active, onChoose };

  useEffect(() => {
    listRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const { choices: list, active: cur, onChoose: choose } = latest.current;
      const action = navigateChoices(e.key, cur, list.length);
      if (action.kind === "none") return;
      e.preventDefault();
      if (action.kind === "focus") setActive(action.position);
      else if (!e.repeat) choose(list[action.position]!.index);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (choices.length === 0) return null;
  const current = Math.min(active, choices.length - 1);

  return (
    <div
      ref={listRef}
      role="listbox"
      tabIndex={0}
      aria-label="dialogue"
      aria-activedescendant={`dialogue-choice-${choices[current]!.index}`}
      style={{
        position: "fixed",
        left: "50%",
        bottom: 24,
        transform: "translateX(-50%)",
        width: "min(560px, calc(100vw - 32px))",
        zIndex: 400,
        display: "flex",
        flexDirection: "column",
        background: "#101826",
        border: "1px solid #3a4f75",
        borderRadius: 6,
        padding: 4,
        outline: "none",
      }}
    >
      {choices.map((choice, position) => (
        <div
          key={choice.index}
          id={`dialogue-choice-${choice.index}`}
          role="option"
          aria-selected={position === current}
          data-choice-index={choice.index}
          onClick={() => onChoose(choice.index)}
          onPointerEnter={() => setActive(position)}
          style={{
            padding: "8px 12px",
            cursor: "pointer",
            color: "#e8f1ff",
            borderRadius: 4,
            background: position === current ? "#22324f" : "transparent",
          }}
        >
          {position < 9 ? `${position + 1}. ` : ""}
          {choice.text}
        </div>
      ))}
    </div>
  );
}
