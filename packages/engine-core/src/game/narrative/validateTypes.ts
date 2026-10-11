import type { DialogueDefinition } from "./dialogueTypes";
import type { GameItemConfig, GameSceneConfig } from "../runtime/types";

/** Una incidencia del contenido: un error rompe el juego, un aviso huele mal. */
export interface ContentIssue {
  severity: "error" | "warning";
  /** Codigo estable, p. ej. "unknown-item", "unknown-scene", "unknown-dialogue-node". */
  code: string;
  /** Ruta legible: "scene:town > hotspot:well > verbs.use[0].do[2]". */
  where: string;
  message: string;
}

/** Todo el contenido declarativo de un juego, tal como se pasa a `createGameRuntime`. */
export interface GameContent {
  scenes: GameSceneConfig[];
  items: GameItemConfig[];
  dialogues?: DialogueDefinition[];
  /** Claves de dialogo conocidas; si se pasa, se validan las claves de `say`, `label`, `line` y `text`. */
  dialogKeys?: ReadonlySet<string>;
  /** Nombres de manejadores `call` que el host registra. */
  handlers?: ReadonlySet<string>;
}

/** Estado compartido de un recorrido de validacion (privado del validador). */
export interface ValidationCtx {
  issues: ContentIssue[];
  content: GameContent;
  sceneIds: Set<string>;
  itemIds: Set<string>;
  dialogueIds: Set<string>;
  /** Ids de interaccion por escena. */
  interactions: Map<string, Set<string>>;
  /** Items que algo da o coloca. */
  provided: Set<string>;
  /** Flag -> primer sitio donde se lee / se escribe. */
  flagsRead: Map<string, string>;
  flagsWritten: Map<string, string>;
  /** Escena -> escenas a las que se puede ir desde ella. */
  sceneEdges: Map<string, Set<string>>;
}

export function report(
  ctx: ValidationCtx,
  severity: ContentIssue["severity"],
  code: string,
  where: string,
  message: string,
): void {
  ctx.issues.push({ severity, code, where, message });
}

/** Marca duplicados de `ids` (en orden) bajo `where`. */
export function checkDuplicates(
  ctx: ValidationCtx,
  kind: string,
  where: string,
  ids: ReadonlyArray<string | undefined>,
): void {
  const seen = new Set<string>();
  const dup = new Set<string>();
  for (const id of ids) {
    if (typeof id !== "string") continue;
    if (seen.has(id)) dup.add(id);
    seen.add(id);
  }
  for (const id of dup) {
    report(ctx, "error", "duplicate-id", where, `${kind} duplicado: "${id}"`);
  }
}
