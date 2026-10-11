import {
  getAvailableVerbs,
  isHotspotVisible,
  type ConditionContext,
  type GameSceneHotspot,
  type Verb,
} from "@pointclick-engine/engine-core";

import { ENGINE_VERB_LABEL_KEYS } from "../i18n/engineTexts";

type Vec3 = readonly [number, number, number];

/** Hotspots cuyo `visibleWhen` se cumple en `ctx`. Puro. */
export function filterVisibleHotspots(
  hotspots: readonly GameSceneHotspot[] | undefined,
  ctx: ConditionContext,
): GameSceneHotspot[] {
  return (hotspots ?? []).filter((h) => isHotspotVisible(h, ctx));
}

/** Que hacer al hacer click: ejecutar un verbo, o abrir el menu si hay varios. */
export type HotspotClickPlan =
  | { kind: "verb"; verb: Verb }
  | { kind: "menu"; verbs: Verb[] };

/**
 * Con un solo verbo aplicable (o ninguno) se ejecuta directo; sin verbos se pide `look`,
 * que el core responde con `hotspot:noAction` (frase generica). Con varios, menu.
 */
export function planHotspotClick(hotspot: GameSceneHotspot, ctx: ConditionContext): HotspotClickPlan {
  const verbs = getAvailableVerbs(hotspot, ctx);
  if (verbs.length > 1) return { kind: "menu", verbs };
  return { kind: "verb", verb: verbs[0] ?? "look" };
}

/** Etiquetas de los verbos ya traducidas con `t` (clave del motor, sobrescribible por el host). */
export function buildVerbLabels(t: (key: string) => string): Record<Verb, string> {
  return {
    look: t(ENGINE_VERB_LABEL_KEYS.look),
    use: t(ENGINE_VERB_LABEL_KEYS.use),
    talk: t(ENGINE_VERB_LABEL_KEYS.talk),
  };
}

/** Volumen que usa una diana de arrastre para detectar la suelta (caja de 2.2 x halfSize). */
export const DROP_HIT_SCALE = 1.1;

export type VolumeLike = { position: Vec3; halfSize: Vec3; rotationY?: number };

/** true si `point` cae dentro de la caja del volumen (rotada en Y), con `scale` sobre `halfSize`. */
export function pointInVolume(point: Vec3, volume: VolumeLike, scale = DROP_HIT_SCALE): boolean {
  const dx = point[0] - volume.position[0];
  const dy = point[1] - volume.position[1];
  const dz = point[2] - volume.position[2];
  const a = volume.rotationY ?? 0;
  const lx = dx * Math.cos(a) - dz * Math.sin(a);
  const lz = dx * Math.sin(a) + dz * Math.cos(a);
  return (
    Math.abs(lx) <= volume.halfSize[0] * scale &&
    Math.abs(dy) <= volume.halfSize[1] * scale &&
    Math.abs(lz) <= volume.halfSize[2] * scale
  );
}

/**
 * Conflicto al soltar un item: si el punto cae sobre alguna diana de `SceneDropTargets`
 * gana la diana (comportamiento de 0.5.0); si no, es del hotspot.
 */
export function resolveDropOwner(point: Vec3, dropTargets: readonly VolumeLike[]): "target" | "hotspot" {
  return dropTargets.some((t) => pointInVolume(point, t)) ? "target" : "hotspot";
}

/** Coloca un menu de `size` junto a `pos` sin salirse de la ventana. */
export function clampMenuPosition(
  pos: { x: number; y: number },
  size: { width: number; height: number },
  viewport: { width: number; height: number },
  margin = 8,
): { x: number; y: number } {
  const clamp = (v: number, max: number) => Math.max(margin, Math.min(v, max - margin));
  return {
    x: clamp(pos.x, viewport.width - size.width),
    y: clamp(pos.y, viewport.height - size.height),
  };
}
