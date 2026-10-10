"use client";

/**
 * Public API mínima del motor de juego (barrel).
 *
 * El runtime agnóstico vive en `@pointclick-engine/engine-core`, los hooks y
 * el canvas en `@pointclick-engine/engine-renderer-r3f`. Este módulo mantiene
 * el contrato v1 estable re-exportando ambos.
 */

import { createElement } from "react";
import type { ComponentType } from "react";

import {
  type GameSceneInteractionFull,
  type GameRuntimeEventHandler,
} from "@pointclick-engine/engine-core";
import { GameCanvasCore } from "@pointclick-engine/engine-renderer-r3f";

// Re-exports from renderer (stable public API)
export {
  useR3FGameLoop,
  WebKeyboardInput,
  useGameState,
  useGameActions,
} from "@pointclick-engine/engine-renderer-r3f";

// i18n public surface (Phase 13) — additions only

export type {
  Locale,
  DialogEntry,
  DialogDictionary,
  LocaleDictionaries,
  I18nConfig,
  I18nState,
  I18nPort,
  I18nStore,
} from "@pointclick-engine/engine-core";

export {
  // Registry
  registerDictionary,
  registerDictionaries,
  getDictionary,
  // Translator
  translate,
  getRandomPhrase,
  matchLocale,
  // Store
  createI18nStore,
  getI18nStore,
  resetI18nStore,
  subscribeI18n,
  setI18nStoreEmitter,
  // Headless port (tests / SSR)
  HeadlessI18nAdapter,
  // Executors for the CommandHandler
  registerI18nExecutors,
} from "@pointclick-engine/engine-core";

export {
  useI18n,
  useLocaleDetection,
  I18nProvider,
  LocaleSwitcher,
} from "@pointclick-engine/engine-renderer-r3f";
export type {
  UseI18nResult,
  UseLocaleDetectionOptions,
  LocaleSwitcherProps,
  LocaleSwitcherRenderOption,
  I18nProviderProps,
} from "@pointclick-engine/engine-renderer-r3f";

// Runtime (vive en engine-core)

export type {
  GameVec3,
  GameSceneGround,
  GameSceneWall,
  GameEvent,
  GameEventType,
  GameEventHandler,
  GameCommand,
} from "@pointclick-engine/engine-core";

// Alias for public API compatibility
export type GameSceneInteraction = GameSceneInteractionFull;

export type {
  GameSceneConfig,
  GameItemDropOutcome,
  GameItemRule,
  GameItemConfig,
  GameRuleConfig,
  GameRuntimeEvent,
  GameRuntimeEventHandler,
  GameRuntime,
  GameState,
  GameActions,
  InventoryUIAdapter,
  DialogUIAdapter,
  GameRuntimeConfig,
} from "@pointclick-engine/engine-core";

export {
  registerScene,
  registerItem,
  registerRule,
  createGameRuntime,
  getGameRuntime,
  getGameState,
  getGameActions,
} from "@pointclick-engine/engine-core";

/** Props del punto de integración GameViewport (canvas + runtime). */
export type GameViewportProps = {
  debug?: boolean;
  onRuntimeEvent?: GameRuntimeEventHandler;
};

/** Integración pública de viewport/canvas para consumir el runtime. */
export function GameViewport({ debug, onRuntimeEvent }: GameViewportProps) {
  return createElement(GameCanvasCore as ComponentType<GameViewportProps>, {
    debug,
    onRuntimeEvent,
  });
}
