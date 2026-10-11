import {
  resolveAudioEvents,
  type AudioDefaultsConfig,
  type AudioRulesContext,
  type AudioPort,
  type AudioSettingsStore,
  type GameEvent,
  type GameScene,
  type ItemDefinition,
  type GameSceneTransition,
  type SceneMusicConfig,
} from "@pointclick-engine/engine-core";

export interface MinimalRuntime {
  on(type: GameEvent["type"], handler: (e: GameEvent) => void): () => void;
}

export interface AttachAudioSystemOpts {
  runtime: MinimalRuntime;
  port: AudioPort;
  defaults: AudioDefaultsConfig;
  scenes: Record<string, GameScene>;
  items: Record<string, ItemDefinition>;
  transitions: Record<string, GameSceneTransition>;
  settingsStore: AudioSettingsStore;
}

/**
 * Suscribe el puerto de audio a los eventos del runtime y sincroniza los
 * settings hacia el puerto. Devuelve la función de limpieza.
 * Sin dependencias de React: testeable como función normal.
 */
export function attachAudioSystem(opts: AttachAudioSystemOpts): () => void {
  const { runtime, port, defaults, items, transitions, settingsStore } = opts;

  let previousMusic: SceneMusicConfig | undefined = undefined;

  const ctxFor = (): AudioRulesContext => ({
    defaults,
    currentScene: undefined,
    previousMusic,
    items,
    transitions,
  });

  const dispatchAudio = (events: GameEvent[]) => {
    for (const e of events) {
      if (e.type === "audio:sfxRequested") {
        port.playSound({
          id: e.soundUrl,
          url: e.soundUrl,
          category: e.category,
          volume: e.volume,
        });
      } else if (e.type === "audio:musicRequested") {
        port.playMusic(
          {
            id: e.trackUrl,
            url: e.trackUrl,
            category: "music",
            loop: e.loop ?? true,
            volume: e.volume,
          },
          { fadeMs: e.fadeMs },
        );
      } else if (e.type === "audio:musicStopped") {
        port.stopMusic({ fadeMs: e.fadeMs });
      }
    }
  };

  const handle = (event: GameEvent) => {
    const out = resolveAudioEvents(event, ctxFor());
    dispatchAudio(out);

    // Actualizar previousMusic cuando la escena cambia
    if (event.type === "scene:changed") {
      previousMusic = event.scene.music;
    }
  };

  const subs = [
    runtime.on("scene:changed", handle),
    runtime.on("item:pickedUp", handle),
    runtime.on("item:dropped", handle),
    runtime.on("transition:triggered", handle),
    runtime.on("dialog:triggered", handle),
  ];

  // Sync inicial de settings hacia el port
  const applySettings = () => {
    const s = settingsStore.getState();
    port.setMuted("master", s.masterMuted);
    port.setMuted("music", s.musicMuted);
    port.setMuted("sfx", s.sfxMuted);
    port.setVolume("master", s.masterVolume);
    port.setVolume("music", s.musicVolume);
    port.setVolume("sfx", s.sfxVolume);
  };
  applySettings();
  const unsubSettings = settingsStore.subscribe(applySettings);

  return () => {
    subs.forEach((u) => u());
    unsubSettings();
  };
}
