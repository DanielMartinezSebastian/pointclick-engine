"use client";

import { useEffect, useState } from "react";
import {
  createGameRuntime,
  useSceneStore,
  useInventoryStateStore,
  usePlacedItemsStateStore,
  type GameRuntime,
  type GameSceneConfig,
  type GameItemConfig,
  sceneTransitionOnCollision,
} from "@pointclick-engine/engine-core";
import { GameViewport } from "@pointclick-engine/engine-renderer-r3f";

/** Escena A: Town-like background con dos spawn points */
const SCENE_A: GameSceneConfig = {
  id: "minimal-a",
  label: "Minimal Scene A",
  background: "/assets/background/town.jpg",
  playerSpawn: [3.08, 1.05, 13.44],
  ground: {
    minX: -12,
    maxX: 17,
    minZ: -15,
    maxZ: 30,
    y: -3.25,
  },
  walls: [],
  interactions: [],
  transitions: [
    sceneTransitionOnCollision({
      id: "transition-a-to-b",
      targetSceneId: "minimal-b",
      position: [2, -1, -12],
      halfSize: [6, 4, 2],
      spawnPosition: [0, -1.1, 20],
      targetPosition: [0, -1.1, 10],
    }),
  ],
};

/** Escena B: Dungeon-like background */
const SCENE_B: GameSceneConfig = {
  id: "minimal-b",
  label: "Minimal Scene B",
  background: "/assets/background/mazmorra.jpg",
  playerSpawn: [0, -1.1, 13.44],
  ground: {
    minX: -14.4,
    maxX: 15.8,
    minZ: -20.6,
    maxZ: 60.6,
    y: -3.15,
  },
  walls: [],
  interactions: [],
  transitions: [
    sceneTransitionOnCollision({
      id: "transition-b-to-a",
      targetSceneId: "minimal-a",
      position: [0, -2.2, -9],
      halfSize: [1, 1, 1],
      spawnPosition: [3.08, 1.05, 13.44],
      targetPosition: [1.60, -2.10, 14.93],
    }),
  ],
};

/** Trophy item: simple configuration with return-to-inventory default */
const TROPHY_ITEM: GameItemConfig = {
  id: "trophy",
  name: "Trophy",
  spriteUrl: "/assets/trophy/trophy.png",
  interactionRules: {},
  defaultRule: {
    outcome: "return",
  },
};

/** Status display showing current scene and inventory count */
function StatusOverlay() {
  const sceneId = useSceneStore((s) => s.sceneId);
  const inventorySlots = useInventoryStateStore((s) => s.slots);
  const inventoryCount = inventorySlots.filter((slot) => slot !== null).length;
  const placedCount = usePlacedItemsStateStore((s) => s.items.length);

  return (
    <div
      data-testid="minimal-status"
      style={{
        position: "fixed",
        top: "1rem",
        left: "1rem",
        padding: "0.75rem 1rem",
        background: "rgba(0, 0, 0, 0.7)",
        color: "#fff",
        fontFamily: "monospace",
        fontSize: "0.875rem",
        borderRadius: "4px",
        zIndex: 100,
      }}
    >
      escena: {sceneId} | inventario: {inventoryCount} | en escena: {placedCount}
    </div>
  );
}

/** Root component: mount runtime once, then viewport */
function MinimalGame() {
  const [runtime, setRuntime] = useState<GameRuntime | null>(null);

  useEffect(() => {
    const created = createGameRuntime({
      scenes: [SCENE_A, SCENE_B],
      items: [TROPHY_ITEM],
    });
    // eslint-disable-next-line react-hooks/set-state-in-effect -- publishes the runtime so child hooks can access it before mounting the viewport
    setRuntime(created);

    return () => {
      created.dispose();
      setRuntime(null);
    };
  }, []);

  if (!runtime) {
    return null;
  }

  return (
    <GameViewport
      runtime={runtime}
      initialSceneId="minimal-a"
      getInitialPlacedItems={(sceneId) => {
        if (sceneId !== "minimal-a") return null;
        return [
          {
            id: "trophy-in-scene-a",
            itemId: "trophy",
            interactionId: "trophy-pickup-zone",
            name: "Trophy",
            spriteUrl: "/assets/trophy/trophy.png",
            worldPosition: [6.5, -2.4, 13.4],
            canPickup: true,
          },
        ];
      }}
      overlay={<StatusOverlay />}
    />
  );
}

export default MinimalGame;
