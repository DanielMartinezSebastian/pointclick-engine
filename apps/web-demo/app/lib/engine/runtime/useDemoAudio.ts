import { useCallback, useEffect, useRef } from "react";

import {
  useSceneStore,
  type AudioDefaultsConfig,
  type PlayerWalkingState,
} from "@pointclick-engine/engine-core";
import { webAudioAdapter } from "../../platform-web-audio";
import { audioSettingsStore } from "../../../store/audio";
import { useInventoryStore } from "../../../store/inventoryStore";

/**
 * Sonidos por defecto de la demo (datos, no lógica). Los sonidos específicos
 * viven en los datos de cada ítem (`pickupSoundUrl`/`dropSoundUrl`) y de cada
 * transición (`triggerSoundUrl`).
 */
export const DEMO_AUDIO_DEFAULTS: AudioDefaultsConfig = {
  clickSoundUrl: "/assets/audio/sfx/click.ogg",
  pickupSoundUrl: "/assets/audio/sfx/pickup-default.ogg",
  dropSoundUrl: "/assets/audio/sfx/drop-default.ogg",
  transitionSoundUrl: "/assets/audio/sfx/transition-default.ogg",
};

/**
 * Sonidos de UI de la demo: sincroniza los ajustes de audio con el adaptador web y
 * suena el click de la mochila y el de empezar a caminar. Devuelve el sonido de las
 * letras del bocadillo.
 */
export function useDemoUiSounds() {
  // Sync audio settings (already hydrated from localStorage at module load)
  // to the webAudioAdapter on mount AND on every subsequent change. Without
  // the initial apply the adapter starts at its defaults and ignores any
  // persisted mute until the user toggles a setting.
  useEffect(() => {
    const apply = (state: ReturnType<typeof audioSettingsStore.getState>) => {
      webAudioAdapter.setMuted("master", state.masterMuted);
      webAudioAdapter.setMuted("music", state.musicMuted);
      webAudioAdapter.setMuted("sfx", state.sfxMuted);
      webAudioAdapter.setVolume("master", state.masterVolume);
      webAudioAdapter.setVolume("music", state.musicVolume);
      webAudioAdapter.setVolume("sfx", state.sfxVolume);
    };
    apply(audioSettingsStore.getState());
    return audioSettingsStore.subscribe(apply);
  }, []);

  // Click sound for inventory toggle
  const isInventoryOpen = useInventoryStore((s) => s.isOpen);
  useEffect(() => {
    webAudioAdapter.playSound({
      id: "click",
      url: "/assets/audio/sfx/click.ogg",
      category: "ui",
    });
  }, [isInventoryOpen]);

  // Click sound on canvas for pathfinding
  const playerWalkingState = useSceneStore((s) => s.playerWalkingState);
  const prevWalkingRef = useRef<PlayerWalkingState | null>(null);
  useEffect(() => {
    // Play click sound when walking starts (transition from null to walking state)
    if (playerWalkingState && !prevWalkingRef.current) {
      webAudioAdapter.playSound({
        id: "click-canvas",
        url: "/assets/audio/sfx/click.ogg",
        category: "ui",
      });
    }
    prevWalkingRef.current = playerWalkingState;
  }, [playerWalkingState]);

  return useCallback(() => {
    const n = Math.floor(Math.random() * 4) + 1;
    const url = `/assets/audio/sfx/speak (${n}).mp3`;
    webAudioAdapter.playSound({ id: url, url, category: "sfx" }, { volume: 0.35 });
  }, []);
}
