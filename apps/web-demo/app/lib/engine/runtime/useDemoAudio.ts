import type { AudioDefaultsConfig } from "@pointclick-engine/engine-core";

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
