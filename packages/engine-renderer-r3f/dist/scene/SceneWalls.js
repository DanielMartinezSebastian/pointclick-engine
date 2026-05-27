"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { useSceneStore } from "@pointclick-engine/engine-core";
export function SceneWalls({ debug, onStartWallMove, onStartWallResize, selectedWallIndex = null, onSelectWall, }) {
    const walls = useSceneStore((s) => s.scene.walls);
    return (_jsx(_Fragment, { children: walls.map((wall, i) => (_jsxs(RigidBody, { type: "fixed", position: wall.position, rotation: [0, wall.rotationY, 0], children: [_jsx(CuboidCollider, { args: wall.halfSize }), debug && (_jsxs(_Fragment, { children: [_jsxs("mesh", { onPointerDown: (e) => {
                                e.stopPropagation();
                                onSelectWall?.(i);
                                onStartWallMove(i, e.point.x, e.point.z);
                            }, children: [_jsx("boxGeometry", { args: [wall.halfSize[0] * 2, wall.halfSize[1] * 2, wall.halfSize[2] * 2] }), _jsx("meshBasicMaterial", { color: selectedWallIndex === i ? "#ffff00" : "#ff4400", wireframe: true })] }), selectedWallIndex === i && (_jsxs(_Fragment, { children: [_jsxs("mesh", { position: [wall.halfSize[0], 0, 0], onPointerDown: (e) => {
                                        e.stopPropagation();
                                        onStartWallResize(i, "x+");
                                    }, children: [_jsx("boxGeometry", { args: [0.35, 0.35, 0.35] }), _jsx("meshBasicMaterial", { color: "#00d8ff" })] }), _jsxs("mesh", { position: [-wall.halfSize[0], 0, 0], onPointerDown: (e) => {
                                        e.stopPropagation();
                                        onStartWallResize(i, "x-");
                                    }, children: [_jsx("boxGeometry", { args: [0.35, 0.35, 0.35] }), _jsx("meshBasicMaterial", { color: "#00d8ff" })] }), _jsxs("mesh", { position: [0, 0, wall.halfSize[2]], onPointerDown: (e) => {
                                        e.stopPropagation();
                                        onStartWallResize(i, "z+");
                                    }, children: [_jsx("boxGeometry", { args: [0.35, 0.35, 0.35] }), _jsx("meshBasicMaterial", { color: "#ff00aa" })] }), _jsxs("mesh", { position: [0, 0, -wall.halfSize[2]], onPointerDown: (e) => {
                                        e.stopPropagation();
                                        onStartWallResize(i, "z-");
                                    }, children: [_jsx("boxGeometry", { args: [0.35, 0.35, 0.35] }), _jsx("meshBasicMaterial", { color: "#ff00aa" })] })] }))] }))] }, i))) }));
}
//# sourceMappingURL=SceneWalls.js.map