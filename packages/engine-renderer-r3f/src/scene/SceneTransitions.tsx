"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useSceneStore } from "@pointclick-engine/engine-core";
import type {
  GameSceneTransition,
  GameSceneTransitionOnCollision,
} from "@pointclick-engine/engine-core";

function CollisionZone({
  transition,
  onActivate,
  debug,
}: {
  transition: GameSceneTransitionOnCollision;
  onActivate: () => void;
  debug: boolean;
}) {
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
    } else if (!inside) {
      insideRef.current = false;
    }
  });

  if (!debug) return null;

  const [x, y, z] = transition.position;
  const [hx, hy, hz] = transition.halfSize;
  return (
    <mesh position={[x, y, z]} raycast={() => null}>
      <boxGeometry args={[hx * 2, hy * 2, hz * 2]} />
      <meshBasicMaterial color="#00ff88" wireframe transparent opacity={0.5} depthWrite={false} />
    </mesh>
  );
}

export function SceneTransitions({
  debug = false,
  onTransitionTriggered,
}: {
  debug?: boolean;
  onTransitionTriggered?: (transitionId: string, targetSceneId: string) => void;
}) {
  const transitions = useSceneStore((s) => s.scene.transitions ?? ([] as GameSceneTransition[]));

  return (
    <>
      {transitions.map((transition) => {
        if (transition.kind === "collision") {
          return (
            <CollisionZone
              key={transition.id}
              transition={transition}
              debug={debug}
              onActivate={() =>
                onTransitionTriggered?.(transition.id, transition.targetSceneId)
              }
            />
          );
        }
        return null;
      })}
    </>
  );
}
