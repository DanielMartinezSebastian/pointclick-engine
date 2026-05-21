"use client";

import { useLoader } from "@react-three/fiber";
import { BallCollider, RigidBody } from "@react-three/rapier";
import { TextureLoader } from "three";

import { useSceneStore } from "../../../../store/sceneStore";

export function SceneCollisionSphere() {
  const globeTexture = useLoader(TextureLoader, "/globe.svg");
  const groundY = useSceneStore((s) => s.scene.ground.y);
  const posY = groundY + 0.1 + 0.5;

  return (
    <RigidBody
      type="dynamic"
      colliders={false}
      position={[-1.09, posY, 13.01]}
      gravityScale={1.2}
      linearDamping={1.0}
      angularDamping={0.8}
      ccd
    >
      <BallCollider args={[0.5]} friction={1.5} restitution={0.05} />
      <mesh>
        <sphereGeometry args={[0.5, 48, 48]} />
        <meshStandardMaterial map={globeTexture} roughness={0.55} metalness={0.02} />
      </mesh>
    </RigidBody>
  );
}
