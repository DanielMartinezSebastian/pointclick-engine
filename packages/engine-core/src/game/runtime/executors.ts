import type { EventBus } from "../../events";
import type { CommandHandler } from "../commands/CommandHandler";
import { findPath } from "../logic";
import {
  useSceneStore,
  useDialogStore,
  useInventoryUiStore,
  useWorldStateStore,
} from "../state";
import type { GameVec3 } from "../types";
import type { GameRuntimeConfig } from "./types";
import { ruleRegistry, sceneRegistry, toRuntimeScene } from "./registry";

/** Registra en `commands` todos los executors del runtime. */
export function registerRuntimeExecutors(
  commands: CommandHandler,
  bus: EventBus,
  config: GameRuntimeConfig,
): void {
  commands.register("scene:set", (cmd) => {
    const sceneConfig = sceneRegistry.get(cmd.sceneId);
    if (!sceneConfig) {
      console.warn(`[runtime] scene:set — scene not registered: ${cmd.sceneId}`);
      return;
    }
    useSceneStore
      .getState()
      .setScene(sceneConfig.id, toRuntimeScene(sceneConfig), cmd.spawnPosition);
  });

  commands.register("scene:respawn", () => {
    useSceneStore.getState().requestRespawn();
  });

  commands.register("player:move", (cmd) => {
    useSceneStore.getState().setPlayerPosition(cmd.position);
  });

  commands.register("player:walkTo", (cmd) => {
    const state = useSceneStore.getState();
    const from: GameVec3 = [
      state.playerPosition[0],
      state.playerPosition[1],
      state.playerPosition[2],
    ];
    const pathResult = findPath({
      start: { x: from[0], z: from[2] },
      goal: { x: cmd.position[0], z: cmd.position[2] },
      bounds: {
        minX: state.scene.ground.minX,
        maxX: state.scene.ground.maxX,
        minZ: state.scene.ground.minZ,
        maxZ: state.scene.ground.maxZ,
      },
      walls: state.scene.walls,
      interactions: state.scene.interactions,
    });

    if (pathResult && pathResult.length > 0) {
      // Siempre incluye el punto de partida para garantizar ≥2 puntos.
      const pathPoints: GameVec3[] = [
        from,
        ...pathResult.map((p) => [p.x, state.scene.ground.y, p.z] as GameVec3),
      ];
      state.setPlayerWalkingState({
        targetPosition: cmd.position,
        pathPoints,
        progress: 0,
        isActive: true,
      });
      bus.emit("player:walkStarted", {
        type: "player:walkStarted",
        targetPosition: cmd.position,
      });
    } else {
      bus.emit("player:walkAborted", {
        type: "player:walkAborted",
        reason: "unreachable",
      });
    }
  });

  commands.register("inventory:toggle", () => {
    if (config.inventoryAdapter) config.inventoryAdapter.toggle();
    else useInventoryUiStore.getState().toggle();
  });

  // Clave del diálogo activo para que dialog:dismiss la incluya en el evento.
  let activeDialogKey: string | undefined;

  commands.register("dialog:trigger", (cmd) => {
    const phrases = ruleRegistry.get(cmd.dialogKey)?.phrases ?? [];
    const text =
      phrases.length > 0
        ? phrases[Math.floor(Math.random() * phrases.length)]!
        : cmd.dialogKey;
    activeDialogKey = cmd.dialogKey;
    if (config.dialogAdapter) config.dialogAdapter.show(text, cmd.dialogKey);
    else useDialogStore.getState().show(text, cmd.dialogKey);
    bus.emit("dialog:triggered", {
      type: "dialog:triggered",
      text,
      dialogKey: cmd.dialogKey,
      source: "command",
    });
  });

  commands.register("dialog:dismiss", () => {
    const key = activeDialogKey;
    activeDialogKey = undefined;
    if (config.dialogAdapter) config.dialogAdapter.hide();
    else useDialogStore.getState().dismiss();
    bus.emit("dialog:dismissed", { type: "dialog:dismissed", dialogKey: key });
  });

  commands.register("transition:activate", (cmd) => {
    const state = useSceneStore.getState();
    const transition = state.scene.transitions?.find((t) => t.id === cmd.transitionId);
    if (!transition) {
      console.warn(`[runtime] transition:activate — unknown transition: ${cmd.transitionId}`);
      return;
    }
    const fromSceneId = state.sceneId;
    bus.emit("transition:started", {
      type: "transition:started",
      transitionId: cmd.transitionId,
    });
    const sceneConfig = sceneRegistry.get(transition.targetSceneId);
    if (!sceneConfig) {
      console.warn(
        `[runtime] transition:activate — target scene not registered: ${transition.targetSceneId}`,
      );
      return;
    }
    useSceneStore
      .getState()
      .setScene(sceneConfig.id, toRuntimeScene(sceneConfig), transition.spawnPosition);
    bus.emit("transition:completed", {
      type: "transition:completed",
      fromSceneId,
      toSceneId: transition.targetSceneId,
    });
  });

  commands.register("transition:cancel", (cmd) => {
    useSceneStore.getState().setTransitionItemOccupying(cmd.transitionId, undefined);
  });

  commands.register("player:stop", () => {
    const state = useSceneStore.getState();
    if (state.playerWalkingState?.isActive) {
      state.setPlayerWalkingState(null);
      bus.emit("player:walkAborted", {
        type: "player:walkAborted",
        reason: "user-input",
      });
    }
  });

  commands.register("state:setFlag", (cmd) => {
    useWorldStateStore.getState().setFlag(cmd.name, cmd.value);
  });

  commands.register("state:clearFlag", (cmd) => {
    useWorldStateStore.getState().clearFlag(cmd.name);
  });

  // Formalmente aplazados (v0.2.0): solo avisan.
  commands.register("inventory:pickup", (cmd) =>
    console.warn(
      `[runtime] executor deferred to v0.2.0: ${cmd.type} — requires UI context (which interaction was clicked). See docs/phases/phase-9-placed-items-agnóstic/README.md#phase-d`,
    ),
  );
  commands.register("inventory:drop", (cmd) =>
    console.warn(
      `[runtime] executor deferred to v0.2.0: ${cmd.type} — requires UI context (drag coordinates, target interaction). See docs/phases/phase-9-placed-items-agnóstic/README.md#phase-d`,
    ),
  );
}
