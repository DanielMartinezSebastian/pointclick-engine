import type { Script } from "../narrative/actions";
import type { DialogDictionary, GameVec3, Locale, SoundCategory, Verb } from "../types";

// Duplicated from ports/audio.ts to avoid circular imports.
type AudioMuteTarget = "master" | SoundCategory;

/**
 * Union exhaustiva de todos los comandos que el motor acepta.
 * Naming: <domain>:<action> (ver ADR-0006).
 */
export type GameCommand =
  // Scene
  | { type: "scene:set"; sceneId: string; spawnPosition?: GameVec3 }
  | { type: "scene:respawn" }
  // Player
  | { type: "player:move"; position: GameVec3 }
  | { type: "player:stop" }
  | { type: "player:walkTo"; position: GameVec3 }
  // Inventory
  | { type: "inventory:toggle" }
  | { type: "inventory:pickup"; itemId: string; placedItemId?: string }
  | {
      type: "inventory:drop";
      itemId: string;
      slotIndex: number;
      /** Destino: una interaccion de la escena activa. Como mucho uno de los dos. */
      interactionId?: string;
      /** Destino: un hotspot (equivale a hotspot:interact con verb "useItem"). */
      hotspotId?: string;
    }
  // Dialog
  | { type: "dialog:trigger"; dialogKey: string; speaker?: string }
  | { type: "dialog:dismiss" }
  // Transitions
  | { type: "transition:activate"; transitionId: string }
  | { type: "transition:cancel"; transitionId: string }
  // Audio
  | { type: "audio:playSfx"; soundUrl: string; category?: SoundCategory; volume?: number }
  | { type: "audio:setMuted"; target: AudioMuteTarget; muted: boolean }
  | { type: "audio:setVolume"; target: AudioMuteTarget; volume: number }
  // i18n
  | { type: "i18n:setLocale"; locale: Locale }
  | { type: "i18n:registerDictionary"; locale: Locale; dict: DialogDictionary }
  // World state
  | { type: "state:setFlag"; name: string; value: boolean | number | string }
  | { type: "state:clearFlag"; name: string }
  // Save / load
  | { type: "game:save"; extra?: Record<string, unknown> }
  | { type: "game:load" }
  | { type: "game:reset" }
  // Narrative scripts
  | { type: "script:run"; script: Script; interrupt?: boolean }
  | { type: "script:cancelAll" }
  // Hotspots
  | { type: "hotspot:interact"; hotspotId: string; verb: Verb | "useItem"; itemId?: string };

export type GameCommandType = GameCommand["type"];
