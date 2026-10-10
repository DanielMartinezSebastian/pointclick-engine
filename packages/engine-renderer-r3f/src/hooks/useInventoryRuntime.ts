import { useCallback, useEffect, useRef, useState } from "react";
import {
  createInventoryRuleContext,
  emitRuntimeEvent,
  getGameRuntime,
  getRandomPhrase as engineGetRandomPhrase,
  useDialogStore,
  useInventoryStateStore,
  useInventoryUiStore,
  usePlacedItemsStateStore,
  type GameSceneInteractionFull,
  type InventoryRuleContext,
  type PlacedSceneItem,
  type RuntimeEventHandler,
} from "@pointclick-engine/engine-core";

import {
  applyDropHit,
  applyDropMiss,
  applyDropOnPlayer,
} from "../inventory/dropHandlers";
import { applyPickup, releaseStaleLocks } from "../inventory/pickupHandlers";
import { seedSceneItems, type GetInitialPlacedItems } from "../inventory/seedScene";
import type {
  DraggedInventoryPayload,
  RuntimeDraggedStack,
} from "../inventory/inventoryRuntimeTypes";
import { buildEnv, cancelFrame, requestFrame } from "../inventory/inventoryEnv";
import { useProximityHintController } from "./useProximityHintController";

type SceneInteraction = GameSceneInteractionFull;

export type SceneEnterApi = {
  /** Muestra el dialogo de la clave (texto via `getPhrase`) como bocadillo del jugador. */
  showDialog(key: string): void;
};

export type UseInventoryRuntimeOptions = {
  sceneId: string;
  sceneInteractions: SceneInteraction[];
  playerPosition: [number, number, number];
  onRuntimeEvent?: RuntimeEventHandler;
  /** Texto de una clave de dialogo. Por defecto, el `getRandomPhrase` del core. */
  getPhrase?: (key: string) => string;
  /**
   * Items iniciales de una escena. Se llama una vez por escena no sembrada; si
   * devuelve un array (aunque sea vacio) se anade y la escena se marca sembrada.
   * `null` = esa escena no se siembra (no se marca). Sin callback no se siembra nada.
   */
  getInitialPlacedItems?: GetInitialPlacedItems;
  /**
   * Se llama al entrar en una escena (y cuando cambia `showSpeechBubble`), tras dos
   * `requestAnimationFrame` para que R3F haya corrido al menos un `useFrame`.
   */
  onSceneEnter?: (sceneId: string, api: SceneEnterApi) => void;
  /** Contexto de reglas de items. Por defecto, el registro del runtime activo. */
  itemContext?: InventoryRuleContext;
};

// Origen del registro de items: el runtime activo. Se resuelve en cada uso, no al montar.
// Sin runtime el registro esta vacio (items desconocidos).
const defaultItemContext = createInventoryRuleContext(
  () => getGameRuntime()?.getItems() ?? {},
);

const defaultGetPhrase = (key: string): string => engineGetRandomPhrase(key);

/**
 * Inventario e items colocados del runtime: arrastre, drops, recogida, pistas por
 * proximidad, bocadillo, siembra por escena y edicion de posicion de items.
 * No persiste nada: la persistencia es del consumidor.
 */
export function useInventoryRuntime({
  sceneId,
  sceneInteractions,
  playerPosition,
  onRuntimeEvent,
  getPhrase = defaultGetPhrase,
  getInitialPlacedItems,
  onSceneEnter,
  itemContext = defaultItemContext,
}: UseInventoryRuntimeOptions) {
  // Dialog state lives in the core dialog store (wirable via dialog:trigger / dialog:dismiss)
  const showDialog = useDialogStore((s) => s.show);
  const dismissDialog = useDialogStore((s) => s.dismiss);

  // Inventory visibility lives in the core UI store (wirable via inventory:toggle)
  const isInventoryOpen = useInventoryUiStore((s) => s.isOpen);

  const inventorySlots = useInventoryStateStore((s) => s.slots);
  const placedItems = usePlacedItemsStateStore((s) => s.items);
  const [draggedStack, setDraggedStack] = useState<RuntimeDraggedStack | null>(null);
  const pickupLockRef = useRef<Set<string>>(new Set());

  // Opciones inyectadas: se leen por ref para no alterar las dependencias de callbacks y efectos.
  const injectedRef = useRef({ getPhrase, itemContext, getInitialPlacedItems, onSceneEnter });
  useEffect(() => {
    injectedRef.current = { getPhrase, itemContext, getInitialPlacedItems, onSceneEnter };
  });

  useEffect(() => {
    releaseStaleLocks(pickupLockRef.current, placedItems);
  }, [placedItems]);

  // Siembra por escena: una vez por escena no sembrada. Idempotente (StrictMode).
  useEffect(() => {
    seedSceneItems(sceneId, injectedRef.current.getInitialPlacedItems);
  }, [sceneId]);

  const handleBoundaryHit = useCallback(
    (phrase: string) => {
      showDialog(phrase, "boundaryHit");
      emitRuntimeEvent(onRuntimeEvent, {
        type: "onDialog",
        source: "boundary",
        text: phrase,
        dialogKey: "boundaryHit",
      });
    },
    [onRuntimeEvent, showDialog],
  );

  const showSpeechBubble = useCallback(
    (
      nextText: string,
      meta?: { source?: "inventory" | "debug"; dialogKey?: string },
    ) => {
      showDialog(nextText, meta?.dialogKey);
      emitRuntimeEvent(onRuntimeEvent, {
        type: "onDialog",
        source: meta?.source ?? "inventory",
        text: nextText,
        dialogKey: meta?.dialogKey,
      });
    },
    [onRuntimeEvent, showDialog],
  );

  const hideSpeechBubble = useCallback(() => {
    dismissDialog();
  }, [dismissDialog]);

  const handleInventoryDropHit = useCallback(
    (interaction: SceneInteraction, payload: DraggedInventoryPayload) => {
      applyDropHit(
        buildEnv(injectedRef.current, showSpeechBubble, onRuntimeEvent, setDraggedStack),
        sceneId,
        interaction,
        payload,
      );
    },
    [onRuntimeEvent, showSpeechBubble],
  );

  const handleInventoryDropMiss = useCallback(
    (payload: DraggedInventoryPayload, interaction?: SceneInteraction) => {
      applyDropMiss(
        buildEnv(injectedRef.current, showSpeechBubble, onRuntimeEvent, setDraggedStack),
        sceneInteractions,
        payload,
        interaction,
      );
    },
    [onRuntimeEvent, sceneInteractions, showSpeechBubble],
  );

  const handleInventoryDropOnPlayer = useCallback(
    (payload: DraggedInventoryPayload) => {
      applyDropOnPlayer(
        buildEnv(injectedRef.current, showSpeechBubble, onRuntimeEvent, setDraggedStack),
        payload,
      );
    },
    [onRuntimeEvent, showSpeechBubble],
  );

  const handlePickupPlacedItem = useCallback(
    (placedItem: PlacedSceneItem) => {
      applyPickup(
        buildEnv(injectedRef.current, showSpeechBubble, onRuntimeEvent, setDraggedStack),
        pickupLockRef.current,
        isInventoryOpen,
        placedItem,
      );
    },
    [isInventoryOpen, onRuntimeEvent, showSpeechBubble],
  );

  const updatePlacedItemPosition = useCallback(
    (id: string, axis: 0 | 1 | 2, value: number) => {
      usePlacedItemsStateStore.getState().updateItemPosition(id, axis, value);
    },
    [],
  );

  const movePlacedItemToPlayer = useCallback(
    (id: string) => {
      const state = usePlacedItemsStateStore.getState();
      const item = state.items.find((i) => i.id === id);
      if (!item) return;
      state.setItemPosition(id, [playerPosition[0], item.worldPosition[1], playerPosition[2]]);
    },
    [playerPosition],
  );

  const removePlacedItemById = useCallback((id: string) => {
    usePlacedItemsStateStore.getState().removeItem(id);
  }, []);

  const handleStartInventoryDrag = useCallback(
    (slotIndex: number, clientX: number, clientY: number) => {
      const stack = inventorySlots[slotIndex];
      if (!stack) return;

      useInventoryUiStore.getState().close();
      setDraggedStack({
        stack,
        fromSlotIndex: slotIndex,
        pointerX: clientX,
        pointerY: clientY,
      });
    },
    [inventorySlots],
  );

  const handleInteractionInspect = useCallback(
    (interaction: SceneInteraction) => {
      if (!interaction.hintDialogKeys) return;

      // Si hay un ítem colocado que puede recogerse, no disparamos el hint:
      // el click será gestionado por el sistema de pickup, no por el de pistas.
      const hasPickableItem = placedItems.some(
        (item) => item.interactionId === interaction.id && item.canPickup,
      );
      if (hasPickableItem) return;

      const isOccupied = placedItems.some((item) => item.interactionId === interaction.id);
      const dialogKey = isOccupied
        ? interaction.hintDialogKeys.occupied
        : interaction.hintDialogKeys.empty;

      showSpeechBubble(injectedRef.current.getPhrase(dialogKey), { dialogKey });
    },
    [placedItems, showSpeechBubble],
  );

  useProximityHintController({
    playerPosition,
    interactions: sceneInteractions,
    placedItems,
    showSpeechBubble,
    getPhrase,
  });

  useEffect(() => {
    if (!injectedRef.current.onSceneEnter) return;

    // Double-rAF: el dialogo de entrada dispara DESPUÉS de que R3F haya corrido
    // al menos un useFrame. setTimeout(0) se ejecutaba antes del primer
    // requestAnimationFrame, dejando el sprite en SPRITE_MIN_SCALE sin que
    // useFrame hubiera corregido aún la escala por profundidad.
    let outerHandle: number | null = null;
    let innerHandle: number | null = null;

    outerHandle = requestFrame(() => {
      outerHandle = null;
      innerHandle = requestFrame(() => {
        innerHandle = null;
        injectedRef.current.onSceneEnter?.(sceneId, {
          showDialog: (key) =>
            showSpeechBubble(injectedRef.current.getPhrase(key), { dialogKey: key }),
        });
      });
    });

    return () => {
      if (outerHandle !== null) cancelFrame(outerHandle);
      if (innerHandle !== null) cancelFrame(innerHandle);
    };
  }, [sceneId, showSpeechBubble]);

  const handleItemInteract = useCallback(
    (item: PlacedSceneItem) => {
      // Emit item interaction event — useTransitionSystem listens for this
      // to check if there's a matching transition
      emitRuntimeEvent(onRuntimeEvent, {
        type: "onDrop",
        outcome: "item-interact",
        itemId: item.itemId,
        interactionId: item.interactionId,
      });
    },
    [onRuntimeEvent],
  );

  return {
    isInventoryOpen,
    inventorySlots,
    draggedStack,
    placedItems,
    handleBoundaryHit,
    showSpeechBubble,
    hideSpeechBubble,
    handleInteractionInspect,
    handleInventoryDropHit,
    handleInventoryDropMiss,
    handleInventoryDropOnPlayer,
    handlePickupPlacedItem,
    updatePlacedItemPosition,
    movePlacedItemToPlayer,
    removePlacedItemById,
    handleStartInventoryDrag,
    handleItemInteract,
  };
}
