import { type GameCharacterName } from "./sprite/clips";
import { type RuntimeEventHandler, type GameSceneWall, type WallToolMode } from "@pointclick-engine/engine-core";
export declare function GameTouchSpriteRuntime({ activeCharacter, debug, showDebugGround, showDebugWalls, wallOpacityMode, wallToolMode, wallPointResetSignal, speechText, speechVisible, speechTrigger, speechCharsPerSecond, onBoundaryHit, onSpeechDismiss, onRuntimeEvent, getMobileInput, addWallWithData, getPhrase, selectedWallIndex, onSelectWall, updateSelectedWall, disableClickToMove, }: {
    activeCharacter: GameCharacterName;
    debug: boolean;
    showDebugGround: boolean;
    showDebugWalls: boolean;
    /** Render mode for debug walls. `wireframe` (default) o `opaque` (sólidos). */
    wallOpacityMode?: "wireframe" | "opaque";
    wallToolMode: WallToolMode;
    wallPointResetSignal: number;
    speechText: string;
    speechVisible: boolean;
    speechTrigger: number;
    speechCharsPerSecond: number;
    onBoundaryHit: (phrase: string) => void;
    onSpeechDismiss: () => void;
    onRuntimeEvent?: RuntimeEventHandler;
    /**
     * DI: Returns current joystick/mobile input state.
     * Default: no-op (always inactive). Inject `useMobileInputStore.getState` for demo.
     */
    getMobileInput?: () => {
        active: boolean;
        x: number;
        z: number;
    };
    /**
     * DI: Adds a wall to the scene editor store.
     * Only used in debug mode. Inject from sceneEditorStore for demo.
     */
    addWallWithData?: (wall: GameSceneWall) => void;
    /**
     * DI: Returns a random phrase for a given key.
     * Inject `getRandomPhrase` from demo content for boundary hit messages.
     */
    getPhrase?: (key: string) => string;
    /**
     * DI: Currently selected wall index for debug editor.
     * Inject from sceneEditorStore for demo.
     */
    selectedWallIndex?: number | null;
    /**
     * DI: Callback to select a wall in the editor.
     * Inject from sceneEditorStore for demo.
     */
    onSelectWall?: (index: number) => void;
    /**
     * DI: Mutator for the currently selected wall.
     * Required for click-and-drag move/resize to persist into scene state.
     * Inject from sceneEditorStore for demo.
     */
    updateSelectedWall?: (updater: (wall: GameSceneWall) => GameSceneWall) => void;
    /**
     * If true, clicks on the ground will not move the player. Used by the
     * debug editor mode to avoid race conditions with mouse-driven edits and
     * by the free-camera mode to prevent accidental pathfinding triggers.
     * The point-tool path keeps working so walls can still be drawn.
     */
    disableClickToMove?: boolean;
}): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=GameTouchSpriteRuntime.d.ts.map