import type { GameItemConfig, GameSceneConfig } from "../runtime/types";
import type { Branch } from "./actions";
import { validateDialogue } from "./validateDialogues";
import {
  addEdge,
  ANY_SCENE,
  refDialogKey,
  refInteraction,
  refItem,
  refScene,
  scanBranches,
  scanCondition,
  scanScript,
} from "./validateScan";
import {
  checkDuplicates,
  report,
  type ContentIssue,
  type GameContent,
  type ValidationCtx,
} from "./validateTypes";

export type { ContentIssue, GameContent } from "./validateTypes";

const VERBS = ["look", "use", "talk"];

type Scope = { sceneId: string };

type Interactive = {
  verbs?: Partial<Record<string, Branch[]>>;
  useItem?: Record<string, Branch[]>;
  useItemDefault?: Branch[];
  visibleWhen?: unknown;
};

/** `verbs`, `useItem`, `useItemDefault` y `visibleWhen` son iguales en hotspots y NPCs. */
function validateInteractive(ctx: ValidationCtx, at: string, e: Interactive, scope: Scope): void {
  scanCondition(ctx, e.visibleWhen, `${at} > visibleWhen`, scope);
  for (const [verb, branches] of Object.entries(e.verbs ?? {})) {
    if (!VERBS.includes(verb)) {
      report(ctx, "error", "unknown-verb", `${at} > verbs.${verb}`, `verbo desconocido: "${verb}" (validos: ${VERBS.join(", ")})`);
    }
    scanBranches(ctx, branches, `${at} > verbs.${verb}`, scope);
  }
  for (const [itemId, branches] of Object.entries(e.useItem ?? {})) {
    refItem(ctx, itemId, `${at} > useItem.${itemId}`, "useItem");
    scanBranches(ctx, branches, `${at} > useItem.${itemId}`, scope);
  }
  scanBranches(ctx, e.useItemDefault, `${at} > useItemDefault`, scope);
}

function validateTransitions(ctx: ValidationCtx, scene: GameSceneConfig, base: string): void {
  const scope = { sceneId: scene.id };
  const list = scene.transitions ?? [];
  checkDuplicates(ctx, "transicion", base, list.map((t) => t.id));
  for (const t of list) {
    const at = `${base} > transition:${t.id}`;
    refScene(ctx, t.targetSceneId, `${at} > targetSceneId`, "la transicion");
    addEdge(ctx, scope, t.targetSceneId);
    const req = t as { requiresItemId?: string; requiresInteractionId?: string };
    refItem(ctx, req.requiresItemId, `${at} > requiresItemId`, "la transicion");
    refInteraction(ctx, scene.id, req.requiresInteractionId, `${at} > requiresInteractionId`, "la transicion");
    scanCondition(ctx, t.when, `${at} > when`, scope);
    scanScript(ctx, t.blocked, `${at} > blocked`, scope);
  }
}

function validateScene(ctx: ValidationCtx, scene: GameSceneConfig): void {
  const base = `scene:${scene.id}`;
  const scope = { sceneId: scene.id };
  checkDuplicates(ctx, "interaccion", base, (scene.interactions ?? []).map((i) => i.id));
  for (const i of scene.interactions ?? []) {
    for (const id of i.acceptsItemIds ?? []) {
      refItem(ctx, id, `${base} > interaction:${i.id} > acceptsItemIds`, "la interaccion");
    }
  }
  const hotspots = scene.hotspots ?? [];
  const npcs = scene.npcs ?? [];
  // Los NPC se proyectan a hotspots: comparten espacio de ids.
  checkDuplicates(ctx, "hotspot/NPC", base, [...hotspots.map((h) => h.id), ...npcs.map((n) => n.id)]);

  for (const h of hotspots) {
    const at = `${base} > hotspot:${h.id}`;
    refDialogKey(ctx, h.label, `${at} > label`);
    validateInteractive(ctx, at, h, scope);
  }
  for (const n of npcs) {
    const at = `${base} > npc:${n.id}`;
    refDialogKey(ctx, n.name, `${at} > name`);
    if (n.dialogueId !== undefined && !ctx.dialogueIds.has(n.dialogueId)) {
      report(ctx, "error", "unknown-dialogue", `${at} > dialogueId`, `dialogueId referencia un dialogo inexistente: "${n.dialogueId}"`);
    }
    validateInteractive(ctx, at, n, scope);
  }

  (scene.initialItems ?? []).forEach((entry, i) => {
    const at = `${base} > initialItems[${i}]`;
    const item = entry?.item;
    scanCondition(ctx, entry?.when, `${at}.when`, scope);
    if (!item) return;
    refItem(ctx, item.itemId, `${at}.item`, "initialItems");
    if (typeof item.itemId === "string") ctx.provided.add(item.itemId);
    refScene(ctx, item.sceneId, `${at}.item`, "initialItems");
    refInteraction(ctx, item.sceneId ?? scene.id, item.interactionId, `${at}.item`, "initialItems");
  });
  scanBranches(ctx, scene.onEnter, `${base} > onEnter`, scope);
  validateTransitions(ctx, scene, base);
}

function validateItem(ctx: ValidationCtx, item: GameItemConfig): void {
  for (const [other, branches] of Object.entries(item.combine ?? {})) {
    const at = `item:${item.id} > combine.${other}`;
    refItem(ctx, other, at, "combine");
    scanBranches(ctx, branches, at);
  }
}

function reachableScenes(ctx: ValidationCtx, first: string): Set<string> {
  const seen = new Set<string>();
  const stack = [first];
  while (stack.length) {
    const id = stack.pop()!;
    if (seen.has(id)) continue;
    seen.add(id);
    const next = [...(ctx.sceneEdges.get(id) ?? []), ...(ctx.sceneEdges.get(ANY_SCENE) ?? [])];
    for (const n of next) if (ctx.sceneIds.has(n)) stack.push(n);
  }
  return seen;
}

function globalWarnings(ctx: ValidationCtx): void {
  const { scenes, items } = ctx.content;
  if (scenes.length > 1) {
    const seen = reachableScenes(ctx, scenes[0].id);
    for (const s of scenes) {
      if (!seen.has(s.id)) {
        report(ctx, "warning", "unreachable-scene", `scene:${s.id}`, `escena inalcanzable desde la inicial ("${scenes[0].id}")`);
      }
    }
  }
  for (const item of items) {
    if (!ctx.provided.has(item.id)) {
      report(ctx, "warning", "unused-item", `item:${item.id}`, "ningun guion lo da ni lo coloca (ni giveItem, ni placeItem, ni initialItems)");
    }
  }
  for (const [flag, where] of ctx.flagsRead) {
    if (!ctx.flagsWritten.has(flag)) {
      report(ctx, "warning", "flag-never-set", where, `el flag "${flag}" se lee pero ningun guion lo escribe`);
    }
  }
  for (const [flag, where] of ctx.flagsWritten) {
    if (!ctx.flagsRead.has(flag)) {
      report(ctx, "warning", "flag-never-read", where, `el flag "${flag}" se escribe pero nada lo lee`);
    }
  }
}

/**
 * Valida el contenido declarativo: referencias rotas, duplicados y huecos del grafo.
 * Pura: solo mira `content`, no stores ni registros. La escena inicial es `scenes[0]`.
 * Los avisos (flags, escenas, items) pueden ser intencionados si los gestiona el host.
 */
export function validateContent(content: GameContent): ContentIssue[] {
  const scenes = content.scenes ?? [];
  const items = content.items ?? [];
  const dialogues = content.dialogues ?? [];
  const ctx: ValidationCtx = {
    issues: [],
    content: { ...content, scenes, items },
    sceneIds: new Set(scenes.map((s) => s.id)),
    itemIds: new Set(items.map((i) => i.id)),
    dialogueIds: new Set(dialogues.map((d) => d.id)),
    interactions: new Map(scenes.map((s) => [s.id, new Set((s.interactions ?? []).map((i) => i.id))])),
    provided: new Set(),
    flagsRead: new Map(),
    flagsWritten: new Map(),
    sceneEdges: new Map(),
  };
  checkDuplicates(ctx, "escena", "scenes", scenes.map((s) => s.id));
  checkDuplicates(ctx, "item", "items", items.map((i) => i.id));
  checkDuplicates(ctx, "dialogo", "dialogues", dialogues.map((d) => d.id));

  for (const scene of scenes) validateScene(ctx, scene);
  for (const dlg of dialogues) validateDialogue(ctx, dlg);
  for (const item of items) validateItem(ctx, item);
  globalWarnings(ctx);
  return ctx.issues;
}
