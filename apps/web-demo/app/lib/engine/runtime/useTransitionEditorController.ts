import { useCallback } from "react";
import { useSceneStore } from "@pointclick-engine/engine-core";
import type { GameSceneTransition } from "@pointclick-engine/engine-core";

export function useTransitionEditorController() {
  const updateTransition = useSceneStore((s) => s.updateTransition);
  const addTransition = useSceneStore((s) => s.addTransition);
  const removeTransition = useSceneStore((s) => s.removeTransition);

  const updateTransitionPosition = useCallback(
    (id: string, axis: 0 | 1 | 2, value: number) => {
      updateTransition(id, (transition) => ({
        ...transition,
        position: [
          axis === 0 ? value : transition.position[0],
          axis === 1 ? value : transition.position[1],
          axis === 2 ? value : transition.position[2],
        ] as [number, number, number],
      }));
    },
    [updateTransition],
  );

  const updateTransitionHalfSize = useCallback(
    (id: string, axis: 0 | 1 | 2, value: number) => {
      updateTransition(id, (transition) => ({
        ...transition,
        halfSize: [
          axis === 0 ? value : transition.halfSize[0],
          axis === 1 ? value : transition.halfSize[1],
          axis === 2 ? value : transition.halfSize[2],
        ] as [number, number, number],
      }));
    },
    [updateTransition],
  );

  const updateTransitionTargetScene = useCallback(
    (id: string, targetSceneId: string) => {
      updateTransition(id, (transition) => ({
        ...transition,
        targetSceneId,
      }));
    },
    [updateTransition],
  );

  const moveTransitionToPlayer = useCallback(
    (id: string) => {
      const { playerPosition } = useSceneStore.getState();
      updateTransition(id, (transition) => ({
        ...transition,
        position: [...playerPosition] as [number, number, number],
      }));
    },
    [updateTransition],
  );

  const createTransition = useCallback(
    (transition: GameSceneTransition) => {
      addTransition(transition);
    },
    [addTransition],
  );

  const deleteTransition = useCallback(
    (id: string) => {
      removeTransition(id);
    },
    [removeTransition],
  );

  return {
    updateTransitionPosition,
    updateTransitionHalfSize,
    updateTransitionTargetScene,
    moveTransitionToPlayer,
    createTransition,
    deleteTransition,
  };
}
