import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToString } from "react-dom/server";

import { DEFAULT_SCENE_ID, SCENES } from "../../demo/content/scenes";
import {
  GameViewport,
  createGameRuntime,
  getGameActions,
  getGameState,
  registerItem,
  registerRule,
  registerScene,
  useGameActions,
  useGameState,
  type GameItemConfig,
  type GameRuleConfig,
  type GameSceneConfig,
} from "./publicApi";

function makeScene(id: string): GameSceneConfig {
  return {
    id,
    label: `Scene ${id}`,
    background: "/assets/background/test.png",
    playerSpawn: [0, 0, 0],
    ground: { minX: -1, maxX: 1, minZ: -1, maxZ: 1, y: 0 },
    walls: [],
    interactions: [],
  };
}

function makeItem(id: string): GameItemConfig {
  return {
    id,
    name: `Item ${id}`,
    spriteUrl: "/assets/items/test.png",
    interactionRules: {},
    defaultRule: { outcome: "return" },
  };
}

function makeRule(key: string): GameRuleConfig {
  return {
    key,
    phrases: ["hola"],
  };
}

describe("publicApi", () => {
  it("crea runtime y devuelve escenas/items/rules registrados", () => {
    const scene = makeScene("test-scene-create");
    const item = makeItem("test-item-create");
    const rule = makeRule("test.rule.create");

    const runtime = createGameRuntime({
      scenes: [scene],
      items: [item],
      rules: [rule],
    });

    expect(runtime.getScenes()[scene.id]).toMatchObject({ id: scene.id });
    expect(runtime.getItems()[item.id]).toMatchObject({ id: item.id });
    expect(runtime.getRules()[rule.key]).toMatchObject({ key: rule.key });
  });

  it("sobrescribe registros por id/key cuando se re-registra", () => {
    registerScene({ ...makeScene("test-scene-overwrite"), label: "v1" });
    registerScene({ ...makeScene("test-scene-overwrite"), label: "v2" });

    registerItem({ ...makeItem("test-item-overwrite"), name: "v1" });
    registerItem({ ...makeItem("test-item-overwrite"), name: "v2" });

    registerRule({ ...makeRule("test.rule.overwrite"), phrases: ["v1"] });
    registerRule({ ...makeRule("test.rule.overwrite"), phrases: ["v2"] });

    const runtime = createGameRuntime();
    expect(runtime.getScenes()["test-scene-overwrite"]?.label).toBe("v2");
    expect(runtime.getItems()["test-item-overwrite"]?.name).toBe("v2");
    expect(runtime.getRules()["test.rule.overwrite"]?.phrases).toEqual(["v2"]);
  });

  it("expone acciones/estado base del runtime store", () => {
    const actions = getGameActions();
    const sceneIds = Object.keys(SCENES);
    expect(sceneIds.length).toBeGreaterThan(0);

    const initialState = getGameState();
    actions.requestRespawn();
    const afterRespawn = getGameState();
    expect(afterRespawn.respawnSignal).toBe(initialState.respawnSignal + 1);

    actions.setScene(sceneIds[0]);
    const afterSetScene = getGameState();
    expect(afterSetScene.sceneId).toBe(sceneIds[0]);
  });

  it("useGameState aplica selector sobre estado publico", () => {
    const expectedSceneId = DEFAULT_SCENE_ID;

    let selectedSceneId = "";

    function Probe() {
      selectedSceneId = useGameState((state) => state.sceneId);
      return null;
    }

    renderToString(createElement(Probe));
    expect(selectedSceneId).toBe(expectedSceneId);
  });

  it("useGameActions expone acciones equivalentes al runtime", () => {
    const runtimeActions = getGameActions();
    let actionsFromHook: ReturnType<typeof useGameActions> | null = null;

    function Probe() {
      actionsFromHook = useGameActions();
      return null;
    }

    renderToString(createElement(Probe));

    expect(actionsFromHook).not.toBeNull();
    expect(actionsFromHook?.setScene).toBe(runtimeActions.setScene);
    expect(actionsFromHook?.setPlayerPosition).toBe(
      runtimeActions.setPlayerPosition,
    );
    expect(actionsFromHook?.requestRespawn).toBe(runtimeActions.requestRespawn);
  });

  it("GameViewport reenvia debug y onRuntimeEvent al componente base", () => {
    const onRuntimeEvent = () => {};
    const element = GameViewport({
      debug: true,
      onRuntimeEvent,
    });

    expect(element.props.debug).toBe(true);
    expect(element.props.onRuntimeEvent).toBe(onRuntimeEvent);
  });
});
