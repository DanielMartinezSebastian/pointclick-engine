export type SpriteAnimation = {
  frames: readonly string[];
  fps: number;
  loop?: boolean;
  flipX?: boolean;
};

export type GameCharacterName =
  | "Dave"
  | "Razor"
  | "Bernard"
  | "Syd"
  | "Wendy"
  | "Jeff"
  | "Michael"
  | "Sandy"
  | "Radiation Suit";

export type GameDirection = "idle" | "north" | "south" | "west" | "east";

type CharacterSprites = Record<GameDirection, SpriteAnimation>;

type CharacterGridPosition = {
  name: GameCharacterName;
  column: 0 | 1 | 2;
  row: 0 | 1 | 2;
};

const DAVE_SPRITE_ROOT = "/assets/sprites/david";

const createFrameUrls = (prefix: string, count: number, startIndex = 1) =>
  Array.from(
    { length: count },
    (_, index) =>
      `${DAVE_SPRITE_ROOT}/${prefix}_${String(startIndex + index).padStart(4, "0")}.png`,
  );

const DAVE_CHARACTER_SPRITES: CharacterSprites = {
  idle: {
    frames: [`${DAVE_SPRITE_ROOT}/david_idle.png`],
    fps: 1,
    loop: true,
  },
  north: {
    frames: createFrameUrls("david-walk-north", 9).slice().reverse(),
    fps: 16,
    loop: true,
  },
  south: {
    frames: createFrameUrls("david-walk-south", 8, 3),
    fps: 16,
    loop: true,
  },
  west: {
    frames: createFrameUrls("david-walk-west", 9).slice().reverse(),
    fps: 16,
    loop: true,
    flipX: true,
  },
  east: {
    frames: createFrameUrls("david-walk-west", 9).slice().reverse(),
    fps: 16,
    loop: true,
  },
};

export const GAME_CHARACTERS = [
  { name: "Dave", column: 0, row: 0 },
  { name: "Razor", column: 1, row: 0 },
  { name: "Bernard", column: 2, row: 0 },
  { name: "Syd", column: 0, row: 1 },
  { name: "Wendy", column: 1, row: 1 },
  { name: "Jeff", column: 2, row: 1 },
  { name: "Michael", column: 0, row: 2 },
  { name: "Sandy", column: 1, row: 2 },
  { name: "Radiation Suit", column: 2, row: 2 },
] as const satisfies ReadonlyArray<CharacterGridPosition>;

export const GAME_CHARACTER_SPRITES = Object.fromEntries(
  GAME_CHARACTERS.map((character) => [character.name, DAVE_CHARACTER_SPRITES]),
) as Record<GameCharacterName, CharacterSprites>;

export const DAVE_SPRITES = DAVE_CHARACTER_SPRITES;
