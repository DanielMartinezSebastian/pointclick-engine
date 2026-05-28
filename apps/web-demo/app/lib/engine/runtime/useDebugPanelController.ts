"use client";

import { useCallback, useState } from "react";
import { type WallToolMode } from "../types/gameRuntime";

export function useDebugPanelController() {
  const [isDebugGroundVisible, setIsDebugGroundVisible] = useState(true);
  const [isDebugWallsVisible, setIsDebugWallsVisible] = useState(true);
  const [wallToolMode, setWallToolMode] = useState<WallToolMode>("manual");
  const [wallPointResetSignal, setWallPointResetSignal] = useState(0);
  const [speechDraft, setSpeechDraft] = useState(
    "Hola. Este es un bocadillo de prueba.",
  );
  const [speechCharsPerSecond, setSpeechCharsPerSecond] = useState(28);

  const handleWallToolModeChange = useCallback((mode: WallToolMode) => {
    setWallToolMode(mode);
    setWallPointResetSignal((signal) => signal + 1);
  }, []);

  const resetWallPointTool = useCallback(() => {
    setWallPointResetSignal((signal) => signal + 1);
  }, []);

  return {
    isDebugGroundVisible,
    setIsDebugGroundVisible,
    isDebugWallsVisible,
    setIsDebugWallsVisible,
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
