"use client";

import { Html } from "@react-three/drei";
import { useEffect, useMemo, useState } from "react";

type SpeechBubbleProps = {
  text: string;
  visible: boolean;
  trigger: number;
  charsPerSecond?: number;
};

export default function SpeechBubble({
  text,
  visible,
  trigger,
  charsPerSecond = 30,
}: SpeechBubbleProps) {
  const normalizedText = useMemo(() => text.trim(), [text]);
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    if (!visible || normalizedText.length === 0) return;

    let index = 0;
    const msPerChar = Math.max(14, Math.floor(1000 / Math.max(1, charsPerSecond)));

    const timer = window.setInterval(() => {
      index += 1;
      setDisplayedText(normalizedText.slice(0, index));

      if (index >= normalizedText.length) {
        window.clearInterval(timer);
      }
    }, msPerChar);

    return () => {
      window.clearInterval(timer);
    };
  }, [charsPerSecond, normalizedText, trigger, visible]);

  if (!visible || normalizedText.length === 0) {
    return null;
  }

  return (
    <Html
      transform
      position={[0, 3.5, 0]}
      style={{ pointerEvents: "none", userSelect: "none" }}
      zIndexRange={[70, 0]}
    >
      <div
        style={{
          minWidth: "180px",
          maxWidth: "280px",
          padding: "10px 12px",
          border: "3px solid #00ff41",
          borderRadius: "4px",
          background: "rgb(10 16 36 / 96%)",
          color: "#00ff41",
          fontFamily: "var(--font-pixel), monospace",
          fontSize: "18px",
          letterSpacing: "0.8px",
          lineHeight: 1.2,
          boxShadow: "0 0 16px rgb(0 255 65 / 35%), inset 0 0 6px rgb(0 255 65 / 20%)",
        }}
      >
        <span style={{ whiteSpace: "pre-wrap" }}>{displayedText}</span>
      </div>
      <div
        style={{
          margin: "-1px auto 0",
          width: 0,
          height: 0,
          borderLeft: "11px solid transparent",
          borderRight: "11px solid transparent",
          borderTop: "14px solid #00ff41",
          filter: "drop-shadow(0 0 4px rgb(0 255 65 / 65%))",
        }}
      />
    </Html>
  );
}
