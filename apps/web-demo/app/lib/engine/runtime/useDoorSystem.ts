"use client";

import { useCallback } from "react";

import type { RuntimeEvent } from "@pointclick-engine/engine-core";
import type { Scene } from "../../../../demo-content/scenes/scenes";
import { useDoorStore } from "../../../store/doorStore";

/**
 * Approach offset added to the wall's halfZ to compute the stop point in
 * front of a closed door. Larger = player stops further away from the door.
 */
const DOOR_APPROACH_GAP = 1.2;

/**
 * Door event bridge — turns engine runtime events into door state changes.
 *
 * The engine's declarative item-rule pipeline already handles the heavy
 * lifting: a `<drop-target>` interaction with `acceptsItemIds` filters
 * which items are valid, and a matching `ItemDefinition.interactionRules`
 * entry decides the outcome ("consume" removes the item from inventory).
 *
 * When that outcome fires for a target whose id matches a `SceneDoor.id`
 * in the active scene, this bridge flips the door open via `useDoorStore`.
 * From the engine's point of view nothing about doors needs to exist —
 * the demo simply listens for `onDrop`+`consume` events and translates
 * them into a door-state change. That keeps the door concept entirely
 * inside the demo layer, free to evolve into a first-class engine
 * primitive later without breaking the existing rule wiring.
 *
 * Returns a handler you can plug into `useInventoryRuntimeController`'s
 * `onRuntimeEvent` prop. Composable: chain it with other handlers if you
 * already have one.
 */
export function useDoorSystem({
  scene,
  passthrough,
}: {
  /** Active scene. `scene.doors` is read to map drop-target → door. */
  scene: Scene | undefined;
  /** Optional handler to chain after the door bridge (e.g., legacy logs). */
  passthrough?: (event: RuntimeEvent) => void;
}) {
  const setOpen = useDoorStore((s) => s.setOpen);

  const handleRuntimeEvent = useCallback(
    (event: RuntimeEvent) => {
      // 1) Apply door logic for matching consume events.
      if (
        event.type === "onDrop" &&
        event.outcome === "consume" &&
        event.interactionId
      ) {
        const door = scene?.doors?.find((d) => d.id === event.interactionId);
        if (door) {
          setOpen(door.id, true);
        }
      }

      // 2) Always passthrough so the rest of the runtime keeps working.
      passthrough?.(event);
    },
    [scene, setOpen, passthrough],
  );

  /**
   * Click-goal preprocessor for the runtime's click-to-move pipeline.
   *
   * Behavior: for each closed door in the active scene, check whether the
   * click point is past the door's wall from the player's perspective.
   * If so, replace the goal with an "approach point" — a position on the
   * player's side of the wall, aligned with the door, offset by the
   * wall depth + a small gap. This stops the player in front of the
   * locked door instead of routing them around the entire wall.
   *
   * Limitation: assumes axis-aligned walls (rotationY ≈ 0). For rotated
   * walls we currently bail out and return null (use the original goal),
   * so the path may still route around. Generalizing this is a future task.
   */
  const getEffectiveClickGoal = useCallback(
    (clickX: number, clickZ: number, playerX: number, playerZ: number) => {
      const doors = scene?.doors;
      const walls = scene?.walls;
      if (!doors || !walls) return null;

      for (const door of doors) {
        if (useDoorStore.getState().isOpen(door.id)) continue;
        const wall = walls[door.wallIndex];
        if (!wall) continue;
        const rotY = wall.rotationY ?? 0;
        if (Math.abs(rotY) > 0.05) continue; // axis-aligned only, for now

        const wallZ = wall.position[2];
        const wallHalfZ = wall.halfSize[2];

        const playerOnSouth = playerZ > wallZ;
        const clickOnSouth = clickZ > wallZ;

        // Only redirect when the click is on the opposite side of the wall
        // — same side means the player can already walk there directly.
        if (playerOnSouth === clickOnSouth) continue;

        // Also: only redirect if the click X is roughly aligned with the
        // door (otherwise the user is probably trying to walk past the
        // wall around its edge, which is legit).
        const wallHalfX = wall.halfSize[0];
        if (Math.abs(clickX - wall.position[0]) > wallHalfX) continue;

        const approachZ = playerOnSouth
          ? wallZ + wallHalfZ + DOOR_APPROACH_GAP
          : wallZ - wallHalfZ - DOOR_APPROACH_GAP;
        return { x: door.position[0], z: approachZ };
      }

      return null;
    },
    [scene],
  );

  return { handleRuntimeEvent, getEffectiveClickGoal };
}
