"use client";

import { useLoader } from "@react-three/fiber";
import { BallCollider, RigidBody } from "@react-three/rapier";
import { TextureLoader, type Texture } from "three";

import { useSceneStore } from "@pointclick-engine/engine-core";

export type SceneCollisionSphereProps = {
  /** Textura opcional de la esfera. Sin ella se pinta con un material liso. */
  textureUrl?: string;
};

function SphereBody({ texture }: { texture?: Texture }) {
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
        <meshStandardMaterial map={texture} roughness={0.55} metalness={0.02} />
      </mesh>
    </RigidBody>
  );
}

function TexturedSphere({ textureUrl }: { textureUrl: string }) {
  const texture = useLoader(TextureLoader, textureUrl);
  return <SphereBody texture={texture} />;
}

/**
 * Esfera física suelta para probar colisiones. El paquete no trae ningún asset:
 * la textura, si se quiere, la aporta el host.
 */
export function SceneCollisionSphere({ textureUrl }: SceneCollisionSphereProps = {}) {
  return textureUrl ? <TexturedSphere textureUrl={textureUrl} /> : <SphereBody />;
}
