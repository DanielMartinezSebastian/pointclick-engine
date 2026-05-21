"use client";

import { useEffect, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";

export type InventoryStack = {
  id: string;
  name: string;
  spriteUrl: string;
  quantity: number;
};

export type InventorySlots = Array<InventoryStack | null>;

function slotStyle(occupied: boolean): CSSProperties {
  return {
    width: "100%",
    aspectRatio: "1 / 1",
    minWidth: 0,
    border: "2px solid rgb(185 216 255 / 55%)",
    borderRadius: "8px",
    background: occupied ? "rgb(18 31 55 / 90%)" : "rgb(10 16 30 / 80%)",
    display: "grid",
    placeItems: "center",
    position: "relative",
    padding: "0",
    cursor: occupied ? "grab" : "default",
    touchAction: "none",
  };
}

export function InventoryUI({
  isOpen,
  slots,
  onToggle,
  onStartDrag,
}: {
  isOpen: boolean;
  slots: InventorySlots;
  onToggle: () => void;
  onStartDrag: (slotIndex: number, clientX: number, clientY: number) => void;
}) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const apply = () => setIsMobile(mediaQuery.matches);
    apply();
    mediaQuery.addEventListener("change", apply);
    return () => {
      mediaQuery.removeEventListener("change", apply);
    };
  }, []);

  const handlePointerDown = (event: ReactPointerEvent<HTMLButtonElement>, slotIndex: number) => {
    if (event.button !== 0) return;
    event.preventDefault();
    onStartDrag(slotIndex, event.clientX, event.clientY);
  };

  return (
    <>
      <button
        type="button"
        onClick={onToggle}
        aria-label={isOpen ? "Cerrar inventario" : "Abrir inventario"}
        style={{
          position: "absolute",
          left: "18px",
          bottom: "18px",
          transform: undefined,
          width: "84px",
          height: "84px",
          border: "none",
          borderRadius: "0",
          background: "transparent",
          boxShadow: "none",
          display: "grid",
          placeItems: "center",
          zIndex: 40,
          cursor: "pointer",
        }}
      >
        <img
          src="/assets/backpack/rotations/south.png"
          alt="Inventario"
          style={{ width: "62px", height: "62px", imageRendering: "pixelated" }}
        />
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            left: isMobile ? "50%" : "18px",
            bottom: isMobile ? "118px" : "118px",
            transform: isMobile ? "translateX(-50%)" : undefined,
            zIndex: 41,
            border: "2px solid rgb(188 225 255 / 75%)",
            borderRadius: isMobile ? "14px" : "12px",
            background: "rgb(5 10 20 / 92%)",
            boxShadow: "0 18px 36px rgb(0 0 0 / 35%)",
            padding: isMobile ? "16px 18px" : "14px",
            width: isMobile ? "min(92vw, 420px)" : "236px",
          }}
        >
          <strong style={{ color: "#d8ecff", fontSize: "12px", letterSpacing: "0.6px" }}>
            Inventario
          </strong>

          <div
            style={{
              marginTop: "10px",
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: isMobile ? "10px" : "8px",
            }}
          >
            {slots.map((stack, index) => (
              <button
                key={`slot-${index}`}
                type="button"
                onPointerDown={(event) => handlePointerDown(event, index)}
                style={slotStyle(Boolean(stack))}
                aria-label={stack ? `Slot ${index + 1}: ${stack.name}` : `Slot ${index + 1} vacio`}
              >
                {stack && (
                  <>
                    <img
                      src={stack.spriteUrl}
                      alt={stack.name}
                      style={{
                        width: isMobile ? "62%" : "44px",
                        height: isMobile ? "62%" : "44px",
                        imageRendering: "pixelated",
                        pointerEvents: "none",
                      }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        right: "4px",
                        bottom: "3px",
                        color: "#e7f4ff",
                        textShadow: "0 1px 4px rgb(0 0 0 / 70%)",
                        fontSize: "11px",
                        pointerEvents: "none",
                      }}
                    >
                      x{stack.quantity}
                    </span>
                  </>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export function DraggedInventoryGhost({
  stack,
  initialPointerX,
  initialPointerY,
}: {
  stack: InventoryStack;
  initialPointerX: number;
  initialPointerY: number;
}) {
  const [pointer, setPointer] = useState({ x: initialPointerX, y: initialPointerY });

  useEffect(() => {
    setPointer({ x: initialPointerX, y: initialPointerY });
  }, [initialPointerX, initialPointerY]);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      setPointer({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener("pointermove", handlePointerMove);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        left: `${pointer.x}px`,
        top: `${pointer.y}px`,
        transform: "translate(-50%, -50%)",
        width: "68px",
        height: "68px",
        display: "grid",
        placeItems: "center",
        pointerEvents: "none",
        zIndex: 90,
      }}
    >
      <img
        src={stack.spriteUrl}
        alt={stack.name}
        style={{ width: "46px", height: "46px", imageRendering: "pixelated", pointerEvents: "none" }}
      />
    </div>
  );
}