// Demo content barrel — re-exports all game-specific data for web-demo.
// This folder is NOT part of the engine; it belongs to the demo application.

export * from "./dialogs/types";
export * from "./dialogs/index";
export { getRandomPhrase } from "./dialogs/getRandomPhrase";
export * from "./items/types";
export * from "./items/index";
export * from "./scenes/scenes";
