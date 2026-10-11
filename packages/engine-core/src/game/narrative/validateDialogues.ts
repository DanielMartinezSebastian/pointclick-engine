import type { DialogueDefinition } from "./dialogueTypes";
import { checkDuplicates, report, type ValidationCtx } from "./validateTypes";
import { refDialogKey, scanCondition, scanScript } from "./validateScan";

/** Comprueba un arbol de dialogo: nodos, saltos, `start`, salidas y alcanzabilidad. */
export function validateDialogue(ctx: ValidationCtx, def: DialogueDefinition): void {
  const base = `dialogue:${def.id}`;
  const nodes = Array.isArray(def.nodes) ? def.nodes : [];
  checkDuplicates(ctx, "nodo de dialogo", base, nodes.map((n) => n?.id));
  const ids = new Set(nodes.map((n) => n?.id));

  const jump = (target: unknown, where: string): void => {
    if (typeof target === "string" && !ids.has(target)) {
      report(ctx, "error", "unknown-dialogue-node", where, `salta a un nodo inexistente: "${target}"`);
    }
  };

  if (!ids.has(def.start)) {
    report(ctx, "error", "unknown-dialogue-start", `${base} > start`, `el nodo inicial no existe: "${String(def.start)}"`);
  }

  const edges = new Map<string, string[]>();
  for (const node of nodes) {
    if (!node) continue;
    const at = `${base} > node:${node.id}`;
    const out: string[] = [];
    refDialogKey(ctx, node.line, `${at} > line`);
    scanScript(ctx, node.do, `${at} > do`);
    jump(node.next, `${at} > next`);
    if (typeof node.next === "string") out.push(node.next);
    const choices = Array.isArray(node.choices) ? node.choices : [];
    choices.forEach((choice, i) => {
      const cat = `${at} > choices[${i}]`;
      refDialogKey(ctx, choice?.text, `${cat}.text`);
      scanCondition(ctx, choice?.when, `${cat}.when`);
      scanScript(ctx, choice?.do, `${cat}.do`);
      jump(choice?.next, `${cat}.next`);
      if (typeof choice?.next === "string") out.push(choice.next);
    });
    // Un nodo vacio no dice, ni hace, ni ofrece, ni enlaza: casi seguro un olvido.
    if (node.line === undefined && !node.do?.length && !choices.length && node.next === undefined) {
      report(ctx, "error", "dialogue-dead-end", at, "nodo sin linea, efectos, opciones ni salida (no es un final intencionado)");
    }
    edges.set(node.id, out);
  }

  const reached = new Set<string>();
  const stack = ids.has(def.start) ? [def.start] : [];
  while (stack.length) {
    const id = stack.pop()!;
    if (reached.has(id)) continue;
    reached.add(id);
    for (const next of edges.get(id) ?? []) if (ids.has(next)) stack.push(next);
  }
  for (const node of nodes) {
    if (node && !reached.has(node.id)) {
      report(ctx, "warning", "unreachable-dialogue-node", `${base} > node:${node.id}`, "nodo inalcanzable desde el inicial");
    }
  }
}
