// Core types for point-and-click game engine
// Framework-agnostic definitions

// Vector types
export type GameVec3 = [x: number, y: number, z: number];
export type GameVec2 = [x: number, y: number];

import type { Branch, Script } from "../narrative/actions";
import type { Condition } from "../narrative/conditions";

// Scene geometry
export interface GameSceneGround {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  y: number;
}

/**
 * An opening (door/window) in a wall.
 * Position and halfSize are relative to the wall's local coordinate space
 * (wall center = origin, axes aligned with wall before rotation).
 */
export interface GameSceneWallOpening {
  /** Unique identifier for this opening. */
  id: string;
  /** Center of the opening relative to the wall's local center. */
  position: GameVec3;
  /** Half-dimensions of the opening (width/2, height/2, depth/2). */
  halfSize: GameVec3;
}

export interface GameSceneWall {
  position: GameVec3;
  halfSize: GameVec3;
  rotationY: number;

  /**
   * Array of openings (doors/windows) in this wall.
   * Empty array or undefined = solid wall (backward compatible).
   */
  openings?: GameSceneWallOpening[];

  /**
   * URL to the wall's texture image.
   * Should point to /public/assets/wall-textures/* or similar.
   * Undefined = no texture (backward compatible).
   */
  textureUrl?: string;

  /**
   * World-space offset applied to the texture plane position.
   * Used for fine-grained alignment with the background image.
   * Defaults to [0, 0, 0].
   */
  texturePosition?: GameVec3;
}

export interface GameSceneInteraction {
  position: GameVec3;
  halfSize: GameVec3;
  rotationY?: number;
  hasCollision?: boolean;
}

// Items
export type PlacedSceneItem = {
  id: string;
  itemId: string;
  interactionId: string;
  name: string;
  spriteUrl: string;
  worldPosition: GameVec3;
  canPickup: boolean;
  hasCollision?: boolean;
  collisionHalfSize?: GameVec3;
  pickupSuccessDialogKey?: string;
  pickupBlockedDialogKey?: string;
  sceneId?: string; // Tracks which scene this item belongs to for multi-scene management
};

export type ItemInteractionRule = {
  outcome: "place" | "consume" | "return";
  hitDialogKey?: DialogKey;
  missDialogKey?: DialogKey;
  placeCanPickup?: boolean;
  placeHasCollision?: boolean;
  placeCollisionHalfSize?: GameVec3;
  pickupSuccessDialogKey?: DialogKey;
  pickupBlockedDialogKey?: DialogKey;
  /** Override del SFX por defecto al hacer drop en esta interacción concreta. */
  dropSoundUrl?: string;
};

export type ItemDefinition = {
  id: string;
  name: string;
  spriteUrl: string;
  descriptionDialogKey?: string;
  interactionRules: Record<string, ItemInteractionRule>;
  defaultRule: ItemInteractionRule;
  /** Override del SFX por defecto al recoger este ítem. */
  pickupSoundUrl?: string;
  /** Override del SFX por defecto al soltar este ítem. */
  dropSoundUrl?: string;
  /** Ramas condicionales para combinar este ítem con otro por id. */
  combine?: Record<string, Branch[]>;
};

// Inventory state
export type InventoryStackState = {
  id: string;
  name: string;
  spriteUrl: string;
  quantity: number;
};

export type InventorySlotsState = Array<InventoryStackState | null>;

// Dialog key (simple string alias)
export type DialogKey = string;

// Scene interaction dialog keys
export interface GameSceneInteractionDialogKeys {
  hit: DialogKey;
  miss: DialogKey;
}

// Scene interaction hint dialog keys
export interface GameSceneInteractionHintDialogKeys {
  empty: DialogKey;
  occupied: DialogKey;
}

// Enhanced Scene Interaction (with editor fields)
export interface GameSceneInteractionFull extends GameSceneInteraction {
  id: string;
  kind: "drop-target";
  hasCollision?: boolean;
  acceptsItemIds?: string[];
  dialogKeys: GameSceneInteractionDialogKeys;
  hintDialogKeys?: GameSceneInteractionHintDialogKeys;
  label: string;
}

// Scene Transitions
export interface BaseSceneTransition {
  id: string;
  targetSceneId: string;
  position: GameVec3;
  halfSize: GameVec3;
  rotationY?: number;
  /** Optional spawn position in target scene. If omitted, uses scene's playerSpawn. */
  spawnPosition?: GameVec3;
  /** Optional walk target position after spawning. If omitted, no walk animation. */
  targetPosition?: GameVec3;
  preTransitionDialogKey?: DialogKey;
  postTransitionDialogKey?: DialogKey;
  /** Override del SFX por defecto al disparar esta transición. */
  triggerSoundUrl?: string;
  /**
   * Condicion para que la transicion ocurra (todos los tipos). Sin ella, siempre ocurre.
   * Si no se cumple no hay cambio de escena y, si existe, corre `blocked`.
   */
  when?: Condition;
  /** Guion que corre al intentar la transicion sin cumplir `when`. */
  blocked?: Script;
}

export interface GameSceneTransitionOnCollision extends BaseSceneTransition {
  kind: "collision";
}

export interface GameSceneTransitionOnItemDrop extends BaseSceneTransition {
  kind: "item-drop";
  requiresItemId?: string;
  consumeItem?: boolean;
  hintDialogKeys?: { empty?: DialogKey; occupied?: DialogKey };
}

export interface GameSceneTransitionOnItemConsume extends BaseSceneTransition {
  kind: "item-consume";
  requiresItemId: string;
  preConsumptionDialogKey?: DialogKey;
}

export interface GameSceneTransitionOnItemInteraction extends BaseSceneTransition {
  kind: "item-interaction";
  requiresItemId: string;
  requiresInteractionId?: string;
}

export type GameSceneTransition =
  | GameSceneTransitionOnCollision
  | GameSceneTransitionOnItemDrop
  | GameSceneTransitionOnItemConsume
  | GameSceneTransitionOnItemInteraction;

export interface TransitionState {
  /** Source scene recorded when the transition was last triggered. */
  lastVisitedSceneId?: string;
  /** For item-drop transitions: item currently occupying the zone. */
  itemIdOccupying?: string;
  /** Whether this transition can be triggered. Default true. */
  isAvailable: boolean;
}

// Player walking state (for path-based movement)
export interface PlayerWalkingState {
  /** Target position to walk towards. */
  targetPosition: GameVec3;
  /** Path points to follow (calculated via pathfinding). */
  pathPoints: GameVec3[];
  /** Walk progress: 0 = start, 1 = complete. */
  progress: number;
  /** Whether walk is currently active. */
  isActive: boolean;
}

// Hotspots (verbos narrativos; ver narrative/hotspots.ts)
export type Verb = "look" | "use" | "talk";

export interface GameSceneHotspot {
  id: string;
  /** Clave de i18n. */
  label: string;
  position: GameVec3;
  halfSize: GameVec3;
  rotationY?: number;
  visibleWhen?: Condition;
  hasCollision?: boolean;
  /** Punto al que camina el jugador antes de actuar. Sin el, actua desde donde esta. */
  approach?: GameVec3;
  verbs?: Partial<Record<Verb, Branch[]>>;
  /** Ramas por itemId al usar un item del inventario sobre el hotspot. */
  useItem?: Record<string, Branch[]>;
  /** Ramas para un item sin regla propia en `useItem`. */
  useItemDefault?: Branch[];
}

/** Hacia donde mira un NPC en reposo. */
export type NpcFacing = "north" | "south" | "west" | "east";

/** Personaje de la escena con el que se puede hablar. Se proyecta a hotspot (`npcToHotspot`). */
export interface GameSceneNpc {
  id: string;
  /** Clave de i18n. */
  name: string;
  /** Id de un personaje registrado en el viewport (prop `characters`). */
  characterId: string;
  position: GameVec3;
  facing?: NpcFacing;
  visibleWhen?: Condition;
  hasCollision?: boolean;
  approach?: GameVec3;
  /**
   * Caja clicable del NPC: semi-extensiones y desplazamiento de su centro respecto a `position`.
   * Por defecto cubre un sprite del tamano por defecto, de los pies a la cabeza.
   */
  clickBox?: { halfSize: GameVec3; offset?: GameVec3 };
  /** Atajo: hablar inicia este diálogo. Equivale a `verbs.talk = [{ do: [{ startDialogue }] }]`. */
  dialogueId?: string;
  /** Verbos e ítems, igual que un hotspot. `verbs.talk` explícito gana sobre `dialogueId`. */
  verbs?: Partial<Record<Verb, Branch[]>>;
  useItem?: Record<string, Branch[]>;
}

// Scene (full scene with all interactions)
export interface GameScene {
  id: string;
  label: string;
  background: string;
  playerSpawn: GameVec3;
  ground: GameSceneGround;
  walls: GameSceneWall[];
  interactions: GameSceneInteractionFull[];
  /** Declarative scene exit/transition zones. */
  transitions?: GameSceneTransition[];
  /** Music optional associated to this scene. */
  music?: SceneMusicConfig;
  /** Hotspots con verbos narrativos. */
  hotspots?: GameSceneHotspot[];
  /** NPCs de la escena. `toRuntimeScene` los proyecta además a `hotspots`. */
  npcs?: GameSceneNpc[];
  /**
   * Items colocados iniciales, sembrados una vez por escena al entrar. Cada item
   * se incluye solo si su `when` se cumple en ese momento (sin `when`, siempre).
   */
  initialItems?: SceneInitialItem[];
  /**
   * Ramas de entrada: en cada entrada a la escena corre el guion de la primera que se cumple.
   * Al evaluarse, la escena ya cuenta como visitada: para "solo la primera vez" usa un flag
   * (`not(flag(...))` y `setFlag` en el guion), no `not(visited(...))`.
   */
  onEnter?: Branch[];
}

export interface SceneInitialItem {
  item: PlacedSceneItem;
  when?: Condition;
}

// Editor/Debug modes
export type WallToolMode = "manual" | "points";
export type DebugEditorMode = "walls" | "ground" | "items" | "targets";

// ---------------------------------------------------------------------------
// Audio
// ---------------------------------------------------------------------------

export type SoundCategory = "music" | "sfx" | "ui" | "ambient";

export interface SoundDefinition {
  id: string;
  url: string;
  /** 0..1, default 1. */
  volume?: number;
  /** Default false para SFX, true implícito para música. */
  loop?: boolean;
  category: SoundCategory;
}

export interface SceneMusicConfig {
  trackUrl: string;
  /** Si true, no se reinicia al cambiar de escena hasta entrar a otra con música distinta. */
  persistAcrossScenes?: boolean;
  /** 0..1, default 1. */
  volume?: number;
  /** Crossfade en ms al entrar/salir. Default 800. */
  fadeMs?: number;
}

export interface AudioSettings {
  masterMuted: boolean;
  musicMuted: boolean;
  sfxMuted: boolean;
  /** 0..1 cada uno. */
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  /** Track actualmente sonando (para restaurar tras unmute / reload). */
  currentMusicTrackUrl?: string;
}

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  masterMuted: false,
  musicMuted: false,
  sfxMuted: false,
  masterVolume: 0.8,
  musicVolume: 0.6,
  sfxVolume: 0.8,
};

// Runtime events
export type RuntimeMoveEvent = {
  type: "onMove";
  position: GameVec3;
  action: "idle" | "north" | "south" | "west" | "east";
};

export type RuntimeCollideEvent = {
  type: "onCollide";
  reason: "boundary" | "stuck" | "pathblocked";
  position: GameVec3;
};

export type RuntimeDropEvent = {
  type: "onDrop";
  outcome:
    | "place"
    | "consume"
    | "return"
    | "rule-miss"
    | "unknown-item"
    | "on-player"
    | "pickup-blocked"
    | "pickup-success"
    | "item-interact";
  itemId: string;
  interactionId?: string;
};

export type RuntimeDialogEvent = {
  type: "onDialog";
  text: string;
  dialogKey?: string;
  source: "boundary" | "inventory" | "debug";
};

export type RuntimeEvent =
  | RuntimeMoveEvent
  | RuntimeCollideEvent
  | RuntimeDropEvent
  | RuntimeDialogEvent;

export type RuntimeEventHandler = (event: RuntimeEvent) => void;

// ---------------------------------------------------------------------------
// i18n / Localization
// ---------------------------------------------------------------------------

/**
 * BCP-47 language tag (e.g. "es", "en", "es-MX", "pt-BR").
 * Intentionally a plain string — not a union — so consumers can register
 * any locale without modifying engine types.
 */
export type Locale = string;

/** A single dialog entry: one or more phrases. If >1, the translator picks one at random. */
export interface DialogEntry {
  phrases: string[];
}

/** Map of dialog key → entry, for a single locale. */
export type DialogDictionary = Record<DialogKey, DialogEntry>;

/** Map of locale → dictionary. Used by `registerDictionaries`. */
export type LocaleDictionaries = Record<Locale, DialogDictionary>;

/** Engine-wide i18n configuration. */
export interface I18nConfig {
  /** Locale used at boot when no detection / persistence applies. */
  defaultLocale: Locale;
  /** Locale consulted when a key is missing in the active locale. */
  fallbackLocale: Locale;
  /** Whitelist of locales the user may switch to. */
  availableLocales: Locale[];
}

/** Reactive state held by `i18nStore`. */
export interface I18nState {
  locale: Locale;
  availableLocales: Locale[];
  fallbackLocale: Locale;
}

/** Conservative defaults. Hosts should override via `createI18nStore` / `resetI18nStore`. */
export const DEFAULT_I18N_CONFIG: I18nConfig = {
  defaultLocale: "en",
  fallbackLocale: "en",
  availableLocales: ["en"],
};
