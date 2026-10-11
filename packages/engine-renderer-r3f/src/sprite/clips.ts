import {
  DAVE_CHARACTER_DEFINITION,
  resolveCharacterSprites,
  toSpriteAnimation,
  type ResolvedSpriteAnimation,
} from "./character";

export type SpriteAnimation = ResolvedSpriteAnimation;

export type GameCharacterName = "Dave";

export type GameDirection = "idle" | "north" | "south" | "west" | "east";

type CharacterSprites = Record<GameDirection, SpriteAnimation>;

type CharacterGridPosition = {
  name: GameCharacterName;
  column: 0 | 1 | 2;
  row: 0 | 1 | 2;
};

const DAVE_CHARACTER_SPRITES: CharacterSprites = resolveCharacterSprites(
  DAVE_CHARACTER_DEFINITION,
);

/** @deprecated Use `CharacterDefinition.speaking`. */
export const DAVE_IDLE_SPEAKING: SpriteAnimation = toSpriteAnimation(
  DAVE_CHARACTER_DEFINITION.speaking!,
);

/** @deprecated Pass a `CharacterDefinition` via the `character` prop. */
export const GAME_CHARACTERS = [
  { name: "Dave", column: 0, row: 0 },
] as const satisfies ReadonlyArray<CharacterGridPosition>;

/** @deprecated Pass a `CharacterDefinition` via the `character` prop. */
export const GAME_CHARACTER_SPRITES = Object.fromEntries(
  GAME_CHARACTERS.map((character) => [character.name, DAVE_CHARACTER_SPRITES]),
) as Record<GameCharacterName, CharacterSprites>;

/** @deprecated Pass a `CharacterDefinition` via the `character` prop. */
export const DAVE_SPRITES = DAVE_CHARACTER_SPRITES;
