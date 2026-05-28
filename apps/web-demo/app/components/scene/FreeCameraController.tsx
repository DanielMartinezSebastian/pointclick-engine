"use client";

import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { OrthographicCamera as ThreeOrthoCamera } from "three";

import { useEditorModeStore } from "../../store/editorModeStore";

/**
 * Default orthographic camera placement mirrored from GameTouchCanvas.
 * Used to restore the camera when leaving free-camera mode.
 */
const DEFAULT_POSITION: [number, number, number] = [0, 5.4, 25.0];
const DEFAULT_ROTATION: [number, number, number] = [-0.24, 0, 0];

/**
 * Free-camera controller.
 *
 * When `cameraMode` is `free`, mounts `OrbitControls` so the user can rotate,
 * pan and zoom the world freely. When it switches back to `fixed`, restores
 * the original camera position and rotation so the game-follow controller can
 * resume seamlessly.
 *
 * The controller does NOT touch projection / zoom while in free mode — the
 * orthographic camera keeps its current scale. `CameraFitHeight` is unmounted
 * by `GameTouchCanvas` while free is active so it does not fight zoom changes.
 */
export function FreeCameraController() {
  const cameraMode = useEditorModeStore((s) => s.cameraMode);
  const { camera } = useThree();
  const previousModeRef = useRef(cameraMode);

  useEffect(() => {
    const wasManual =
      previousModeRef.current === "free" || previousModeRef.current === "locked";
    const isFixed = cameraMode === "fixed";

    // Only restore the default pose when returning to `fixed`. Transitions
    // between `free` ↔ `locked` keep whatever pose the user dialed in so the
    // "freeze where I am now" workflow works.
    if (wasManual && isFixed) {
      camera.position.set(...DEFAULT_POSITION);
      camera.rotation.set(...DEFAULT_ROTATION);
      camera.updateProjectionMatrix();
    }

    previousModeRef.current = cameraMode;
  }, [cameraMode, camera]);

  // OrbitControls only while explicitly `free`. In `locked` the camera stays
  // exactly where the user left it and no controls intercept the pointer —
  // that lets the editor pick up clicks on scene elements again.
  if (cameraMode !== "free") return null;

  // Orbit around the world center (0, 0, 0) by default. Allow generous
  // freedom but cap polar angles to avoid going under the floor.
  return (
    <OrbitControls
      makeDefault
      enableRotate
      enablePan
      enableZoom
      target={[0, 0, 0]}
      minPolarAngle={0.1}
      maxPolarAngle={Math.PI / 2 - 0.05}
      // Orthographic cameras zoom via `camera.zoom`; OrbitControls handles
      // this automatically for ortho when `enableZoom` is true.
      zoomSpeed={0.8}
      rotateSpeed={0.7}
      panSpeed={0.6}
    />
  );
}

/**
 * Re-export the default camera position so other modules can keep a single
 * source of truth for the resting camera placement.
 */
export const FREE_CAMERA_DEFAULT_POSITION = DEFAULT_POSITION;
export const FREE_CAMERA_DEFAULT_ROTATION = DEFAULT_ROTATION;

/**
 * Helper hook: returns whether the camera is currently in free mode.
 * Avoids importing the entire store into call sites that just want the flag.
 */
export function useIsFreeCamera() {
  return useEditorModeStore((s) => s.cameraMode === "free");
}

// Type-only re-export so TS users can narrow `Camera` if needed.
export type FreeCameraOrthographic = ThreeOrthoCamera;
