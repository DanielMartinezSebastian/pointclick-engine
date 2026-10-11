export const RENDERER_VERSION = "0.5.0";

// Canvas core
export { GameCanvasCore } from "./components/GameCanvasCore";
export type { GameCanvasCoreProps } from "./components/GameCanvasCore";

// Adapters
export { useR3FGameLoop } from "./adapters/gameLoopR3F";
export { WebKeyboardInput } from "./adapters/keyboardInput";

// Sprite
export { default as DavidSprite } from "./sprite/DavidSprite";
export type { DavidSpriteHandle } from "./sprite/DavidSprite";
export { default as CharacterSprite } from "./sprite/CharacterSprite";
export type { CharacterSpriteHandle } from "./sprite/CharacterSprite";
export type {
  CharacterClip,
  CharacterDefinition,
  CharacterDirection,
} from "./sprite/character";
export {
  buildFrameUrls,
  selectClip,
  resolveCharacterSprites,
  listCharacterAnimations,
  toSpriteAnimation,
} from "./sprite/character";
export * from "./sprite/clips";
export { buildSpeakingAnimation } from "./sprite/speakingAnimation";
export { NpcSprite, type NpcSpriteProps, type NpcSpeech } from "./sprite/NpcSprite";
export { selectNpcAnimation } from "./sprite/npcAnimation";
export { spriteScaleAtDepth, DEPTH_FAR_Z, DEPTH_NEAR_Z } from "./sprite/depthScale";

// Scene
export { SceneGround } from "./scene/SceneGround";
export { SceneWalls } from "./scene/SceneWalls";
export type { WallResizeHandle } from "./scene/SceneWalls";
export { SceneWallPlane } from "./scene/SceneWallPlane";
export { computeWallSegments } from "./scene/wallSegments";
export type { WallSegment } from "./scene/wallSegments";
export { SceneCollisionSphere } from "./scene/SceneCollisionSphere";
export { SceneWallPointPreview } from "./scene/SceneWallPointPreview";
export { SceneNpcs, useVisibleNpcs, type SceneNpcsProps } from "./scene/SceneNpcs";
export { filterVisibleNpcs, resolveSpeakingNpcId } from "./scene/visibleNpcs";
export { SceneTransitions } from "./scene/SceneTransitions";
export {
  SceneBackgroundPlane,
  preloadSceneBackground,
} from "./scene/SceneBackgroundPlane";
export {
  CameraController,
  CameraFitHeight,
} from "./scene/SceneCameraControllers";
export {
  WORLD_VIEW_HEIGHT,
  CAMERA_POSITION,
  CAMERA_ROTATION,
} from "./scene/cameraConstants";

// Inventory (scene-side)
export { PlacedSceneItems } from "./inventory/PlacedSceneItems";
export {
  SceneDropTargets,
  type SceneDropTargetsProps,
  type SceneDropTargetInteraction,
  type DraggedInventoryPayload,
} from "./inventory/SceneDropTargets";

// Viewport (juego jugable completo)
export { GameViewport, type GameViewportProps } from "./viewport/GameViewport";
export {
  GameViewportView,
  type GameViewportViewProps,
  type GameViewportSpriteRuntimeProps,
} from "./viewport/GameViewportView";
export {
  useGameViewportController,
  type GameViewportController,
  type GameViewportControllerOptions,
  type GameViewportAudioOptions,
} from "./viewport/useGameViewportController";

// Runtime
export { GameTouchSpriteRuntime } from "./GameTouchSpriteRuntime";
export { default as SpeechBubble } from "./SpeechBubble";

// Hooks
export { usePlayerWalkAnimation } from "./hooks/usePlayerWalkAnimation";
export { useAudioSystem } from "./hooks/useAudioSystem";
export {
  attachAudioSystem,
  type AttachAudioSystemOpts,
} from "./hooks/attachAudioSystem";
export { useProximityHintController } from "./hooks/useProximityHintController";
export {
  useSceneRuntime,
  resolveInitialSceneId,
  resolveSceneFromRuntime,
  type SceneProgressStorage,
  type UseSceneRuntimeOptions,
} from "./hooks/useSceneRuntime";
export {
  useTransitionSystem,
  type UseTransitionSystemOpts,
} from "./hooks/useTransitionSystem";
export {
  decideLeaveScene,
  resolveUsedTransition,
  type CanLeaveScene,
  type LeaveSceneTransition,
  type LeaveSceneBlock,
} from "./hooks/transitionRules";
export {
  useInventoryRuntime,
  type UseInventoryRuntimeOptions,
  type SceneEnterApi,
} from "./hooks/useInventoryRuntime";
export {
  seedSceneItems,
  type GetInitialPlacedItems,
  type SeedStore,
} from "./inventory/seedScene";
export { useClickToMoveController } from "./hooks/useClickToMoveController";
export { useKeyboardMovementInput } from "./adapters/useKeyboardMovementInput";
export type { KeyboardMovementState } from "./adapters/useKeyboardMovementInput";

// i18n
export { useI18n, type UseI18nResult } from "./hooks/useI18n";
export {
  useLocaleDetection,
  type UseLocaleDetectionOptions,
} from "./hooks/useLocaleDetection";
export { I18nProvider, type I18nProviderProps } from "./components/I18nProvider";
export {
  LocaleSwitcher,
  type LocaleSwitcherProps,
  type LocaleSwitcherRenderOption,
} from "./components/LocaleSwitcher";

// Game state hooks
export { useGameState } from "./hooks/useGameState";
export { useGameActions } from "./hooks/useGameActions";
