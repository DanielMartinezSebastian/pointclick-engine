import { setSceneStoreLogger } from "../game/state";
import { useDialogStore } from "../game/state/dialogStore";
import { getDialogueState, useDialogueStore } from "../game/state/dialogueStore";
import { useInputLockStore } from "../game/state/inputLockStore";
import { DEFAULT_INVENTORY_SLOT_COUNT, getInventoryState } from "../game/state/inventoryStore";
import { getPlacedItemsState } from "../game/state/placedItemsReactiveStore";
import { applySnapshot, captureSnapshot, type GameSnapshot } from "../game/state/saveGame";
import { getSceneState, useSceneStore } from "../game/state/sceneStore";
import { getWorldState, type FlagValue } from "../game/state/worldStateStore";
import type { KeyValueStoragePort } from "../game/state/gameStatePersistence";
import { createGameRuntime, getGameRuntime } from "../game/runtime/createGameRuntime";
import { dialogueRegistry, itemRegistry, ruleRegistry, sceneRegistry } from "../game/runtime/registry";
import type { GameRuntime, ScriptHandler } from "../game/runtime/types";
import {
  evaluateTransitionGate,
  getDeclaredScene,
  getSceneRuleContext,
  resolveEnterScript,
  resolveInitialItems,
} from "../game/narrative/sceneRules";
import type { GameContent } from "../game/narrative/validateContent";
import type { Verb } from "../game/types";
import { HeadlessClock } from "../ports/headlessClock";

/** Opciones de `createPlaythrough`. */
export interface PlaythroughOptions {
  /** Escena en la que empieza la partida. Por defecto, la primera de `content.scenes`. */
  initialSceneId?: string;
  /**
   * Manejadores de la accion `call`. Se registran ANTES de entrar en la escena inicial,
   * para que un `onEnter` que los use los encuentre.
   */
  handlers?: Record<string, ScriptHandler>;
  /**
   * Se llama con el runtime recien creado, ANTES de entrar en la escena inicial: el sitio para
   * suscribirse a eventos que ya ocurren al arrancar (p. ej. el bocadillo de un `onEnter`).
   */
  onRuntime?: (runtime: GameRuntime) => void;
  /**
   * Partida guardada de la que partir (p. ej. `otraPartida.save()`). Se restaura sin volver a
   * correr el `onEnter` de la escena guardada; `initialSceneId` se ignora.
   */
  snapshot?: GameSnapshot;
}

export interface PlaythroughState {
  sceneId: string;
  /** Un id por unidad (un item apilado x2 aparece dos veces), en orden de slot. */
  inventory: string[];
  flags: Record<string, FlagValue>;
  /** true mientras hay una conversacion (arbol de dialogo) abierta. */
  dialogueActive: boolean;
}

export interface Playthrough {
  runtime: GameRuntime;
  clock: HeadlessClock;
  /** Mira el hotspot / NPC `id` de la escena activa. Verbo `look`. */
  look(id: string): Promise<void>;
  /** Usa el hotspot / NPC `id` (verbo `use`). */
  use(id: string): Promise<void>;
  /** Habla con el hotspot / NPC `id` (verbo `talk`). Se detiene en la primera eleccion pendiente. */
  talk(id: string): Promise<void>;
  /** Usa el item `itemId` del inventario sobre el hotspot / NPC `id`. */
  useItemOn(itemId: string, id: string): Promise<void>;
  /** Combina dos items del inventario. */
  combine(a: string, b: string): Promise<void>;
  /** Recoge un item colocado de la escena activa (por el `id` del item colocado). */
  pickUp(placedItemId: string): Promise<void>;
  /**
   * Elige una opcion de la conversacion activa. `index` es la posicion ORIGINAL en
   * `node.choices` (la misma que usa `dialogue:choose`), no la posicion entre las visibles.
   * Lanza si esa opcion no esta disponible ahora.
   */
  choose(index: number): Promise<void>;
  /** Cruza la transicion `transitionId` de la escena activa, respetando `when` / `blocked`. */
  goThrough(transitionId: string): Promise<void>;
  /** Avanza el reloj y descarta bocadillos hasta que no quede ningun guion en curso. */
  settle(): Promise<void>;
  state(): PlaythroughState;
  save(): GameSnapshot;
  dispose(): void;
}

/** Iteraciones maximas de `settle` antes de dar el recorrido por atascado. */
export const SETTLE_MAX_ITERATIONS = 2000;
/** Milisegundos de reloj virtual que avanza `settle` en cada iteracion. */
export const SETTLE_STEP_MS = 250;

const MICROTASKS_PER_TURN = 40;

async function flushMicrotasks(times = MICROTASKS_PER_TURN): Promise<void> {
  for (let i = 0; i < times; i++) await Promise.resolve();
}

function memoryStorage(): KeyValueStoragePort {
  const data = new Map<string, string>();
  return {
    getItem: (key) => (data.has(key) ? data.get(key)! : null),
    setItem: (key, value) => void data.set(key, value),
    removeItem: (key) => void data.delete(key),
  };
}

/** Deja los registros globales del runtime y los stores de partida como recien arrancados. */
function resetGlobalState(): void {
  sceneRegistry.clear();
  itemRegistry.clear();
  ruleRegistry.clear();
  dialogueRegistry.clear();
  useDialogStore.setState({ text: "", key: undefined, speaker: undefined, visible: false, triggerCount: 0 });
  useDialogueStore.getState().clear();
  useInputLockStore.setState({ inputLocked: false });
  getInventoryState().reset(DEFAULT_INVENTORY_SLOT_COUNT);
  getPlacedItemsState().reset();
  getWorldState().reset();
  useSceneStore.setState({ sceneId: "", playerPosition: [0, 0, 0], playerWalkingState: null });
}

/**
 * Crea una partida headless de `content`: runtime real, `HeadlessClock`, almacenamiento en
 * memoria y caminata instantanea. Valida el contenido y lanza si hay errores.
 *
 * Los registros de escenas, items y dialogos del runtime son globales de modulo: crear una
 * partida los deja limpios (y descarta el runtime activo anterior), y `dispose()` los vuelve
 * a limpiar. Hay una sola partida viva a la vez por proceso.
 *
 * Sin renderer, aqui se aplican las reglas declarativas de escena que en el juego aplica el
 * renderer, con las mismas funciones puras del core: siembra de `initialItems` y `onEnter` al
 * entrar en una escena, y `when` / `blocked` en `goThrough`.
 */
export function createPlaythrough(content: GameContent, opts: PlaythroughOptions = {}): Playthrough {
  const first = content.scenes[0];
  const initialSceneId = opts.initialSceneId ?? first?.id;
  if (!opts.snapshot) {
    if (initialSceneId === undefined) throw new Error("[playthrough] el contenido no tiene escenas");
    if (!content.scenes.some((s) => s.id === initialSceneId)) {
      throw new Error(`[playthrough] escena inicial inexistente: "${initialSceneId}"`);
    }
  }

  getGameRuntime()?.dispose();
  resetGlobalState();
  setSceneStoreLogger(() => {});

  const handlerNames =
    content.handlers ?? (opts.handlers ? new Set(Object.keys(opts.handlers)) : undefined);
  const clock = new HeadlessClock();
  let runtime: GameRuntime;
  try {
    runtime = createGameRuntime({
      scenes: content.scenes,
      items: content.items,
      ...(content.dialogues ? { dialogues: content.dialogues } : {}),
      ...(content.dialogKeys ? { dialogKeys: content.dialogKeys } : {}),
      ...(handlerNames ? { handlerNames } : {}),
      storage: memoryStorage(),
      clock,
      instantWalk: true,
      validate: "throw",
    });
  } catch (error) {
    resetGlobalState();
    setSceneStoreLogger(null);
    throw error;
  }
  for (const [name, fn] of Object.entries(opts.handlers ?? {})) runtime.registerHandler(name, fn);
  opts.onRuntime?.(runtime);

  // --- seguimiento de guiones en curso -------------------------------------------------
  let running = 0;
  let restoring = false;
  let disposed = false;
  const offs: Array<() => void> = [
    runtime.on("script:started", () => void running++),
    runtime.on("script:finished", () => void running--),
    // Lo que el renderer hace al entrar en una escena: sembrar items y correr `onEnter`.
    runtime.on("scene:changed", (event) => {
      if (restoring) return;
      enterScene(event.sceneId);
    }),
  ];

  function enterScene(sceneId: string): void {
    const placed = getPlacedItemsState();
    const declared = getDeclaredScene(sceneId)?.initialItems;
    if (Array.isArray(declared) && !placed.isSceneSeeded(sceneId)) {
      const added = resolveInitialItems(sceneId, declared, getSceneRuleContext(sceneId, placed.items));
      if (added && added.length > 0) placed.setItems([...placed.items, ...added]);
      placed.markSceneSeeded(sceneId);
    }
    const script = resolveEnterScript(getDeclaredScene(sceneId)?.onEnter, getSceneRuleContext(sceneId));
    if (script) runtime.runScript(script);
  }

  async function settle(): Promise<void> {
    for (let i = 0; i < SETTLE_MAX_ITERATIONS; i++) {
      await flushMicrotasks();
      if (useDialogStore.getState().visible) {
        runtime.executeCommand({ type: "dialog:dismiss" });
        continue;
      }
      if (running <= 0) return;
      // Una conversacion esperando una eleccion no avanza sin el jugador: es un punto de reposo.
      if (getDialogueState().choices.length > 0) return;
      clock.advance(SETTLE_STEP_MS);
    }
    const { activeDialogueId, nodeId } = getDialogueState();
    throw new Error(
      `[playthrough] settle() no converge tras ${SETTLE_MAX_ITERATIONS} iteraciones ` +
        `(${SETTLE_STEP_MS} ms virtuales cada una): guiones en curso=${running}, ` +
        `temporizadores pendientes=${clock.pending()}, ` +
        `dialogo=${activeDialogueId ?? "ninguno"}${nodeId ? `/${nodeId}` : ""}`,
    );
  }

  async function interact(verb: Verb | "useItem", id: string, itemId?: string): Promise<void> {
    runtime.executeCommand({
      type: "hotspot:interact",
      hotspotId: id,
      verb,
      ...(itemId !== undefined ? { itemId } : {}),
    });
    await settle();
  }

  // --- estado inicial --------------------------------------------------------------------
  if (opts.snapshot) {
    restoring = true;
    let applied = false;
    try {
      applied = applySnapshot(opts.snapshot);
    } finally {
      restoring = false;
    }
    if (!applied) {
      runtime.dispose();
      resetGlobalState();
      setSceneStoreLogger(null);
      throw new Error(`[playthrough] la escena de la partida guardada no existe: "${opts.snapshot.sceneId}"`);
    }
  } else {
    runtime.executeCommand({ type: "scene:set", sceneId: initialSceneId! });
  }

  const playthrough: Playthrough = {
    runtime,
    clock,
    look: (id) => interact("look", id),
    use: (id) => interact("use", id),
    talk: (id) => interact("talk", id),
    useItemOn: (itemId, id) => interact("useItem", id, itemId),
    async combine(a, b) {
      runtime.executeCommand({ type: "inventory:combine", itemId: a, withItemId: b });
      await settle();
    },
    async pickUp(placedItemId) {
      const sceneId = getSceneState().sceneId;
      const placed = getPlacedItemsState().items.find((p) => p.id === placedItemId);
      // El comando busca por id en TODAS las escenas: aqui solo se alcanza lo de la escena activa.
      if (placed && placed.sceneId === sceneId) {
        runtime.executeCommand({ type: "inventory:pickup", itemId: placed.itemId, placedItemId });
      } else {
        runtime.emit({ type: "inventory:pickupFailed", itemId: placedItemId, reason: "not-found" });
      }
      await settle();
    },
    async choose(index) {
      if (!getDialogueState().choices.some((c) => c.index === index)) {
        const available = getDialogueState().choices.map((c) => c.index).join(", ") || "ninguna";
        throw new Error(`[playthrough] choose(${index}): opcion no disponible (disponibles: ${available})`);
      }
      runtime.executeCommand({ type: "dialogue:choose", index });
      await settle();
    },
    async goThrough(transitionId) {
      const { sceneId, scene } = getSceneState();
      const transition = scene.transitions?.find((t) => t.id === transitionId);
      if (!transition) {
        throw new Error(`[playthrough] goThrough: la escena "${sceneId}" no tiene la transicion "${transitionId}"`);
      }
      const gate = evaluateTransitionGate(transition, getSceneRuleContext(sceneId));
      if (!gate.allowed) {
        if (gate.blocked.length > 0) runtime.runScript(gate.blocked);
      } else {
        runtime.executeCommand({ type: "transition:activate", transitionId });
      }
      await settle();
    },
    settle,
    state() {
      return {
        sceneId: getSceneState().sceneId,
        inventory: getInventoryState().slots.flatMap((s) =>
          s ? Array.from({ length: s.quantity }, () => s.id) : [],
        ),
        flags: { ...getWorldState().flags },
        dialogueActive: getDialogueState().activeDialogueId !== null,
      };
    },
    save: () => captureSnapshot(),
    dispose() {
      if (disposed) return;
      disposed = true;
      for (const off of offs) off();
      runtime.dispose();
      resetGlobalState();
      setSceneStoreLogger(null);
    },
  };
  return playthrough;
}
