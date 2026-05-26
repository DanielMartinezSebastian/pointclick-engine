export type WallResizeHandle = "x+" | "x-" | "z+" | "z-";
export declare function SceneWalls({ debug, onStartWallMove, onStartWallResize, selectedWallIndex, onSelectWall, }: {
    debug: boolean;
    onStartWallMove: (index: number, pointX: number, pointZ: number) => void;
    onStartWallResize: (index: number, handle: WallResizeHandle) => void;
    /** Currently selected wall index for debug editor (injected via DI). */
    selectedWallIndex?: number | null;
    /** Callback to select a wall in the editor (injected via DI). */
    onSelectWall?: (index: number) => void;
}): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=SceneWalls.d.ts.map