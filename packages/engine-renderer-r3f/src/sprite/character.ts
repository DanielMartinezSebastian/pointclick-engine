/**
 * Agnostic character definition: pure data + pure helpers (no React/Three).
 * A consumer describes its own character with `CharacterDefinition` and passes
 * it to the runtime. David's definition below is the embedded default kept for
 * backwards compatibility.
 */

export type CharacterDirection = "idle" | "north" | "south" | "west" | "east";

export interface CharacterClip {
  /** Frame image URLs, in playback order. */
  frames: string[];
  fps: number;
  /** Defaults to true. */
  loop?: boolean;
  /** Mirror the sprite horizontally while this clip plays. */
  mirror?: boolean;
}

export interface CharacterDefinition {
  id: string;
  clips: Record<CharacterDirection, CharacterClip>;
  /** Clip played while the character speaks and stands idle. */
  speaking?: CharacterClip;
  /**
   * `[minScale, maxScale]`: sprite scale at the nearest/farthest depth
   * (the plane is 2 world units tall before scaling). Default `[1.4, 2.94]`.
   */
  size?: [number, number];
}

/** Shape consumed by the sprite component (kept for the legacy exports). */
export interface ResolvedSpriteAnimation {
  frames: readonly string[];
  fps: number;
  loop?: boolean;
  flipX?: boolean;
}

export const DEFAULT_CHARACTER_SIZE: [number, number] = [1.4, 2.94];

/** `<root>/<prefix>_0001.png`, `_0002.png`, ... (4-digit zero padded). */
export function buildFrameUrls(
  root: string,
  prefix: string,
  count: number,
  startIndex = 1,
): string[] {
  return Array.from(
    { length: count },
    (_, index) => `${root}/${prefix}_${String(startIndex + index).padStart(4, "0")}.png`,
  );
}

export function toSpriteAnimation(clip: CharacterClip): ResolvedSpriteAnimation {
  const animation: ResolvedSpriteAnimation = { frames: clip.frames, fps: clip.fps };
  if (clip.loop !== undefined) animation.loop = clip.loop;
  if (clip.mirror) animation.flipX = true;
  return animation;
}

/** Clip for a direction/action. */
export function selectClip(
  character: CharacterDefinition,
  direction: CharacterDirection,
): CharacterClip {
  return character.clips[direction];
}

/** Resolved animations per direction. */
export function resolveCharacterSprites(
  character: CharacterDefinition,
): Record<CharacterDirection, ResolvedSpriteAnimation> {
  return {
    idle: toSpriteAnimation(character.clips.idle),
    north: toSpriteAnimation(character.clips.north),
    south: toSpriteAnimation(character.clips.south),
    west: toSpriteAnimation(character.clips.west),
    east: toSpriteAnimation(character.clips.east),
  };
}

/** Every animation to preload: the 5 direction clips, then speaking (if any). */
export function listCharacterAnimations(
  character: CharacterDefinition,
): ResolvedSpriteAnimation[] {
  const sprites = resolveCharacterSprites(character);
  const all: ResolvedSpriteAnimation[] = [...Object.values(sprites)];
  if (character.speaking) all.push(toSpriteAnimation(character.speaking));
  return all;
}

/** Base frames for the varied speaking animation. Falls back to idle frames. */
export function speakingBaseFrames(character: CharacterDefinition): readonly string[] {
  return character.speaking?.frames ?? character.clips.idle.frames;
}

const DAVE_SPRITE_ROOT = "/assets/sprites/david";

/** @deprecated Embedded default. Define your own `CharacterDefinition`. */
export const DAVE_CHARACTER_DEFINITION: CharacterDefinition = {
  id: "david",
  clips: {
    idle: { frames: [`${DAVE_SPRITE_ROOT}/david_idle.png`], fps: 1, loop: true },
    north: {
      frames: buildFrameUrls(DAVE_SPRITE_ROOT, "david-walk-north", 9).reverse(),
      fps: 16,
      loop: true,
    },
    south: {
      frames: buildFrameUrls(DAVE_SPRITE_ROOT, "david-walk-south", 8, 3),
      fps: 16,
      loop: true,
    },
    west: {
      frames: buildFrameUrls(DAVE_SPRITE_ROOT, "david-walk-west", 9).reverse(),
      fps: 16,
      loop: true,
      mirror: true,
    },
    east: {
      frames: buildFrameUrls(DAVE_SPRITE_ROOT, "david-walk-west", 9).reverse(),
      fps: 16,
      loop: true,
    },
  },
  speaking: {
    frames: buildFrameUrls(DAVE_SPRITE_ROOT, "david_speaking", 8),
    fps: 8,
    loop: true,
  },
  size: [1.4, 2.94],
};
