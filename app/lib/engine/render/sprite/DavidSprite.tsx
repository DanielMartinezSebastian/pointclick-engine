"use client";

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import {
  ClampToEdgeWrapping,
  FrontSide,
  Mesh,
  MeshBasicMaterial,
  NearestFilter,
  SRGBColorSpace,
  Texture,
  TextureLoader,
} from "three";

import type { SpriteAnimation } from "./clips";

type DavidSpriteProps = {
  animation: SpriteAnimation;
  meshRef?: React.RefObject<Mesh | null>;
  scale?: [number, number, number];
  isPaused?: boolean;
};

export type DavidSpriteHandle = {
  nextFrame: () => void;
};

function cloneTexture(sourceTexture: Texture) {
  const clonedTexture = sourceTexture.clone();
  clonedTexture.colorSpace = SRGBColorSpace;
  clonedTexture.magFilter = NearestFilter;
  clonedTexture.minFilter = NearestFilter;
  clonedTexture.wrapS = ClampToEdgeWrapping;
  clonedTexture.wrapT = ClampToEdgeWrapping;
  clonedTexture.generateMipmaps = false;
  clonedTexture.needsUpdate = true;
  return clonedTexture;
}

const DavidSprite = forwardRef<DavidSpriteHandle, DavidSpriteProps>(
  ({ animation, meshRef, scale = [2.2, 2.2, 1], isPaused = false }, ref) => {
    const internalRef = useRef<Mesh>(null);
    const targetRef = meshRef ?? internalRef;
    const materialRef = useRef<MeshBasicMaterial>(null);
    const sourceTextures = useLoader(TextureLoader, animation.frames) as unknown as Texture[];

    const textures = useMemo(() => sourceTextures.map(cloneTexture), [sourceTextures]);
    const frameAspect = useMemo(() => {
      const image = textures[0]?.image as { width?: number; height?: number } | undefined;
      if (!image?.width || !image?.height) {
        return 1;
      }

      return image.width / image.height;
    }, [textures]);
    const frameCursorRef = useRef(0);
    const frameTimeRef = useRef(0);

    useEffect(() => {
      frameCursorRef.current = 0;
      frameTimeRef.current = 0;

      const firstTexture = textures[0];
      const material = materialRef.current;

      if (material && firstTexture) {
        material.map = firstTexture;
        material.needsUpdate = true;
      }
    }, [animation, textures]);

    useImperativeHandle(
      ref,
      () => ({
        nextFrame: () => {
          if (textures.length <= 1) {
            return;
          }

          const clipLength = textures.length;
          frameCursorRef.current = animation.loop ?? true
            ? (frameCursorRef.current + 1) % clipLength
            : Math.min(frameCursorRef.current + 1, clipLength - 1);

          const material = materialRef.current;
          const nextTexture = textures[frameCursorRef.current];

          if (material && nextTexture) {
            material.map = nextTexture;
            material.needsUpdate = true;
          }
        },
      }),
      [animation.loop, textures],
    );

    useFrame((_, delta) => {
      if (isPaused || textures.length <= 1) {
        return;
      }

      frameTimeRef.current += delta;
      const stepTime = 1 / animation.fps;

      if (frameTimeRef.current < stepTime) {
        return;
      }

      const steps = Math.floor(frameTimeRef.current / stepTime);
      frameTimeRef.current -= steps * stepTime;

      frameCursorRef.current = animation.loop ?? true
        ? (frameCursorRef.current + steps) % textures.length
        : Math.min(frameCursorRef.current + steps, textures.length - 1);

      const material = materialRef.current;
      const nextTexture = textures[frameCursorRef.current];

      if (material && nextTexture) {
        material.map = nextTexture;
        material.needsUpdate = true;
      }
    });

    const [sx, sy, sz] = scale;
    const meshScale = useMemo<[number, number, number]>(
      () => [animation.flipX ? -Math.abs(sx) : Math.abs(sx), sy, sz],
      [animation.flipX, sx, sy, sz],
    );
    const planeWidth = 2 * frameAspect;
    const planeHeight = 2;

    return (
      <mesh ref={targetRef} scale={meshScale}>
        <planeGeometry args={[planeWidth, planeHeight]} />
        <meshBasicMaterial ref={materialRef} map={textures[0]} transparent toneMapped={false} side={FrontSide} />
      </mesh>
    );
  },
);

DavidSprite.displayName = "DavidSprite";

export default DavidSprite;
