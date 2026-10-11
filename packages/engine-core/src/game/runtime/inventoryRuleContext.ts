import type { InventoryRuleContext } from "../logic/rules/inventoryRules";
import type { ItemDefinition, ItemInteractionRule } from "../types";
import type { GameItemConfig, GameItemRule } from "./types";

type ItemsSource =
  | Record<string, GameItemConfig>
  | (() => Record<string, GameItemConfig>);

const INTERACTION_OUTCOMES: ReadonlySet<string> = new Set(["place", "consume", "return"]);

function hasOwn(obj: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

/**
 * Una regla de interaccion solo admite place/consume/return. `GameItemRule`
 * es mas ancha (incluye outcomes de resultado como "rule-miss"), asi que se
 * comprueba en tiempo de ejecucion y se estrecha el tipo sin `as any`.
 */
function toInteractionRule(rule: GameItemRule): ItemInteractionRule | null {
  if (!INTERACTION_OUTCOMES.has(rule.outcome)) return null;
  const outcome = rule.outcome as ItemInteractionRule["outcome"];
  return { ...rule, outcome };
}

/**
 * Construye el `InventoryRuleContext` que consumen las reglas de inventario
 * (`resolveInventoryDropHitDecision`, `resolvePickupPlacedItemDecision`, ...)
 * a partir de un registro de items del runtime.
 *
 * `items` puede ser el registro o una funcion que lo devuelva; con funcion, el
 * registro se lee en CADA uso (no al crear el contexto), de modo que items
 * registrados despues o un runtime recreado se reflejan sin rehacer el contexto.
 *
 * Comportamiento ante reglas invalidas: una regla cuyo `outcome` no sea
 * place/consume/return (p. ej. "rule-miss" o un valor desconocido) no es una
 * regla de interaccion valida. Comportamiento seguro y sin efectos:
 * - `resolveItemRule` devuelve `null` para esa interaccion (la regla elegida,
 *   sea la especifica o la `defaultRule`, no cae a otra). Las reglas de
 *   inventario lo traducen en "rule-miss": el item NO se consume ni se coloca
 *   y se muestra el dialogo de fallo por defecto.
 * - `getItemDefinition` omite esas reglas de `interactionRules` y sustituye una
 *   `defaultRule` invalida por `{ outcome: "return" }` (conservando
 *   `missDialogKey`), para que la definicion devuelta cumpla `ItemDefinition`.
 * - Se avisa una sola vez por regla con `console.warn`.
 *
 * Un item desconocido devuelve `null` en ambas funciones.
 */
export function createInventoryRuleContext(items: ItemsSource): InventoryRuleContext {
  const read = (): Record<string, GameItemConfig> =>
    typeof items === "function" ? items() : items;
  const warned = new Set<string>();

  const warnInvalid = (itemId: string, where: string, rule: GameItemRule) => {
    const key = `${itemId}|${where}`;
    if (warned.has(key)) return;
    warned.add(key);
    console.warn(
      `[inventory] item "${itemId}" ${where}: outcome "${String(rule.outcome)}" is not a valid interaction outcome (place|consume|return); rule ignored`,
    );
  };

  const getConfig = (itemId: string): GameItemConfig | null => {
    const registry = read();
    return hasOwn(registry, itemId) ? (registry[itemId] ?? null) : null;
  };

  return {
    getItemDefinition: (itemId: string): ItemDefinition | null => {
      const config = getConfig(itemId);
      if (!config) return null;

      const interactionRules: Record<string, ItemInteractionRule> = {};
      for (const [interactionId, rule] of Object.entries(config.interactionRules)) {
        const valid = toInteractionRule(rule);
        if (valid) interactionRules[interactionId] = valid;
        else warnInvalid(itemId, `interactionRules["${interactionId}"]`, rule);
      }

      let defaultRule = toInteractionRule(config.defaultRule);
      if (!defaultRule) {
        warnInvalid(itemId, "defaultRule", config.defaultRule);
        defaultRule = { outcome: "return", missDialogKey: config.defaultRule.missDialogKey };
      }

      return {
        id: config.id,
        name: config.name,
        spriteUrl: config.spriteUrl,
        descriptionDialogKey: config.descriptionDialogKey,
        pickupSoundUrl: config.pickupSoundUrl,
        dropSoundUrl: config.dropSoundUrl,
        interactionRules,
        defaultRule,
      };
    },

    resolveItemRule: (itemId: string, interactionId: string): ItemInteractionRule | null => {
      const config = getConfig(itemId);
      if (!config) return null;

      const isSpecific = hasOwn(config.interactionRules, interactionId);
      const raw = isSpecific ? config.interactionRules[interactionId]! : config.defaultRule;
      const valid = toInteractionRule(raw);
      if (!valid) {
        warnInvalid(
          itemId,
          isSpecific ? `interactionRules["${interactionId}"]` : "defaultRule",
          raw,
        );
        return null;
      }
      return valid;
    },
  };
}
