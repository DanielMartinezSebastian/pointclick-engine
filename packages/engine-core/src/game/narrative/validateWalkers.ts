/**
 * Recorrido generico de guiones y condiciones para el validador. Es el UNICO sitio
 * que conoce la forma de las acciones y condiciones: una accion o condicion nueva
 * solo hay que ensenarsela aqui. Puro: no lee stores ni registros.
 */

export const ACTION_KINDS = [
  "say",
  "setFlag",
  "giveItem",
  "removeItem",
  "placeItem",
  "removePlacedItem",
  "changeScene",
  "walkTo",
  "wait",
  "playSfx",
  "startDialogue",
  "lockInput",
  "emit",
  "call",
] as const;

/** En el orden en que `evaluateCondition` las reconoce. */
export const CONDITION_KINDS = [
  "flag",
  "hasItem",
  "itemPlaced",
  "inScene",
  "visited",
  "all",
  "any",
  "not",
] as const;

type Node = Record<string, unknown>;

export interface WalkVisitor {
  /** Una accion reconocida (`kind` es su clave distintiva). */
  action?(kind: string, action: Node, where: string): void;
  /** Una condicion reconocida; `all`/`any`/`not` tambien se avisan, y luego se recorren. */
  condition?(kind: string, condition: Node, where: string): void;
  /** Un elemento que no es una accion/condicion conocida. */
  unknown?(what: "action" | "condition" | "branch", node: unknown, where: string): void;
}

const isObj = (x: unknown): x is Node => x !== null && typeof x === "object" && !Array.isArray(x);

export function detectKind(node: Node, kinds: readonly string[]): string | undefined {
  return kinds.find((k) => k in node);
}

export function walkCondition(cond: unknown, where: string, v: WalkVisitor): void {
  if (cond === undefined) return;
  const c = isObj(cond) ? cond : null;
  const kind = c ? detectKind(c, CONDITION_KINDS) : undefined;
  if (!c || !kind) return void v.unknown?.("condition", cond, where);
  v.condition?.(kind, c, where);
  if ((kind === "all" || kind === "any") && Array.isArray(c[kind])) {
    (c[kind] as unknown[]).forEach((x, i) => walkCondition(x, `${where}.${kind}[${i}]`, v));
  } else if (kind === "not") {
    walkCondition(c.not, `${where}.not`, v);
  }
}

export function walkScript(script: unknown, where: string, v: WalkVisitor): void {
  if (script === undefined) return;
  if (!Array.isArray(script)) return void v.unknown?.("action", script, where);
  script.forEach((action, i) => {
    const at = `${where}[${i}]`;
    const a = isObj(action) ? action : null;
    const kind = a ? detectKind(a, ACTION_KINDS) : undefined;
    if (!a || !kind) return void v.unknown?.("action", action, at);
    v.action?.(kind, a, at);
  });
}

/** `where` apunta a la lista de ramas (p. ej. `verbs.use`); cada rama anade `[i].when` / `[i].do`. */
export function walkBranches(branches: unknown, where: string, v: WalkVisitor): void {
  if (branches === undefined) return;
  if (!Array.isArray(branches)) return void v.unknown?.("branch", branches, where);
  branches.forEach((b, i) => {
    const at = `${where}[${i}]`;
    if (!isObj(b)) return void v.unknown?.("branch", b, at);
    walkCondition(b.when, `${at}.when`, v);
    walkScript(b.do, `${at}.do`, v);
  });
}
