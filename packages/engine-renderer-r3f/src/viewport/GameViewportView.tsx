"use client";

import { Suspense, useEffect, useRef, type ComponentProps, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { OrthographicCamera } from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import { useInventoryUiStore } from "@pointclick-engine/engine-core";

import { GameTouchSpriteRuntime } from "../GameTouchSpriteRuntime";
import { PlacedSceneItems } from "../inventory/PlacedSceneItems";
import { SceneDropTargets } from "../inventory/SceneDropTargets";
import { CAMERA_POSITION, CAMERA_ROTATION, WORLD_VIEW_HEIGHT } from "../scene/cameraConstants";
import { SceneBackgroundPlane } from "../scene/SceneBackgroundPlane";
import { CameraController, CameraFitHeight } from "../scene/SceneCameraControllers";
import { SceneNpcs, useVisibleNpcs } from "../scene/SceneNpcs";
import { resolveSpeakingNpcId } from "../scene/visibleNpcs";
import { SceneTransitions } from "../scene/SceneTransitions";
import type { CharacterDefinition } from "../sprite/character";
import type { GameViewportController } from "./useGameViewportController";

/**
 * Props de editor / depuracion / entrada que el host pasa a `GameTouchSpriteRuntime`.
 * Las que controla el viewport (personaje, bocadillo, eventos) no se pueden sobrescribir.
 */
export type GameViewportSpriteRuntimeProps = Partial<
  Omit<
    ComponentProps<typeof GameTouchSpriteRuntime>,
    | "activeCharacter"
    | "character"
    | "debug"
    | "speechText"
    | "speechVisible"
    | "speechTrigger"
    | "onBoundaryHit"
    | "onSpeechDismiss"
    | "onRuntimeEvent"
  >
>;

export type GameViewportViewProps = {
  /** Resultado de `useGameViewportController`. */
  controller: GameViewportController;
  /** Definicion del personaje. Por defecto, el personaje incluido. */
  character?: CharacterDefinition;
  /** Personajes de los NPCs de la escena por `characterId` (ver `GameSceneNpc`). */
  characters?: Record<string, CharacterDefinition>;
  /** Depuracion del sprite y de las zonas de transicion. Por defecto, la del controlador. */
  debug?: boolean;
  /**
   * Con `"fixed"` (por defecto) se montan los controladores de camara fija; con cualquier
   * otro valor (p. ej. `"free"`) no, y el host aporta la suya por `canvasChildren`.
   */
  cameraMode?: "fixed" | (string & {});
  /** Props de editor/depuracion/entrada para `GameTouchSpriteRuntime`. */
  spriteRuntimeProps?: GameViewportSpriteRuntimeProps;
  /**
   * Condicion extra del host para recoger items. Se suma a las genericas
   * (inventario cerrado y sin bocadillo visible). Por defecto `true`.
   */
  canPickupItems?: boolean;
  /** Contenido extra del Canvas fuera de `<Physics>` (p. ej. una camara libre). */
  canvasChildren?: ReactNode;
  /** Contenido extra DENTRO de `<Physics>` (p. ej. puertas). */
  children?: ReactNode;
  /** HTML por encima del canvas y por debajo de la cortina de fundido. */
  overlay?: ReactNode;
  /** Se llama una vez cuando los assets del personaje han resuelto. */
  onSceneReady?: () => void;
};

/**
 * Se monta dentro del Suspense del runtime: cuando llega al DOM significa que
 * useLoader ha resuelto todos los assets del personaje. Llama onReady una sola vez.
 */
function SceneReadyReporter({ onReady }: { onReady: () => void }) {
  const onReadyRef = useRef(onReady);
  useEffect(() => { onReadyRef.current(); }, []); // intentional: run once on mount
  return null;
}

const noop = () => {};

/** Vista presentacional del juego: Canvas, escena, personaje, items y cortina de fundido. */
export function GameViewportView({
  controller,
  character,
  characters,
  debug = controller.debug,
  cameraMode = "fixed",
  spriteRuntimeProps,
  canPickupItems = true,
  canvasChildren,
  children,
  overlay,
  onSceneReady = noop,
}: GameViewportViewProps) {
  const {
    sceneBackground,
    sceneInteractions,
    playerPosition,
    draggedStack,
    scenePlacedItems,
    isInventoryOpen,
    speechText,
    speechVisible,
    speechTrigger,
    speechSpeaker,
    fadeOverlayRef,
    handleBackgroundReady,
    handleRuntimeEvent,
    handleTransitionTriggered,
    handleBoundaryHit,
    hideSpeechBubble,
    handleInteractionInspect,
    handleInventoryDropHit,
    handleInventoryDropMiss,
    handleInventoryDropOnPlayer,
    handlePickupPlacedItem,
    handleItemInteract,
  } = controller;

  // Si habla un NPC visible, el bocadillo (y el gesto de hablar) es suyo y no del jugador.
  const visibleNpcs = useVisibleNpcs();
  const speakingNpcId = resolveSpeakingNpcId(visibleNpcs, speechSpeaker, speechVisible);
  const speechCharsPerSecond = spriteRuntimeProps?.speechCharsPerSecond ?? 28;

  return (
    <div style={{ position: "fixed", inset: 0, width: "100dvw", height: "100dvh", overflow: "hidden" }}>
      <Canvas
        gl={{ alpha: false, antialias: true, preserveDrawingBuffer: false }}
        onPointerDownCapture={() => useInventoryUiStore.getState().close()}
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
        <OrthographicCamera makeDefault position={CAMERA_POSITION} rotation={CAMERA_ROTATION} near={0.01} far={120} />
        {cameraMode === "fixed" && <CameraFitHeight desiredWorldHeight={WORLD_VIEW_HEIGHT} />}
        <ambientLight intensity={1.1} color="#8bc2ff" />
        <directionalLight position={[3, 9, 6]} intensity={1.5} color="#d8ecff" />
        <SceneBackgroundPlane url={sceneBackground} onReady={handleBackgroundReady} />
        {cameraMode === "fixed" && <CameraController />}
        {canvasChildren}
        <Physics gravity={[0, -20, 0]}>
          <Suspense fallback={null}>
            <GameTouchSpriteRuntime
              showDebugGround={false}
              showDebugWalls={false}
              wallToolMode="manual"
              wallPointResetSignal={0}
              speechCharsPerSecond={28}
              {...spriteRuntimeProps}
              activeCharacter="Dave"
              character={character}
              debug={debug}
              speechText={speechText}
              speechVisible={speechVisible && speakingNpcId === null}
              speechTrigger={speechTrigger}
              onBoundaryHit={handleBoundaryHit}
              onSpeechDismiss={hideSpeechBubble}
              onRuntimeEvent={handleRuntimeEvent}
            />
            <SceneReadyReporter onReady={onSceneReady} />
          </Suspense>
          <SceneNpcs
            npcs={visibleNpcs}
            characters={characters}
            speakingNpcId={speakingNpcId}
            speechText={speechText}
            speechTrigger={speechTrigger}
            speechCharsPerSecond={speechCharsPerSecond}
            onSpeechDismiss={hideSpeechBubble}
            debug={debug}
          />
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
            items={scenePlacedItems}
            onPickup={handlePickupPlacedItem}
            onInteract={handleItemInteract}
            canPickup={!isInventoryOpen && canPickupItems && !speechVisible}
          />
          {children}
          <SceneTransitions
            debug={debug}
            onTransitionTriggered={handleTransitionTriggered}
          />
        </Physics>
      </Canvas>

      {overlay}

      {/* Cortina de transición: siempre en DOM, opacidad 0 en reposo.
          Se activa/desactiva via ref para evitar el batching de React. */}
      <div
        ref={fadeOverlayRef}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 500,
          background: "#070d1f",
          opacity: 0,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
