"use client";

import { useMemo } from "react";
import { CuboidCollider, RigidBody } from "@react-three/rapier";

import { useSceneStore } from "../../../../store/sceneStore";

const checkerVertexShader = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const checkerFragmentShader = /* glsl */`
  varying vec2 vUv;
  uniform float uCells;
  void main() {
    vec2 cell = floor(vUv * uCells);
    float checker = mod(cell.x + cell.y, 2.0);
    vec3 col = checker > 0.5 ? vec3(0.0, 1.0, 0.25) : vec3(0.0, 0.0, 0.0);
    float alpha = checker > 0.5 ? 0.28 : 0.04;
    gl_FragColor = vec4(col, alpha);
  }
`;

export function SceneGround({
  onClickWorld,
  onHoverWorld,
  debug,
  depthNearZ,
  depthFarZ,
}: {
  onClickWorld: (x: number, z: number) => void;
  onHoverWorld?: (x: number, z: number) => void;
  debug: boolean;
  depthNearZ: number;
  depthFarZ: number;
}) {
  const ground = useSceneStore((s) => s.scene.ground);

  const width = ground.maxX - ground.minX;
  const depth = ground.maxZ - ground.minZ;
  const centerX = (ground.minX + ground.maxX) / 2;
  const centerZ = (ground.minZ + ground.maxZ) / 2;

  const segX = Math.round(width / 2);
  const segZ = Math.round(depth / 2);

  const gy = ground.y + 0.02;
  const t = 0.05;
  const borderWallHalfHeight = 3;
  const borderWallHalfThickness = 0.35;
  const borderWallCenterY = ground.y + borderWallHalfHeight;

  const cells = Math.max(segX, segZ);
  const checkerUniforms = useMemo(() => ({ uCells: { value: cells } }), [cells]);

  return (
    <>
      <RigidBody type="fixed" position={[centerX, ground.y, centerZ]}>
        <CuboidCollider args={[width / 2, 0.2, depth / 2]} friction={2.8} restitution={0} />
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          onPointerDown={(e) => {
            e.stopPropagation();
            onClickWorld(e.point.x, e.point.z);
          }}
          onPointerMove={(e) => {
            if (!onHoverWorld) return;
            onHoverWorld(e.point.x, e.point.z);
          }}
        >
          <planeGeometry args={[width, depth]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </RigidBody>

      <RigidBody type="fixed" position={[centerX, borderWallCenterY, ground.minZ - borderWallHalfThickness]}>
        <CuboidCollider args={[width / 2 + borderWallHalfThickness, borderWallHalfHeight, borderWallHalfThickness]} />
      </RigidBody>
      <RigidBody type="fixed" position={[centerX, borderWallCenterY, ground.maxZ + borderWallHalfThickness]}>
        <CuboidCollider args={[width / 2 + borderWallHalfThickness, borderWallHalfHeight, borderWallHalfThickness]} />
      </RigidBody>
      <RigidBody type="fixed" position={[ground.minX - borderWallHalfThickness, borderWallCenterY, centerZ]}>
        <CuboidCollider args={[borderWallHalfThickness, borderWallHalfHeight, depth / 2 + borderWallHalfThickness]} />
      </RigidBody>
      <RigidBody type="fixed" position={[ground.maxX + borderWallHalfThickness, borderWallCenterY, centerZ]}>
        <CuboidCollider args={[borderWallHalfThickness, borderWallHalfHeight, depth / 2 + borderWallHalfThickness]} />
      </RigidBody>

      {debug && (
        <>
          <mesh position={[centerX, gy, centerZ]} rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
            <planeGeometry args={[width, depth, segX, segZ]} />
            <shaderMaterial
              vertexShader={checkerVertexShader}
              fragmentShader={checkerFragmentShader}
              uniforms={checkerUniforms}
              transparent
              depthWrite={false}
            />
          </mesh>
          <mesh position={[centerX, gy + 0.001, centerZ]} rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
            <planeGeometry args={[width, depth, segX, segZ]} />
            <meshBasicMaterial color="#00ff41" wireframe transparent opacity={0.45} depthWrite={false} />
          </mesh>

          <mesh position={[centerX, gy, ground.minZ]}><boxGeometry args={[width + t, t, t]} /><meshBasicMaterial color="#00ff88" /></mesh>
          <mesh position={[centerX, gy, ground.maxZ]}><boxGeometry args={[width + t, t, t]} /><meshBasicMaterial color="#00ff88" /></mesh>
          <mesh position={[ground.minX, gy, centerZ]}><boxGeometry args={[t, t, depth]} /><meshBasicMaterial color="#00ff88" /></mesh>
          <mesh position={[ground.maxX, gy, centerZ]}><boxGeometry args={[t, t, depth]} /><meshBasicMaterial color="#00ff88" /></mesh>

          <mesh position={[ground.minX, ground.y + 1.25, ground.minZ]}><boxGeometry args={[t, 2.5, t]} /><meshBasicMaterial color="#ffff00" /></mesh>
          <mesh position={[ground.maxX, ground.y + 1.25, ground.minZ]}><boxGeometry args={[t, 2.5, t]} /><meshBasicMaterial color="#ffff00" /></mesh>
          <mesh position={[ground.minX, ground.y + 1.25, ground.maxZ]}><boxGeometry args={[t, 2.5, t]} /><meshBasicMaterial color="#ffff00" /></mesh>
          <mesh position={[ground.maxX, ground.y + 1.25, ground.maxZ]}><boxGeometry args={[t, 2.5, t]} /><meshBasicMaterial color="#ffff00" /></mesh>

          <mesh position={[centerX, gy, depthNearZ]}><boxGeometry args={[width, t, t]} /><meshBasicMaterial color="#ff8800" /></mesh>
          <mesh position={[centerX, gy, depthFarZ]}><boxGeometry args={[width, t, t]} /><meshBasicMaterial color="#ff4400" /></mesh>
        </>
      )}
    </>
  );
}
