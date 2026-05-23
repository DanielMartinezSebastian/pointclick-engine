"use client";

import gsap from "gsap";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";

import { browserTimerAdapter, type TimerHandle } from "../lib/platform-web";

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
    border: "3px solid rgb(132 230 255 / 78%)",
    borderRadius: "4px",
    background: occupied
      ? "linear-gradient(180deg, rgb(26 82 112 / 100%) 0%, rgb(10 32 48 / 100%) 100%)"
      : "linear-gradient(180deg, rgb(8 18 30 / 100%) 0%, rgb(5 11 20 / 100%) 100%)",
    boxShadow: "inset 0 0 0 2px rgb(255 255 255 / 6%), inset 0 -3px 0 rgb(0 0 0 / 24%), 0 3px 0 rgb(0 0 0 / 24%)",
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
  const [isMobileCloseSpinRunning, setIsMobileCloseSpinRunning] = useState(false);
  const [isBackpackHoverSpinRunning, setIsBackpackHoverSpinRunning] = useState(false);
  const [isPickupSpinRunning, setIsPickupSpinRunning] = useState(false);
  const [isPanelRendered, setIsPanelRendered] = useState(isOpen);
  const previousOpenRef = useRef(isOpen);
  const previousItemCountRef = useRef<number | null>(null);
  const backpackSpinIntervalRef = useRef<TimerHandle | null>(null);
  const backpackSpinStartTimeoutRef = useRef<TimerHandle | null>(null);
  const backpackSpinTokenRef = useRef(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelTweenRef = useRef<gsap.core.Tween | null>(null);

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

  const clearBackpackSpinInterval = useCallback(() => {
    if (backpackSpinIntervalRef.current !== null) {
      browserTimerAdapter.clearInterval(backpackSpinIntervalRef.current);
      backpackSpinIntervalRef.current = null;
    }
  }, []);

  const resetBackpackSpinFlags = useCallback(() => {
    setIsMobileOpenSpinRunning(false);
    setIsMobileCloseSpinRunning(false);
    setIsBackpackHoverSpinRunning(false);
    setIsPickupSpinRunning(false);
  }, []);

  const animatePanel = useCallback(
    (open: boolean) => {
      if (!panelRef.current) return;

      panelTweenRef.current?.kill();

      const transformOrigin = isMobile ? "50% 100%" : "0% 100%";

      panelTweenRef.current = gsap.fromTo(
        panelRef.current,
        {
          opacity: open ? 0 : 1,
          y: open ? 18 : 0,
          scale: open ? 0.92 : 1,
          transformOrigin,
        },
        {
          opacity: open ? 1 : 0,
          y: open ? 0 : 18,
          scale: open ? 1 : 0.92,
          duration: open ? 0.34 : 0.24,
          ease: open ? "back.out(1.7)" : "back.in(1.7)",
          onComplete: () => {
            if (!open) {
              setIsPanelRendered(false);
            }
          },
        },
      );
    },
    [isMobile],
  );

  const startBackpackSpin = useCallback(
    (direction: 1 | -1, setRunning: (value: boolean) => void) => {
      backpackSpinTokenRef.current += 1;
      const spinToken = backpackSpinTokenRef.current;

      clearBackpackSpinInterval();
      if (backpackSpinStartTimeoutRef.current !== null) {
        browserTimerAdapter.clearTimeout(backpackSpinStartTimeoutRef.current);
        backpackSpinStartTimeoutRef.current = null;
      }

      backpackSpinStartTimeoutRef.current = browserTimerAdapter.setTimeout(() => {
        if (backpackSpinTokenRef.current !== spinToken) {
          return;
        }

        resetBackpackSpinFlags();
        setRunning(true);

        let steps = 0;
        const totalSteps = BACKPACK_ROTATION_FRAMES.length;

        const intervalId = browserTimerAdapter.setInterval(() => {
          if (backpackSpinTokenRef.current !== spinToken) {
            browserTimerAdapter.clearInterval(intervalId);
            return;
          }

          steps += 1;
          setBackpackFrameIndex((current) => (current + direction + BACKPACK_ROTATION_FRAMES.length) % BACKPACK_ROTATION_FRAMES.length);

          if (steps >= totalSteps) {
            browserTimerAdapter.clearInterval(intervalId);
            backpackSpinIntervalRef.current = null;
            setBackpackFrameIndex(BACKPACK_NORMAL_FRAME_INDEX);
            setRunning(false);
          }
        }, 75);

        backpackSpinIntervalRef.current = intervalId;
        backpackSpinStartTimeoutRef.current = null;
      }, 0);

      return () => {
        if (backpackSpinTokenRef.current !== spinToken) {
          return;
        }

        if (backpackSpinStartTimeoutRef.current !== null) {
          browserTimerAdapter.clearTimeout(backpackSpinStartTimeoutRef.current);
          backpackSpinStartTimeoutRef.current = null;
        }

        clearBackpackSpinInterval();
        setBackpackFrameIndex(BACKPACK_NORMAL_FRAME_INDEX);
        setRunning(false);
      };
    },
    [clearBackpackSpinInterval, resetBackpackSpinFlags],
  );

  useEffect(() => {
    if (
      isMobile ||
      isOpen ||
      !isBackpackHovered ||
      isMobileOpenSpinRunning ||
      isMobileCloseSpinRunning ||
      isPickupSpinRunning ||
      isBackpackHoverSpinRunning
    ) {
      return;
    }

    return startBackpackSpin(1, setIsBackpackHoverSpinRunning);
  }, [
    isBackpackHoverSpinRunning,
    isBackpackHovered,
    isMobile,
    isMobileCloseSpinRunning,
    isMobileOpenSpinRunning,
    isOpen,
    isPickupSpinRunning,
    startBackpackSpin,
  ]);

  useEffect(() => {
    const wasOpen = previousOpenRef.current;

    if (!isMobile || wasOpen === isOpen) {
      return;
    }

    previousOpenRef.current = isOpen;

    if (isOpen) {
      return startBackpackSpin(1, setIsMobileOpenSpinRunning);
    }

    return startBackpackSpin(-1, setIsMobileCloseSpinRunning);
  }, [isMobile, isOpen, startBackpackSpin]);

  useEffect(() => {
    const totalItems = slots.reduce((count, slot) => count + (slot ? slot.quantity : 0), 0);
    const previousItemCount = previousItemCountRef.current;
    previousItemCountRef.current = totalItems;

    if (previousItemCount === null || totalItems <= previousItemCount) {
      return;
    }

    return startBackpackSpin(1, setIsPickupSpinRunning);
  }, [slots, startBackpackSpin]);

  useEffect(() => {
    if (isOpen) {
      if (!isPanelRendered) {
        const animationFrameId = window.requestAnimationFrame(() => {
          setIsPanelRendered(true);
        });

        return () => {
          window.cancelAnimationFrame(animationFrameId);
        };
      }

      animatePanel(true);
      return;
    }

    if (isPanelRendered) {
      animatePanel(false);
    }
  }, [animatePanel, isOpen, isPanelRendered]);

  useEffect(() => {
    return () => {
      panelTweenRef.current?.kill();
    };
  }, []);

  const backpackSpriteSrc =
    isMobileOpenSpinRunning ||
    isMobileCloseSpinRunning ||
    isBackpackHoverSpinRunning ||
    isPickupSpinRunning ||
    (!isOpen && isBackpackHovered)
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
        <Image
          src={backpackSpriteSrc}
          alt="Inventario"
          width={isMobile ? 62 : 93}
          height={isMobile ? 62 : 93}
          unoptimized
          style={{
            width: isMobile ? "62px" : "93px",
            height: isMobile ? "62px" : "93px",
            imageRendering: "pixelated",
          }}
        />
      </button>
      {isPanelRendered && (
        <div
          style={{
            position: "absolute",
            left: isMobile ? "50%" : "18px",
            bottom: isMobile ? "118px" : "118px",
            transform: isMobile ? "translateX(-50%)" : undefined,
            zIndex: 41,
          }}
        >
          <div
            ref={panelRef}
            style={{
              position: "relative",
              border: "4px solid rgb(140 227 255 / 88%)",
              borderRadius: isMobile ? "8px" : "6px",
              background: "linear-gradient(180deg, rgb(10 29 45 / 100%) 0%, rgb(4 11 18 / 100%) 100%)",
              boxShadow:
                "0 16px 0 rgb(0 0 0 / 26%), 0 18px 36px rgb(0 0 0 / 35%), inset 0 0 0 2px rgb(255 255 255 / 8%), inset 0 -4px 0 rgb(0 0 0 / 18%)",
              padding: isMobile ? "16px 18px" : "14px",
              width: isMobile ? "min(calc(100vw - 56px), 420px)" : "236px",
            }}
          >
            <button
              type="button"
              onClick={onToggle}
              aria-label="Cerrar inventario"
              style={{
                position: "absolute",
                top: isMobile ? "-18px" : "-16px",
                right: isMobile ? "-18px" : "-16px",
                width: isMobile ? "34px" : "30px",
                height: isMobile ? "34px" : "30px",
                border: "3px solid rgb(95 16 20 / 100%)",
                borderRadius: "999px",
                background: "linear-gradient(180deg, rgb(255 110 120 / 100%) 0%, rgb(173 31 44 / 100%) 100%)",
                color: "#fff3f3",
                boxShadow: "0 3px 0 rgb(0 0 0 / 26%), inset 0 0 0 2px rgb(255 255 255 / 16%)",
                display: "grid",
                placeItems: "center",
                fontSize: isMobile ? "18px" : "16px",
                lineHeight: 1,
                fontWeight: 900,
                textShadow: "0 2px 0 rgb(0 0 0 / 35%)",
                cursor: "pointer",
                zIndex: 3,
                padding: 0,
              }}
            >
              X
            </button>

            <strong
              style={{
                color: "#bff4ff",
                fontSize: "18px",
                letterSpacing: "1.5px",
                display: "block",
                width: "100%",
                textAlign: "center",
                textTransform: "uppercase",
                textShadow: "0 3px 0 rgb(0 0 0 / 36%)",
                borderBottom: "2px solid rgb(132 230 255 / 75%)",
                paddingBottom: "4px",
              }}
            >
              Inventario
            </strong>

            <div
              style={{
                marginTop: "10px",
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: isMobile ? "10px" : "9px",
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
                      <div
                        style={{
                          position: "relative",
                          width: isMobile ? "62%" : "44px",
                          height: isMobile ? "62%" : "44px",
                          pointerEvents: "none",
                        }}
                      >
                        <Image
                          src={stack.spriteUrl}
                          alt={stack.name}
                          fill
                          sizes={isMobile ? "62px" : "44px"}
                          unoptimized
                          style={{
                            objectFit: "contain",
                            imageRendering: "pixelated",
                            pointerEvents: "none",
                          }}
                        />
                      </div>
                      {stack.quantity > 1 && (
                        <span
                          style={{
                            position: "absolute",
                            right: "4px",
                            bottom: "3px",
                            fontSize: "12px",
                            color: "#d9fbff",
                            textShadow: "0 2px 0 rgb(0 0 0 / 50%)",
                            pointerEvents: "none",
                          }}
                        >
                          x{stack.quantity}
                        </span>
                      )}
                    </>
                  )}
                </button>
              ))}
            </div>
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
        width: "92px",
        height: "92px",
        display: "grid",
        placeItems: "center",
        pointerEvents: "none",
        zIndex: 90,
      }}
    >
      <Image
        src={stack.spriteUrl}
        alt={stack.name}
        width={64}
        height={64}
        unoptimized
        style={{
          width: "64px",
          height: "64px",
          objectFit: "contain",
          imageRendering: "pixelated",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}