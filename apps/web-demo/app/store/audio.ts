import { createAudioSettingsStore } from "@pointclick-engine/engine-core";
import { useSyncExternalStore } from "react";
import { bindAudioPersistence } from "../lib/platform-web";

export const audioSettingsStore = createAudioSettingsStore();
bindAudioPersistence(audioSettingsStore);

export function useAudioSettings() {
  return useSyncExternalStore(
    audioSettingsStore.subscribe,
    audioSettingsStore.getState,
    audioSettingsStore.getState,
  );
}
