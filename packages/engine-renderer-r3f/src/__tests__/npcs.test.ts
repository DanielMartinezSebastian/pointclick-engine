import { describe, expect, test } from "vitest";
import type { ConditionContext, GameSceneNpc } from "@pointclick-engine/engine-core";
import { DAVE_CHARACTER_DEFINITION, DEFAULT_CHARACTER_SIZE, type CharacterDefinition } from "../sprite/character";
import { selectNpcAnimation } from "../sprite/npcAnimation";
import { DEPTH_FAR_Z, DEPTH_NEAR_Z, spriteScaleAtDepth } from "../sprite/depthScale";
import { filterVisibleNpcs, resolveSpeakingNpcId } from "../scene/visibleNpcs";

const npc = (id: string, extra: Partial<GameSceneNpc> = {}): GameSceneNpc => ({
  id,
  name: `npc.${id}`,
  characterId: "c",
  position: [0, 0, 0],
  ...extra,
});
const ctx = (flags: ConditionContext["flags"] = {}): ConditionContext => ({
  flags,
  inventory: [],
  placedItems: [],
  sceneId: "s",
  visitedSceneIds: [],
});

describe("selectNpcAnimation", () => {
  const c = DAVE_CHARACTER_DEFINITION;
  test("sin facing: un solo frame del clip idle", () => {
    const a = selectNpcAnimation(c, undefined, false, 1, 28);
    expect(a.frames).toEqual(c.clips.idle.frames.slice(0, 1));
  });
  test("facing elige el primer frame del clip de esa direccion", () => {
    expect(selectNpcAnimation(c, "south", false, 1, 28).frames).toEqual(c.clips.south.frames.slice(0, 1));
  });
  test("facing west conserva el espejo del clip", () => {
    expect(selectNpcAnimation(c, "west", false, 1, 28).flipX).toBe(true);
    expect(selectNpcAnimation(c, "east", false, 1, 28).flipX).toBeUndefined();
  });
  test("hablando usa solo frames del clip speaking", () => {
    const a = selectNpcAnimation(c, "south", true, 3, 28);
    expect(a.frames.length).toBeGreaterThan(1);
    expect(a.frames.every((f) => c.speaking!.frames.includes(f))).toBe(true);
  });
  test("hablando sin clip speaking usa frames de idle", () => {
    const noSpeak: CharacterDefinition = { ...c, speaking: undefined };
    const a = selectNpcAnimation(noSpeak, undefined, true, 0, 28);
    expect(a.frames.every((f) => c.clips.idle.frames.includes(f))).toBe(true);
  });
});

describe("visibilidad", () => {
  test("filterVisibleNpcs aplica visibleWhen", () => {
    const list = [npc("a"), npc("b", { visibleWhen: { flag: "on" } })];
    expect(filterVisibleNpcs(list, ctx()).map((n) => n.id)).toEqual(["a"]);
    expect(filterVisibleNpcs(list, ctx({ on: true })).map((n) => n.id)).toEqual(["a", "b"]);
    expect(filterVisibleNpcs(undefined, ctx())).toEqual([]);
  });
  test("resolveSpeakingNpcId", () => {
    const list = [npc("a")];
    expect(resolveSpeakingNpcId(list, "a", true)).toBe("a");
    expect(resolveSpeakingNpcId(list, "a", false)).toBeNull();
    expect(resolveSpeakingNpcId(list, undefined, true)).toBeNull();
    expect(resolveSpeakingNpcId(list, "player", true)).toBeNull();
    expect(resolveSpeakingNpcId(list, "ghost", true)).toBeNull();
    expect(resolveSpeakingNpcId([], "a", true)).toBeNull();
  });
});

describe("spriteScaleAtDepth", () => {
  test("extremos y clamp", () => {
    expect(spriteScaleAtDepth(DEPTH_FAR_Z)).toBeCloseTo(DEFAULT_CHARACTER_SIZE[0]);
    expect(spriteScaleAtDepth(DEPTH_NEAR_Z)).toBeCloseTo(DEFAULT_CHARACTER_SIZE[1]);
    expect(spriteScaleAtDepth(100)).toBeCloseTo(DEFAULT_CHARACTER_SIZE[1]);
    expect(spriteScaleAtDepth(-100, [1, 2])).toBeCloseTo(1);
  });
});
