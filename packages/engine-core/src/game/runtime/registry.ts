import type { GameScene } from "../types";
import { npcToHotspot } from "../narrative/npcs";
import type { DialogueDefinition } from "../narrative/dialogueTypes";
import type {
  GameSceneConfig,
  GameItemConfig,
  GameRuleConfig,
} from "./types";

// Registros por defecto (singleton de módulo, como el contrato v1).
export const sceneRegistry = new Map<string, GameSceneConfig>();
export const itemRegistry = new Map<string, GameItemConfig>();
export const ruleRegistry = new Map<string, GameRuleConfig>();
export const dialogueRegistry = new Map<string, DialogueDefinition>();

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

/** Registra un arbol de dialogo. Idempotente: el mismo id sobreescribe el anterior. */
export function registerDialogue(def: DialogueDefinition): void {
  dialogueRegistry.set(def.id, def);
}

/**
 * Convierte la config pública en `GameScene` completa.
 * Único punto de conversión: conserva `transitions` y `music`.
 */
export function toRuntimeScene(config: GameSceneConfig): GameScene {
  // Un NPC es un hotspot con sprite: se anade a `hotspots` para que `hotspot:interact` lo vea.
  // Sin NPCs, `hotspots` es la misma referencia de la config.
  const hotspots = config.npcs?.length
    ? [...(config.hotspots ?? []), ...config.npcs.map(npcToHotspot)]
    : config.hotspots;
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
    hotspots,
    npcs: config.npcs,
    initialItems: config.initialItems,
    onEnter: config.onEnter,
  };
}
