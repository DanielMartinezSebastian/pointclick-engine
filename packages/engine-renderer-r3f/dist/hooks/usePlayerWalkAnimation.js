"use client";
import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useSceneStore } from "@pointclick-engine/engine-core";
// Walk animation config
const WALK_DURATION_MS = 2000; // 2 seconds to complete walk
const COLLISION_CHECK_RADIUS = 0.5; // Collision radius around player
/**
 * Hook that smoothly animates player walking along a calculated path.
 *
 * - Interpolates position via useFrame
 * - Detects collisions and aborts if blocked
 * - Allows manual cancellation on user input
 * - Returns animated position for rendering
 *
 * Usage:
 * ```
 * const { animatedPosition, isWalking } = usePlayerWalkAnimation(
 *   playerPosition,
 *   walkingState
 * );
 * ```
 */
export function usePlayerWalkAnimation(playerPosition, walkingState, onWalkAbort, onWalkComplete) {
    const updateWalkProgress = useSceneStore((s) => s.updateWalkProgress);
    const scene = useSceneStore((s) => s.scene);
    // Animated position: either from path or current player position
    const animatedPositionRef = useRef(playerPosition);
    const lastPlayerPositionRef = useRef(playerPosition);
    // Track elapsed time for walk animation
    const elapsedRef = useRef(0);
    // Keep walkingState in ref so useFrame always sees current value
    const walkingStateRef = useRef(walkingState);
    const playerPositionRef = useRef(playerPosition);
    // Update refs when props change
    useEffect(() => {
        walkingStateRef.current = walkingState;
        playerPositionRef.current = playerPosition;
    }, [walkingState, playerPosition]);
    // Detect if user manually moved player (input override)
    // But only check when NOT walking (during walk, position changes are from animation)
    const lastWalkStateRef = useRef(null);
    useEffect(() => {
        // Only detect input when NOT actively walking
        if (walkingState?.isActive) {
            lastWalkStateRef.current = walkingState;
            lastPlayerPositionRef.current = playerPosition;
            return;
        }
        const posChanged = playerPosition[0] !== lastPlayerPositionRef.current[0] ||
            playerPosition[2] !== lastPlayerPositionRef.current[2];
        // If walk just started, ignore the position change (it's from scene transition)
        const walkJustStarted = !lastWalkStateRef.current?.isActive && walkingState?.isActive;
        if (posChanged && walkingState?.isActive && !walkJustStarted) {
            // User input detected during walk → abort
            onWalkAbort?.("user-input");
            useSceneStore.getState().setPlayerWalkingState(null);
        }
        lastPlayerPositionRef.current = playerPosition;
        lastWalkStateRef.current = walkingState;
    }, [playerPosition, walkingState?.isActive, onWalkAbort]);
    // Animation frame loop
    useFrame((_, delta) => {
        const currentWalkingState = walkingStateRef.current;
        const currentPlayerPosition = playerPositionRef.current;
        if (!currentWalkingState?.isActive) {
            // Not walking, use current position
            animatedPositionRef.current = currentPlayerPosition;
            return;
        }
        // console.log(`[usePlayerWalkAnimation] Walking, progress:`, currentWalkingState.progress);
        elapsedRef.current += delta * 1000; // Convert to ms
        const progress = Math.min(elapsedRef.current / WALK_DURATION_MS, 1);
        // Interpolate position along path
        if (currentWalkingState.pathPoints.length >= 2) {
            const startPos = currentWalkingState.pathPoints[0];
            const endPos = currentWalkingState.pathPoints[currentWalkingState.pathPoints.length - 1];
            const interpolated = [
                startPos[0] + (endPos[0] - startPos[0]) * progress,
                startPos[1], // Y stays at ground level
                startPos[2] + (endPos[2] - startPos[2]) * progress,
            ];
            // Check collision with walls (simplified)
            const collision = checkCollisionAtPosition(interpolated, scene);
            if (collision) {
                // Abort walk on collision
                onWalkAbort?.("collision");
                useSceneStore.getState().setPlayerWalkingState(null);
                animatedPositionRef.current = playerPosition;
                return;
            }
            animatedPositionRef.current = interpolated;
            updateWalkProgress(progress);
            // Walk complete when progress reaches 1
            if (progress >= 1) {
                onWalkComplete?.();
                useSceneStore.getState().setPlayerWalkingState(null);
                elapsedRef.current = 0;
            }
        }
    });
    return {
        animatedPosition: animatedPositionRef.current,
        isWalking: walkingStateRef.current?.isActive ?? false,
        progress: walkingStateRef.current?.progress ?? 0,
    };
}
/**
 * Simplified collision check: see if position would collide with any wall.
 * (Note: This is a conservative check. Real collision would use physics engine.)
 */
function checkCollisionAtPosition(position, scene) {
    const [x, y, z] = position;
    const buffer = COLLISION_CHECK_RADIUS;
    // Check against all walls
    for (const wall of scene.walls) {
        const [wx, wy, wz] = wall.position;
        const [hwx, hwy, hwz] = wall.halfSize;
        // Conservative AABB check
        const wallMinX = wx - hwx;
        const wallMaxX = wx + hwx;
        const wallMinZ = wz - hwz;
        const wallMaxZ = wz + hwz;
        if (x > wallMinX - buffer &&
            x < wallMaxX + buffer &&
            z > wallMinZ - buffer &&
            z < wallMaxZ + buffer) {
            return true; // Collision detected
        }
    }
    return false; // No collision
}
//# sourceMappingURL=usePlayerWalkAnimation.js.map