"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { ClampToEdgeWrapping, FrontSide, NearestFilter, SRGBColorSpace, TextureLoader, } from "three";
const SHOULD_LOG_SPRITE_STATE = process.env.NODE_ENV !== "production";
let spriteInstanceCounter = 0;
function logSpriteState(event, payload) {
    if (!SHOULD_LOG_SPRITE_STATE)
        return;
    if (typeof window !== "undefined") {
        const nextEntry = { scope: "sprite", event, payload, ts: Date.now() };
        const currentTrace = (window.__gameTrace ?? []);
        window.__gameTrace = [...currentTrace, nextEntry].slice(-300);
    }
    console.info(`[sprite-state] ${event}`, payload);
}
function cloneTexture(sourceTexture) {
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
const DavidSprite = forwardRef(({ animation, preloadAnimations, meshRef, scale = [2.2, 2.2, 1], isPaused = false }, ref) => {
    const spriteInstanceIdRef = useRef(null);
    if (spriteInstanceIdRef.current == null) {
        spriteInstanceIdRef.current = ++spriteInstanceCounter;
    }
    const internalRef = useRef(null);
    const targetRef = meshRef ?? internalRef;
    const materialRef = useRef(null);
    const renderer = useThree((state) => state.gl);
    const preloadedFrames = useMemo(() => {
        if (!preloadAnimations?.length) {
            return null;
        }
        const uniqueFrames = new Set();
        preloadAnimations.forEach((clip) => {
            clip.frames.forEach((frame) => {
                uniqueFrames.add(frame);
            });
        });
        return Array.from(uniqueFrames);
    }, [preloadAnimations]);
    const framesToLoad = preloadedFrames ?? animation.frames;
    const sourceTextures = useLoader(TextureLoader, framesToLoad);
    const texturesByFrame = useMemo(() => {
        const byFrame = new Map();
        framesToLoad.forEach((frame, index) => {
            const sourceTexture = sourceTextures[index];
            if (!sourceTexture)
                return;
            byFrame.set(frame, cloneTexture(sourceTexture));
        });
        return byFrame;
    }, [framesToLoad, sourceTextures]);
    const textures = useMemo(() => animation.frames
        .map((frame) => texturesByFrame.get(frame))
        .filter((texture) => Boolean(texture)), [animation.frames, texturesByFrame]);
    useEffect(() => {
        const initTexture = renderer.initTexture;
        if (!initTexture)
            return;
        texturesByFrame.forEach((texture) => {
            initTexture(texture);
        });
    }, [renderer, texturesByFrame]);
    const frameAspect = useMemo(() => {
        const image = textures[0]?.image;
        if (!image?.width || !image?.height) {
            return 1;
        }
        return image.width / image.height;
    }, [textures]);
    const frameCursorRef = useRef(0);
    const frameTimeRef = useRef(0);
    useEffect(() => {
        const instanceId = spriteInstanceIdRef.current;
        logSpriteState("mount", {
            instanceId,
            preloadClipCount: preloadAnimations?.length ?? 1,
            loadedFrameCount: framesToLoad.length,
        });
        return () => {
            logSpriteState("unmount", { instanceId });
        };
    }, [framesToLoad.length, preloadAnimations]);
    useEffect(() => {
        logSpriteState("animation-change", {
            instanceId: spriteInstanceIdRef.current,
            fps: animation.fps,
            frameCount: animation.frames.length,
            firstFrame: animation.frames[0],
        });
    }, [animation]);
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
    useImperativeHandle(ref, () => ({
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
    }), [animation.loop, textures]);
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
    const meshScale = useMemo(() => [animation.flipX ? -Math.abs(sx) : Math.abs(sx), sy, sz], [animation.flipX, sx, sy, sz]);
    const planeWidth = 2 * frameAspect;
    const planeHeight = 2;
    return (_jsxs("mesh", { ref: targetRef, scale: meshScale, children: [_jsx("planeGeometry", { args: [planeWidth, planeHeight] }), _jsx("meshBasicMaterial", { ref: materialRef, map: textures[0], transparent: true, toneMapped: false, side: FrontSide })] }));
});
DavidSprite.displayName = "DavidSprite";
export default DavidSprite;
//# sourceMappingURL=DavidSprite.js.map