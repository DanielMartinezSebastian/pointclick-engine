"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";

import {
  GameViewportView,
  useGameViewportController,
} from "@pointclick-engine/engine-renderer-r3f";
import { useSceneStore, type RuntimeEvent } from "@pointclick-engine/engine-core";

import { PixelLoader } from "./PixelLoader";
import { DraggedInventoryGhost, InventoryUI } from "./InventoryUI";
import { FreeCameraController } from "./scene/FreeCameraController";
import { SceneDoors } from "./scene/SceneDoors";
import { DebugOverlayRuntimePanel } from "./debug/DebugOverlayRuntimePanel";
import { SCENES } from "../../demo-content/scenes/scenes";
import { DAVID } from "../../demo-content/characters/david";
import type { GameRuntime } from "../lib/engine/publicApi";
import { DEMO_VIEWPORT_OPTIONS } from "../lib/engine/runtime/demoViewportOptions";
import { useDemoUiSounds } from "../lib/engine/runtime/useDemoAudio";
import { useDemoSceneDebug } from "../lib/engine/runtime/useDemoSceneDebug";
import { useDoorClickGoal, useDoorEventBridge } from "../lib/engine/runtime/useDoorSystem";
import { useInteractionEditorController } from "../lib/engine/runtime/useInteractionEditorController";
import { useDebugPanelController } from "../lib/engine/runtime/useDebugPanelController";
import { useDebugModeEffects } from "../lib/engine/runtime/useDebugModeEffects";
import { useTransitionEditorController } from "../lib/engine/runtime/useTransitionEditorController";
import { useMobileInputStore } from "../store/mobileInputStore";
import { useSceneEditorStore } from "../store/sceneEditorStore";
import { useInventoryStore } from "../store/inventoryStore";
import {
  selectGameInteractionsDisabled,
  selectSceneEditingBlocked,
  useEditorModeStore,
} from "../store/editorModeStore";

// Carga el joystick solo en cliente (ssr: false); la detección de dispositivo
// táctil se realiza dentro del propio componente con window garantizado.
const Joystick = dynamic(() => import("./Joystick"), { ssr: false });

type GameTouchCanvasProps = {
  /** Runtime ya creado (page.tsx lo crea antes de montar el canvas). */
  runtime?: GameRuntime | null;
  debug?: boolean;
  onRuntimeEvent?: (event: RuntimeEvent) => void;
};

/**
 * Juego de la demo: el motor (`useGameViewportController` + `GameViewportView`, en el
 * renderer) más lo propio de la demo: puertas, debug/editor, joystick, mochila,
 * pantalla de carga y sonidos de UI.
 */
export default function GameTouchCanvas({
  runtime,
  debug: debugOverride,
  onRuntimeEvent,
}: GameTouchCanvasProps = {}) {
  const [sceneReady, setSceneReady] = useState(false);
  const handleSceneReady = useCallback(() => setSceneReady(true), []);

  const { isDebug } = useDebugModeEffects();
  const runtimeDebug = typeof debugOverride === "boolean" ? debugOverride : isDebug;

  // Expone el sceneStore en window para tests E2E / debug externo.
  // Solo activo cuando debug mode está habilitado (nunca en producción).
  useEffect(() => {
    if (!runtimeDebug) return;
    (window as unknown as Record<string, unknown>).__sceneStore = useSceneStore;
    return () => {
      delete (window as unknown as Record<string, unknown>).__sceneStore;
    };
  }, [runtimeDebug]);

  const debugPanel = useDebugPanelController();

  // Las puertas (demo) observan los eventos del runtime antes que el callback del host:
  // un `consume` sobre la diana de una puerta la abre.
  const doorSceneId = useSceneStore((s) => s.sceneId);
  const handleHostRuntimeEvent = useDoorEventBridge({
    scene: SCENES[doorSceneId],
    passthrough: onRuntimeEvent,
  });

  // Estado de escena, inventario, transiciones, audio y cadena de eventos (renderer).
  const controller = useGameViewportController({
    ...DEMO_VIEWPORT_OPTIONS,
    runtime,
    onRuntimeEvent: handleHostRuntimeEvent,
    debug: runtimeDebug,
  });
  const { sceneId, playerPosition, scenePlayerSpawn, updateInteraction } = controller;
  const { sceneOptions, setScene } = useDemoSceneDebug(controller.storeSetScene);

  // Las puertas son datos de la demo (no están en GameScene del core).
  const currentScene = SCENES[sceneId];
  const getEffectiveClickGoal = useDoorClickGoal(currentScene);
  const handleSpeechLetterSound = useDemoUiSounds();

  const isInventoryOpen = useInventoryStore((s) => s.isOpen);
  const toggleInventory = useInventoryStore((s) => s.toggle);

  const interactionEditor = useInteractionEditorController({
    playerPosition,
    scenePlayerSpawnY: scenePlayerSpawn[1],
    updateInteraction,
  });
  const transitionEditor = useTransitionEditorController();

  // Editor / camera modes (debug only; defaults preserve runtime behavior)
  const disableClickToMove = useEditorModeStore(selectGameInteractionsDisabled);
  const sceneEditingBlocked = useEditorModeStore(selectSceneEditingBlocked);
  const wallOpacityMode = useEditorModeStore((s) => s.wallOpacityMode);
  const cameraMode = useEditorModeStore((s) => s.cameraMode);
  const showPlayerCollider = useEditorModeStore((s) => s.showPlayerCollider);

  // DI props for renderer-r3f's GameTouchSpriteRuntime
  const addWallWithData = useSceneEditorStore((s) => s.addWallWithData);
  const selectedWallIndex = useSceneEditorStore((s) => s.selectedWallIndex);
  const onSelectWall = useSceneEditorStore((s) => s.selectWall);
  const updateSelectedWall = useSceneEditorStore((s) => s.updateSelectedWall);

  const overlay = (
    <>
      <PixelLoader ready={sceneReady} />
      <Joystick />
      <InventoryUI
        isOpen={isInventoryOpen}
        slots={controller.inventorySlots}
        onToggle={toggleInventory}
        onStartDrag={controller.handleStartInventoryDrag}
      />
      {controller.draggedStack && (
        <DraggedInventoryGhost
          stack={controller.draggedStack.stack}
          initialPointerX={controller.draggedStack.pointerX}
          initialPointerY={controller.draggedStack.pointerY}
        />
      )}
      <DebugOverlayRuntimePanel
        {...debugPanel}
        {...interactionEditor}
        isDebug={runtimeDebug}
        sceneId={sceneId}
        setScene={setScene}
        sceneOptions={sceneOptions}
        readyMessage="Dave listo — flechas/WASD o click para moverse"
        requestRespawn={controller.requestRespawn}
        showSpeechBubble={controller.showSpeechBubble}
        hideSpeechBubble={controller.hideSpeechBubble}
        speechVisible={controller.speechVisible}
        sceneInteractions={controller.sceneInteractions}
        resetInteractionsFromSceneConfig={controller.resetInteractionsFromSceneConfig}
        placedItems={controller.placedItems}
        updatePlacedItemPosition={controller.updatePlacedItemPosition}
        movePlacedItemToPlayer={controller.movePlacedItemToPlayer}
        removePlacedItemById={controller.removePlacedItemById}
        sceneTransitions={controller.sceneTransitions}
        updateTransitionPosition={transitionEditor.updateTransitionPosition}
        updateTransitionHalfSize={transitionEditor.updateTransitionHalfSize}
        updateTransitionTargetScene={transitionEditor.updateTransitionTargetScene}
        moveTransitionToPlayer={transitionEditor.moveTransitionToPlayer}
        addTransition={transitionEditor.createTransition}
        removeTransition={transitionEditor.deleteTransition}
      />
    </>
  );

  return (
    <GameViewportView
      controller={controller}
      character={DAVID}
      debug={runtimeDebug}
      cameraMode={cameraMode}
      canPickupItems={!disableClickToMove}
      onSceneReady={handleSceneReady}
      spriteRuntimeProps={{
        showDebugGround: debugPanel.isDebugGroundVisible,
        showDebugWalls: debugPanel.isDebugWallsVisible,
        showPlayerCollider,
        wallOpacityMode,
        wallInteractionsEnabled: !sceneEditingBlocked,
        wallToolMode: debugPanel.wallToolMode,
        disableClickToMove,
        getEffectiveClickGoal,
        wallPointResetSignal: debugPanel.wallPointResetSignal,
        speechCharsPerSecond: debugPanel.speechCharsPerSecond,
        onSpeechLetterSound: handleSpeechLetterSound,
        getMobileInput: useMobileInputStore.getState,
        addWallWithData,
        selectedWallIndex,
        onSelectWall,
        updateSelectedWall,
      }}
      canvasChildren={<FreeCameraController />}
      overlay={overlay}
    >
      <SceneDoors doors={currentScene?.doors ?? []} />
    </GameViewportView>
  );
}
