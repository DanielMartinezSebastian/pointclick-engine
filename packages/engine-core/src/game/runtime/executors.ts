import type { EventBus } from "../../events";
import type { CommandHandler } from "../commands/CommandHandler";
import { findPath } from "../logic";
import { useSceneStore } from "../state";
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
    useSceneStore.getState().setScene(sceneConfig.id, toRuntimeScene(sceneConfig));
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
    config.inventoryAdapter?.toggle();
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
    config.dialogAdapter?.show(text, cmd.dialogKey);
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
    config.dialogAdapter?.hide();
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
    useSceneStore.getState().setScene(sceneConfig.id, toRuntimeScene(sceneConfig));
    bus.emit("transition:completed", {
      type: "transition:completed",
      fromSceneId,
      toSceneId: transition.targetSceneId,
    });
  });

  commands.register("transition:cancel", (cmd) => {
    useSceneStore.getState().setTransitionItemOccupying(cmd.transitionId, undefined);
  });

  // Formalmente aplazados (v0.2.0): solo avisan.
  commands.register("player:stop", (cmd) =>
    console.warn(
      `[runtime] executor deferred to v0.2.0: ${cmd.type} — requires renderer-r3f DI prop for cancelTarget. See docs/phases/phase-5-publish/tasks/02-wire-pending-commands.md#aplazados`,
    ),
  );
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
