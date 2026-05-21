"use client";

import { useCallback, type Dispatch, type SetStateAction } from "react";

import { DebugOverlayPanel } from "../DebugOverlayPanel";
import { GroundEditorPanel } from "./GroundEditorPanel";
import { InteractionTargetsEditorPanel } from "./InteractionTargetsEditorPanel";
import { PlacedItemsEditorPanel } from "./PlacedItemsEditorPanel";
import { WallEditorPanel, type WallToolMode } from "./WallEditorPanel";
import { type SceneInteraction } from "../../scenes/scenes";
import { type PlacedSceneItem } from "../inventory/PlacedSceneItems";

type EditorMode = "walls" | "ground" | "items" | "targets";

export function DebugOverlayRuntimePanel({
  isDebug,
  debugPanelSide,
  setDebugPanelSide,
  isDebugGroundVisible,
  setIsDebugGroundVisible,
  isDebugWallsVisible,
  setIsDebugWallsVisible,
  sceneId,
  setScene,
  sceneOptions,
  readyMessage,
  requestRespawn,
  editorMode,
  setEditorMode,
  wallToolMode,
  handleWallToolModeChange,
  resetWallPointTool,
  speechDraft,
  setSpeechDraft,
  speechCharsPerSecond,
  setSpeechCharsPerSecond,
  showSpeechBubble,
  hideSpeechBubble,
  speechVisible,
  sceneInteractions,
  updateInteractionPosition,
  updateInteractionHalfSize,
  updateInteractionRotationDeg,
  moveInteractionToPlayer,
  resetInteractionsFromSceneConfig,
  placedItems,
  updatePlacedItemPosition,
  movePlacedItemToPlayer,
  removePlacedItemById,
}: {
  isDebug: boolean;
  debugPanelSide: "left" | "right";
  setDebugPanelSide: Dispatch<SetStateAction<"left" | "right">>;
  isDebugGroundVisible: boolean;
  setIsDebugGroundVisible: Dispatch<SetStateAction<boolean>>;
  isDebugWallsVisible: boolean;
  setIsDebugWallsVisible: Dispatch<SetStateAction<boolean>>;
  sceneId: string;
  setScene: (value: string) => void;
  sceneOptions: Array<{ label: string; value: string }>;
  readyMessage: string;
  requestRespawn: () => void;
  editorMode: EditorMode;
  setEditorMode: (value: EditorMode) => void;
  wallToolMode: WallToolMode;
  handleWallToolModeChange: (mode: WallToolMode) => void;
  resetWallPointTool: () => void;
  speechDraft: string;
  setSpeechDraft: Dispatch<SetStateAction<string>>;
  speechCharsPerSecond: number;
  setSpeechCharsPerSecond: Dispatch<SetStateAction<number>>;
  showSpeechBubble: (text: string) => void;
  hideSpeechBubble: () => void;
  speechVisible: boolean;
  sceneInteractions: SceneInteraction[];
  updateInteractionPosition: (id: string, axis: 0 | 1 | 2, value: number) => void;
  updateInteractionHalfSize: (id: string, axis: 0 | 1 | 2, value: number) => void;
  updateInteractionRotationDeg: (id: string, value: number) => void;
  moveInteractionToPlayer: (id: string) => void;
  resetInteractionsFromSceneConfig: () => void;
  placedItems: PlacedSceneItem[];
  updatePlacedItemPosition: (id: string, axis: 0 | 1 | 2, value: number) => void;
  movePlacedItemToPlayer: (id: string) => void;
  removePlacedItemById: (id: string) => void;
}) {
  const runSpeechBubble = useCallback(() => {
    const nextText = speechDraft.trim();
    if (!nextText) return;
    showSpeechBubble(nextText);
  }, [showSpeechBubble, speechDraft]);

  const editorContent =
    editorMode === "walls" ? (
      <WallEditorPanel
        wallToolMode={wallToolMode}
        setWallToolMode={handleWallToolModeChange}
        onResetPointTool={resetWallPointTool}
      />
    ) : editorMode === "ground" ? (
      <GroundEditorPanel />
    ) : editorMode === "targets" ? (
      <InteractionTargetsEditorPanel
        interactions={sceneInteractions}
        onSetPosition={updateInteractionPosition}
        onSetHalfSize={updateInteractionHalfSize}
        onSetRotationDeg={updateInteractionRotationDeg}
        onMoveToPlayer={moveInteractionToPlayer}
        onResetFromSceneConfig={resetInteractionsFromSceneConfig}
      />
    ) : editorMode === "items" ? (
      <PlacedItemsEditorPanel
        items={placedItems}
        onSetPosition={updatePlacedItemPosition}
        onMoveToPlayer={movePlacedItemToPlayer}
        onRemove={removePlacedItemById}
      />
    ) : null;

  return (
    <DebugOverlayPanel
      isDebug={isDebug}
      debugPanelSide={debugPanelSide}
      onTogglePanelSide={() => setDebugPanelSide((side) => (side === "left" ? "right" : "left"))}
      isDebugGroundVisible={isDebugGroundVisible}
      onToggleGround={() => setIsDebugGroundVisible((visible) => !visible)}
      isDebugWallsVisible={isDebugWallsVisible}
      onToggleWalls={() => setIsDebugWallsVisible((visible) => !visible)}
      sceneId={sceneId}
      onSceneChange={setScene}
      sceneOptions={sceneOptions}
      readyMessage={readyMessage}
      onRespawn={requestRespawn}
      editorMode={editorMode}
      onEditorModeChange={setEditorMode}
      speechDraft={speechDraft}
      onSpeechDraftChange={setSpeechDraft}
      speechCharsPerSecond={speechCharsPerSecond}
      onSpeechCharsPerSecondChange={(value) => setSpeechCharsPerSecond(Math.max(1, Math.round(value)))}
      onRunSpeech={runSpeechBubble}
      onHideSpeech={hideSpeechBubble}
      speechVisible={speechVisible}
      editorContent={editorContent}
    />
  );
}