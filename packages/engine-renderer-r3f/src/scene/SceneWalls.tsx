"use client";

import { CuboidCollider, RigidBody } from "@react-three/rapier";

import { type GameSceneWall, useSceneStore } from "@pointclick-engine/engine-core";

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
      {walls.map((wall: GameSceneWall, i: number) => (
        <RigidBody key={i} type="fixed" position={wall.position} rotation={[0, wall.rotationY, 0]}>
          <CuboidCollider args={wall.halfSize} />
          {debug && (
            <>
              <mesh
                onPointerDown={(e) => {
                  e.stopPropagation();
                  onSelectWall?.(i);
                  onStartWallMove(i, e.point.x, e.point.z);
                }}
              >
                <boxGeometry args={[wall.halfSize[0] * 2, wall.halfSize[1] * 2, wall.halfSize[2] * 2]} />
                <meshBasicMaterial color={selectedWallIndex === i ? "#ffff00" : "#ff4400"} wireframe />
              </mesh>

              {selectedWallIndex === i && (
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
      ))}
    </>
  );
}
