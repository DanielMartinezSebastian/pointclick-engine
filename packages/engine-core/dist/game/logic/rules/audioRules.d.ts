import type { GameEvent } from "../../events";
import type { GameScene, ItemDefinition, GameSceneTransition, SceneMusicConfig } from "../../types";
export interface AudioDefaultsConfig {
    clickSoundUrl?: string;
    pickupSoundUrl?: string;
    dropSoundUrl?: string;
    transitionSoundUrl?: string;
    dialogSoundUrl?: string;
}
export interface AudioRulesContext {
    defaults: AudioDefaultsConfig;
    currentScene?: GameScene;
    previousMusic?: SceneMusicConfig;
    items: Record<string, ItemDefinition>;
    transitions: Record<string, GameSceneTransition>;
}
/**
 * Pure resolver: dado un evento del juego, devuelve los eventos de audio derivados.
 * El runtime se encarga de propagarlos al EventBus.
 */
export declare function resolveAudioEvents(event: GameEvent, ctx: AudioRulesContext): GameEvent[];
/** Helper para el host: SFX de click manual (ej. botón de inventario). */
export declare function clickSfxEvent(defaults: AudioDefaultsConfig, override?: string): GameEvent | null;
//# sourceMappingURL=audioRules.d.ts.map