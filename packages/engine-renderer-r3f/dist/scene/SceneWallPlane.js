"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { DoubleSide, TextureLoader } from "three";
/**
 * SceneWallPlane – renders a wall texture as a camera-facing plane.
 *
 * Follows the same camera-billboard pattern as SceneBackgroundPlane:
 * the plane always faces the camera (quaternion copy) and is positioned
 * at the wall's world position plus an optional texturePosition offset.
 * depthTest/depthWrite are disabled so the texture renders on top of
 * scene geometry, ordered by renderOrder.
 *
 * Only rendered when `wall.textureUrl` is set.
 */
export function SceneWallPlane({ wall, renderOrder = 0, }) {
    const [texture, setTexture] = useState(null);
    const meshRef = useRef(null);
    useEffect(() => {
        if (!wall.textureUrl) {
            setTexture(null);
            return;
        }
        const loader = new TextureLoader();
        let mounted = true;
        let loadedTexture = null;
        loader.load(wall.textureUrl, (tex) => {
            if (!mounted) {
                tex.dispose();
                return;
            }
            loadedTexture = tex;
            setTexture(tex);
        }, undefined, (err) => {
            console.warn("SceneWallPlane: texture load error", err);
        });
        return () => {
            mounted = false;
            if (loadedTexture) {
                loadedTexture.dispose();
            }
        };
    }, [wall.textureUrl]);
    useFrame(({ camera }) => {
        if (!meshRef.current)
            return;
        // Position: wall world position + texturePosition offset
        const wx = wall.position[0] + (wall.texturePosition?.[0] ?? 0);
        const wy = wall.position[1] + (wall.texturePosition?.[1] ?? 0);
        const wz = wall.position[2] + (wall.texturePosition?.[2] ?? 0);
        meshRef.current.position.set(wx, wy, wz);
        // Always face the camera (billboard)
        meshRef.current.quaternion.copy(camera.quaternion);
    });
    if (!wall.textureUrl || !texture)
        return null;
    // Derive plane dimensions from texture aspect ratio + wall height
    const textureImage = texture?.image;
    const aspect = textureImage?.width && textureImage?.height
        ? textureImage.width / textureImage.height
        : 1;
    const planeHeight = wall.halfSize[1] * 2;
    const planeWidth = planeHeight * aspect;
    return (_jsxs("mesh", { ref: meshRef, frustumCulled: false, renderOrder: renderOrder, children: [_jsx("planeGeometry", { args: [planeWidth, planeHeight] }), _jsx("meshBasicMaterial", { map: texture, side: DoubleSide, depthTest: false, depthWrite: false, transparent: true })] }));
}
//# sourceMappingURL=SceneWallPlane.js.map