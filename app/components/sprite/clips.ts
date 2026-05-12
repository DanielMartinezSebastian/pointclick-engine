export type AnimationClip = {
  startFrame: number;
  endFrame: number;
  fps: number;
  loop?: boolean;
  x: number;
  y: number;
  frameWidth: number;
  frameHeight: number;
  strideX: number;
  offsetX?: number;
  offsetY?: number;
};

export const ATLAS_SIZE = {
  width: 712,
  height: 628,
};

export type ManiacMansionCharacterName =
  | "Dave"
  | "Razor"
  | "Bernard"
  | "Syd"
  | "Wendy"
  | "Jeff"
  | "Michael"
  | "Sandy"
  | "Radiation Suit";

export type ManiacMansionDirection = "idle" | "left" | "right" | "up" | "down";

type CharacterClips = Record<ManiacMansionDirection, AnimationClip>;

type CharacterGridPosition = {
  name: ManiacMansionCharacterName;
  column: 0 | 1 | 2;
  row: 0 | 1 | 2;
};

const FRAME_WIDTH = 26;
const FRAME_HEIGHT = 56;
const FRAME_STRIDE_X = 28;
const FRAMES_PER_ROW = 8;
const CHARACTER_COLUMN_ORIGINS = [0, 240, 480] as const;
const CHARACTER_ROW_ORIGINS = [0, 216, 428] as const;
const CHARACTER_ROW_Y_ADJUSTMENTS = [0, -4, -4] as const;
const ROW_FRAME_X = 2;
const ROW_FRAME_Y = 27;
const ROW_VERTICAL_OFFSET = 60;
const HALF_ROW_FRAME_COUNT = 4;

const createClip = (
  x: number,
  y: number,
  fps: number,
  loop: boolean,
  frameCount = FRAMES_PER_ROW,
): AnimationClip => ({
  x,
  y,
  frameWidth: FRAME_WIDTH,
  frameHeight: FRAME_HEIGHT,
  strideX: FRAME_STRIDE_X,
  startFrame: 0,
  endFrame: frameCount - 1,
  fps,
  loop,
});

const createCharacterClips = ({
  column,
  row,
}: CharacterGridPosition): CharacterClips => {
  const originX = CHARACTER_COLUMN_ORIGINS[column] + ROW_FRAME_X;
  const originY =
    CHARACTER_ROW_ORIGINS[row] + ROW_FRAME_Y + CHARACTER_ROW_Y_ADJUSTMENTS[row];

  return {
    idle: {
      ...createClip(originX, originY, 1, true),
      startFrame: 0,
      endFrame: 0,
    },
    down: createClip(
      originX,
      originY + ROW_VERTICAL_OFFSET,
      8,
      true,
      HALF_ROW_FRAME_COUNT,
    ),
    up: createClip(
      originX + HALF_ROW_FRAME_COUNT * FRAME_STRIDE_X,
      originY + ROW_VERTICAL_OFFSET,
      8,
      true,
      HALF_ROW_FRAME_COUNT,
    ),
    left: createClip(
      originX,
      originY + ROW_VERTICAL_OFFSET * 2,
      8,
      true,
      HALF_ROW_FRAME_COUNT,
    ),
    right: createClip(
      originX + HALF_ROW_FRAME_COUNT * FRAME_STRIDE_X,
      originY + ROW_VERTICAL_OFFSET * 2,
      8,
      true,
      HALF_ROW_FRAME_COUNT,
    ),
  };
};

export const MANIAC_MANSION_CHARACTERS = [
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

export const MANIAC_MANSION_CHARACTER_CLIPS = Object.fromEntries(
  MANIAC_MANSION_CHARACTERS.map((character) => [
    character.name,
    createCharacterClips(character),
  ]),
) as Record<ManiacMansionCharacterName, CharacterClips>;

export const DAVE_CLIPS = MANIAC_MANSION_CHARACTER_CLIPS.Dave;
