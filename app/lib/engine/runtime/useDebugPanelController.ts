"use client";

import { useCallback, useState } from "react";

export function useDebugPanelController() {
  const [debugPanelSide, setDebugPanelSide] = useState<"left" | "right">(
    "left",
  );
  const [isDebugGroundVisible, setIsDebugGroundVisible] = useState(true);
  const [isDebugWallsVisible, setIsDebugWallsVisible] = useState(true);
  const [editorMode, setEditorMode] = useState<
    "walls" | "ground" | "items" | "targets"
  >("walls");
  const [wallToolMode, setWallToolMode] = useState<"manual" | "points">(
    "manual",
  );
  const [wallPointResetSignal, setWallPointResetSignal] = useState(0);
  const [speechDraft, setSpeechDraft] = useState(
    "Hola. Este es un bocadillo de prueba.",
  );
  const [speechCharsPerSecond, setSpeechCharsPerSecond] = useState(28);

  const handleWallToolModeChange = useCallback(
    (mode: "manual" | "points") => {
      setWallToolMode(mode);
      setWallPointResetSignal((signal) => signal + 1);
    },
    [],
  );

  const resetWallPointTool = useCallback(() => {
    setWallPointResetSignal((signal) => signal + 1);
  }, []);

  return {
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
  };
}
