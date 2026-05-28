"use client";

import { CuboidCollider, RigidBody } from "@react-three/rapier";

import { type GameSceneWall, useSceneStore } from "@pointclick-engine/engine-core";
import { SceneWallPlane } from "./SceneWallPlane";
import { computeWallSegments } from "./wallSegments";

export type WallResizeHandle = "x+" | "x-" | "z+" | "z-";

export function SceneWalls({
  debug,
  opacityMode = "wireframe",
  interactionsEnabled = true,
  onStartWallMove,
  onStartWallResize,
  selectedWallIndex = null,
  onSelectWall,
}: {
  debug: boolean;
  /** `wireframe` (default) o `opaque` (sólidos translúcidos). */
  opacityMode?: "wireframe" | "opaque";
  /**
   * When false, all wall meshes ignore pointer events — used while the
   * camera is in `free` mode so OrbitControls drag doesn't accidentally
   * select / move a wall. Defaults to true (normal editor behaviour).
   */
  interactionsEnabled?: boolean;
  onStartWallMove: (index: number, pointX: number, pointZ: number) => void;
  onStartWallResize: (index: number, handle: WallResizeHandle) => void;
  /** Currently selected wall index for debug editor (injected via DI). */
  selectedWallIndex?: number | null;
  /** Callback to select a wall in the editor (injected via DI). */
  onSelectWall?: (index: number) => void;
}) {
  const isOpaque = opacityMode === "opaque";
  const walls = useSceneStore((s) => s.scene.walls);
  // Returning null from raycast removes the mesh from the picking pass, so
  // OrbitControls drag never produces an onPointerDown on a wall element.
  const blockRaycast = interactionsEnabled ? undefined : () => null;

  return (
    <>
      {walls.map((wall: GameSceneWall, i: number) => {
        // Decompose wall into solid segments around its openings.
        // Each segment gets its own CuboidCollider (real physics holes)
        // and its own debug mesh (real visual hole — no overlay).
        const segments = computeWallSegments(wall.halfSize, wall.openings);
        const isSelected = selectedWallIndex === i;

        return (
          <RigidBody
            key={i}
            type="fixed"
            // colliders={false} is critical: by default @react-three/rapier
            // auto-generates a cuboid collider per child mesh — that would
            // promote the debug wireframes AND (when the wall is selected) the
            // resize-handle cubes into physical obstacles, silently blocking
            // the player around the wall's Z faces and inside the opening.
            colliders={false}
            position={wall.position}
            rotation={[0, wall.rotationY, 0]}
          >
            {/* One collider per solid segment → openings have no collision */}
            {segments.map((seg, si) => (
              <CuboidCollider
                key={si}
                position={seg.position}
                args={seg.halfSize}
              />
            ))}

            {debug && (
              <>
                {/* One wireframe mesh per segment — the gaps ARE the openings */}
                {segments.map((seg, si) => (
                  <mesh
                    key={si}
                    position={seg.position}
                    raycast={blockRaycast}
                    onPointerDown={interactionsEnabled ? (e) => {
                      e.stopPropagation();
                      onSelectWall?.(i);
                      onStartWallMove(i, e.point.x, e.point.z);
                    } : undefined}
                  >
                    <boxGeometry
                      args={[seg.halfSize[0] * 2, seg.halfSize[1] * 2, seg.halfSize[2] * 2]}
                    />
                    <meshBasicMaterial
                      color={isSelected ? "#ffff00" : "#ff4400"}
                      wireframe={!isOpaque}
                      transparent={isOpaque}
                      opacity={isOpaque ? 0.65 : 1}
                      depthWrite={!isOpaque}
                    />
                  </mesh>
                ))}

                {/* Resize handles — hidden when interactions are blocked
                    (e.g. free camera mode) since they would just clutter
                    the view without responding to clicks. */}
                {isSelected && interactionsEnabled && (
                  <>
                    <mesh
                      position={[wall.halfSize[0], 0, 0]}
                      raycast={blockRaycast}
                      onPointerDown={interactionsEnabled ? (e) => {
                        e.stopPropagation();
                        onStartWallResize(i, "x+");
                      } : undefined}
                    >
                      <boxGeometry args={[0.35, 0.35, 0.35]} />
                      <meshBasicMaterial color="#00d8ff" />
                    </mesh>
                    <mesh
                      position={[-wall.halfSize[0], 0, 0]}
                      raycast={blockRaycast}
                      onPointerDown={interactionsEnabled ? (e) => {
                        e.stopPropagation();
                        onStartWallResize(i, "x-");
                      } : undefined}
                    >
                      <boxGeometry args={[0.35, 0.35, 0.35]} />
                      <meshBasicMaterial color="#00d8ff" />
                    </mesh>
                    <mesh
                      position={[0, 0, wall.halfSize[2]]}
                      raycast={blockRaycast}
                      onPointerDown={interactionsEnabled ? (e) => {
                        e.stopPropagation();
                        onStartWallResize(i, "z+");
                      } : undefined}
                    >
                      <boxGeometry args={[0.35, 0.35, 0.35]} />
                      <meshBasicMaterial color="#ff00aa" />
                    </mesh>
                    <mesh
                      position={[0, 0, -wall.halfSize[2]]}
                      raycast={blockRaycast}
                      onPointerDown={interactionsEnabled ? (e) => {
                        e.stopPropagation();
                        onStartWallResize(i, "z-");
                      } : undefined}
                    >
                      <boxGeometry args={[0.35, 0.35, 0.35]} />
                      <meshBasicMaterial color="#ff00aa" />
                    </mesh>
                  </>
                )}
              </>
            )}
          </RigidBody>
        );
      })}

      {/* Wall texture planes — rendered outside RigidBody, camera-facing */}
      {walls.map((wall: GameSceneWall, i: number) =>
        wall.textureUrl ? (
          <SceneWallPlane key={`wall-plane-${i}`} wall={wall} renderOrder={i} />
        ) : null,
      )}
    </>
  );
}
