import { describe, expect, test } from "vitest";
import {
  buildFrameUrls,
  DAVE_CHARACTER_DEFINITION,
  listCharacterAnimations,
  resolveCharacterSprites,
  selectClip,
  speakingBaseFrames,
  toSpriteAnimation,
  type CharacterDefinition,
} from "../sprite/character";
import {
  DAVE_IDLE_SPEAKING,
  DAVE_SPRITES,
  GAME_CHARACTER_SPRITES,
} from "../sprite/clips";
import { buildSpeakingAnimation } from "../sprite/speakingAnimation";

const R = "/assets/sprites/david";
const seq = (prefix: string, n: number, start = 1) =>
  Array.from({ length: n }, (_, i) => `${R}/${prefix}_${String(start + i).padStart(4, "0")}.png`);

describe("default David character (regression: identical to legacy values)", () => {
  test("legacy clips: exact frames, fps, loop, flip", () => {
    expect(DAVE_SPRITES).toEqual({
      idle: { frames: [`${R}/david_idle.png`], fps: 1, loop: true },
      north: { frames: seq("david-walk-north", 9).reverse(), fps: 16, loop: true },
      south: { frames: seq("david-walk-south", 8, 3), fps: 16, loop: true },
      west: { frames: seq("david-walk-west", 9).reverse(), fps: 16, loop: true, flipX: true },
      east: { frames: seq("david-walk-west", 9).reverse(), fps: 16, loop: true },
    });
    expect(GAME_CHARACTER_SPRITES.Dave).toBe(DAVE_SPRITES);
    expect(DAVE_IDLE_SPEAKING).toEqual({ frames: seq("david_speaking", 8), fps: 8, loop: true });
  });

  test("concrete first/last URLs", () => {
    expect(DAVE_SPRITES.north.frames[0]).toBe(`${R}/david-walk-north_0009.png`);
    expect(DAVE_SPRITES.south.frames[0]).toBe(`${R}/david-walk-south_0003.png`);
    expect(DAVE_SPRITES.south.frames.at(-1)).toBe(`${R}/david-walk-south_0010.png`);
    expect(DAVE_SPRITES.west.frames[8]).toBe(`${R}/david-walk-west_0001.png`);
  });

  test("preload list order: 5 direction clips then speaking", () => {
    const list = listCharacterAnimations(DAVE_CHARACTER_DEFINITION);
    expect(list).toEqual([...Object.values(DAVE_SPRITES), DAVE_IDLE_SPEAKING]);
  });

  test("size default is [1.4, 2.94]", () => {
    expect(DAVE_CHARACTER_DEFINITION.size).toEqual([1.4, 2.94]);
  });

  test("speaking animation with explicit David frames equals default call", () => {
    for (const seed of [0, 1, 7, 42]) {
      for (const cps of [10, 30, 60]) {
        expect(buildSpeakingAnimation(seed, cps, speakingBaseFrames(DAVE_CHARACTER_DEFINITION))).toEqual(
          buildSpeakingAnimation(seed, cps),
        );
      }
    }
  });
});

describe("custom character (not David)", () => {
  const clip = (name: string, n: number, fps: number, mirror?: boolean) => ({
    frames: buildFrameUrls("/npc/guard", name, n),
    fps,
    mirror,
  });
  const guard: CharacterDefinition = {
    id: "guard",
    clips: {
      idle: clip("idle", 1, 2),
      north: clip("n", 3, 10),
      south: clip("s", 4, 12),
      west: clip("w", 2, 6, true),
      east: clip("w", 2, 6),
    },
    speaking: { frames: buildFrameUrls("/npc/guard", "talk", 3), fps: 5 },
    size: [1, 2],
  };

  test("buildFrameUrls pads and honours start index", () => {
    expect(buildFrameUrls("/x", "a", 2, 9)).toEqual(["/x/a_0009.png", "/x/a_0010.png"]);
  });

  test("selectClip picks by direction", () => {
    expect(selectClip(guard, "north").frames).toEqual([
      "/npc/guard/n_0001.png",
      "/npc/guard/n_0002.png",
      "/npc/guard/n_0003.png",
    ]);
    expect(selectClip(guard, "south").fps).toBe(12);
    expect(selectClip(guard, "idle").fps).toBe(2);
  });

  test("mirror maps to flipX only when set; loop untouched when unset", () => {
    const sprites = resolveCharacterSprites(guard);
    expect(sprites.west.flipX).toBe(true);
    expect(sprites.east.flipX).toBeUndefined();
    expect("loop" in sprites.east).toBe(false);
    expect(toSpriteAnimation({ frames: ["a"], fps: 1, loop: false }).loop).toBe(false);
  });

  test("preload list and speaking frames", () => {
    expect(listCharacterAnimations(guard)).toHaveLength(6);
    expect(speakingBaseFrames(guard)).toEqual(buildFrameUrls("/npc/guard", "talk", 3));
    const noSpeak = { ...guard, speaking: undefined };
    expect(listCharacterAnimations(noSpeak)).toHaveLength(5);
    expect(speakingBaseFrames(noSpeak)).toEqual(guard.clips.idle.frames);
  });

  test("speaking animation only uses the character's frames", () => {
    const anim = buildSpeakingAnimation(3, 20, speakingBaseFrames(guard));
    const allowed = new Set(guard.speaking!.frames);
    expect(anim.frames.length).toBeGreaterThan(0);
    expect(anim.frames.every((f) => allowed.has(f))).toBe(true);
  });
});
