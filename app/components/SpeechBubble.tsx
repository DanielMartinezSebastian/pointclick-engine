"use client";

import { RoundedBox, Text } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";

import { useSceneStore } from "../store/sceneStore";

type SpeechBubbleProps = {
  text: string;
  visible: boolean;
  trigger: number;
  charsPerSecond?: number;
  onDismiss?: () => void;
};

const SPRITE_HALF_WIDTH_WORLD = 0.62;
const BUBBLE_GAP_WORLD = 0.22;
const DEPTH_FAR_Z = -16;
const DEPTH_NEAR_Z = 8;
const SPRITE_MIN_SCALE = 1.4;
const SPRITE_MAX_SCALE = 2.94;
const SPRITE_HALF_WIDTH_FACTOR = 0.36;
const BORDER_PADDING = 0.09;
const SPRITE_CENTER_Y_OFFSET = -0.95;
const BUBBLE_HEADROOM = -1;
const TEXT_PADDING_X = 0.2;
const TEXT_PADDING_Y = 0.16;
const FONT_SIZE = 0.2;
const LINE_HEIGHT = 1.18;
const AVG_CHAR_WIDTH_WORLD = 0.096;
const MIN_BUBBLE_WIDTH = 0.6;
const MAX_BUBBLE_WIDTH = 5.2;
const MIN_BUBBLE_HEIGHT = 0.45;
const MAX_BUBBLE_HEIGHT = 3.8;
const MS_PER_WORD_READ = 286;
const MIN_READ_MS = 2080;
const MAX_READ_MS = 10400;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function lerp(start: number, end: number, t: number) {
  return start + (end - start) * t;
}

function wrapParagraphByWords(paragraph: string, maxCharsPerLine: number) {
  const words = paragraph.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [""];

  const lines: string[] = [];
  let currentLine = words[0];

  for (let index = 1; index < words.length; index += 1) {
    const candidate = `${currentLine} ${words[index]}`;
    if (candidate.length <= maxCharsPerLine) {
      currentLine = candidate;
    } else {
      lines.push(currentLine);
      currentLine = words[index];
    }
  }

  lines.push(currentLine);
  return lines;
}

export default function SpeechBubble({
  text,
  visible,
  trigger,
  charsPerSecond = 30,
  onDismiss,
}: SpeechBubbleProps) {
  const playerPosition = useSceneStore((state) => state.playerPosition);
  const ground = useSceneStore((state) => state.scene.ground);
  const normalizedText = useMemo(() => text.trim(), [text]);
  const [displayedText, setDisplayedText] = useState("");
  const dismissTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!visible || normalizedText.length === 0) return;

    let index = 0;
    const msPerChar = Math.max(14, Math.floor(1000 / Math.max(1, charsPerSecond)));

    const timer = window.setInterval(() => {
      index += 1;
      setDisplayedText(normalizedText.slice(0, index));

      if (index >= normalizedText.length) {
        window.clearInterval(timer);

        if (onDismiss) {
          const wordCount = normalizedText.trim().split(/\s+/).filter(Boolean).length;
          const readMs = clamp(wordCount * MS_PER_WORD_READ, MIN_READ_MS, MAX_READ_MS);
          dismissTimerRef.current = Number(window.setTimeout(onDismiss, readMs));
        }
      }
    }, msPerChar);

    return () => {
      window.clearInterval(timer);
      if (dismissTimerRef.current !== null) {
        window.clearTimeout(dismissTimerRef.current);
        dismissTimerRef.current = null;
      }
    };
  }, [charsPerSecond, normalizedText, onDismiss, trigger, visible]);

  const shouldShowLeft = useMemo(() => {
    const worldEdgePadding = 0.9;
    const spaceLeft = playerPosition[0] - ground.minX - worldEdgePadding;
    const spaceRight = ground.maxX - playerPosition[0] - worldEdgePadding;
    return spaceLeft > spaceRight;
  }, [ground.maxX, ground.minX, playerPosition]);

  const depthFactor = useMemo(() => {
    return clamp((playerPosition[2] - DEPTH_FAR_Z) / (DEPTH_NEAR_Z - DEPTH_FAR_Z), 0, 1);
  }, [playerPosition]);

  const spriteScale = useMemo(() => {
    return lerp(SPRITE_MIN_SCALE, SPRITE_MAX_SCALE, depthFactor);
  }, [depthFactor]);

  const bubbleLayout = useMemo(() => {
    const layoutText = displayedText.length > 0 ? displayedText : " ";
    const paragraphs = layoutText.split("\n");
    const totalChars = Math.max(1, layoutText.length);
    const targetCharsPerLine = clamp(Math.round(Math.sqrt(totalChars) * 2.4), 18, 36);

    const wrappedLines = paragraphs.flatMap((paragraph) =>
      paragraph.trim().length === 0 ? [""] : wrapParagraphByWords(paragraph, targetCharsPerLine),
    );

    const longestLineChars = Math.max(1, ...wrappedLines.map((line) => line.length));
    const lineCount = Math.max(1, wrappedLines.length);

    const textWidth = clamp(
      longestLineChars * AVG_CHAR_WIDTH_WORLD,
      MIN_BUBBLE_WIDTH - (TEXT_PADDING_X * 2),
      MAX_BUBBLE_WIDTH - (TEXT_PADDING_X * 2),
    );
    const bubbleWidth = clamp(textWidth + (TEXT_PADDING_X * 2), MIN_BUBBLE_WIDTH, MAX_BUBBLE_WIDTH);

    const lineHeightWorld = FONT_SIZE * LINE_HEIGHT;
    const textHeight = lineCount * lineHeightWorld;
    const bubbleHeight = clamp(textHeight + (TEXT_PADDING_Y * 2), MIN_BUBBLE_HEIGHT, MAX_BUBBLE_HEIGHT);

    return {
      bubbleWidth,
      bubbleHeight,
      textMaxWidth: bubbleWidth - (TEXT_PADDING_X * 2),
    };
  }, [displayedText]);

  if (!visible || normalizedText.length === 0) {
    return null;
  }

  const spriteHalfWidthWorld = Math.max(SPRITE_HALF_WIDTH_WORLD, spriteScale * SPRITE_HALF_WIDTH_FACTOR);
  const sideOffset = spriteHalfWidthWorld + BUBBLE_GAP_WORLD;
  const offsetX = shouldShowLeft ? -sideOffset : sideOffset;
  const offsetY = (2 * spriteScale) + SPRITE_CENTER_Y_OFFSET + BUBBLE_HEADROOM;
  const bubbleCenterX = shouldShowLeft
    ? offsetX - bubbleLayout.bubbleWidth / 2
    : offsetX + bubbleLayout.bubbleWidth / 2;
  const arrowBaseX = shouldShowLeft ? offsetX + 0.07 : offsetX - 0.07;
  const arrowRotationZ = shouldShowLeft ? -Math.PI / 2 : Math.PI / 2;

  return (
    <group position={[0, offsetY, 0]}>
      <group position={[bubbleCenterX, 0, 0.03]}>
        <RoundedBox
          args={[1, 1, 0.02]}
          scale={[bubbleLayout.bubbleWidth + BORDER_PADDING, bubbleLayout.bubbleHeight + BORDER_PADDING, 1]}
          radius={0.14}
          smoothness={4}
          position={[0, 0, -0.003]}
        >
          <meshBasicMaterial color="#ffffff" toneMapped={false} />
        </RoundedBox>
        <RoundedBox
          args={[1, 1, 0.018]}
          scale={[bubbleLayout.bubbleWidth, bubbleLayout.bubbleHeight, 1]}
          radius={0.12}
          smoothness={4}
          position={[0, 0, 0]}
        >
          <meshBasicMaterial color="#ffffff" toneMapped={false} />
        </RoundedBox>
        <Text
          position={[-(bubbleLayout.bubbleWidth / 2) + TEXT_PADDING_X, 0, 0.012]}
          color="#121212"
          anchorX="left"
          anchorY="middle"
          maxWidth={bubbleLayout.textMaxWidth}
          lineHeight={LINE_HEIGHT}
          fontSize={FONT_SIZE}
          textAlign="left"
          outlineWidth={0.005}
          outlineColor="#ffffff"
        >
          {displayedText}
        </Text>
      </group>

      <mesh position={[arrowBaseX, 0, 0.027]} rotation={[0, 0, arrowRotationZ]}>
        <coneGeometry args={[0.16, 0.27, 3]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </mesh>
      <mesh position={[arrowBaseX, 0, 0.028]} rotation={[0, 0, arrowRotationZ]}>
        <coneGeometry args={[0.13, 0.22, 3]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </mesh>
    </group>
  );
}
