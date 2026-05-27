"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useMemo } from "react";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { useSceneStore } from "@pointclick-engine/engine-core";
const checkerVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const checkerFragmentShader = /* glsl */ `
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
export function SceneGround({ onClickWorld, onHoverWorld, debug, depthNearZ, depthFarZ, }) {
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
    return (_jsxs(_Fragment, { children: [_jsxs(RigidBody, { type: "fixed", position: [centerX, ground.y, centerZ], children: [_jsx(CuboidCollider, { args: [width / 2, 0.2, depth / 2], friction: 2.8, restitution: 0 }), _jsxs("mesh", { rotation: [-Math.PI / 2, 0, 0], onPointerDown: (e) => {
                            e.stopPropagation();
                            onClickWorld(e.point.x, e.point.z);
                        }, onPointerMove: (e) => {
                            if (!onHoverWorld)
                                return;
                            onHoverWorld(e.point.x, e.point.z);
                        }, children: [_jsx("planeGeometry", { args: [width, depth] }), _jsx("meshBasicMaterial", { transparent: true, opacity: 0, depthWrite: false })] })] }), _jsx(RigidBody, { type: "fixed", position: [centerX, borderWallCenterY, ground.minZ - borderWallHalfThickness], children: _jsx(CuboidCollider, { args: [width / 2 + borderWallHalfThickness, borderWallHalfHeight, borderWallHalfThickness] }) }), _jsx(RigidBody, { type: "fixed", position: [centerX, borderWallCenterY, ground.maxZ + borderWallHalfThickness], children: _jsx(CuboidCollider, { args: [width / 2 + borderWallHalfThickness, borderWallHalfHeight, borderWallHalfThickness] }) }), _jsx(RigidBody, { type: "fixed", position: [ground.minX - borderWallHalfThickness, borderWallCenterY, centerZ], children: _jsx(CuboidCollider, { args: [borderWallHalfThickness, borderWallHalfHeight, depth / 2 + borderWallHalfThickness] }) }), _jsx(RigidBody, { type: "fixed", position: [ground.maxX + borderWallHalfThickness, borderWallCenterY, centerZ], children: _jsx(CuboidCollider, { args: [borderWallHalfThickness, borderWallHalfHeight, depth / 2 + borderWallHalfThickness] }) }), debug && (_jsxs(_Fragment, { children: [_jsxs("mesh", { position: [centerX, gy, centerZ], rotation: [-Math.PI / 2, 0, 0], raycast: () => null, children: [_jsx("planeGeometry", { args: [width, depth, segX, segZ] }), _jsx("shaderMaterial", { vertexShader: checkerVertexShader, fragmentShader: checkerFragmentShader, uniforms: checkerUniforms, transparent: true, depthWrite: false })] }), _jsxs("mesh", { position: [centerX, gy + 0.001, centerZ], rotation: [-Math.PI / 2, 0, 0], raycast: () => null, children: [_jsx("planeGeometry", { args: [width, depth, segX, segZ] }), _jsx("meshBasicMaterial", { color: "#00ff41", wireframe: true, transparent: true, opacity: 0.45, depthWrite: false })] }), _jsxs("mesh", { position: [centerX, gy, ground.minZ], children: [_jsx("boxGeometry", { args: [width + t, t, t] }), _jsx("meshBasicMaterial", { color: "#00ff88" })] }), _jsxs("mesh", { position: [centerX, gy, ground.maxZ], children: [_jsx("boxGeometry", { args: [width + t, t, t] }), _jsx("meshBasicMaterial", { color: "#00ff88" })] }), _jsxs("mesh", { position: [ground.minX, gy, centerZ], children: [_jsx("boxGeometry", { args: [t, t, depth] }), _jsx("meshBasicMaterial", { color: "#00ff88" })] }), _jsxs("mesh", { position: [ground.maxX, gy, centerZ], children: [_jsx("boxGeometry", { args: [t, t, depth] }), _jsx("meshBasicMaterial", { color: "#00ff88" })] }), _jsxs("mesh", { position: [ground.minX, ground.y + 1.25, ground.minZ], children: [_jsx("boxGeometry", { args: [t, 2.5, t] }), _jsx("meshBasicMaterial", { color: "#ffff00" })] }), _jsxs("mesh", { position: [ground.maxX, ground.y + 1.25, ground.minZ], children: [_jsx("boxGeometry", { args: [t, 2.5, t] }), _jsx("meshBasicMaterial", { color: "#ffff00" })] }), _jsxs("mesh", { position: [ground.minX, ground.y + 1.25, ground.maxZ], children: [_jsx("boxGeometry", { args: [t, 2.5, t] }), _jsx("meshBasicMaterial", { color: "#ffff00" })] }), _jsxs("mesh", { position: [ground.maxX, ground.y + 1.25, ground.maxZ], children: [_jsx("boxGeometry", { args: [t, 2.5, t] }), _jsx("meshBasicMaterial", { color: "#ffff00" })] }), _jsxs("mesh", { position: [centerX, gy, depthNearZ], children: [_jsx("boxGeometry", { args: [width, t, t] }), _jsx("meshBasicMaterial", { color: "#ff8800" })] }), _jsxs("mesh", { position: [centerX, gy, depthFarZ], children: [_jsx("boxGeometry", { args: [width, t, t] }), _jsx("meshBasicMaterial", { color: "#ff4400" })] })] }))] }));
}
//# sourceMappingURL=SceneGround.js.map