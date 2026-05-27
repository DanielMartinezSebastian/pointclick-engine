"use client";

import { useCallback } from "react";

import type { SceneInteraction } from "../../../../demo-content/scenes/scenes";

const PLAYER_COLLIDER_HALF_HEIGHT = 0.95;
const DEBUG_INTERACTION_COLLISION_OVERLAP_MARGIN = 0.05;

function keepInteractionCollidable(
  interaction: SceneInteraction,
  playerSpawnY: number,
): SceneInteraction {
  if (!interaction.hasCollision) return interaction;

  const minTopY =
    playerSpawnY -
    PLAYER_COLLIDER_HALF_HEIGHT +
    DEBUG_INTERACTION_COLLISION_OVERLAP_MARGIN;
  const minCenterY = minTopY - interaction.halfSize[1];
  if (interaction.position[1] >= minCenterY) return interaction;

  const position = [...interaction.position] as [number, number, number];
  position[1] = minCenterY;
  return { ...interaction, position };
}

export function useInteractionEditorController({
  playerPosition,
  scenePlayerSpawnY,
  updateInteraction,
}: {
  playerPosition: [number, number, number];
  scenePlayerSpawnY: number;
  updateInteraction: (
    id: string,
    updater: (interaction: SceneInteraction) => SceneInteraction,
  ) => void;
}) {
  const updateInteractionPosition = useCallback(
    (id: string, axis: 0 | 1 | 2, value: number) => {
      updateInteraction(id, (interaction) => {
        const position = [...interaction.position] as [number, number, number];
        position[axis] = value;
        return keepInteractionCollidable(
          { ...interaction, position },
          scenePlayerSpawnY,
        );
      });
    },
    [scenePlayerSpawnY, updateInteraction],
  );

  const updateInteractionHalfSize = useCallback(
    (id: string, axis: 0 | 1 | 2, value: number) => {
      updateInteraction(id, (interaction) => {
        const halfSize = [...interaction.halfSize] as [number, number, number];
        halfSize[axis] = Math.max(0.05, value);
        return keepInteractionCollidable(
          { ...interaction, halfSize },
          scenePlayerSpawnY,
        );
      });
    },
    [scenePlayerSpawnY, updateInteraction],
  );

  const updateInteractionRotationDeg = useCallback(
    (id: string, value: number) => {
      updateInteraction(id, (interaction) => ({
        ...interaction,
        rotationY: (value * Math.PI) / 180,
      }));
    },
    [updateInteraction],
  );

  const moveInteractionToPlayer = useCallback(
    (id: string) => {
      updateInteraction(id, (interaction) => ({
        ...interaction,
        position: [
          playerPosition[0],
          interaction.position[1],
          playerPosition[2],
        ],
      }));
    },
    [playerPosition, updateInteraction],
  );

  return {
    updateInteractionPosition,
    updateInteractionHalfSize,
    updateInteractionRotationDeg,
    moveInteractionToPlayer,
  };
}
