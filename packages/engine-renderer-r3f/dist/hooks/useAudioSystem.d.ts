import { type AudioDefaultsConfig, type AudioPort, type AudioSettingsStore, type GameEvent, type GameScene, type ItemDefinition, type GameSceneTransition } from "@pointclick-engine/engine-core";
interface MinimalRuntime {
    on(type: GameEvent["type"], handler: (e: GameEvent) => void): () => void;
}
interface UseAudioSystemOpts {
    runtime: MinimalRuntime;
    port: AudioPort;
    defaults: AudioDefaultsConfig;
    scenes: Record<string, GameScene>;
    items: Record<string, ItemDefinition>;
    transitions: Record<string, GameSceneTransition>;
    settingsStore: AudioSettingsStore;
}
export declare function useAudioSystem(opts: UseAudioSystemOpts): void;
export {};
//# sourceMappingURL=useAudioSystem.d.ts.map