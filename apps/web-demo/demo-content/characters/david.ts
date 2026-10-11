// David, the demo's playable character. Pass it to the runtime:
//   <GameTouchSpriteRuntime character={DAVID} ... />
// Demo content: NOT part of the engine packages.
import {
  buildFrameUrls,
  type CharacterDefinition,
} from "@pointclick-engine/engine-renderer-r3f";

const ROOT = "/assets/sprites/david";

export const DAVID: CharacterDefinition = {
  id: "david",
  clips: {
    idle: { frames: [`${ROOT}/david_idle.png`], fps: 1, loop: true },
    north: {
      frames: buildFrameUrls(ROOT, "david-walk-north", 9).reverse(),
      fps: 16,
      loop: true,
    },
    south: {
      frames: buildFrameUrls(ROOT, "david-walk-south", 8, 3),
      fps: 16,
      loop: true,
    },
    west: {
      frames: buildFrameUrls(ROOT, "david-walk-west", 9).reverse(),
      fps: 16,
      loop: true,
      mirror: true,
    },
    east: {
      frames: buildFrameUrls(ROOT, "david-walk-west", 9).reverse(),
      fps: 16,
      loop: true,
    },
  },
  speaking: {
    frames: buildFrameUrls(ROOT, "david_speaking", 8),
    fps: 8,
    loop: true,
  },
  size: [1.4, 2.94],
};
