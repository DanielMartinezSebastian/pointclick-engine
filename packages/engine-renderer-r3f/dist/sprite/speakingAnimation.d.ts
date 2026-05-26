import { type SpriteAnimation } from "./clips";
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
export declare function buildSpeakingAnimation(seed: number, charsPerSecond: number): SpriteAnimation;
//# sourceMappingURL=speakingAnimation.d.ts.map