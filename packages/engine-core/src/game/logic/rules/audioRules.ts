import type { GameEvent } from "../../events";
import type {
  GameScene,
  ItemDefinition,
  GameSceneTransition,
  SceneMusicConfig,
} from "../../types";

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
export function resolveAudioEvents(
  event: GameEvent,
  ctx: AudioRulesContext,
): GameEvent[] {
  switch (event.type) {
    case "scene:changed": {
      const music = event.scene.music;
      const out: GameEvent[] = [];
      if (music) {
        // Cambia/inicia música
        out.push({
          type: "audio:musicRequested",
          trackUrl: music.trackUrl,
          fadeMs: music.fadeMs ?? 800,
          volume: music.volume,
          loop: true,
        });
      } else if (ctx.previousMusic && !ctx.previousMusic.persistAcrossScenes) {
        // La escena anterior tenía música no-persistente y la nueva no tiene → parar
        out.push({ type: "audio:musicStopped", fadeMs: 600 });
      }
      return out;
    }

    case "item:pickedUp": {
      const item = ctx.items[event.itemId];
      const url = item?.pickupSoundUrl ?? ctx.defaults.pickupSoundUrl;
      if (!url) return [];
      return [{ type: "audio:sfxRequested", soundUrl: url, category: "sfx" }];
    }

    case "item:dropped": {
      const item = ctx.items[event.itemId];
      // Prioridad: interacción específica > item > default
      const url = item?.dropSoundUrl ?? ctx.defaults.dropSoundUrl;
      if (!url) return [];
      return [{ type: "audio:sfxRequested", soundUrl: url, category: "sfx" }];
    }

    case "transition:triggered": {
      const t = ctx.transitions[event.transitionId];
      const url = t?.triggerSoundUrl ?? ctx.defaults.transitionSoundUrl;
      if (!url) return [];
      return [{ type: "audio:sfxRequested", soundUrl: url, category: "sfx" }];
    }

    case "dialog:triggered": {
      const url = ctx.defaults.dialogSoundUrl;
      if (!url) return [];
      return [{ type: "audio:sfxRequested", soundUrl: url, category: "ui" }];
    }

    default:
      return [];
  }
}

/** Helper para el host: SFX de click manual (ej. botón de inventario). */
export function clickSfxEvent(
  defaults: AudioDefaultsConfig,
  override?: string,
): GameEvent | null {
  const url = override ?? defaults.clickSoundUrl;
  if (!url) return null;
  return { type: "audio:sfxRequested", soundUrl: url, category: "ui" };
}
