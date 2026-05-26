"use client";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
/**
 * R3F adapter that exposes a GameLoopPort. Must be used inside a Canvas tree.
 *
 * Usage:
 *   const loop = useR3FGameLoop();
 *   useEffect(() => loop.subscribe(delta => ...), [loop]);
 */
export function useR3FGameLoop() {
    const callbacksRef = useRef(new Set());
    useFrame((_state, delta) => {
        for (const cb of callbacksRef.current)
            cb(delta);
    });
    // Stable port reference — created once, never recreated
    const portRef = useRef({
        subscribe(callback) {
            callbacksRef.current.add(callback);
            return () => {
                callbacksRef.current.delete(callback);
            };
        },
    });
    return portRef.current;
}
//# sourceMappingURL=gameLoopR3F.js.map