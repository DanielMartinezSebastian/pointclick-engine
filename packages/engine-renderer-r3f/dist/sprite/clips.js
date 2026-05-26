const DAVE_SPRITE_ROOT = "/assets/sprites/david";
const createFrameUrls = (prefix, count, startIndex = 1) => Array.from({ length: count }, (_, index) => `${DAVE_SPRITE_ROOT}/${prefix}_${String(startIndex + index).padStart(4, "0")}.png`);
const DAVE_CHARACTER_SPRITES = {
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
export const DAVE_IDLE_SPEAKING = {
    frames: createFrameUrls("david_speaking", 8),
    fps: 8,
    loop: true,
};
export const GAME_CHARACTERS = [
    { name: "Dave", column: 0, row: 0 },
];
export const GAME_CHARACTER_SPRITES = Object.fromEntries(GAME_CHARACTERS.map((character) => [character.name, DAVE_CHARACTER_SPRITES]));
export const DAVE_SPRITES = DAVE_CHARACTER_SPRITES;
//# sourceMappingURL=clips.js.map