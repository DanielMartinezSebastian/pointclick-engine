"use client";

import { CuboidCollider, RigidBody } from "@react-three/rapier";

import { type GameSceneWall, useSceneStore } from "@pointclick-engine/engine-core";
import { SceneWallPlane } from "./SceneWallPlane";

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

              {/* Opening cuts — always visible in debug mode (cyan wireframe + solid fill) */}
              {wall.openings?.map((opening, oi) => (
                <group key={`opening-${oi}`} position={opening.position}>
                  {/* Solid fill so the cut reads as a "hole" at a glance */}
                  <mesh>
                    <boxGeometry
                      args={[
                        opening.halfSize[0] * 2,
                        opening.halfSize[1] * 2,
                        opening.halfSize[2] * 2,
                      ]}
                    />
                    <meshBasicMaterial color="#001a1a" transparent opacity={0.85} />
                  </mesh>
                  {/* Wireframe outline to show exact boundaries */}
                  <mesh>
                    <boxGeometry
                      args={[
                        opening.halfSize[0] * 2,
                        opening.halfSize[1] * 2,
                        opening.halfSize[2] * 2,
                      ]}
                    />
                    <meshBasicMaterial color="#00ffcc" wireframe />
                  </mesh>
                </group>
              ))}

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

      {/* Wall texture planes — rendered outside RigidBody, camera-facing */}
      {walls.map((wall: GameSceneWall, i: number) =>
        wall.textureUrl ? (
          <SceneWallPlane key={`wall-plane-${i}`} wall={wall} renderOrder={i} />
        ) : null,
      )}
    </>
  );
}
