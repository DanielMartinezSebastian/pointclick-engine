import { create } from "zustand";

/**
 * worldStateStore — memoria del motor: flags con nombre y escenas visitadas.
 *
 * Mismo estilo que dialogStore. El store NO conoce el bus: `createGameRuntime`
 * se suscribe a él y emite `state:flagChanged` (ver runtime/worldStateWiring.ts).
 */
export type FlagValue = boolean | number | string;

export type WorldSnapshot = {
  flags: Record<string, FlagValue>;
  visitedSceneIds: string[];
};

export type WorldStateStoreState = {
  flags: Record<string, FlagValue>;
  visitedSceneIds: string[];
  setFlag: (name: string, value: FlagValue) => void;
  clearFlag: (name: string) => void;
  markSceneVisited: (sceneId: string) => void;
  setAll: (snapshot: WorldSnapshot) => void;
  reset: () => void;
};

export const useWorldStateStore = create<WorldStateStoreState>((set, get) => ({
  flags: {},
  visitedSceneIds: [],
  setFlag: (name, value) => {
    const flags = get().flags;
    if (Object.prototype.hasOwnProperty.call(flags, name) && flags[name] === value) return;
    set({ flags: { ...flags, [name]: value } });
  },
  clearFlag: (name) => {
    const flags = get().flags;
    if (!Object.prototype.hasOwnProperty.call(flags, name)) return;
    const next = { ...flags };
    delete next[name];
    set({ flags: next });
  },
  markSceneVisited: (sceneId) => {
    const visited = get().visitedSceneIds;
    if (visited.includes(sceneId)) return;
    set({ visitedSceneIds: [...visited, sceneId] });
  },
  setAll: (snapshot) =>
    set({
      flags: { ...snapshot.flags },
      visitedSceneIds: Array.from(new Set(snapshot.visitedSceneIds)),
    }),
  reset: () => set({ flags: {}, visitedSceneIds: [] }),
}));

/** Lee el estado de mundo sin React. */
export function getWorldState(): WorldStateStoreState {
  return useWorldStateStore.getState();
}
