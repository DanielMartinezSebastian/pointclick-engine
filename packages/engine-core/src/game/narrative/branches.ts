import { evaluateCondition, type ConditionContext } from "./conditions";
import type { Branch, Script } from "./actions";

/** Guion de la primera rama que se cumple (sin `when` = siempre), o `null`. */
export function pickBranch(branches: Branch[] | undefined, ctx: ConditionContext): Script | null {
  if (!Array.isArray(branches)) return null;
  for (const b of branches) {
    if (evaluateCondition(b?.when, ctx)) return Array.isArray(b?.do) ? b.do : [];
  }
  return null;
}
