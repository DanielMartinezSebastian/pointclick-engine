"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrthographicCamera } from "@react-three/drei";
import { Physics } from "@react-three/rapier";

import { PixelLoader } from "./PixelLoader";

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
import { GameTouchSpriteRuntime } from "@pointclick/engine-renderer-r3f";
import { useInventoryRuntimeController } from "../lib/engine/runtime/useInventoryRuntimeController";
import { useInteractionEditorController } from "../lib/engine/runtime/useInteractionEditorController";
import { useDebugPanelController } from "../lib/engine/runtime/useDebugPanelController";
import { useDebugModeEffects } from "../lib/engine/runtime/useDebugModeEffects";
import { useSceneRuntimeController } from "../lib/engine/runtime/useSceneRuntimeController";
import { legacyRuntimeEventToGameEvent, type RuntimeEvent } from "@pointclick/engine-core";
import { getGameRuntime } from "../lib/engine/publicApi";
import { useMobileInputStore } from "../store/mobileInputStore";
import { useSceneEditorStore } from "../store/sceneEditorStore";
import { useDialogStore } from "../store/dialogStore";
import { useInventoryStore } from "../store/inventoryStore";
import { getRandomPhrase } from "../../demo-content/dialogs/getRandomPhrase";

// Carga el joystick solo en cliente (ssr: false); la detección de dispositivo
// táctil se realiza dentro del propio componente con window garantizado.
const Joystick = dynamic(() => import("./Joystick"), { ssr: false });

const CAMERA_POSITION: [number, number, number] = [0, 5.4, 25.0];

type GameTouchCanvasProps = {
  debug?: boolean;
  onRuntimeEvent?: (event: RuntimeEvent) => void;
};

/**
 * Se monta dentro del Suspense del runtime — cuando este componente llega al
 * DOM significa que useLoader ha resuelto todos los assets del personaje.
 * Llama onReady una sola vez para señalizar al PixelLoader.
 */
function SceneReadyReporter({ onReady }: { onReady: () => void }) {
  const onReadyRef = useRef(onReady);
  useEffect(() => { onReadyRef.current(); }, []); // intentional: run once on mount
  return null;
}

export default function GameTouchCanvas({
  debug: debugOverride,
  onRuntimeEvent,
}: GameTouchCanvasProps = {}) {
  const selectedCharacter: GameCharacterName = "Dave";
  const [sceneReady, setSceneReady] = useState(false);
  const handleSceneReady = useCallback(() => setSceneReady(true), []);

  const { isDebug } = useDebugModeEffects();
  const runtimeDebug = typeof debugOverride === "boolean" ? debugOverride : isDebug;

  const handleRuntimeEvent = useCallback((event: RuntimeEvent) => {
    // Legacy callback (backwards compat)
    onRuntimeEvent?.(event);
    // Also emit to the bidirectional event bus (Phase 4)
    const gameEvent = legacyRuntimeEventToGameEvent(event);
    getGameRuntime()?.emit(gameEvent);
    if (!runtimeDebug) return;
    console.debug("[runtime-event]", event);
  }, [onRuntimeEvent, runtimeDebug]);

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

  // Dialog state lives in dialogStore (also writable via dialog:trigger / dialog:dismiss commands)
  const speechText = useDialogStore((s) => s.text);
  const speechVisible = useDialogStore((s) => s.visible);
  const speechTrigger = useDialogStore((s) => s.triggerCount);

  // Inventory visibility lives in inventoryStore (also writable via inventory:toggle command)
  const isInventoryOpen = useInventoryStore((s) => s.isOpen);
  const toggleInventory = useInventoryStore((s) => s.toggle);

  const {
    inventorySlots,
    draggedStack,
    placedItems,
    handleBoundaryHit,
    showSpeechBubble,
    hideSpeechBubble,
    handleInteractionInspect,
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

  // DI props for renderer-r3f's GameTouchSpriteRuntime
  const addWallWithData = useSceneEditorStore((s) => s.addWallWithData);
  const selectedWallIndex = useSceneEditorStore((s) => s.selectedWallIndex);
  const onSelectWall = useSceneEditorStore((s) => s.selectWall);

  const readyMessage = `${selectedCharacter} listo — flechas/WASD o click para moverse`;

  return (
    <div style={{ position: "fixed", inset: 0, width: "100dvw", height: "100dvh", overflow: "hidden" }}>

      <PixelLoader ready={sceneReady} />

      <Canvas
        gl={{ alpha: false, antialias: true, preserveDrawingBuffer: false }}
        onPointerDownCapture={() => useInventoryStore.getState().close()}
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
              debug={runtimeDebug}
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
              getMobileInput={useMobileInputStore.getState}
              addWallWithData={addWallWithData}
              getPhrase={getRandomPhrase}
              selectedWallIndex={selectedWallIndex}
              onSelectWall={onSelectWall}
            />
            <SceneReadyReporter onReady={handleSceneReady} />
          </Suspense>
          <SceneDropTargets
            targets={sceneInteractions}
            draggedStack={draggedStack ? { stack: draggedStack.stack, fromSlotIndex: draggedStack.fromSlotIndex } : null}
            onDropHit={handleInventoryDropHit}
            onDropMiss={handleInventoryDropMiss}
            onInspect={handleInteractionInspect}
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
        onToggle={toggleInventory}
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
        isDebug={runtimeDebug}
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
