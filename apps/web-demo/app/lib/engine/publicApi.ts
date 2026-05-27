"use client";

// Re-exports from renderer (stable public API)
export { useR3FGameLoop, WebKeyboardInput } from "@pointclick/engine-renderer-r3f";

/**
 * Public API mínima del motor de juego.
 *
 * Este módulo expone contratos estables e independientes de demo/content.
 * Usa estos tipos y funciones para integrar el engine desde fuera sin
 * acoplar a imports internos de app/demo/content.
 */

import { useShallow } from "zustand/react/shallow";
import { createElement } from "react";
import type { ComponentType } from "react";

import {
  useSceneStore,
  setSceneStoreEmitter,
  EventBus,
  CommandHandler,
  type GameVec3,
  type GameSceneGround,
  type GameSceneWall,
  type GameSceneInteractionFull,
  type GameEvent,
  type GameEventType,
  type GameEventHandler,
  type GameCommand,
} from "@pointclick/engine-core";
import GameTouchCanvas from "../../components/GameTouchCanvas";

// ---------------------------------------------------------------------------
// Tipos públicos reutilizables (importados o re-exportados de engine-core)
// ---------------------------------------------------------------------------

// Re-export key types from engine-core for API stability
export type { GameVec3, GameSceneGround, GameSceneWall } from "@pointclick/engine-core";
// Re-export bidirectional API types
export type {
  GameEvent,
  GameEventType,
  GameEventHandler,
  GameCommand,
} from "@pointclick/engine-core";

// Alias for public API compatibility
export type GameSceneInteraction = GameSceneInteractionFull;

/** Configuración de escena registrable via API pública. */
export type GameSceneConfig = {
  id: string;
  label: string;
  background: string;
  playerSpawn: GameVec3;
  ground: GameSceneGround;
  walls: GameSceneWall[];
  interactions: GameSceneInteraction[];
};

export type GameItemDropOutcome = "consume" | "place" | "return";

export type GameItemRule = {
  outcome: GameItemDropOutcome;
  hitDialogKey?: string;
  missDialogKey?: string;
  placeCanPickup?: boolean;
  placeHasCollision?: boolean;
  placeCollisionHalfSize?: GameVec3;
  pickupSuccessDialogKey?: string;
  pickupBlockedDialogKey?: string;
};

/** Configuración de ítem registrable via API pública. */
export type GameItemConfig = {
  id: string;
  name: string;
  spriteUrl: string;
  descriptionDialogKey?: string;
  interactionRules: Record<string, GameItemRule>;
  defaultRule: GameItemRule;
};

/** Regla de texto/diálogo registrable via API pública. */
export type GameRuleConfig = {
  key: string;
  phrases: string[];
};

/** Props del punto de integración GameViewport (canvas + runtime). */
export type GameViewportProps = {
  debug?: boolean;
  onRuntimeEvent?: GameRuntimeEventHandler;
};

// ---------------------------------------------------------------------------
// Eventos de runtime (legacy — mantenidos por backwards compat)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Handle de runtime devuelto por createGameRuntime (Phase 4)
// ---------------------------------------------------------------------------

export type GameRuntime = {
  // Registro (existentes)
  getScenes: () => Record<string, GameSceneConfig>;
  getItems: () => Record<string, GameItemConfig>;
  getRules: () => Record<string, GameRuleConfig>;
  // Bidirectional API (Phase 4)
  /**
   * Envía un comando al motor. Sync, fire-and-forget.
   * Comandos sin executor registrado loguean warn y no hacen nada.
   * Ver ADR-0006 y docs/architecture/05-bidirectional-communication.md.
   */
  executeCommand: (cmd: GameCommand) => void;
  /**
   * Suscribe a un tipo de evento del motor.
   * @returns unsubscribe — llámalo para cancelar la suscripción (ej. en useEffect cleanup).
   */
  on: <T extends GameEventType>(type: T, handler: GameEventHandler<T>) => () => void;
  /**
   * Emite un evento al bus del runtime.
   * Útil para que el renderer envíe eventos sin conocer el store.
   */
  emit: (event: GameEvent) => void;
  /**
   * Libera el bus y desactiva las emisiones del store.
   * Llamar al desmontar la app / en tests cleanup.
   */
  dispose: () => void;
};

type SceneStoreSnapshot = ReturnType<typeof useSceneStore.getState>;

export type GameState = Pick<
  SceneStoreSnapshot,
  "sceneId" | "scene" | "playerPosition" | "respawnSignal"
>;

export type GameActions = Pick<
  SceneStoreSnapshot,
  "setScene" | "setPlayerPosition" | "requestRespawn"
>;

function toGameState(state: SceneStoreSnapshot): GameState {
  return {
    sceneId: state.sceneId,
    scene: state.scene,
    playerPosition: state.playerPosition,
    respawnSignal: state.respawnSignal,
  };
}

// ---------------------------------------------------------------------------
// Configuración de createGameRuntime
// ---------------------------------------------------------------------------

export type GameRuntimeConfig = {
  scenes?: GameSceneConfig[];
  items?: GameItemConfig[];
  rules?: GameRuleConfig[];
};

// ---------------------------------------------------------------------------
// Registros internos (singleton de módulo)
// ---------------------------------------------------------------------------

const _sceneRegistry = new Map<string, GameSceneConfig>();
const _itemRegistry = new Map<string, GameItemConfig>();
const _ruleRegistry = new Map<string, GameRuleConfig>();

/** Singleton del runtime activo. Accesible vía getGameRuntime(). */
let _runtimeHandle: GameRuntime | null = null;

/**
 * Registra una escena en el motor.
 * Idempotente: registrar la misma id sobreescribe la anterior.
 */
export function registerScene(config: GameSceneConfig): void {
  _sceneRegistry.set(config.id, config);
}

/**
 * Registra un ítem en el motor.
 * Idempotente: registrar el mismo id sobreescribe el anterior.
 */
export function registerItem(config: GameItemConfig): void {
  _itemRegistry.set(config.id, config);
}

/**
 * Registra una regla de diálogo en el motor.
 * Idempotente: registrar la misma key sobreescribe la anterior.
 */
export function registerRule(config: GameRuleConfig): void {
  _ruleRegistry.set(config.key, config);
}

// ---------------------------------------------------------------------------
// Factory principal
// ---------------------------------------------------------------------------

/**
 * Inicializa el runtime con las escenas, ítems y reglas proporcionadas.
 *
 * Registra cada config en el registry global, crea el EventBus y el
 * CommandHandler, y devuelve un handle con acceso completo a la API
 * bidireccional (`executeCommand`, `on`, `emit`, `dispose`).
 *
 * El handle se almacena como singleton accesible vía `getGameRuntime()`.
 *
 * @example
 * ```ts
 * const runtime = createGameRuntime({ scenes: [myScene], items: [myItem] });
 * runtime.on("scene:changed", (e) => console.log("now in:", e.sceneId));
 * runtime.executeCommand({ type: "scene:set", sceneId: myScene.id });
 * ```
 */
export function createGameRuntime(config: GameRuntimeConfig = {}): GameRuntime {
  // Register content
  for (const scene of config.scenes ?? []) {
    registerScene(scene);
  }
  for (const item of config.items ?? []) {
    registerItem(item);
  }
  for (const rule of config.rules ?? []) {
    registerRule(rule);
  }

  // Create bus and command handler
  const bus = new EventBus();
  const commands = new CommandHandler();

  // Wire store → bus
  setSceneStoreEmitter((event) => bus.emit(event.type, event));

  // Register executors: scene commands
  commands.register("scene:set", (cmd) => {
    const sceneConfig = _sceneRegistry.get(cmd.sceneId);
    if (!sceneConfig) {
      console.warn(`[runtime] scene:set — scene not registered: ${cmd.sceneId}`);
      return;
    }
    useSceneStore.getState().setScene(sceneConfig.id, {
      id: sceneConfig.id,
      label: sceneConfig.label,
      background: sceneConfig.background,
      playerSpawn: sceneConfig.playerSpawn,
      ground: sceneConfig.ground,
      walls: sceneConfig.walls,
      interactions: sceneConfig.interactions,
    });
  });

  commands.register("scene:respawn", () => {
    useSceneStore.getState().requestRespawn();
  });

  commands.register("player:move", (cmd) => {
    useSceneStore.getState().setPlayerPosition(cmd.position);
  });

  // Placeholder executors for commands not yet fully wired (Phase 4)
  // These will be connected in Phase 5
  const notYetWired = [
    "player:stop",
    "inventory:toggle",
    "inventory:pickup",
    "inventory:drop",
    "dialog:trigger",
    "dialog:dismiss",
  ] as const;

  for (const t of notYetWired) {
    commands.register(t, (cmd) =>
      console.warn(`[runtime] executor not yet wired: ${cmd.type}`),
    );
  }

  const runtime: GameRuntime = {
    getScenes: () => Object.fromEntries(_sceneRegistry),
    getItems: () => Object.fromEntries(_itemRegistry),
    getRules: () => Object.fromEntries(_ruleRegistry),
    executeCommand: (cmd) => commands.execute(cmd),
    on: <T extends GameEventType>(type: T, handler: GameEventHandler<T>) =>
      bus.on(type, handler as (data: unknown) => void),
    emit: (event: GameEvent) => bus.emit(event.type, event),
    dispose: () => {
      bus.clear();
      commands.clear();
      setSceneStoreEmitter(null);
      if (_runtimeHandle === runtime) _runtimeHandle = null;
    },
  };

  _runtimeHandle = runtime;
  return runtime;
}

/**
 * Devuelve el handle del runtime activo (creado por `createGameRuntime`).
 * Retorna `null` si no se ha inicializado o tras llamar a `dispose()`.
 *
 * Útil para acceder al runtime desde componentes o callbacks que no
 * tienen acceso directo al handle (ej. GameTouchCanvas).
 */
export function getGameRuntime(): GameRuntime | null {
  return _runtimeHandle;
}

/** Lee snapshot del estado público del runtime sin usar hooks React. */
export function getGameState(): GameState {
  return toGameState(useSceneStore.getState());
}

/** Lee acciones públicas del runtime sin usar hooks React. */
export function getGameActions(): GameActions {
  const state = useSceneStore.getState();
  return {
    setScene: (id: string) => {
      const sceneConfig = _sceneRegistry.get(id);
      if (!sceneConfig) {
        console.warn(`Scene not registered: ${id}`);
        return;
      }
      state.setScene(id, {
        id: sceneConfig.id,
        label: sceneConfig.label,
        background: sceneConfig.background,
        playerSpawn: sceneConfig.playerSpawn,
        ground: sceneConfig.ground,
        walls: sceneConfig.walls,
        interactions: sceneConfig.interactions,
      });
    },
    setPlayerPosition: state.setPlayerPosition,
    requestRespawn: state.requestRespawn,
  };
}

/** Hook para seleccionar estado de juego desde la API pública. */
export function useGameState<T>(selector: (state: GameState) => T): T {
  return useSceneStore((state) => selector(toGameState(state)));
}

/** Hook para obtener acciones públicas con referencia estable. */
export function useGameActions(): GameActions {
  return useSceneStore(
    useShallow((state) => ({
      setScene: (id: string) => {
        const sceneConfig = _sceneRegistry.get(id);
        if (!sceneConfig) {
          console.warn(`Scene not registered: ${id}`);
          return;
        }
        state.setScene(id, {
          id: sceneConfig.id,
          label: sceneConfig.label,
          background: sceneConfig.background,
          playerSpawn: sceneConfig.playerSpawn,
          ground: sceneConfig.ground,
          walls: sceneConfig.walls,
          interactions: sceneConfig.interactions,
        });
      },
      setPlayerPosition: state.setPlayerPosition,
      requestRespawn: state.requestRespawn,
    })),
  );
}

/** Integración pública de viewport/canvas para consumir el runtime. */
export function GameViewport({ debug, onRuntimeEvent }: GameViewportProps) {
  return createElement(GameTouchCanvas as ComponentType<GameViewportProps>, {
    debug,
    onRuntimeEvent,
  });
}
