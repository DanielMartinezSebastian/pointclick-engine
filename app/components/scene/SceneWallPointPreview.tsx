"use client";

import { useMemo } from "react";
import type { Vector2 } from "three";

type WallPointPreview = {
  start: Vector2;
  end: Vector2;
};

export function SceneWallPointPreview({
  preview,
  groundY,
}: {
  preview: WallPointPreview | null;
  groundY: number;
}) {
  const pointPreviewLength = useMemo(() => {
    if (!preview) return 0;
    return Math.sqrt((preview.end.x - preview.start.x) ** 2 + (preview.end.y - preview.start.y) ** 2);
  }, [preview]);

  const pointPreviewMidX = preview ? (preview.start.x + preview.end.x) / 2 : 0;
  const pointPreviewMidZ = preview ? (preview.start.y + preview.end.y) / 2 : 0;
  const pointPreviewRotationY = preview
    ? -Math.atan2(preview.end.y - preview.start.y, preview.end.x - preview.start.x)
    : 0;

  if (!preview) return null;

  return (
    <>
      <mesh position={[preview.start.x, groundY + 0.12, preview.start.y]}>
        <boxGeometry args={[0.22, 0.22, 0.22]} />
        <meshBasicMaterial color="#00ff41" />
      </mesh>
      <mesh position={[preview.end.x, groundY + 0.12, preview.end.y]}>
        <boxGeometry args={[0.2, 0.2, 0.2]} />
        <meshBasicMaterial color="#00d8ff" />
      </mesh>
      {pointPreviewLength >= 0.01 && (
        <mesh position={[pointPreviewMidX, groundY + 0.1, pointPreviewMidZ]} rotation={[0, pointPreviewRotationY, 0]}>
          <boxGeometry args={[pointPreviewLength, 0.08, 0.08]} />
          <meshBasicMaterial color="#00d8ff" transparent opacity={0.85} />
        </mesh>
      )}
    </>
  );
}