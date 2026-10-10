import type {
  GameVec3,
  GameSceneGround,
  GameSceneWall,
  GameSceneInteractionFull,
  GameSceneTransition,
  SceneMusicConfig,
} from "../types";
import type {
  GameEvent,
  GameEventType,
  GameEventHandler,
} from "../events/types";
import type { GameCommand } from "../commands/types";
import type { useSceneStore } from "../state";

/** Configuración de escena registrable via API pública. */
export type GameSceneConfig = {
  id: string;
  label: string;
  background: string;
  playerSpawn: GameVec3;
  ground: GameSceneGround;
  walls: GameSceneWall[];
  interactions: GameSceneInteractionFull[];
  /** Zonas de transición declarativas (se conservan al registrar la escena). */
  transitions?: GameSceneTransition[];
  music?: SceneMusicConfig;
};

export type GameItemDropOutcome =
  | "consume"
  | "place"
  | "return"
  | "rule-miss"
  | "unknown-item"
  | "on-player"
  | "pickup-blocked"
  | "pickup-success";

export type GameItemRule = {
  outcome: GameItemDropOutcome;
  hitDialogKey?: string;
  missDialogKey?: string;
  placeCanPickup?: boolean;
  placeHasCollision?: boolean;
  placeCollisionHalfSize?: GameVec3;
  pickupSuccessDialogKey?: string;
  pickupBlockedDialogKey?: string;
  dropSoundUrl?: string;
};

/** Configuración de ítem registrable via API pública. */
export type GameItemConfig = {
  id: string;
  name: string;
  spriteUrl: string;
  descriptionDialogKey?: string;
  pickupSoundUrl?: string;
  dropSoundUrl?: string;
  interactionRules: Record<string, GameItemRule>;
  defaultRule: GameItemRule;
};

/** Regla de texto/diálogo registrable via API pública. */
export type GameRuleConfig = {
  key: string;
  phrases: string[];
};

/** Eventos de runtime (legacy — mantenidos por backwards compat). */
export type GameRuntimeEvent =
  | {
      type: "onMove";
      position: GameVec3;
      action: "idle" | "north" | "south" | "west" | "east";
    }
  | { type: "onCollide"; reason: "boundary" | "stuck"; position: GameVec3 }
  | { type: "onDrop"; outcome: string; itemId: string; interactionId?: string }
  | { type: "onDialog"; text: string; dialogKey?: string; source: string };

export type GameRuntimeEventHandler = (event: GameRuntimeEvent) => void;

/** Handle de runtime devuelto por createGameRuntime. */
export type GameRuntime = {
  getScenes: () => Record<string, GameSceneConfig>;
  getItems: () => Record<string, GameItemConfig>;
  getRules: () => Record<string, GameRuleConfig>;
  /**
   * Envía un comando al motor. Sync, fire-and-forget.
   * Comandos sin executor registrado loguean warn y no hacen nada.
   */
  executeCommand: (cmd: GameCommand) => void;
  /** Suscribe a un tipo de evento. Devuelve unsubscribe. */
  on: <T extends GameEventType>(type: T, handler: GameEventHandler<T>) => () => void;
  /** Emite un evento al bus del runtime. */
  emit: (event: GameEvent) => void;
  /** Libera el bus, los comandos y desactiva las emisiones del store. */
  dispose: () => void;
};

export type SceneStoreSnapshot = ReturnType<typeof useSceneStore.getState>;

export type GameState = Pick<
  SceneStoreSnapshot,
  "sceneId" | "scene" | "playerPosition" | "respawnSignal"
>;

export type GameActions = {
  setScene: (sceneId: string) => void;
  setPlayerPosition: SceneStoreSnapshot["setPlayerPosition"];
  requestRespawn: SceneStoreSnapshot["requestRespawn"];
};

/** Adapter para conectar el engine con la UI de inventario del host. */
export interface InventoryUIAdapter {
  toggle(): void;
  isOpen(): boolean;
}

/** Adapter para conectar el engine con el sistema de diálogos del host. */
export interface DialogUIAdapter {
  show(text: string, dialogKey?: string): void;
  hide(): void;
}

export type GameRuntimeConfig = {
  scenes?: GameSceneConfig[];
  items?: GameItemConfig[];
  rules?: GameRuleConfig[];
  /** Adapter de UI para inventory. Si no se pasa, inventory:toggle usa el store del core (useInventoryUiStore). */
  inventoryAdapter?: InventoryUIAdapter;
  /** Adapter de UI para diálogos. Si no se pasa, dialog:trigger/dismiss usan el store del core (useDialogStore) y emiten el evento. */
  dialogAdapter?: DialogUIAdapter;
};
