"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

import {
  useEditorModeStore,
  type EditorTabId,
  type PanelPosition,
} from "../../store/editorModeStore";

/**
 * Floating debug panel with a drag handle (the title bar).
 *
 * The panel stores its on-screen position in `editorModeStore` so it survives
 * remount cycles within the same browser session. Closing happens via the
 * tab bar (clicking the active tab again) or via the ✕ button.
 */
export function FloatingPanel({
  id,
  title,
  children,
  defaultPosition,
  width = 320,
  maxHeight = "calc(100vh - 120px)",
}: {
  id: EditorTabId;
  title: string;
  children: ReactNode;
  defaultPosition?: PanelPosition;
  width?: number | string;
  maxHeight?: string | number;
}) {
  const storedPosition = useEditorModeStore((s) => s.panelPositions[id]);
  const setPanelPosition = useEditorModeStore((s) => s.setPanelPosition);
  const closePanel = useEditorModeStore((s) => s.closePanel);

  // Pick a sensible starting position if none has been stored yet.
  const initialPosition: PanelPosition =
    storedPosition ?? defaultPosition ?? { x: 16, y: 76 };
  const [position, setPosition] = useState<PanelPosition>(initialPosition);
  const dragStateRef = useRef<{
    pointerId: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Sync local state when the store changes externally (e.g. reset).
  useEffect(() => {
    if (storedPosition) setPosition(storedPosition);
  }, [storedPosition]);

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.button !== 0) return;
      event.preventDefault();
      const target = event.currentTarget;
      target.setPointerCapture(event.pointerId);
      dragStateRef.current = {
        pointerId: event.pointerId,
        offsetX: event.clientX - position.x,
        offsetY: event.clientY - position.y,
      };
      setIsDragging(true);
    },
    [position.x, position.y],
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const drag = dragStateRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      const maxX = window.innerWidth - 80;
      const maxY = window.innerHeight - 40;
      const nextX = Math.min(Math.max(0, event.clientX - drag.offsetX), maxX);
      const nextY = Math.min(Math.max(0, event.clientY - drag.offsetY), maxY);
      setPosition({ x: nextX, y: nextY });
    },
    [],
  );

  const handlePointerUp = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const drag = dragStateRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      event.currentTarget.releasePointerCapture(event.pointerId);
      dragStateRef.current = null;
      setIsDragging(false);
      setPanelPosition(id, position);
    },
    [id, position, setPanelPosition],
  );

  const containerStyle: CSSProperties = {
    position: "fixed",
    left: position.x,
    top: position.y,
    width,
    maxHeight,
    overflowY: "auto",
    zIndex: 10002,
    display: "flex",
    flexDirection: "column",
    borderRadius: "2px",
    border: "3px solid #00ff41",
    background: "rgb(12 19 48 / 96%)",
    color: "#00ff41",
    backdropFilter: "blur(4px)",
    boxShadow:
      "0 0 16px rgba(0, 255, 65, 0.3), inset 0 0 8px rgba(0, 255, 65, 0.1)",
    fontFamily: "var(--font-pixel), monospace",
    fontSize: "13px",
    letterSpacing: "1px",
    textShadow: "0 0 10px rgba(0, 255, 65, 0.4)",
    pointerEvents: "auto",
  };

  const headerStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
    padding: "0.55rem 0.8rem",
    cursor: isDragging ? "grabbing" : "grab",
    borderBottom: "2px solid rgb(0 255 65 / 30%)",
    background: "rgb(0 255 65 / 8%)",
    userSelect: "none",
    touchAction: "none",
  };

  const closeButtonStyle: CSSProperties = {
    border: "1px solid #00ff41",
    background: "transparent",
    color: "#00ff41",
    width: "22px",
    height: "22px",
    borderRadius: "2px",
    fontSize: "12px",
    cursor: "pointer",
    fontFamily: "var(--font-pixel), monospace",
    lineHeight: 1,
  };

  return (
    <div style={containerStyle}>
      <div
        style={headerStyle}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <strong style={{ fontSize: "12px", letterSpacing: "1px" }}>{title}</strong>
        <button
          type="button"
          style={closeButtonStyle}
          onPointerDown={(event) => {
            event.stopPropagation();
          }}
          onClick={(event) => {
            event.stopPropagation();
            closePanel(id);
          }}
          aria-label={`Cerrar ${title}`}
        >
          ×
        </button>
      </div>
      <div style={{ padding: "0.85rem 1rem", display: "grid", gap: "10px" }}>
        {children}
      </div>
    </div>
  );
}
