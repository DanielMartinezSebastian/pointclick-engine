"use client";

import { useCallback, useEffect, useRef } from "react";
import gsap from "gsap";

export type ConfirmationDialogProps = {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmationDialog({
  isOpen,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  isDangerous = false,
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    if (!overlayRef.current || !dialogRef.current) return;

    tweenRef.current?.kill();

    if (isOpen) {
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.2 },
      );

      gsap.fromTo(
        dialogRef.current,
        { opacity: 0, scale: 0.8, y: -20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: "back.out(1.5)" },
      );
    } else {
      tweenRef.current = gsap.to(
        [overlayRef.current, dialogRef.current],
        {
          opacity: 0,
          scale: 0.8,
          y: -20,
          duration: 0.2,
        },
      );
    }
  }, [isOpen]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === overlayRef.current) {
        onCancel();
      }
    },
    [onCancel],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
      }
    },
    [onCancel],
  );

  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleBackdropClick}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        backdropFilter: "blur(2px)",
      }}
    >
      <div
        ref={dialogRef}
        style={{
          position: "relative",
          backgroundColor: "linear-gradient(180deg, rgb(10 29 45 / 100%) 0%, rgb(4 11 18 / 100%) 100%)",
          border: "4px solid rgb(140 227 255 / 88%)",
          borderRadius: "8px",
          padding: "24px",
          maxWidth: "420px",
          width: "90%",
          boxShadow:
            "0 16px 0 rgb(0 0 0 / 26%), 0 18px 36px rgb(0 0 0 / 35%), inset 0 0 0 2px rgb(255 255 255 / 8%), inset 0 -4px 0 rgb(0 0 0 / 18%)",
        }}
      >
        <h2
          style={{
            color: "#bff4ff",
            fontSize: "18px",
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            textShadow: "0 3px 0 rgb(0 0 0 / 36%)",
            margin: "0 0 16px 0",
            borderBottom: "2px solid rgb(132 230 255 / 75%)",
            paddingBottom: "12px",
          }}
        >
          {title}
        </h2>

        <p
          style={{
            color: "#d9fbff",
            fontSize: "14px",
            lineHeight: "1.6",
            margin: "0 0 24px 0",
            textShadow: "0 2px 0 rgb(0 0 0 / 35%)",
          }}
        >
          {message}
        </p>

        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "flex-end",
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: "8px 16px",
              fontSize: "12px",
              fontWeight: "bold",
              color: "#bff4ff",
              backgroundColor: "rgb(10 40 60 / 100%)",
              border: "2px solid rgb(132 230 255 / 75%)",
              borderRadius: "4px",
              cursor: "pointer",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              textShadow: "0 2px 0 rgb(0 0 0 / 35%)",
              transition: "all 0.2s ease",
              boxShadow: "inset 0 0 0 2px rgb(255 255 255 / 8%)",
            }}
            onMouseEnter={(e) => {
              const target = e.currentTarget as HTMLButtonElement;
              target.style.backgroundColor = "rgb(20 50 70 / 100%)";
            }}
            onMouseLeave={(e) => {
              const target = e.currentTarget as HTMLButtonElement;
              target.style.backgroundColor = "rgb(10 40 60 / 100%)";
            }}
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            style={{
              padding: "8px 16px",
              fontSize: "12px",
              fontWeight: "bold",
              color: "#fff3f3",
              backgroundColor: isDangerous ? "rgb(173 31 44 / 100%)" : "rgb(20 100 60 / 100%)",
              border: isDangerous ? "2px solid rgb(95 16 20 / 100%)" : "2px solid rgb(50 150 80 / 100%)",
              borderRadius: "4px",
              cursor: "pointer",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              textShadow: "0 2px 0 rgb(0 0 0 / 35%)",
              transition: "all 0.2s ease",
              boxShadow: "inset 0 0 0 2px rgb(255 255 255 / 8%)",
            }}
            onMouseEnter={(e) => {
              const target = e.currentTarget as HTMLButtonElement;
              target.style.backgroundColor = isDangerous
                ? "rgb(200 40 50 / 100%)"
                : "rgb(30 120 70 / 100%)";
            }}
            onMouseLeave={(e) => {
              const target = e.currentTarget as HTMLButtonElement;
              target.style.backgroundColor = isDangerous
                ? "rgb(173 31 44 / 100%)"
                : "rgb(20 100 60 / 100%)";
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
