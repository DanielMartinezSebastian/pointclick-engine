"use client";

import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { DoubleSide, Mesh, TextureLoader, Vector3 } from "three";

import { useSceneStore } from "@pointclick-engine/engine-core";

export function SceneBackgroundPlane({ url }: { url: string | null | undefined }) {
  const [texture, setTexture] = useState<import("three").Texture | null>(null);
  const meshRef = useRef<Mesh | null>(null);
  const ground = useSceneStore((s) => s.scene.ground);

  useEffect(() => {
    if (!url) return;

    const loader = new TextureLoader();
    let mounted = true;
    let loadedTexture: import("three").Texture | null = null;

    loader.load(
      url,
      (tex) => {
        if (!mounted) {
          tex.dispose();
          return;
        }

        loadedTexture = tex;
        setTexture(tex);
      },
      undefined,
      (err) => {
        console.warn("SceneBackgroundPlane: texture load error", err);
      },
    );

    return () => {
      mounted = false;
      if (loadedTexture) {
        loadedTexture.dispose();
      }
    };
  }, [url]);

  let aspect = 16 / 9;
  const textureImage = texture?.image as { width?: number; height?: number } | undefined;
  if (textureImage?.width && textureImage?.height) {
    aspect = textureImage.width / textureImage.height;
  }

  const height = 19.28;
  const groundCenterX = (ground.minX + ground.maxX) / 2;
  const width = height * aspect;

  useFrame(({ camera }) => {
    if (!meshRef.current) return;
    const dir = new Vector3();
    camera.getWorldDirection(dir);
    const distance = 10;
    meshRef.current.position.copy(camera.position).addScaledVector(dir, distance);
    meshRef.current.position.x = groundCenterX;
    meshRef.current.quaternion.copy(camera.quaternion);
  });

  if (!url) return null;
  if (!texture) return null;

  return (
    <mesh ref={meshRef} frustumCulled={false} renderOrder={-100}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} side={DoubleSide} depthTest={false} depthWrite={false} />
    </mesh>
  );
}