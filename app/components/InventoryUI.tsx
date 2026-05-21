"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";

export type InventoryStack = {
  id: string;
  name: string;
  spriteUrl: string;
  quantity: number;
};

export type InventorySlots = Array<InventoryStack | null>;

const BACKPACK_ROTATION_FRAMES = [
  "/assets/backpack/rotations/south.png",
  "/assets/backpack/rotations/south-west.png",
  "/assets/backpack/rotations/west.png",
  "/assets/backpack/rotations/north-west.png",
  "/assets/backpack/rotations/north.png",
  "/assets/backpack/rotations/north-east.png",
  "/assets/backpack/rotations/east.png",
  "/assets/backpack/rotations/south-east.png",
] as const;

const BACKPACK_NORMAL_FRAME_INDEX = 0;

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
  const [isBackpackHovered, setIsBackpackHovered] = useState(false);
  const [backpackFrameIndex, setBackpackFrameIndex] = useState(BACKPACK_NORMAL_FRAME_INDEX);
  const [isMobileOpenSpinRunning, setIsMobileOpenSpinRunning] = useState(false);
  const wasOpenRef = useRef(isOpen);

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

  useEffect(() => {
    if (isMobile || isOpen || !isBackpackHovered || isMobileOpenSpinRunning) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setBackpackFrameIndex((current) => (current + 1) % BACKPACK_ROTATION_FRAMES.length);
    }, 90);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isBackpackHovered, isMobile, isMobileOpenSpinRunning, isOpen]);

  useEffect(() => {
    const wasOpen = wasOpenRef.current;
    wasOpenRef.current = isOpen;

    if (!isMobile || wasOpen || !isOpen) {
      return;
    }

    setIsMobileOpenSpinRunning(true);
    let steps = 0;
    const totalSteps = BACKPACK_ROTATION_FRAMES.length * 3;

    const intervalId = window.setInterval(() => {
      steps += 1;
      setBackpackFrameIndex((current) => (current + 1) % BACKPACK_ROTATION_FRAMES.length);

      if (steps >= totalSteps) {
        window.clearInterval(intervalId);
        setBackpackFrameIndex(BACKPACK_NORMAL_FRAME_INDEX);
        setIsMobileOpenSpinRunning(false);
      }
    }, 75);

    return () => {
      window.clearInterval(intervalId);
      setIsMobileOpenSpinRunning(false);
      setBackpackFrameIndex(BACKPACK_NORMAL_FRAME_INDEX);
    };
  }, [isMobile, isOpen]);

  const backpackSpriteSrc =
    isMobileOpenSpinRunning || (!isOpen && isBackpackHovered)
      ? BACKPACK_ROTATION_FRAMES[backpackFrameIndex]
      : BACKPACK_ROTATION_FRAMES[BACKPACK_NORMAL_FRAME_INDEX];

  return (
    <>
      <button
        type="button"
        onClick={onToggle}
        onPointerEnter={() => setIsBackpackHovered(true)}
        onPointerLeave={() => setIsBackpackHovered(false)}
        aria-label={isOpen ? "Cerrar inventario" : "Abrir inventario"}
        style={{
          position: "absolute",
          left: isMobile ? "22px" : "18px",
          bottom: isMobile ? "30px" : "18px",
          transform: undefined,
          width: isMobile ? "84px" : "126px",
          height: isMobile ? "84px" : "126px",
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
          src={backpackSpriteSrc}
          alt="Inventario"
          style={{
            width: isMobile ? "62px" : "93px",
            height: isMobile ? "62px" : "93px",
            imageRendering: "pixelated",
          }}
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