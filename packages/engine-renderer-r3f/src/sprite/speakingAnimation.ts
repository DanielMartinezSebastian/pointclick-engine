import { DAVE_IDLE_SPEAKING, type SpriteAnimation } from "./clips";

const BASE_FRAMES = DAVE_IDLE_SPEAKING.frames;
const FRAME_COUNT = BASE_FRAMES.length;

/**
 * Builds a varied speaking animation from the base idle-speaking frames.
 *
 * Strategy: generates chunks of 2–3 consecutive frames with 1–2 repetitions
 * each, then jumps to an overlapping or skipped position. The result is a
 * pre-computed frame sequence (~15–20 frames) that loops, giving natural
 * mouth movement without a mechanical cycle.
 *
 * @param seed      speechTrigger value — stabilises the pattern for one
 *                  speech event; different dialogues get different patterns.
 * @param charsPerSecond  text reveal speed → drives fps so mouth matches pace.
 */
export function buildSpeakingAnimation(
  seed: number,
  charsPerSecond: number,
): SpriteAnimation {
  const result: string[] = [];
  let pos = seed % FRAME_COUNT;

  // 6 chunks → roughly 15–20 frames before the loop point
  for (let chunk = 0; chunk < 6; chunk++) {
    const chunkSize = 2 + ((seed * 7 + chunk * 3) % 2); // 2 or 3
    const repeats = 1 + ((seed * 5 + chunk * 11) % 2);  // 1 or 2

    for (let r = 0; r < repeats; r++) {
      for (let i = 0; i < chunkSize; i++) {
        result.push(BASE_FRAMES[(pos + i) % FRAME_COUNT]);
      }
    }

    // Advance by chunkSize + a small irregular offset (1 or 2)
    const jump = chunkSize + 1 + ((seed * 3 + chunk * 7) % 2);
    pos = (pos + jump) % FRAME_COUNT;
  }

  // Sync fps to text reveal speed: ~1 mouth move per 4 characters,
  // clamped so it always looks natural regardless of text speed.
  const fps = Math.max(4, Math.min(10, Math.round(charsPerSecond * 0.25)));

  return { frames: result, fps, loop: true };
}
