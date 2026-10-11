import type { GameSceneNpc } from "@pointclick-engine/engine-core";

import {
  speakingBaseFrames,
  toSpriteAnimation,
  type CharacterDefinition,
  type ResolvedSpriteAnimation,
} from "./character";
import { buildSpeakingAnimation } from "./speakingAnimation";

/**
 * Animacion de un NPC (puro):
 *  - hablando: el clip `speaking` variado (como el jugador); sin `speaking` usa los frames de `idle`.
 *  - en reposo: el primer frame del clip de `facing` (sin `facing`, el clip `idle`), en bucle.
 */
export function selectNpcAnimation(
  character: CharacterDefinition,
  facing: GameSceneNpc["facing"],
  speaking: boolean,
  speechTrigger: number,
  charsPerSecond: number,
): ResolvedSpriteAnimation {
  if (speaking) {
    return buildSpeakingAnimation(speechTrigger, charsPerSecond, speakingBaseFrames(character));
  }
  const clip = character.clips[facing ?? "idle"] ?? character.clips.idle;
  const still = toSpriteAnimation({ ...clip, frames: clip.frames.slice(0, 1), fps: 1, loop: true });
  return still;
}
