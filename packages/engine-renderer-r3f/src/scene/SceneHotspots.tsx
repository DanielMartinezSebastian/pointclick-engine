"use client";

import type { ThreeEvent } from "@react-three/fiber";
import type { GameSceneHotspot } from "@pointclick-engine/engine-core";

import type { DraggedInventoryPayload } from "../inventory/SceneDropTargets";
import { DROP_HIT_SCALE, pointInVolume, resolveDropOwner, type VolumeLike } from "./hotspotLogic";

export type SceneHotspotsProps = {
  hotspots: readonly GameSceneHotspot[];
  /** Item arrastrado ahora, o `null`. */
  draggedStack: DraggedInventoryPayload | null;
  /** Dianas de `SceneDropTargets`: si el punto cae en una, gana ella. */
  dropTargets: readonly VolumeLike[];
  onActivate: (hotspot: GameSceneHotspot, screenPosition: { x: number; y: number }) => void;
  onDropItem: (hotspot: GameSceneHotspot, itemId: string) => void;
  debug?: boolean;
};

function toTuple(e: ThreeEvent<PointerEvent>): [number, number, number] {
  return [e.point.x, e.point.y, e.point.z];
}

/**
 * Volumenes clicables de los hotspots (los NPC incluidos: llegan ya proyectados en
 * `scene.hotspots`). Sin hotspots no renderiza nada. El click NO llega al suelo
 * (no hay click-to-move) salvo que caiga sobre una diana de arrastre.
 */
export function SceneHotspots({
  hotspots,
  draggedStack,
  dropTargets,
  onActivate,
  onDropItem,
  debug = false,
}: SceneHotspotsProps) {
  if (hotspots.length === 0) return null;
  const k = DROP_HIT_SCALE * 2;
  return (
    <>
      {hotspots.map((hotspot) => {
        const [hx, hy, hz] = hotspot.halfSize;
        return (
          <group key={hotspot.id} position={hotspot.position} rotation={[0, hotspot.rotationY ?? 0, 0]}>
            <mesh
              onPointerDown={(e) => {
                if (draggedStack) return;
                // Sobre una diana, el click sigue su camino de siempre (inspeccion / suelo).
                if (dropTargets.some((t) => pointInVolume(toTuple(e), t))) return;
                e.stopPropagation();
                onActivate(hotspot, { x: e.clientX, y: e.clientY });
              }}
              onPointerUp={(e) => {
                if (!draggedStack) return;
                if (resolveDropOwner(toTuple(e), dropTargets) === "target") return;
                e.stopPropagation();
                onDropItem(hotspot, draggedStack.stack.id);
              }}
            >
              <boxGeometry args={[hx * k, hy * k, hz * k]} />
              <meshBasicMaterial transparent opacity={0.01} depthWrite={false} />
            </mesh>
            {debug && (
              <mesh raycast={() => null}>
                <boxGeometry args={[hx * k, hy * k, hz * k]} />
                <meshBasicMaterial color="#ffb347" wireframe transparent opacity={0.8} depthWrite={false} />
              </mesh>
            )}
          </group>
        );
      })}
    </>
  );
}
