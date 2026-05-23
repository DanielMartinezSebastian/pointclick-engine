"use client";

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

import GameTouchCanvas from "../../components/GameTouchCanvas";
import { useSceneStore } from "../../store/sceneStore";

// ---------------------------------------------------------------------------
// Tipos públicos reutilizables
// ---------------------------------------------------------------------------

export type GameVec3 = [number, number, number];

export type GameSceneGround = {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  y: number;
};

export type GameSceneWall = {
  position: GameVec3;
  rotationY?: number;
  halfSize: GameVec3;
};

export type GameSceneInteractionDialogKeys = {
  hit: string;
  miss: string;
};

export type GameSceneInteraction = {
  id: string;
  kind: "drop-target";
  position: GameVec3;
  rotationY?: number;
  halfSize: GameVec3;
  hasCollision?: boolean;
  acceptsItemIds?: string[];
  dialogKeys: GameSceneInteractionDialogKeys;
  label: string;
};

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
// Eventos de runtime
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
// Handle de runtime devuelto por createGameRuntime
// ---------------------------------------------------------------------------

export type GameRuntime = {
  getScenes: () => Record<string, GameSceneConfig>;
  getItems: () => Record<string, GameItemConfig>;
  getRules: () => Record<string, GameRuleConfig>;
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
// Registros internos (singleton)
// ---------------------------------------------------------------------------

const _sceneRegistry = new Map<string, GameSceneConfig>();
const _itemRegistry = new Map<string, GameItemConfig>();
const _ruleRegistry = new Map<string, GameRuleConfig>();

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
 * Registra cada config en el registry global y devuelve un handle con
 * acceso de sólo lectura al estado del registry.
 *
 * @example
 * ```ts
 * const runtime = createGameRuntime({
 *   scenes: [myScene],
 *   items: [myItem],
 *   rules: [{ key: "boundaryHit", phrases: ["¡Cuidado!"] }],
 * });
 * ```
 */
export function createGameRuntime(config: GameRuntimeConfig = {}): GameRuntime {
  for (const scene of config.scenes ?? []) {
    registerScene(scene);
  }
  for (const item of config.items ?? []) {
    registerItem(item);
  }
  for (const rule of config.rules ?? []) {
    registerRule(rule);
  }

  return {
    getScenes: () => Object.fromEntries(_sceneRegistry),
    getItems: () => Object.fromEntries(_itemRegistry),
    getRules: () => Object.fromEntries(_ruleRegistry),
  };
}

/** Lee snapshot del estado público del runtime sin usar hooks React. */
export function getGameState(): GameState {
  return toGameState(useSceneStore.getState());
}

/** Lee acciones públicas del runtime sin usar hooks React. */
export function getGameActions(): GameActions {
  const state = useSceneStore.getState();
  return {
    setScene: state.setScene,
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
      setScene: state.setScene,
      setPlayerPosition: state.setPlayerPosition,
      requestRespawn: state.requestRespawn,
    })),
  );
}

/** Integración pública de viewport/canvas para consumir el runtime. */
export function GameViewport({
  debug,
  onRuntimeEvent,
}: GameViewportProps) {
  return createElement(GameTouchCanvas as ComponentType<GameViewportProps>, {
    debug,
    onRuntimeEvent,
  });
}
