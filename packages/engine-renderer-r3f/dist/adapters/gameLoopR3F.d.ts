import type { GameLoopPort } from "@pointclick/engine-core";
/**
 * R3F adapter that exposes a GameLoopPort. Must be used inside a Canvas tree.
 *
 * Usage:
 *   const loop = useR3FGameLoop();
 *   useEffect(() => loop.subscribe(delta => ...), [loop]);
 */
export declare function useR3FGameLoop(): GameLoopPort;
//# sourceMappingURL=gameLoopR3F.d.ts.map