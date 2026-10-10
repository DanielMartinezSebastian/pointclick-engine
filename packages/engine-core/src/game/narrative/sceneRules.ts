import type { GameScene, GameSceneTransition, PlacedSceneItem, SceneInitialItem } from "../types";
import { getSceneState } from "../state/sceneStore";
import { sceneRegistry } from "../runtime/registry";
import type { Script } from "./actions";
import { pickBranch } from "./branches";
import { evaluateCondition, getConditionContext, type ConditionContext } from "./conditions";

/**
 * Reglas de escena declarativas: tres reglas que antes eran callbacks del host
 * (siembra inicial, guion de entrada y permiso/bloqueo de transiciones) pasan a ser
 * dato de la escena. Todo lo de este modulo es puro salvo `getDeclaredScene`.
 *
 * Orden de evaluacion cuando el host ademas pasa los callbacks de la Fase 16:
 *  - Siembra: primero `scene.initialItems`; despues `getInitialPlacedItems`, que ve
 *    los items declarativos ya anadidos y cuyos items se anaden tras ellos.
 *  - Entrada: primero el guion de `scene.onEnter`; despues `onSceneEnter`.
 *  - Transicion: primero `transition.when`/`blocked`; solo si deja pasar se evalua
 *    `canLeaveScene`, que puede vetar. Si `when` falla, `canLeaveScene` no se llama.
 */

/** Los campos declarativos de una escena que consumen los hosts. */
export type DeclaredSceneRules = Pick<GameScene, "initialItems" | "onEnter">;

/**
 * Items iniciales cuyo `when` se cumple en `ctx` (sin `when`, siempre), en orden.
 * `null` si la escena no declara `initialItems` (el host puede usar su callback).
 * Todos los `when` se evaluan contra el mismo `ctx` (el estado previo a la siembra).
 * Un item sin `sceneId` recibe `sceneId`.
 */
export function resolveInitialItems(
  sceneId: string,
  initialItems: SceneInitialItem[] | undefined,
  ctx: ConditionContext,
): PlacedSceneItem[] | null {
  if (!Array.isArray(initialItems)) return null;
  const out: PlacedSceneItem[] = [];
  for (const entry of initialItems) {
    if (!entry || !entry.item) continue;
    if (!evaluateCondition(entry.when, ctx)) continue;
    out.push(entry.item.sceneId === undefined ? { ...entry.item, sceneId } : entry.item);
  }
  return out;
}

/** Guion de la primera rama de `onEnter` que se cumple, o `null` (sin `onEnter` o ninguna). */
export function resolveEnterScript(
  onEnter: DeclaredSceneRules["onEnter"],
  ctx: ConditionContext,
): Script | null {
  return pickBranch(onEnter, ctx);
}

export type TransitionGate = { allowed: true } | { allowed: false; blocked: Script };

/**
 * Decide si una transicion esta permitida por su `when` (aplica a todos los tipos).
 * Sin `when` -> permitida. Si no se cumple, devuelve el guion `blocked` (o `[]`).
 */
export function evaluateTransitionGate(
  transition: Pick<GameSceneTransition, "when" | "blocked">,
  ctx: ConditionContext,
): TransitionGate {
  if (evaluateCondition(transition.when, ctx)) return { allowed: true };
  return { allowed: false, blocked: Array.isArray(transition.blocked) ? transition.blocked : [] };
}

/**
 * Reglas declarativas de la escena `sceneId`: la escena activa si coincide el id,
 * o la registrada en el runtime. `undefined` si no se conoce.
 */
export function getDeclaredScene(sceneId: string): DeclaredSceneRules | undefined {
  const active = getSceneState();
  if (active.sceneId === sceneId) return active.scene;
  return sceneRegistry.get(sceneId);
}

/** Contexto de condiciones para `sceneId`, con los items colocados dados (p. ej. antes de sembrar). */
export function getSceneRuleContext(sceneId: string, placedItems?: PlacedSceneItem[]): ConditionContext {
  const ctx = getConditionContext();
  return { ...ctx, sceneId, ...(placedItems ? { placedItems } : {}) };
}
