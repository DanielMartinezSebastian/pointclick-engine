"use client";

import { useCallback, type Dispatch, type SetStateAction } from "react";

import { EditorTabsBar } from "./EditorTabsBar";
import { FloatingPanel } from "./FloatingPanel";
import { GroundEditorPanel } from "./GroundEditorPanel";
import { InteractionTargetsEditorPanel } from "./InteractionTargetsEditorPanel";
import { PlacedItemsEditorPanel } from "./PlacedItemsEditorPanel";
import { ScenePanel } from "./ScenePanel";
import { SpeechPanel } from "./SpeechPanel";
import { WallEditorPanel } from "./WallEditorPanel";
import { type SceneInteraction } from "../../../demo-content/scenes/scenes";
import {
  type PlacedSceneItem,
  type WallToolMode,
} from "../../lib/engine/types/gameRuntime";
import { useEditorModeStore } from "../../store/editorModeStore";

/**
 * Debug overlay root.
 *
 * Wires the floating tab bar to its individual `FloatingPanel`s. Each panel
 * is rendered only when its tab is active (state lives in `editorModeStore`).
 * The panels can be dragged independently by their title bars.
 */
export function DebugOverlayRuntimePanel({
  isDebug,
  isDebugGroundVisible,
  setIsDebugGroundVisible,
  isDebugWallsVisible,
  setIsDebugWallsVisible,
  sceneId,
  setScene,
  sceneOptions,
  readyMessage,
  requestRespawn,
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
  isDebugGroundVisible: boolean;
  setIsDebugGroundVisible: Dispatch<SetStateAction<boolean>>;
  isDebugWallsVisible: boolean;
  setIsDebugWallsVisible: Dispatch<SetStateAction<boolean>>;
  sceneId: string;
  setScene: (value: string) => void;
  sceneOptions: Array<{ label: string; value: string }>;
  readyMessage: string;
  requestRespawn: () => void;
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
  const activePanels = useEditorModeStore((s) => s.activePanels);
  const runSpeechBubble = useCallback(() => {
    const nextText = speechDraft.trim();
    if (!nextText) return;
    showSpeechBubble(nextText);
  }, [showSpeechBubble, speechDraft]);

  if (!isDebug) return null;

  return (
    <>
      <EditorTabsBar />

      {activePanels.has("scene") && (
        <FloatingPanel
          id="scene"
          title="Escena"
          defaultPosition={{ x: 16, y: 72 }}
        >
          <ScenePanel
            sceneId={sceneId}
            sceneOptions={sceneOptions}
            onSceneChange={setScene}
            readyMessage={readyMessage}
            onRespawn={requestRespawn}
            isDebugGroundVisible={isDebugGroundVisible}
            onToggleGround={() => setIsDebugGroundVisible((v) => !v)}
            isDebugWallsVisible={isDebugWallsVisible}
            onToggleWalls={() => setIsDebugWallsVisible((v) => !v)}
          />
        </FloatingPanel>
      )}

      {activePanels.has("walls") && (
        <FloatingPanel
          id="walls"
          title="Editor de paredes"
          defaultPosition={{ x: 16, y: 72 }}
          width={360}
        >
          <WallEditorPanel
            wallToolMode={wallToolMode}
            setWallToolMode={handleWallToolModeChange}
            onResetPointTool={resetWallPointTool}
          />
        </FloatingPanel>
      )}

      {activePanels.has("ground") && (
        <FloatingPanel
          id="ground"
          title="Editor de suelo"
          defaultPosition={{ x: 400, y: 72 }}
        >
          <GroundEditorPanel />
        </FloatingPanel>
      )}

      {activePanels.has("items") && (
        <FloatingPanel
          id="items"
          title="Items colocados"
          defaultPosition={{ x: 400, y: 72 }}
          width={340}
        >
          <PlacedItemsEditorPanel
            items={placedItems}
            onSetPosition={updatePlacedItemPosition}
            onMoveToPlayer={movePlacedItemToPlayer}
            onRemove={removePlacedItemById}
          />
        </FloatingPanel>
      )}

      {activePanels.has("targets") && (
        <FloatingPanel
          id="targets"
          title="Targets de interacción"
          defaultPosition={{ x: 760, y: 72 }}
          width={340}
        >
          <InteractionTargetsEditorPanel
            interactions={sceneInteractions}
            onSetPosition={updateInteractionPosition}
            onSetHalfSize={updateInteractionHalfSize}
            onSetRotationDeg={updateInteractionRotationDeg}
            onMoveToPlayer={moveInteractionToPlayer}
            onResetFromSceneConfig={resetInteractionsFromSceneConfig}
          />
        </FloatingPanel>
      )}

      {activePanels.has("speech") && (
        <FloatingPanel
          id="speech"
          title="Bocadillo de diálogo"
          defaultPosition={{ x: 760, y: 72 }}
        >
          <SpeechPanel
            speechDraft={speechDraft}
            onSpeechDraftChange={setSpeechDraft}
            speechCharsPerSecond={speechCharsPerSecond}
            onSpeechCharsPerSecondChange={(value) =>
              setSpeechCharsPerSecond(Math.max(1, Math.round(value)))
            }
            onRunSpeech={runSpeechBubble}
            onHideSpeech={hideSpeechBubble}
            speechVisible={speechVisible}
          />
        </FloatingPanel>
      )}
    </>
  );
}
