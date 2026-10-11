// Helix: NPC de la escena de pruebas `sciFiLab`.
// Arte: "8 Directional 2D Point and Click Male Character", de DeMoNiCaTeD (CC-BY-SA 4.0).
// Frames recortados y escalados x4 desde la hoja original; ver `public/assets/LICENSES-art.md`.
// Demo content: NOT part of the engine packages.
import {
  buildFrameUrls,
  type CharacterDefinition,
} from "@pointclick-engine/engine-renderer-r3f";

const ROOT = "/assets/sprites/helix";

export const HELIX: CharacterDefinition = {
  id: "helix",
  clips: {
    idle: { frames: [`${ROOT}/helix_idle.png`], fps: 1, loop: true },
    north: { frames: buildFrameUrls(ROOT, "helix-walk-north", 8), fps: 10, loop: true },
    south: { frames: buildFrameUrls(ROOT, "helix-walk-south", 8), fps: 10, loop: true },
    west: { frames: buildFrameUrls(ROOT, "helix-walk-east", 8), fps: 10, loop: true, mirror: true },
    east: { frames: buildFrameUrls(ROOT, "helix-walk-east", 8), fps: 10, loop: true },
  },
  // La hoja no trae clip de habla: mientras habla se queda en reposo.
  size: [1.4, 2.94],
};
