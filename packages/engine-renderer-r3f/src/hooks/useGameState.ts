import { useSceneStore, toGameState, type GameState } from "@pointclick-engine/engine-core";

/** Hook para seleccionar estado de juego desde la API pública. */
export function useGameState<T>(selector: (state: GameState) => T): T {
  return useSceneStore((state) => selector(toGameState(state)));
}
