import { report, type ValidationCtx } from "./validateTypes";
import { walkBranches, walkCondition, walkScript, type WalkVisitor } from "./validateWalkers";

/** Escena donde vive el guion (si se conoce): resuelve interacciones y aristas del grafo. */
export interface ScanScope {
  sceneId?: string;
}

const str = (x: unknown): x is string => typeof x === "string";

export function refItem(ctx: ValidationCtx, id: unknown, where: string, what: string): void {
  if (str(id) && !ctx.itemIds.has(id)) {
    report(ctx, "error", "unknown-item", where, `${what} referencia un item inexistente: "${id}"`);
  }
}

export function refScene(ctx: ValidationCtx, id: unknown, where: string, what: string): void {
  if (str(id) && !ctx.sceneIds.has(id)) {
    report(ctx, "error", "unknown-scene", where, `${what} referencia una escena inexistente: "${id}"`);
  }
}

export function refDialogue(ctx: ValidationCtx, id: unknown, where: string, what: string): void {
  if (str(id) && !ctx.dialogueIds.has(id)) {
    report(ctx, "error", "unknown-dialogue", where, `${what} referencia un dialogo inexistente: "${id}"`);
  }
}

/** `sceneId` indefinido = cualquier escena. */
export function refInteraction(
  ctx: ValidationCtx,
  sceneId: string | undefined,
  id: unknown,
  where: string,
  what: string,
): void {
  if (!str(id)) return;
  let found = false;
  if (sceneId !== undefined && ctx.interactions.has(sceneId)) {
    found = ctx.interactions.get(sceneId)!.has(id);
  } else if (sceneId === undefined) {
    found = [...ctx.interactions.values()].some((s) => s.has(id));
  } else return; // escena desconocida: ya se avisa como unknown-scene
  if (!found) {
    const place = sceneId !== undefined ? ` en la escena "${sceneId}"` : "";
    report(ctx, "error", "unknown-interaction", where, `${what} referencia una interaccion inexistente${place}: "${id}"`);
  }
}

export function refDialogKey(ctx: ValidationCtx, key: unknown, where: string): void {
  const known = ctx.content.dialogKeys;
  if (known && str(key) && !known.has(key)) {
    report(ctx, "warning", "unknown-dialog-key", where, `clave de dialogo desconocida: "${key}"`);
  }
}

export const ANY_SCENE = "*";

export function addEdge(ctx: ValidationCtx, scope: ScanScope, target: unknown): void {
  if (!str(target)) return;
  // Sin escena (dialogos, combine): la arista cuenta desde cualquier escena ("*").
  const from = scope.sceneId ?? ANY_SCENE;
  const set = ctx.sceneEdges.get(from) ?? new Set<string>();
  set.add(target);
  ctx.sceneEdges.set(from, set);
}

export function noteFlag(map: Map<string, string>, name: unknown, where: string): void {
  if (str(name) && !map.has(name)) map.set(name, where);
}

function placedChecks(ctx: ValidationCtx, scope: ScanScope, placed: unknown, where: string): void {
  const p = (placed ?? {}) as Record<string, unknown>;
  refItem(ctx, p.itemId, where, "placeItem");
  if (str(p.itemId)) ctx.provided.add(p.itemId);
  refScene(ctx, p.sceneId, where, "placeItem");
}

function makeVisitor(ctx: ValidationCtx, scope: ScanScope): WalkVisitor {
  return {
    action(kind, a, where) {
      const at = `${where}.${kind}`;
      switch (kind) {
        case "say":
          refDialogKey(ctx, a.say, at);
          break;
        case "setFlag":
          noteFlag(ctx.flagsWritten, a.setFlag, at);
          break;
        case "giveItem":
          refItem(ctx, a.giveItem, at, "giveItem");
          if (str(a.giveItem)) ctx.provided.add(a.giveItem);
          break;
        case "removeItem":
          refItem(ctx, a.removeItem, at, "removeItem");
          break;
        case "placeItem":
          placedChecks(ctx, scope, a.placeItem, at);
          break;
        case "changeScene":
          refScene(ctx, a.changeScene, at, "changeScene");
          addEdge(ctx, scope, a.changeScene);
          break;
        case "startDialogue":
          refDialogue(ctx, a.startDialogue, at, "startDialogue");
          break;
        case "call":
          if (ctx.content.handlers && str(a.call) && !ctx.content.handlers.has(a.call)) {
            report(ctx, "warning", "unknown-handler", at, `call a un manejador no declarado: "${a.call}"`);
          }
          break;
      }
    },
    condition(kind, c, where) {
      const at = `${where}.${kind}`;
      switch (kind) {
        case "flag":
          noteFlag(ctx.flagsRead, c.flag, at);
          break;
        case "hasItem":
          refItem(ctx, c.hasItem, at, "hasItem");
          break;
        case "itemPlaced":
          refItem(ctx, c.itemPlaced, at, "itemPlaced");
          refScene(ctx, c.inScene, at, "itemPlaced.inScene");
          refInteraction(ctx, str(c.inScene) ? c.inScene : undefined, c.at, at, "itemPlaced.at");
          break;
        case "inScene":
          refScene(ctx, c.inScene, at, "inScene");
          break;
        case "visited":
          refScene(ctx, c.visited, at, "visited");
          break;
      }
    },
    unknown(what, node, where) {
      report(ctx, "error", `unknown-${what}`, where, `${what === "action" ? "accion" : what === "branch" ? "rama" : "condicion"} con forma desconocida: ${safeJson(node)}`);
    },
  };
}

function safeJson(x: unknown): string {
  try {
    return JSON.stringify(x) ?? String(x);
  } catch {
    return String(x);
  }
}

export const scanScript = (ctx: ValidationCtx, script: unknown, where: string, scope: ScanScope = {}) =>
  walkScript(script, where, makeVisitor(ctx, scope));
export const scanBranches = (ctx: ValidationCtx, branches: unknown, where: string, scope: ScanScope = {}) =>
  walkBranches(branches, where, makeVisitor(ctx, scope));
export const scanCondition = (ctx: ValidationCtx, cond: unknown, where: string, scope: ScanScope = {}) =>
  walkCondition(cond, where, makeVisitor(ctx, scope));
