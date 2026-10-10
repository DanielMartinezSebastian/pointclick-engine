import type { GameScene } from "../types";
import type {
  GameSceneConfig,
  GameItemConfig,
  GameRuleConfig,
} from "./types";

// Registros por defecto (singleton de módulo, como el contrato v1).
export const sceneRegistry = new Map<string, GameSceneConfig>();
export const itemRegistry = new Map<string, GameItemConfig>();
export const ruleRegistry = new Map<string, GameRuleConfig>();

/** Registra una escena. Idempotente: la misma id sobreescribe la anterior. */
export function registerScene(config: GameSceneConfig): void {
  sceneRegistry.set(config.id, config);
}

/** Registra un ítem. Idempotente: el mismo id sobreescribe el anterior. */
export function registerItem(config: GameItemConfig): void {
  itemRegistry.set(config.id, config);
}

/** Registra una regla de diálogo. Idempotente por key. */
export function registerRule(config: GameRuleConfig): void {
  ruleRegistry.set(config.key, config);
}

/**
 * Convierte la config pública en `GameScene` completa.
 * Único punto de conversión: conserva `transitions` y `music`.
 */
export function toRuntimeScene(config: GameSceneConfig): GameScene {
  return {
    id: config.id,
    label: config.label,
    background: config.background,
    playerSpawn: config.playerSpawn,
    ground: config.ground,
    walls: config.walls,
    interactions: config.interactions,
    transitions: config.transitions,
    music: config.music,
  };
}
