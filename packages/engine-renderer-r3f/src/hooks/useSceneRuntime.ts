import { useEffect } from "react";
import {
  getGameRuntime,
  toRuntimeScene,
  useSceneStore,
  type GameScene,
} from "@pointclick-engine/engine-core";

/**
 * Puerto de persistencia del progreso. Hoy solo la escena; un paso posterior
 * añadirá el inventario al mismo puerto.
 */
export type SceneProgressStorage = {
  loadSceneId(): string | null;
  saveSceneId(id: string): void;
};

export type UseSceneRuntimeOptions = {
  /** Escena a sembrar si no hay una guardada (o la guardada no existe). */
  initialSceneId?: string;
  /** Sin él no se persiste nada. */
  storage?: SceneProgressStorage;
  /**
   * Resuelve la escena completa por id. Por defecto, el registro del runtime
   * pasado por `toRuntimeScene`.
   */
  resolveScene?: (id: string) => GameScene | null;
};

/**
 * Decide que escena sembrar: la guardada si existe; si no, la inicial si
 * existe; si no, `null` (no se siembra nada). Pura, sin React.
 */
export function resolveInitialSceneId(args: {
  savedId: string | null | undefined;
  initialSceneId: string | undefined;
  hasScene: (id: string) => boolean;
}): string | null {
  const { savedId, initialSceneId, hasScene } = args;
  const wanted = savedId || initialSceneId;
  if (wanted && hasScene(wanted)) return wanted;
  if (initialSceneId && hasScene(initialSceneId)) return initialSceneId;
  return null;
}

/** Resolutor por defecto: registro del runtime; `null` si no hay runtime. */
export function resolveSceneFromRuntime(id: string): GameScene | null {
  const config = getGameRuntime()?.getScenes()[id];
  return config ? toRuntimeScene(config) : null;
}

/**
 * Estado de escena del `useSceneStore`, siembra de la escena inicial al montar
 * (si el store esta vacio) y persistencia del id de escena.
 */
export function useSceneRuntime(options: UseSceneRuntimeOptions = {}) {
  const { initialSceneId, storage, resolveScene = resolveSceneFromRuntime } = options;

  const sceneId = useSceneStore((s) => s.sceneId);
  const sceneBackground = useSceneStore((s) => s.scene.background);
  const storeSetScene = useSceneStore((s) => s.setScene);
  const sceneInteractions = useSceneStore((s) => s.scene.interactions);
  const requestRespawn = useSceneStore((s) => s.requestRespawn);
  const playerPosition = useSceneStore((s) => s.playerPosition);
  const scenePlayerSpawn = useSceneStore((s) => s.scene.playerSpawn);
  const updateInteraction = useSceneStore((s) => s.updateInteraction);
  const resetInteractionsFromSceneConfig = useSceneStore(
    (s) => s.resetInteractionsFromSceneConfig,
  );

  // El store del core arranca vacio: se siembra una sola vez al montar.
  useEffect(() => {
    if (useSceneStore.getState().sceneId) return;
    const id = resolveInitialSceneId({
      savedId: storage?.loadSceneId() ?? null,
      initialSceneId,
      hasScene: (candidate) => resolveScene(candidate) !== null,
    });
    if (!id) return;
    const scene = resolveScene(id);
    if (scene) storeSetScene(id, scene);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persistir la escena actual cada vez que cambia.
  useEffect(() => {
    if (sceneId) storage?.saveSceneId(sceneId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneId]);

  return {
    sceneId,
    sceneBackground,
    storeSetScene,
    sceneInteractions,
    requestRespawn,
    playerPosition,
    scenePlayerSpawn,
    updateInteraction,
    resetInteractionsFromSceneConfig,
  };
}
