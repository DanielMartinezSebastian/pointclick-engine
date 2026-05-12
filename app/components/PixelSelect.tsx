"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "pixelarticons/react";

interface PixelSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  label?: string;
}

export default function PixelSelect({
  value,
  onChange,
  options,
  label,
}: PixelSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen]);

  return (
    <div style={{ display: "grid", gap: "6px", cursor: "none" }} ref={containerRef}>
      {label && (
        <label
          style={{
            fontSize: "11px",
            letterSpacing: "1px",
            textTransform: "uppercase",
            fontWeight: "bold",
          }}
        >
          {label}
        </label>
      )}

      <div style={{ position: "relative" }}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            width: "100%",
            borderRadius: "2px",
            border: "2px solid #00ff41",
            background: "rgb(8 12 32 / 90%)",
            color: "#00ff41",
            padding: "0.6rem 0.8rem",
            fontSize: "12px",
            fontFamily: "var(--font-pixel), monospace",
            letterSpacing: "1px",
            boxShadow: "inset 0 0 4px rgba(0, 255, 65, 0.2), 0 0 8px rgba(0, 255, 65, 0.2)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "8px",
            textAlign: "left",
            cursor: "none",
          }}
        >
          <span>{selectedOption?.label || "Seleccionar..."}</span>
          <ChevronDown
            width={16}
            height={16}
            fill="#00ff41"
            style={{
              transform: isOpen ? "rotateZ(180deg)" : "rotateZ(0deg)",
              transition: "transform 0.2s",
            }}
          />
        </button>

        {isOpen && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              marginTop: "4px",
              border: "2px solid #00ff41",
              borderRadius: "2px",
              background: "rgb(8 12 32 / 95%)",
              boxShadow:
                "0 0 16px rgba(0, 255, 65, 0.3), inset 0 0 4px rgba(0, 255, 65, 0.1)",
              zIndex: 1000,
              maxHeight: "200px",
              overflowY: "auto",
            }}
          >
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                style={{
                  width: "100%",
                  padding: "0.6rem 0.8rem",
                  border: "none",
                  background:
                    option.value === value
                      ? "rgba(0, 255, 65, 0.2)"
                      : "transparent",
                  color: "#00ff41",
                  fontSize: "12px",
                  fontFamily: "var(--font-pixel), monospace",
                  letterSpacing: "1px",
                  textAlign: "left",
                  cursor: "none",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "rgba(0, 255, 65, 0.15)";
                }}
                onMouseLeave={(e) => {
                  if (option.value !== value) {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "transparent";
                  }
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
