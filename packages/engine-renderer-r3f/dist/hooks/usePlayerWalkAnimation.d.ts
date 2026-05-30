import type { GameVec3, PlayerWalkingState } from "@pointclick-engine/engine-core";
interface UsePlayerWalkAnimationResult {
    /** Current animated position (may differ from store position during walk) */
    animatedPosition: GameVec3;
    /** Whether currently walking */
    isWalking: boolean;
    /** Progress 0-1 */
    progress: number;
}
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
export declare function usePlayerWalkAnimation(playerPosition: GameVec3, walkingState: PlayerWalkingState | null, onWalkAbort?: (reason: "user-input" | "collision" | "unreachable") => void, onWalkComplete?: () => void): UsePlayerWalkAnimationResult;
export {};
//# sourceMappingURL=usePlayerWalkAnimation.d.ts.map