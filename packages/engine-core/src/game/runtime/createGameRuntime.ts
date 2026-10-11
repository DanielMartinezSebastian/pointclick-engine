import { EventBus } from "../../events";
import { CommandHandler } from "../commands/CommandHandler";
import { setSceneStoreEmitter, useSceneStore, useWorldStateStore } from "../state";
import type { GameEvent, GameEventType, GameEventHandler } from "../events/types";
import type {
  GameRuntime,
  GameRuntimeConfig,
  GameState,
  GameActions,
  SceneStoreSnapshot,
} from "./types";
import {
  registerScene,
  registerItem,
  registerRule,
  registerDialogue,
  sceneRegistry,
  itemRegistry,
  ruleRegistry,
  dialogueRegistry,
  toRuntimeScene,
} from "./registry";
import { registerRuntimeExecutors } from "./executors";
import { createSequencer } from "../narrative/sequencer";
import { registerCombineCommands } from "../narrative/combine";
import { registerHotspotCommands } from "../narrative/hotspots";
import { registerDialogueCommands } from "../narrative/dialogue";
import { registerInventoryCommands } from "./inventoryExecutors";
import { systemClock } from "../../ports/clock";
import { validateContent, type ContentIssue } from "../narrative/validateContent";

const isDevelopment = (): boolean =>
  typeof process !== "undefined" && process.env?.NODE_ENV === "development";

const formatIssue = (i: ContentIssue): string =>
  `  [${i.severity}] ${i.code} @ ${i.where}: ${i.message}`;

/** Valida el contenido de `config` segun `config.validate` (ver `GameRuntimeConfig.validate`). */
function runContentValidation(config: GameRuntimeConfig): void {
  const mode = config.validate ?? (isDevelopment() ? true : false);
  if (mode === false) return;
  if (!config.scenes?.length && !config.items?.length && !config.dialogues?.length) return;
  const issues = validateContent({
    scenes: config.scenes ?? [],
    items: config.items ?? [],
    ...(config.dialogues ? { dialogues: config.dialogues } : {}),
    ...(config.dialogKeys ? { dialogKeys: config.dialogKeys } : {}),
    ...(config.handlerNames ? { handlers: config.handlerNames } : {}),
  });
  if (issues.length === 0) return;
  const errors = issues.filter((i) => i.severity === "error");
  const text = `[validateContent] ${errors.length} error(es), ${issues.length - errors.length} aviso(s):\n${issues.map(formatIssue).join("\n")}`;
  if (mode === "throw" && errors.length > 0) throw new Error(text);
  console.warn(text);
}

/**
 * Cablea el estado de mundo con el bus (los stores no se conocen entre sí ni al bus):
 *  - suscripción al store de mundo -> emite `state:flagChanged` por diff de flags
 *    (cubre comandos y llamadas directas a `getWorldState().setFlag`).
 *  - `scene:changed` del bus -> `markSceneVisited` (incluida la escena ya activa).
 * Devuelve la función que suelta ambas suscripciones.
 */
function wireWorldState(bus: EventBus): () => void {
  const unsubStore = useWorldStateStore.subscribe((state, prev) => {
    if (state.flags === prev.flags) return;
    const names = new Set([...Object.keys(prev.flags), ...Object.keys(state.flags)]);
    for (const name of names) {
      const before = prev.flags[name];
      const after = state.flags[name];
      if (before === after) continue;
      bus.emit("state:flagChanged", {
        type: "state:flagChanged",
        name,
        ...(after !== undefined ? { value: after } : {}),
        ...(before !== undefined ? { previous: before } : {}),
      });
    }
  });
  const unsubScene = bus.on<{ sceneId: string }>("scene:changed", (e) => {
    useWorldStateStore.getState().markSceneVisited(e.sceneId);
  });
  const activeSceneId = useSceneStore.getState().sceneId;
  if (activeSceneId) useWorldStateStore.getState().markSceneVisited(activeSceneId);
  return () => {
    unsubStore();
    unsubScene();
  };
}

/** Singleton del runtime activo. Accesible vía getGameRuntime(). */
let runtimeHandle: GameRuntime | null = null;

/**
 * Inicializa el runtime con las escenas, ítems y reglas proporcionadas.
 * Crea EventBus y CommandHandler, cablea store → bus y devuelve el handle
 * (`executeCommand`, `on`, `emit`, `dispose`), guardado como singleton.
 */
export function createGameRuntime(config: GameRuntimeConfig = {}): GameRuntime {
  runContentValidation(config);
  for (const scene of config.scenes ?? []) registerScene(scene);
  for (const item of config.items ?? []) registerItem(item);
  for (const rule of config.rules ?? []) registerRule(rule);
  for (const dlg of config.dialogues ?? []) registerDialogue(dlg);

  const bus = new EventBus();
  const commands = new CommandHandler();

  setSceneStoreEmitter((event) => bus.emit(event.type, event));
  registerRuntimeExecutors(commands, bus, config);
  const unwireWorldState = wireWorldState(bus);

  // Secuenciador narrativo: despacha comandos por el handle y espera eventos del bus.
  const sequencer = createSequencer({
    execute: (cmd) => runtime.executeCommand(cmd),
    emit: (event) => bus.emit(event.type, event),
    on: (type, handler) => bus.on(type, handler as (data: unknown) => void),
    clock: config.clock ?? systemClock,
    instantWalk: config.instantWalk ?? false,
    getItem: (id) => itemRegistry.get(id),
  });
  commands.register("script:run", (cmd) => {
    sequencer.run(cmd.script, { interrupt: cmd.interrupt });
  });
  commands.register("script:cancelAll", () => sequencer.cancelAll());
  const emitEvent = (event: GameEvent) => bus.emit(event.type, event);
  registerHotspotCommands(commands, { emit: emitEvent, runScript: (s) => sequencer.run(s) });
  const dialogueEngine = registerDialogueCommands(commands, {
    emit: emitEvent,
    runScript: (s) => sequencer.run(s),
    registerExecutor: (key, executor) => sequencer.registerExecutor(key, executor),
  });
  registerCombineCommands(commands, {
    emit: emitEvent,
    runScript: (s) => sequencer.run(s),
    getItem: (id) => itemRegistry.get(id),
  });
  registerInventoryCommands(commands, emitEvent);

  const runtime: GameRuntime = {
    getScenes: () => Object.fromEntries(sceneRegistry),
    getItems: () => Object.fromEntries(itemRegistry),
    getRules: () => Object.fromEntries(ruleRegistry),
    getDialogues: () => Object.fromEntries(dialogueRegistry),
    executeCommand: (cmd) => commands.execute(cmd),
    on: <T extends GameEventType>(type: T, handler: GameEventHandler<T>) =>
      bus.on(type, handler as (data: unknown) => void),
    emit: (event: GameEvent) => bus.emit(event.type, event),
    runScript: (script, opts) => sequencer.run(script, opts),
    registerHandler: (name, fn) => sequencer.registerHandler(name, fn),
    dispose: () => {
      dialogueEngine.dispose();
      sequencer.dispose();
      unwireWorldState();
      bus.clear();
      commands.clear();
      setSceneStoreEmitter(null);
      if (runtimeHandle === runtime) runtimeHandle = null;
    },
  };

  runtimeHandle = runtime;
  return runtime;
}

/** Handle del runtime activo, o `null` si no hay o tras `dispose()`. */
export function getGameRuntime(): GameRuntime | null {
  return runtimeHandle;
}

/** Proyección pública del estado del store (reutilizable por hooks). */
export function toGameState(state: SceneStoreSnapshot): GameState {
  return {
    sceneId: state.sceneId,
    scene: state.scene,
    playerPosition: state.playerPosition,
    respawnSignal: state.respawnSignal,
  };
}

/** Construye las acciones públicas a partir de un snapshot del store. */
export function toGameActions(state: SceneStoreSnapshot): GameActions {
  return {
    setScene: (id: string) => {
      const sceneConfig = sceneRegistry.get(id);
      if (!sceneConfig) {
        console.warn(`Scene not registered: ${id}`);
        return;
      }
      state.setScene(id, toRuntimeScene(sceneConfig));
    },
    setPlayerPosition: state.setPlayerPosition,
    requestRespawn: state.requestRespawn,
  };
}

/** Lee snapshot del estado público sin hooks. */
export function getGameState(): GameState {
  return toGameState(useSceneStore.getState());
}

/** Lee acciones públicas sin hooks. */
export function getGameActions(): GameActions {
  return toGameActions(useSceneStore.getState());
}
