"use client";

import { useFrame } from "@react-three/fiber";
import { MathUtils, OrthographicCamera as ThreeOrthoCamera } from "three";
import { useRef, useEffect } from "react";

import { browserEnvironmentAdapter } from "../../lib/platform-web";
import { useSceneStore } from "@pointclick-engine/engine-core";

export function CameraController() {
  const groundCenterXRef = useRef<number>(0);
  const prevSceneIdRef = useRef<string>("");
  const sceneId = useSceneStore((s) => s.sceneId);

  useEffect(() => {
    const { scene: { ground } } = useSceneStore.getState();
    groundCenterXRef.current = (ground.minX + ground.maxX) / 2;
  }, [sceneId]);

  useFrame(({ camera, size }) => {
    const {
      playerPosition,
      scene: { ground },
    } = useSceneStore.getState();
    const zoom = (camera as ThreeOrthoCamera).zoom;
    const halfViewW = size.width / (2 * zoom);
    const groundCenterX = groundCenterXRef.current;
    const minCamX = ground.minX + halfViewW;
    const maxCamX = ground.maxX - halfViewW;
    const targetX = playerPosition[0];
    const clampedX =
      minCamX <= maxCamX ? MathUtils.clamp(targetX, minCamX, maxCamX) : groundCenterX;

    // Snap camera position when scene changes, lerp for normal movement within scene
    const isSceneTransition = prevSceneIdRef.current !== sceneId;
    if (isSceneTransition) {
      console.log(`[CameraController] Scene transition detected: ${prevSceneIdRef.current} → ${sceneId}, snapping camera from ${camera.position.x.toFixed(2)} to ${clampedX.toFixed(2)}`);
      camera.position.setX(clampedX);
      prevSceneIdRef.current = sceneId;
    } else {
      camera.position.setX(MathUtils.lerp(camera.position.x, clampedX, 0.1));
    }
  });

  return null;
}

export function CameraFitHeight({ desiredWorldHeight = 19.28 }: { desiredWorldHeight?: number }) {
  useFrame(({ camera, size }) => {
    const cam = camera as ThreeOrthoCamera;
    if (!cam) return;

    const pixelHeight = Math.max(
      1,
      size.height || browserEnvironmentAdapter.getInnerHeight(800),
    );
    const targetZoom = pixelHeight / desiredWorldHeight;

    if (Math.abs(cam.zoom - targetZoom) <= 0.0001) return;
    cam.zoom = targetZoom;
    cam.updateProjectionMatrix();
  });

  return null;
}