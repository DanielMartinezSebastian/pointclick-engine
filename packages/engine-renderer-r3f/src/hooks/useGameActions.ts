import { useShallow } from "zustand/react/shallow";
import { useSceneStore, toGameActions, type GameActions } from "@pointclick-engine/engine-core";

/** Hook para obtener acciones públicas con referencia estable. */
export function useGameActions(): GameActions {
  return useSceneStore(useShallow((state) => toGameActions(state)));
}
