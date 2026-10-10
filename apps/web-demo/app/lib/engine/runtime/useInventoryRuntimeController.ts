"use client";

import { useEffect } from "react";

import { getRandomPhrase } from "../../../../demo-content/dialogs/getRandomPhrase";
import type { SceneInteraction } from "../../../../demo-content/scenes/scenes";
import type { RuntimeEventHandler } from "@pointclick-engine/engine-core";
import { useInventoryRuntime } from "@pointclick-engine/engine-renderer-r3f";
import { startGamePersistence } from "../../gamePersistence";
import { getDemoInitialPlacedItems, onDemoSceneEnter } from "./demoSceneRules";

// Los diccionarios de la demo se registran en su getRandomPhrase.
const getDemoPhrase = (key: string): string => getRandomPhrase(key);

/**
 * Envoltorio de la demo sobre `useInventoryRuntime` (en el renderer). Aporta lo propio
 * del juego: frases con diccionarios, trofeo inicial, bienvenida y persistencia.
 */
export function useInventoryRuntimeController({
  sceneId,
  sceneInteractions,
  playerPosition,
  onRuntimeEvent,
}: {
  sceneId: string;
  sceneInteractions: SceneInteraction[];
  playerPosition: [number, number, number];
  onRuntimeEvent?: RuntimeEventHandler;
}) {
  // Guardado automático de ambos stores (ya hidratados al importar gamePersistence)
  // mientras el hook esté montado. Va ANTES del hook del renderer: sus efectos
  // (siembra, bienvenida) corren después, como antes del traslado.
  useEffect(() => startGamePersistence(), []);

  return useInventoryRuntime({
    sceneId,
    sceneInteractions,
    playerPosition,
    onRuntimeEvent,
    getPhrase: getDemoPhrase,
    getInitialPlacedItems: getDemoInitialPlacedItems,
    onSceneEnter: onDemoSceneEnter,
  });
}
