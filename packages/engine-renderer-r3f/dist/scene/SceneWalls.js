"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { useSceneStore } from "@pointclick-engine/engine-core";
import { SceneWallPlane } from "./SceneWallPlane";
import { computeWallSegments } from "./wallSegments";
export function SceneWalls({ debug, opacityMode = "wireframe", interactionsEnabled = true, onStartWallMove, onStartWallResize, selectedWallIndex = null, onSelectWall, }) {
    const isOpaque = opacityMode === "opaque";
    const walls = useSceneStore((s) => s.scene.walls);
    // Returning null from raycast removes the mesh from the picking pass, so
    // OrbitControls drag never produces an onPointerDown on a wall element.
    const blockRaycast = interactionsEnabled ? undefined : () => null;
    return (_jsxs(_Fragment, { children: [walls.map((wall, i) => {
                // Decompose wall into solid segments around its openings.
                // Each segment gets its own CuboidCollider (real physics holes)
                // and its own debug mesh (real visual hole — no overlay).
                const segments = computeWallSegments(wall.halfSize, wall.openings);
                const isSelected = selectedWallIndex === i;
                return (_jsxs(RigidBody, { type: "fixed", 
                    // colliders={false} is critical: by default @react-three/rapier
                    // auto-generates a cuboid collider per child mesh — that would
                    // promote the debug wireframes AND (when the wall is selected) the
                    // resize-handle cubes into physical obstacles, silently blocking
                    // the player around the wall's Z faces and inside the opening.
                    colliders: false, position: wall.position, rotation: [0, wall.rotationY, 0], children: [segments.map((seg, si) => (_jsx(CuboidCollider, { position: seg.position, args: seg.halfSize }, si))), debug && (_jsxs(_Fragment, { children: [segments.map((seg, si) => (_jsxs("mesh", { position: seg.position, raycast: blockRaycast, onPointerDown: interactionsEnabled ? (e) => {
                                        e.stopPropagation();
                                        onSelectWall?.(i);
                                        onStartWallMove(i, e.point.x, e.point.z);
                                    } : undefined, children: [_jsx("boxGeometry", { args: [seg.halfSize[0] * 2, seg.halfSize[1] * 2, seg.halfSize[2] * 2] }), _jsx("meshBasicMaterial", { color: isSelected ? "#ffff00" : "#ff4400", wireframe: !isOpaque, transparent: isOpaque, opacity: isOpaque ? 0.65 : 1, depthWrite: !isOpaque })] }, si))), isSelected && interactionsEnabled && (_jsxs(_Fragment, { children: [_jsxs("mesh", { position: [wall.halfSize[0], 0, 0], raycast: blockRaycast, onPointerDown: interactionsEnabled ? (e) => {
                                                e.stopPropagation();
                                                onStartWallResize(i, "x+");
                                            } : undefined, children: [_jsx("boxGeometry", { args: [0.35, 0.35, 0.35] }), _jsx("meshBasicMaterial", { color: "#00d8ff" })] }), _jsxs("mesh", { position: [-wall.halfSize[0], 0, 0], raycast: blockRaycast, onPointerDown: interactionsEnabled ? (e) => {
                                                e.stopPropagation();
                                                onStartWallResize(i, "x-");
                                            } : undefined, children: [_jsx("boxGeometry", { args: [0.35, 0.35, 0.35] }), _jsx("meshBasicMaterial", { color: "#00d8ff" })] }), _jsxs("mesh", { position: [0, 0, wall.halfSize[2]], raycast: blockRaycast, onPointerDown: interactionsEnabled ? (e) => {
                                                e.stopPropagation();
                                                onStartWallResize(i, "z+");
                                            } : undefined, children: [_jsx("boxGeometry", { args: [0.35, 0.35, 0.35] }), _jsx("meshBasicMaterial", { color: "#ff00aa" })] }), _jsxs("mesh", { position: [0, 0, -wall.halfSize[2]], raycast: blockRaycast, onPointerDown: interactionsEnabled ? (e) => {
                                                e.stopPropagation();
                                                onStartWallResize(i, "z-");
                                            } : undefined, children: [_jsx("boxGeometry", { args: [0.35, 0.35, 0.35] }), _jsx("meshBasicMaterial", { color: "#ff00aa" })] })] }))] }))] }, i));
            }), walls.map((wall, i) => wall.textureUrl ? (_jsx(SceneWallPlane, { wall: wall, renderOrder: i }, `wall-plane-${i}`)) : null)] }));
}
//# sourceMappingURL=SceneWalls.js.map