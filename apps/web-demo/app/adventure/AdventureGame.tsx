"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";

import {
  GameViewportView,
  useGameViewportController,
  useI18n,
} from "@pointclick-engine/engine-renderer-r3f";
import {
  createGameRuntime,
  getGameRuntime,
  useSceneStore,
  type GameRuntime,
} from "@pointclick-engine/engine-core";

import { ADVENTURE_CHARACTERS } from "../../adventure-content";
import { DAVID } from "../../demo-content/characters/david";
import { PixelLoader } from "../components/PixelLoader";
import { webAudioAdapter } from "../lib/platform-web-audio";
import { useInventoryStore } from "../store/inventoryStore";
import { useMobileInputStore } from "../store/mobileInputStore";
import { AdventureDragGhost, AdventureInventory } from "./AdventureInventory";
import {
  ADVENTURE_RUNTIME_CONFIG,
  ADVENTURE_VIEWPORT_OPTIONS,
  adventureAudioSettings,
  hydrateAdventure,
} from "./adventureRuntime";

// Joystick táctil: solo en cliente (nipplejs necesita `window`).
const Joystick = dynamic(() => import("../components/Joystick"), { ssr: false });

/** Hace hablar al Programador: sonido de letra aleatorio del bocadillo. */
function playSpeechLetter(): void {
  const n = Math.floor(Math.random() * 4) + 1;
  const url = `/assets/audio/sfx/speak (${n}).mp3`;
  webAudioAdapter.playSound({ id: url, url, category: "sfx" }, { volume: 0.35 });
}

function AdventureViewport({
  runtime,
  debug,
}: {
  runtime: GameRuntime;
  debug: boolean;
}) {
  const { t } = useI18n();
  const [sceneReady, setSceneReady] = useState(false);
  const handleSceneReady = useCallback(() => setSceneReady(true), []);

  // Expone el sceneStore (solo con debug) para inspeccionar la escena desde fuera.
  useEffect(() => {
    if (!debug) return;
    (window as unknown as Record<string, unknown>).__sceneStore = useSceneStore;
    return () => {
      delete (window as unknown as Record<string, unknown>).__sceneStore;
    };
  }, [debug]);

  // Los ajustes de audio (en memoria) gobiernan el adaptador web.
  useEffect(() => {
    const apply = (state: ReturnType<typeof adventureAudioSettings.getState>) => {
      webAudioAdapter.setMuted("master", state.masterMuted);
      webAudioAdapter.setMuted("music", state.musicMuted);
      webAudioAdapter.setMuted("sfx", state.sfxMuted);
      webAudioAdapter.setVolume("master", state.masterVolume);
      webAudioAdapter.setVolume("music", state.musicVolume);
      webAudioAdapter.setVolume("sfx", state.sfxVolume);
    };
    apply(adventureAudioSettings.getState());
    return adventureAudioSettings.subscribe(apply);
  }, []);

  const controller = useGameViewportController({
    ...ADVENTURE_VIEWPORT_OPTIONS,
    runtime,
    debug,
  });
  const { draggedStack, inventorySlots, clearDrag, showSpeechBubble } = controller;

  // Soltar un ítem sobre OTRO slot ocupado los combina (`inventory:combine`). Con un slot vacío,
  // el mismo ítem o la escena, la suelta sigue su camino de siempre.
  const handleDropOnSlot = useCallback(
    (slotIndex: number): boolean => {
      const target = inventorySlots[slotIndex];
      if (!draggedStack || !target) return false;
      if (slotIndex === draggedStack.fromSlotIndex || target.id === draggedStack.stack.id) return false;
      (runtime ?? getGameRuntime())?.executeCommand({
        type: "inventory:combine",
        itemId: draggedStack.stack.id,
        withItemId: target.id,
      });
      clearDrag();
      return true;
    },
    [clearDrag, draggedStack, inventorySlots, runtime],
  );

  // Combinación imposible: una frase, y los ítems siguen donde estaban.
  useEffect(() => {
    return runtime.on("item:combineFailed", () => {
      showSpeechBubble(t("adv.combineFailed"), { dialogKey: "adv.combineFailed" });
    });
  }, [runtime, showSpeechBubble, t]);

  const isInventoryOpen = useInventoryStore((s) => s.isOpen);
  const toggleInventory = useInventoryStore((s) => s.toggle);

  const overlay = (
    <>
      {/* Estado observable para el smoke: bocadillo visible y escena actual (sin efecto visual). */}
      <div
        hidden
        data-testid="adventure-status"
        data-speech={controller.speechVisible ? "on" : "off"}
        data-scene={controller.sceneId}
      />
      <PixelLoader ready={sceneReady} />
      <Joystick />
      <AdventureInventory
        isOpen={isInventoryOpen}
        slots={controller.inventorySlots}
        onToggle={toggleInventory}
        onStartDrag={controller.handleStartInventoryDrag}
        isDragging={controller.draggedStack !== null}
        onDropOnSlot={handleDropOnSlot}
      />
      {controller.draggedStack && (
        <AdventureDragGhost
          stack={controller.draggedStack.stack}
          pointerX={controller.draggedStack.pointerX}
          pointerY={controller.draggedStack.pointerY}
        />
      )}
    </>
  );

  return (
    <GameViewportView
      controller={controller}
      character={DAVID}
      characters={ADVENTURE_CHARACTERS}
      debug={debug}
      onSceneReady={handleSceneReady}
      spriteRuntimeProps={{
        onSpeechLetterSound: playSpeechLetter,
        getMobileInput: useMobileInputStore.getState,
      }}
      overlay={overlay}
    />
  );
}

/**
 * Juego de la aventura. Crea el runtime en un efecto (con su dispose en el cleanup) y monta el
 * viewport cuando ya existe: los efectos de los hijos corren antes que los del padre, y la siembra
 * de la escena inicial necesita el runtime y el audio ya suscritos (StrictMode es seguro).
 */
export function AdventureGame({
  debug = false,
  onCredits,
}: {
  debug?: boolean;
  /** Se llama cuando el guion dispara el manejador `credits`. */
  onCredits: () => void;
}) {
  const [runtime, setRuntime] = useState<GameRuntime | null>(null);

  useEffect(() => {
    // La partida guardada (si la hay) vuelca el inventario, los ítems y los flags antes de montar.
    hydrateAdventure();
    const created = createGameRuntime(ADVENTURE_RUNTIME_CONFIG);
    const offCredits = created.registerHandler("credits", () => onCredits());
    // eslint-disable-next-line react-hooks/set-state-in-effect -- publica el runtime para que el viewport se monte cuando ya existe
    setRuntime(created);
    return () => {
      offCredits();
      created.dispose();
      setRuntime(null);
    };
  }, [onCredits]);

  return runtime ? <AdventureViewport runtime={runtime} debug={debug} /> : null;
}
