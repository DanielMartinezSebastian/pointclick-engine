"use client";

import { Suspense, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { OrthographicCamera } from "@react-three/drei";
import { Physics } from "@react-three/rapier";

import {
  type GameCharacterName,
} from "./sprite/clips";
import dynamic from "next/dynamic";
import { DraggedInventoryGhost, InventoryUI } from "./InventoryUI";
import { SceneDropTargets } from "./inventory/SceneDropTargets";
import { PlacedSceneItems } from "./inventory/PlacedSceneItems";
import { SceneBackgroundPlane } from "./scene/SceneBackgroundPlane";
import { CameraController, CameraFitHeight } from "./scene/SceneCameraControllers";
import { DebugOverlayRuntimePanel } from "./debug/DebugOverlayRuntimePanel";
import { GameTouchSpriteRuntime } from "../lib/engine/runtime/GameTouchSpriteRuntime";
import { useInventoryRuntimeController } from "../lib/engine/runtime/useInventoryRuntimeController";
import { useInteractionEditorController } from "../lib/engine/runtime/useInteractionEditorController";
import { useDebugPanelController } from "../lib/engine/runtime/useDebugPanelController";
import { useDebugModeEffects } from "../lib/engine/runtime/useDebugModeEffects";
import { useSceneRuntimeController } from "../lib/engine/runtime/useSceneRuntimeController";
import type { RuntimeEvent } from "../lib/engine/types/runtimeEvents";

// Carga el joystick solo en cliente (ssr: false); la detección de dispositivo
// táctil se realiza dentro del propio componente con window garantizado.
const Joystick = dynamic(() => import("./Joystick"), { ssr: false });

const CAMERA_POSITION: [number, number, number] = [0, 5.4, 25.0];


export default function GameTouchCanvas() {
  const selectedCharacter: GameCharacterName = "Dave";
  const { isDebug } = useDebugModeEffects();

  const handleRuntimeEvent = useCallback((event: RuntimeEvent) => {
    if (!isDebug) return;
    console.debug("[runtime-event]", event);
  }, [isDebug]);

  const {
    debugPanelSide,
    setDebugPanelSide,
    isDebugGroundVisible,
    setIsDebugGroundVisible,
    isDebugWallsVisible,
    setIsDebugWallsVisible,
    editorMode,
    setEditorMode,
    wallToolMode,
    wallPointResetSignal,
    handleWallToolModeChange,
    resetWallPointTool,
    speechDraft,
    setSpeechDraft,
    speechCharsPerSecond,
    setSpeechCharsPerSecond,
  } = useDebugPanelController();
  const {
    sceneId,
    sceneBackground,
    setScene,
    sceneInteractions,
    requestRespawn,
    playerPosition,
    scenePlayerSpawn,
    updateInteraction,
    resetInteractionsFromSceneConfig,
    sceneOptions,
  } = useSceneRuntimeController();

  const {
    speechText,
    speechVisible,
    speechTrigger,
    isInventoryOpen,
    inventorySlots,
    draggedStack,
    placedItems,
    setIsInventoryOpen,
    handleBoundaryHit,
    showSpeechBubble,
    hideSpeechBubble,
    handleInventoryDropHit,
    handleInventoryDropMiss,
    handleInventoryDropOnPlayer,
    handlePickupPlacedItem,
    updatePlacedItemPosition,
    movePlacedItemToPlayer,
    removePlacedItemById,
    handleStartInventoryDrag,
  } = useInventoryRuntimeController({
    sceneId,
    sceneInteractions,
    playerPosition,
    onRuntimeEvent: handleRuntimeEvent,
  });

  const {
    updateInteractionPosition,
    updateInteractionHalfSize,
    updateInteractionRotationDeg,
    moveInteractionToPlayer,
  } = useInteractionEditorController({
    playerPosition,
    scenePlayerSpawnY: scenePlayerSpawn[1],
    updateInteraction,
  });

  const readyMessage = `${selectedCharacter} listo — flechas/WASD o click para moverse`;

  return (
    <div style={{ position: "fixed", inset: 0, width: "100dvw", height: "100dvh", overflow: "hidden" }}>

      <Canvas
        gl={{ alpha: false, antialias: true, preserveDrawingBuffer: false }}
        onPointerDownCapture={() => setIsInventoryOpen(false)}
        onCreated={(state) => {
          try {
            const glCtx = state.gl.getContext();
            console.log("Three: renderer created", {
              contextAttributes: glCtx?.getContextAttributes?.(),
              version: glCtx?.getParameter?.(glCtx.VERSION),
              shadingLanguageVersion: glCtx?.getParameter?.(glCtx.SHADING_LANGUAGE_VERSION),
            });
            state.gl.setClearColor(0x0f0f10, 1);
            state.gl.clear();
          } catch (err) {
            console.error("Three: onCreated error", err);
          }
        }}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 1, background: "transparent", display: "block" }}
      >
        <OrthographicCamera makeDefault position={CAMERA_POSITION} rotation={[-0.24, 0, 0]} near={0.01} far={120} />
        <CameraFitHeight desiredWorldHeight={19.28} />
        {/* <fog attach="fog" args={["#070d1f", 20, 55]} /> */}
        <ambientLight intensity={1.1} color="#8bc2ff" />
        <directionalLight position={[3, 9, 6]} intensity={1.5} color="#d8ecff" />
        <SceneBackgroundPlane url={sceneBackground} />
        <CameraController />
        <Physics gravity={[0, -20, 0]}>
          <Suspense fallback={null}>
            <GameTouchSpriteRuntime
              activeCharacter={selectedCharacter}
              debug={isDebug}
              showDebugGround={isDebugGroundVisible}
              showDebugWalls={isDebugWallsVisible}
              wallToolMode={wallToolMode}
              wallPointResetSignal={wallPointResetSignal}
              speechText={speechText}
              speechVisible={speechVisible}
              speechTrigger={speechTrigger}
              speechCharsPerSecond={speechCharsPerSecond}
              onBoundaryHit={handleBoundaryHit}
              onSpeechDismiss={hideSpeechBubble}
              onRuntimeEvent={handleRuntimeEvent}
            />
          </Suspense>
          <SceneDropTargets
            targets={sceneInteractions}
            draggedStack={draggedStack ? { stack: draggedStack.stack, fromSlotIndex: draggedStack.fromSlotIndex } : null}
            onDropHit={handleInventoryDropHit}
            onDropMiss={handleInventoryDropMiss}
            playerDropTarget={{
              position: playerPosition,
              onDrop: handleInventoryDropOnPlayer,
            }}
          />
          <PlacedSceneItems
            items={placedItems}
            onPickup={handlePickupPlacedItem}
            canPickup={!isInventoryOpen}
          />
        </Physics>
      </Canvas>

      <Joystick />
      <InventoryUI
        isOpen={isInventoryOpen}
        slots={inventorySlots}
        onToggle={() => setIsInventoryOpen((open) => !open)}
        onStartDrag={handleStartInventoryDrag}
      />
      {draggedStack && (
        <DraggedInventoryGhost
          stack={draggedStack.stack}
          initialPointerX={draggedStack.pointerX}
          initialPointerY={draggedStack.pointerY}
        />
      )}
      <DebugOverlayRuntimePanel
        isDebug={isDebug}
        debugPanelSide={debugPanelSide}
        setDebugPanelSide={setDebugPanelSide}
        isDebugGroundVisible={isDebugGroundVisible}
        setIsDebugGroundVisible={setIsDebugGroundVisible}
        isDebugWallsVisible={isDebugWallsVisible}
        setIsDebugWallsVisible={setIsDebugWallsVisible}
        sceneId={sceneId}
        setScene={setScene}
        sceneOptions={sceneOptions}
        readyMessage={readyMessage}
        requestRespawn={requestRespawn}
        editorMode={editorMode}
        setEditorMode={setEditorMode}
        wallToolMode={wallToolMode}
        handleWallToolModeChange={handleWallToolModeChange}
        resetWallPointTool={resetWallPointTool}
        speechDraft={speechDraft}
        setSpeechDraft={setSpeechDraft}
        speechCharsPerSecond={speechCharsPerSecond}
        setSpeechCharsPerSecond={setSpeechCharsPerSecond}
        showSpeechBubble={showSpeechBubble}
        hideSpeechBubble={hideSpeechBubble}
        speechVisible={speechVisible}
        sceneInteractions={sceneInteractions}
        updateInteractionPosition={updateInteractionPosition}
        updateInteractionHalfSize={updateInteractionHalfSize}
        updateInteractionRotationDeg={updateInteractionRotationDeg}
        moveInteractionToPlayer={moveInteractionToPlayer}
        resetInteractionsFromSceneConfig={resetInteractionsFromSceneConfig}
        placedItems={placedItems}
        updatePlacedItemPosition={updatePlacedItemPosition}
        movePlacedItemToPlayer={movePlacedItemToPlayer}
        removePlacedItemById={removePlacedItemById}
      />
    </div>
  );
}
