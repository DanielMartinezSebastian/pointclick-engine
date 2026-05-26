import { create } from "zustand";
const SHOULD_LOG_STATE_TRANSITIONS = process.env.NODE_ENV !== "production";
function logSceneStore(event, payload) {
    if (!SHOULD_LOG_STATE_TRANSITIONS)
        return;
    if (typeof window !== "undefined") {
        const nextEntry = { scope: "scene-store", event, payload, ts: Date.now() };
        const currentTrace = window.__gameTrace ?? [];
        window.__gameTrace = [
            ...currentTrace,
            nextEntry,
        ].slice(-300);
    }
    console.info(`[scene-store] ${event}`, payload);
}
function cloneWall(wall) {
    return {
        position: [...wall.position],
        rotationY: wall.rotationY,
        halfSize: [...wall.halfSize],
    };
}
function cloneInteraction(interaction) {
    return {
        ...interaction,
        position: [...interaction.position],
        halfSize: [...interaction.halfSize],
        acceptsItemIds: interaction.acceptsItemIds
            ? [...interaction.acceptsItemIds]
            : undefined,
        dialogKeys: { ...interaction.dialogKeys },
    };
}
function cloneScene(scene) {
    return {
        ...scene,
        playerSpawn: [...scene.playerSpawn],
        ground: { ...scene.ground },
        walls: scene.walls.map(cloneWall),
        interactions: scene.interactions.map(cloneInteraction),
    };
}
export const useSceneStore = create((set, get) => ({
    sceneId: "",
    scene: {
        id: "",
        label: "",
        background: "",
        playerSpawn: [0, 0, 0],
        ground: { minX: 0, maxX: 0, minZ: 0, maxZ: 0, y: 0 },
        walls: [],
        interactions: [],
    },
    playerPosition: [0, 0, 0],
    respawnSignal: 0,
    setScene: (id, scene) => {
        const clonedScene = cloneScene(scene);
        logSceneStore("set-scene", {
            fromSceneId: get().sceneId,
            toSceneId: id,
            spawn: clonedScene.playerSpawn,
        });
        set({
            sceneId: id,
            scene: clonedScene,
            playerPosition: [...clonedScene.playerSpawn],
        });
    },
    updateGround: (updater) => set((state) => ({
        scene: {
            ...state.scene,
            ground: updater({ ...state.scene.ground }),
        },
    })),
    appendWall: (wall) => set((state) => ({
        scene: {
            ...state.scene,
            walls: [...state.scene.walls, cloneWall(wall)],
        },
    })),
    removeWall: (index) => set((state) => ({
        scene: {
            ...state.scene,
            walls: state.scene.walls.filter((_, i) => i !== index),
        },
    })),
    updateWall: (index, updater) => set((state) => ({
        scene: {
            ...state.scene,
            walls: state.scene.walls.map((wall, i) => i !== index ? wall : updater(cloneWall(wall))),
        },
    })),
    updateInteraction: (id, updater) => set((state) => ({
        scene: {
            ...state.scene,
            interactions: state.scene.interactions.map((interaction) => {
                if (interaction.id !== id)
                    return interaction;
                return updater(cloneInteraction(interaction));
            }),
        },
    })),
    resetInteractionsFromSceneConfig: () => set((state) => {
        logSceneStore("reset-interactions", {
            sceneId: state.sceneId,
            interactionCount: state.scene.interactions.length,
        });
        return {
            scene: {
                ...state.scene,
                interactions: state.scene.interactions.map(cloneInteraction),
            },
        };
    }),
    setPlayerPosition: (position) => set({ playerPosition: position }),
    requestRespawn: () => set((state) => {
        const nextRespawnSignal = state.respawnSignal + 1;
        logSceneStore("request-respawn", {
            sceneId: state.sceneId,
            previousRespawnSignal: state.respawnSignal,
            nextRespawnSignal,
            currentPlayerPosition: state.playerPosition,
        });
        return { respawnSignal: nextRespawnSignal };
    }),
}));
/** Read state without React (for use from other renderers or tests) */
export function getSceneState() {
    return useSceneStore.getState();
}
/** Subscribe to state changes without React */
export function subscribeSceneState(listener) {
    return useSceneStore.subscribe(listener);
}
//# sourceMappingURL=sceneStore.js.map