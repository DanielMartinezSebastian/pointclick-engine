"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useSceneStore } from "@pointclick-engine/engine-core";
const EMPTY_TRANSITIONS = [];
function CollisionZone({ transition, onActivate, debug, }) {
    const insideRef = useRef(false);
    useFrame(() => {
        const { playerPosition } = useSceneStore.getState();
        const [px, , pz] = playerPosition;
        const [tx, , tz] = transition.position;
        const [hx, , hz] = transition.halfSize;
        const inside = Math.abs(px - tx) <= hx && Math.abs(pz - tz) <= hz;
        if (inside && !insideRef.current) {
            insideRef.current = true;
            onActivate();
        }
        else if (!inside) {
            insideRef.current = false;
        }
    });
    const [x, y, z] = transition.position;
    const [hx, hy, hz] = transition.halfSize;
    return (_jsxs(_Fragment, { children: [_jsxs("mesh", { position: [x, y, z], raycast: () => null, children: [_jsx("boxGeometry", { args: [hx * 2, hy * 2, hz * 2] }), _jsx("meshBasicMaterial", { transparent: true, opacity: 0, depthWrite: false })] }), debug && (_jsxs("mesh", { position: [x, y, z], raycast: () => null, children: [_jsx("boxGeometry", { args: [hx * 2, hy * 2, hz * 2] }), _jsx("meshBasicMaterial", { color: "#00ff88", wireframe: true, transparent: true, opacity: 0.5, depthWrite: false })] }))] }));
}
export function SceneTransitions({ debug = false, onTransitionTriggered, }) {
    const transitions = useSceneStore((s) => s.scene.transitions ?? EMPTY_TRANSITIONS);
    return (_jsx(_Fragment, { children: transitions.map((transition) => {
            if (transition.kind === "collision") {
                return (_jsx(CollisionZone, { transition: transition, debug: debug, onActivate: () => onTransitionTriggered?.(transition.id, transition.targetSceneId) }, transition.id));
            }
            return null;
        }) }));
}
//# sourceMappingURL=SceneTransitions.js.map