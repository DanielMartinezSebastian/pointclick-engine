"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { GameLoopCallback, GameLoopPort, Unsubscribe } from "@pointclick/engine-core";

/**
 * R3F adapter that exposes a GameLoopPort. Must be used inside a Canvas tree.
 *
 * Usage:
 *   const loop = useR3FGameLoop();
 *   useEffect(() => loop.subscribe(delta => ...), [loop]);
 */
export function useR3FGameLoop(): GameLoopPort {
  const callbacksRef = useRef(new Set<GameLoopCallback>());

  useFrame((_state, delta) => {
    for (const cb of callbacksRef.current) cb(delta);
  });

  // Stable port reference — created once, never recreated
  const portRef = useRef<GameLoopPort>({
    subscribe(callback: GameLoopCallback): Unsubscribe {
      callbacksRef.current.add(callback);
      return () => {
        callbacksRef.current.delete(callback);
      };
    },
  });

  return portRef.current;
}
