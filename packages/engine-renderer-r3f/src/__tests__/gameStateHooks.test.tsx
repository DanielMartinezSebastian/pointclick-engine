import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { registerScene, getGameState, type GameActions } from "@pointclick-engine/engine-core";

import { useGameActions, useGameState } from "../index";

function makeScene(id: string) {
  return {
    id,
    label: `Scene ${id}`,
    background: "/assets/background/test.png",
    playerSpawn: [0, 0, 0] as [number, number, number],
    ground: { minX: -1, maxX: 1, minZ: -1, maxZ: 1, y: 0 },
    walls: [],
    interactions: [],
  };
}

describe("game state hooks", () => {
  it("useGameActions().setScene changes sceneId", () => {
    registerScene(makeScene("hooks-scene-a"));
    registerScene(makeScene("hooks-scene-b"));

    let actions: GameActions | undefined;
    let sceneId: string | undefined;
    function Probe() {
      actions = useGameActions();
      sceneId = useGameState((s) => s.sceneId);
      return null;
    }

    renderToString(createElement(Probe));
    expect(actions).toBeDefined();
    actions!.setScene("hooks-scene-a");
    expect(getGameState().sceneId).toBe("hooks-scene-a");
    actions!.setScene("hooks-scene-b");
    expect(getGameState().sceneId).toBe("hooks-scene-b");

    // renderToString reads the store's server snapshot, so only check it resolves.
    renderToString(createElement(Probe));
    expect(typeof sceneId).toBe("string");
  });
});
