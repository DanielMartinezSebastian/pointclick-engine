export type SpriteAnimation = {
    frames: readonly string[];
    fps: number;
    loop?: boolean;
    flipX?: boolean;
};
export type GameCharacterName = "Dave";
export type GameDirection = "idle" | "north" | "south" | "west" | "east";
type CharacterSprites = Record<GameDirection, SpriteAnimation>;
export declare const DAVE_IDLE_SPEAKING: SpriteAnimation;
export declare const GAME_CHARACTERS: readonly [{
    readonly name: "Dave";
    readonly column: 0;
    readonly row: 0;
}];
export declare const GAME_CHARACTER_SPRITES: Record<GameCharacterName, CharacterSprites>;
export declare const DAVE_SPRITES: CharacterSprites;
export {};
//# sourceMappingURL=clips.d.ts.map