"use client";

import { CuboidCollider, RigidBody } from "@react-three/rapier";

import { type GameSceneWall, useSceneStore } from "@pointclick-engine/engine-core";
import { SceneWallPlane } from "./SceneWallPlane";
import { computeWallSegments } from "./wallSegments";

export type WallResizeHandle = "x+" | "x-" | "z+" | "z-";

export function SceneWalls({
  debug,
  onStartWallMove,
  onStartWallResize,
  selectedWallIndex = null,
  onSelectWall,
}: {
  debug: boolean;
  onStartWallMove: (index: number, pointX: number, pointZ: number) => void;
  onStartWallResize: (index: number, handle: WallResizeHandle) => void;
  /** Currently selected wall index for debug editor (injected via DI). */
  selectedWallIndex?: number | null;
  /** Callback to select a wall in the editor (injected via DI). */
  onSelectWall?: (index: number) => void;
}) {
  const walls = useSceneStore((s) => s.scene.walls);

  return (
    <>
      {walls.map((wall: GameSceneWall, i: number) => {
        // Decompose wall into solid segments around its openings.
        // Each segment gets its own CuboidCollider (real physics holes)
        // and its own debug mesh (real visual hole — no overlay).
        const segments = computeWallSegments(wall.halfSize, wall.openings);
        const isSelected = selectedWallIndex === i;

        return (
          <RigidBody key={i} type="fixed" position={wall.position} rotation={[0, wall.rotationY, 0]}>
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
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      onSelectWall?.(i);
                      onStartWallMove(i, e.point.x, e.point.z);
                    }}
                  >
                    <boxGeometry
                      args={[seg.halfSize[0] * 2, seg.halfSize[1] * 2, seg.halfSize[2] * 2]}
                    />
                    <meshBasicMaterial
                      color={isSelected ? "#ffff00" : "#ff4400"}
                      wireframe
                    />
                  </mesh>
                ))}

                {/* Resize handles — always based on full wall halfSize */}
                {isSelected && (
                  <>
                    <mesh
                      position={[wall.halfSize[0], 0, 0]}
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        onStartWallResize(i, "x+");
                      }}
                    >
                      <boxGeometry args={[0.35, 0.35, 0.35]} />
                      <meshBasicMaterial color="#00d8ff" />
                    </mesh>
                    <mesh
                      position={[-wall.halfSize[0], 0, 0]}
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        onStartWallResize(i, "x-");
                      }}
                    >
                      <boxGeometry args={[0.35, 0.35, 0.35]} />
                      <meshBasicMaterial color="#00d8ff" />
                    </mesh>
                    <mesh
                      position={[0, 0, wall.halfSize[2]]}
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        onStartWallResize(i, "z+");
                      }}
                    >
                      <boxGeometry args={[0.35, 0.35, 0.35]} />
                      <meshBasicMaterial color="#ff00aa" />
                    </mesh>
                    <mesh
                      position={[0, 0, -wall.halfSize[2]]}
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        onStartWallResize(i, "z-");
                      }}
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
