import { describe, it, expect, vi, afterEach } from "vitest";
import {
  createGameRuntime,
  registerScene,
  useSceneStore,
  type GameRuntime,
  type GameSceneConfig,
} from "../index";

function makeScene(id: string, extra: Partial<GameSceneConfig> = {}): GameSceneConfig {
  return {
    id,
    label: `Scene ${id}`,
    background: "/bg.png",
    playerSpawn: [0, 0, 0],
    ground: { minX: -5, maxX: 5, minZ: -5, maxZ: 5, y: 0 },
    walls: [],
    interactions: [],
    ...extra,
  };
}

let rt: GameRuntime | null = null;
afterEach(() => {
  rt?.dispose();
  rt = null;
  vi.restoreAllMocks();
});

describe("player:stop", () => {
  it("tras player:walkTo a destino alcanzable, player:stop deja playerWalkingState inactivo o nulo", () => {
    rt = createGameRuntime({ scenes: [makeScene("rt-stop-1")] });
    rt.executeCommand({ type: "scene:set", sceneId: "rt-stop-1" });
    useSceneStore.getState().setPlayerWalkingState(null);

    // Start a walk
    rt.executeCommand({ type: "player:walkTo", position: [3, 0, 3] });
    const walking = useSceneStore.getState().playerWalkingState;
    expect(walking?.isActive).toBe(true);

    // Stop the walk
    rt.executeCommand({ type: "player:stop" });
    const stopped = useSceneStore.getState().playerWalkingState;
    expect(stopped).toBeNull();
  });

  it("emite player:walkAborted con reason: 'user-input' exactamente una vez", () => {
    rt = createGameRuntime({ scenes: [makeScene("rt-stop-2")] });
    rt.executeCommand({ type: "scene:set", sceneId: "rt-stop-2" });
    useSceneStore.getState().setPlayerWalkingState(null);

    const aborted = vi.fn();
    rt.on("player:walkAborted", aborted);

    // Start a walk
    rt.executeCommand({ type: "player:walkTo", position: [3, 0, 3] });

    // Stop the walk
    rt.executeCommand({ type: "player:stop" });

    expect(aborted).toHaveBeenCalledTimes(1);
    expect(aborted).toHaveBeenCalledWith({
      type: "player:walkAborted",
      reason: "user-input",
    });
  });

  it("player:stop sin caminata activa no emite nada", () => {
    rt = createGameRuntime({ scenes: [makeScene("rt-stop-3")] });
    rt.executeCommand({ type: "scene:set", sceneId: "rt-stop-3" });
    useSceneStore.getState().setPlayerWalkingState(null);

    const aborted = vi.fn();
    rt.on("player:walkAborted", aborted);

    // Try to stop without a walk
    rt.executeCommand({ type: "player:stop" });

    expect(aborted).not.toHaveBeenCalled();
    expect(useSceneStore.getState().playerWalkingState).toBeNull();
  });
});
