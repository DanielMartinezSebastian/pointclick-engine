"use client";

import { useEffect, useMemo, useRef, forwardRef, useImperativeHandle } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import {
  ClampToEdgeWrapping,
  FrontSide,
  Mesh,
  NearestFilter,
  SRGBColorSpace,
  Texture,
  TextureLoader,
} from "three";

type AnimationClip = {
  x: number;
  y: number;
  frameWidth: number;
  frameHeight: number;
  strideX: number;
  startFrame: number;
  endFrame: number;
  fps: number;
  loop?: boolean;
};

type AtlasGrid = {
  width: number;
  height: number;
};

type AnimatedSpriteProps = {
  textureUrl: string;
  clip: AnimationClip;
  atlas: AtlasGrid;
  meshRef?: React.RefObject<Mesh | null>;
  scale?: [number, number, number];
  flipX?: boolean;
  isPaused?: boolean;
};

export type AnimatedSpriteHandle = {
  nextFrame: () => void;
};

function applyFrame(texture: Texture, atlas: AtlasGrid, clip: AnimationClip, frame: number) {
  const uvWidth = clip.frameWidth / atlas.width;
  const uvHeight = clip.frameHeight / atlas.height;
  const frameX = clip.x + frame * clip.strideX;
  const frameY = clip.y;

  texture.repeat.set(uvWidth, uvHeight);
  texture.offset.set(frameX / atlas.width, 1 - (frameY + clip.frameHeight) / atlas.height);
}

const AnimatedSprite = forwardRef<AnimatedSpriteHandle, AnimatedSpriteProps>(
  ({
    textureUrl,
    clip,
    atlas,
    meshRef,
    scale = [2.2, 2.2, 1],
    flipX = false,
    isPaused = false,
  }: AnimatedSpriteProps, ref) => {
    const internalRef = useRef<Mesh>(null);
    const targetRef = meshRef ?? internalRef;
    const sourceTexture = useLoader(TextureLoader, textureUrl);

    const texture = useMemo(() => {
      const clonedTexture = sourceTexture.clone();
      clonedTexture.colorSpace = SRGBColorSpace;
      clonedTexture.magFilter = NearestFilter;
      clonedTexture.minFilter = NearestFilter;
      clonedTexture.wrapS = ClampToEdgeWrapping;
      clonedTexture.wrapT = ClampToEdgeWrapping;
      clonedTexture.generateMipmaps = false;
      clonedTexture.needsUpdate = true;
      return clonedTexture;
    }, [sourceTexture]);

    const frameCursorRef = useRef(clip.startFrame);
    const frameTimeRef = useRef(0);

    useEffect(() => {
      frameCursorRef.current = clip.startFrame;
      frameTimeRef.current = 0;
      applyFrame(texture, atlas, clip, clip.startFrame);
    }, [atlas, clip, texture]);

    useImperativeHandle(
      ref,
      () => ({
        nextFrame: () => {
          const clipLength = clip.endFrame - clip.startFrame + 1;
          const nextFrameIndex = frameCursorRef.current - clip.startFrame + 1;

          if (clip.loop ?? true) {
            frameCursorRef.current = clip.startFrame + (nextFrameIndex % clipLength);
          } else {
            frameCursorRef.current = Math.min(clip.startFrame + nextFrameIndex, clip.endFrame);
          }

          applyFrame(texture, atlas, clip, frameCursorRef.current);
        },
      }),
      [clip, texture, atlas],
    );

    useFrame((_, delta) => {
      if (isPaused) {
        return;
      }

      frameTimeRef.current += delta;
      const stepTime = 1 / clip.fps;

      if (frameTimeRef.current < stepTime) {
        return;
      }

      const steps = Math.floor(frameTimeRef.current / stepTime);
      frameTimeRef.current -= steps * stepTime;

      const clipLength = clip.endFrame - clip.startFrame + 1;
      const frameAdvance = frameCursorRef.current - clip.startFrame + steps;

      if (clip.loop ?? true) {
        frameCursorRef.current = clip.startFrame + (frameAdvance % clipLength);
      } else {
        frameCursorRef.current = Math.min(clip.startFrame + frameAdvance, clip.endFrame);
      }

      applyFrame(texture, atlas, clip, frameCursorRef.current);
    });

    // Memoizar el array de escala para que R3F no re-aplique el prop en cada render
    // y no sobreescriba la escala imperativa que gestiona el padre desde useFrame.
    const [sx, sy, sz] = scale;
    const meshScale = useMemo<[number, number, number]>(
      () => [flipX ? -Math.abs(sx) : Math.abs(sx), sy, sz],
      [flipX, sx, sy, sz],
    );

    return (
      <mesh
        ref={targetRef}
        scale={meshScale}
      >
        <planeGeometry args={[2, 2]} />
        <meshBasicMaterial map={texture} transparent toneMapped={false} side={FrontSide} />
      </mesh>
    );
  },
);

AnimatedSprite.displayName = "AnimatedSprite";

export default AnimatedSprite;