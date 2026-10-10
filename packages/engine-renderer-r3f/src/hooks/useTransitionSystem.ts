"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  getGameRuntime,
  useDialogStore,
  useSceneStore,
  resolveTransitionFromItemDrop,
  resolveTransitionFromItemInteraction,
} from "@pointclick-engine/engine-core";
import type { RuntimeEvent, GameScene } from "@pointclick-engine/engine-core";
import { preloadSceneBackground } from "../scene/SceneBackgroundPlane";
import { resolveSceneFromRuntime } from "./useSceneRuntime";
import {
  decideLeaveScene,
  resolveUsedTransition,
  type CanLeaveScene,
} from "./transitionRules";

export type { CanLeaveScene, LeaveSceneTransition, LeaveSceneBlock } from "./transitionRules";

/**
 * Cablea las transiciones de escena:
 * - Por colision (via el callback `handleTransitionTriggered`)
 * - Por soltar/interactuar con un item (via `wrapRuntimeEventForTransitions`)
 */
export interface UseTransitionSystemOpts {
  onBeforeChange?: () => void;
  /** Resuelve el objeto de escena completo por ID. Por defecto, el registro del runtime. */
  resolveScene?: (sceneId: string) => GameScene | null;
  /**
   * Regla del juego para permitir salir de la escena. Si devuelve un objeto,
   * se muestra ese dialogo y no se cambia de escena. Se evalua al disparar la transicion.
   */
  canLeaveScene?: CanLeaveScene;
}

export function useTransitionSystem(opts?: UseTransitionSystemOpts) {
  const storeSetScene = useSceneStore((s) => s.setScene);
  const isTransitioningRef = useRef(false);
  const showDialog = useDialogStore((s) => s.show);
  const dialogVisible = useDialogStore((s) => s.visible);
  const pendingTransitionRef = useRef<{ id: string; targetSceneId: string } | null>(null);
  const optsRef = useRef(opts);
  useEffect(() => { optsRef.current = opts; });

  const changeScene = useCallback(
    (targetSceneId: string, transitionId: string) => {
      if (isTransitioningRef.current) return;

      const resolvedScene = (optsRef.current?.resolveScene ?? resolveSceneFromRuntime)(targetSceneId);
      if (!resolvedScene) {
        // Sin escena destino no se cambia nada; la guarda no llega a tomarse.
        console.warn(`[transition] target scene could not be resolved: ${targetSceneId}`);
        return;
      }

      isTransitioningRef.current = true;

      getGameRuntime()?.emit({
        type: "transition:started",
        transitionId,
      });

      // Notify caller synchronously so it can show the curtain overlay before
      // any state update causes a re-render with the new (backgroundless) scene.
      optsRef.current?.onBeforeChange?.();

      const fromSceneId = useSceneStore.getState().sceneId;
      const fromScene = useSceneStore.getState().scene;

      const { spawnPosition, walkTarget } = resolveUsedTransition(fromScene, transitionId);

      // Change scene first with optional custom spawn position
      storeSetScene(targetSceneId, resolvedScene, spawnPosition);

      // Then emit walk command in the new scene with correct pathfinding context
      if (walkTarget) {
        getGameRuntime()?.executeCommand({
          type: "player:walkTo",
          position: walkTarget,
        });
      }

      getGameRuntime()?.emit({
        type: "transition:completed",
        fromSceneId,
        toSceneId: targetSceneId,
      });

      // Reset guard after a brief delay so re-entering the same zone works
      setTimeout(() => {
        isTransitioningRef.current = false;
      }, 800);
    },
    [storeSetScene],
  );

  /** Called by SceneTransitions renderer when player enters a collision zone. */
  const handleTransitionTriggered = useCallback(
    (transitionId: string, targetSceneId: string) => {
      const currentSceneId = useSceneStore.getState().sceneId;
      const currentScene = useSceneStore.getState().scene;
      const transition = currentScene.transitions?.find((t) => t.id === transitionId);

      if (!transition) {
        console.warn(`[transition] transition not found: ${transitionId}`);
        return;
      }

      const decision = decideLeaveScene(optsRef.current?.canLeaveScene, {
        transitionId,
        fromSceneId: currentSceneId,
        targetSceneId,
      });
      if (!decision.allowed) {
        showDialog(decision.text, decision.dialogKey);
        return;
      }

      // Preload the target scene background so it's in browser cache when we switch.
      const resolveScene = optsRef.current?.resolveScene ?? resolveSceneFromRuntime;
      const targetBg = resolveScene(targetSceneId)?.background;
      if (targetBg) preloadSceneBackground(targetBg);

      getGameRuntime()?.emit({
        type: "transition:triggered",
        transitionId,
        targetSceneId,
      });
      changeScene(targetSceneId, transitionId);
    },
    [changeScene, showDialog],
  );

  /**
   * Handles item-drop and item-interact events from the inventory system.
   * Returns a passthrough handler that checks if the drop/interact matches a transition.
   * Defers the scene change until the dialog is dismissed.
   */
  const wrapRuntimeEventForTransitions = useCallback(
    (passthrough: (event: RuntimeEvent) => void) =>
      (event: RuntimeEvent) => {
        const scene = useSceneStore.getState().scene;

        if (event.type === "onDrop" && (event.outcome === "consume" || event.outcome === "place") && event.interactionId) {
          const gameEvent = {
            type: "item:dropped" as const,
            itemId: event.itemId,
            outcome: event.outcome as "consume" | "place",
            interactionId: event.interactionId,
          };
          const matching = resolveTransitionFromItemDrop(scene, gameEvent);
          if (matching) {
            getGameRuntime()?.emit({
              type: "transition:triggered",
              transitionId: matching.id,
              targetSceneId: matching.targetSceneId,
            });
            // Store transition to trigger after dialog closes
            pendingTransitionRef.current = { id: matching.id, targetSceneId: matching.targetSceneId };
          }
        }

        if (event.type === "onDrop" && event.outcome === "item-interact" && event.interactionId) {
          const matching = resolveTransitionFromItemInteraction(scene, event.itemId, event.interactionId);
          if (matching) {
            getGameRuntime()?.emit({
              type: "transition:triggered",
              transitionId: matching.id,
              targetSceneId: matching.targetSceneId,
            });
            // Store transition to trigger after dialog closes
            pendingTransitionRef.current = { id: matching.id, targetSceneId: matching.targetSceneId };
          }
        }

        passthrough(event);
      },
    [],
  );

  // Execute pending transition after dialog is dismissed
  useEffect(() => {
    if (!dialogVisible && pendingTransitionRef.current) {
      const t = pendingTransitionRef.current;
      pendingTransitionRef.current = null;
      changeScene(t.targetSceneId, t.id);
    }
  }, [dialogVisible, changeScene]);

  return { handleTransitionTriggered, wrapRuntimeEventForTransitions };
}
