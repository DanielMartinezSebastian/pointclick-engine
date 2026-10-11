import type { AudioSettings, GameScene, GameVec3, Locale, SoundCategory, Verb } from "../types";

/**
 * Union exhaustiva de todos los eventos que el motor puede emitir.
 * Naming: <domain>:<action> (ver ADR-0006).
 */
export type GameEvent =
  // Scene
  | { type: "scene:changed"; sceneId: string; scene: GameScene }
  | { type: "scene:respawnRequested"; sceneId: string }
  // Player
  | {
      type: "player:moved";
      position: GameVec3;
      action: "idle" | "north" | "south" | "west" | "east";
    }
  | { type: "player:collided"; reason: "boundary" | "stuck" | "pathblocked"; position: GameVec3 }
  // Inventory
  | { type: "item:pickedUp"; itemId: string; quantity: number }
  | {
      type: "item:dropped";
      itemId: string;
      /**
       * Outcome of the drop interaction.
       *
       * Rule results:
       * - "consume": Item was consumed by the rule
       * - "place": Item was placed in the world
       * - "return": Item returned to inventory (fallback)
       *
       * No matching rule:
       * - "rule-miss": Drop target exists but no rule matched
       * - "unknown-item": Item not registered in the system
       * - "on-player": Item was dropped on the player character
       *
       * @deprecated Legacy outcomes (do not use in new code):
       * - "pickup-blocked": Attempted pickup was blocked (use `inventory:pickupFailed` instead)
       * - "item-interact": Item click (use `hotspot:interacted` instead)
       */
      outcome:
        | "consume"
        | "place"
        | "return"
        | "rule-miss"
        | "unknown-item"
        | "on-player"
        | "pickup-blocked"
        | "item-interact";
      interactionId?: string;
    }
  | { type: "item:removed"; itemId: string }
  | { type: "inventory:full"; itemId: string }
  // Dialog
  | { type: "dialog:triggered"; text: string; dialogKey?: string; source: string; speaker?: string }
  | { type: "dialog:dismissed"; dialogKey?: string }
  // Transitions
  | { type: "transition:triggered"; transitionId: string; targetSceneId: string }
  | { type: "transition:started"; transitionId: string }
  | { type: "transition:completed"; fromSceneId: string; toSceneId: string }
  | { type: "transition:colliderClicked"; transitionId: string; position: GameVec3 }
  // Player walking
  | { type: "player:walkStarted"; targetPosition: GameVec3 }
  | { type: "player:walkCompleted"; position: GameVec3 }
  | {
      type: "player:walkAborted";
      reason: "user-input" | "collision" | "unreachable";
    }
  // Audio
  | { type: "audio:sfxRequested"; soundUrl: string; category: SoundCategory; volume?: number }
  | { type: "audio:musicRequested"; trackUrl: string; fadeMs?: number; volume?: number; loop?: boolean }
  | { type: "audio:musicStopped"; fadeMs?: number }
  | { type: "audio:settingsChanged"; settings: AudioSettings }
  // i18n
  | { type: "i18n:localeChanged"; locale: Locale; previous: Locale }
  | { type: "i18n:dictionaryUpdated"; locale: Locale; keysAdded: number }
  // World state
  | {
      type: "state:flagChanged";
      name: string;
      value?: boolean | number | string;
      previous?: boolean | number | string;
    }
  // Save / load
  | { type: "game:saved" }
  | {
      type: "game:loaded";
      found: boolean;
      /** true si se aplicó todo (la escena guardada estaba registrada). Solo con found. */
      applied?: boolean;
      /** Estado propio del host guardado en la instantánea. Solo con found. */
      extra?: Record<string, unknown>;
    }
  | { type: "game:reset" }
  // Narrative scripts
  | { type: "script:started"; id: number }
  | { type: "script:finished"; id: number; result: "finished" | "cancelled" }
  | { type: "input:lockChanged"; locked: boolean }
  | { type: "custom"; name: string; payload?: unknown }
  // Hotspots
  | { type: "hotspot:interacted"; hotspotId: string; verb: Verb | "useItem"; itemId?: string }
  | {
      type: "hotspot:noAction";
      hotspotId: string;
      verb: Verb | "useItem";
      itemId?: string;
      reason: "not-found" | "hidden" | "missing-item" | "no-rule";
    }
  // Dialogue trees
  | { type: "dialogue:started"; dialogueId: string }
  | { type: "dialogue:nodeEntered"; dialogueId: string; nodeId: string }
  | { type: "dialogue:choiceMade"; dialogueId: string; nodeId: string; index: number }
  | { type: "dialogue:ended"; dialogueId: string; reason: "finished" | "ended" | "cancelled" }
  // Inventory (comandos inventory:pickup / inventory:drop)
  | {
      type: "inventory:pickupFailed";
      itemId: string;
      reason: "not-found" | "blocked" | "full" | "unknown-item";
    }
  // Item combination
  | { type: "item:combined"; itemId: string; withItemId: string }
  | { type: "item:combineFailed"; itemId: string; withItemId: string };

export type GameEventType = GameEvent["type"];

export type GameEventHandler<T extends GameEventType = GameEventType> = (
  event: Extract<GameEvent, { type: T }>,
) => void;
