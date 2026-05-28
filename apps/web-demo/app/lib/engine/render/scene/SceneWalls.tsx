"use client";

import { CuboidCollider, RigidBody } from "@react-three/rapier";

import { type GameSceneWall, useSceneStore } from "@pointclick-engine/engine-core";
import { useSceneEditorStore } from "../../../../store/sceneEditorStore";
import { computeWallSegments } from "@pointclick-engine/engine-renderer-r3f";
import { SceneWallPlane } from "@pointclick-engine/engine-renderer-r3f";

export type WallResizeHandle = "x+" | "x-" | "z+" | "z-";

export function SceneWalls({
  debug,
  onStartWallMove,
  onStartWallResize,
}: {
  debug: boolean;
  onStartWallMove: (index: number, pointX: number, pointZ: number) => void;
  onStartWallResize: (index: number, handle: WallResizeHandle) => void;
}) {
  const walls = useSceneStore((s) => s.scene.walls);
  const selectedWallIndex = useSceneEditorStore((s) => s.selectedWallIndex);
  const selectWall = useSceneEditorStore((s) => s.selectWall);

  return (
    <>
      {walls.map((wall: GameSceneWall, i: number) => {
        const segments = computeWallSegments(wall.halfSize, wall.openings);
        const isSelected = selectedWallIndex === i;

        return (
          <RigidBody
            key={i}
            type="fixed"
            colliders={false}
            position={wall.position}
            rotation={[0, wall.rotationY ?? 0, 0]}
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
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      selectWall(i);
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
