"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getGameRuntime,
  getInputLockState,
  useInputLockStore,
  useInventoryStateStore,
  usePlacedItemsStateStore,
  useSceneStore,
  useWorldStateStore,
  type ConditionContext,
  type GameSceneHotspot,
  type Verb,
} from "@pointclick-engine/engine-core";

import { ENGINE_NO_ACTION_KEY, ensureEngineTexts } from "../i18n/engineTexts";
import { buildVerbLabels, filterVisibleHotspots, planHotspotClick } from "../scene/hotspotLogic";
import { useI18n } from "./useI18n";

const NO_HOTSPOTS: GameSceneHotspot[] = [];

export type HotspotMenuState = {
  hotspot: GameSceneHotspot;
  verbs: Verb[];
  position: { x: number; y: number };
};

export type UseHotspotInteractionsOptions = {
  /** Muestra una frase en el bocadillo (el de `useGameViewportController`). */
  showSpeechBubble: (text: string, meta?: { dialogKey?: string }) => void;
  /** Cancela el arrastre del inventario en curso. */
  clearDrag: () => void;
  /** Clave de la frase generica de `hotspot:noAction`. Por defecto, la del motor. */
  noActionDialogKey?: string;
};

/** Hotspots visibles de la escena activa (incluye los NPC proyectados); se recalcula al cambiar el estado. */
export function useVisibleHotspots(): GameSceneHotspot[] {
  const hotspots = useSceneStore((s) => s.scene.hotspots);
  const sceneId = useSceneStore((s) => s.sceneId);
  const flags = useWorldStateStore((s) => s.flags);
  const visitedSceneIds = useWorldStateStore((s) => s.visitedSceneIds);
  const inventory = useInventoryStateStore((s) => s.slots);
  const placedItems = usePlacedItemsStateStore((s) => s.items);
  return useMemo(() => {
    if (!hotspots?.length) return NO_HOTSPOTS;
    const ctx: ConditionContext = { flags, inventory, placedItems, sceneId, visitedSceneIds };
    return filterVisibleHotspots(hotspots, ctx);
  }, [hotspots, flags, inventory, placedItems, sceneId, visitedSceneIds]);
}

/**
 * Logica de interaccion con hotspots: click (verbo por defecto o menu), suelta de un
 * item (`useItem`) y frase generica de `hotspot:noAction`. Respeta `inputLocked`.
 */
export function useHotspotInteractions({
  showSpeechBubble,
  clearDrag,
  noActionDialogKey = ENGINE_NO_ACTION_KEY,
}: UseHotspotInteractionsOptions) {
  const hotspots = useVisibleHotspots();
  const sceneId = useSceneStore((s) => s.sceneId);
  const { t, getPhrase } = useI18n();
  const [menu, setMenu] = useState<HotspotMenuState | null>(null);
  const hasHotspots = hotspots.length > 0;

  useEffect(() => {
    if (hasHotspots) ensureEngineTexts();
  }, [hasHotspots]);

  // Ultimos valores por ref: el listener de eventos no se re-suscribe al cambiar la frase o el bocadillo.
  const latestRef = useRef({ showSpeechBubble, getPhrase, noActionDialogKey });
  useEffect(() => {
    latestRef.current = { showSpeechBubble, getPhrase, noActionDialogKey };
  });

  useEffect(() => {
    if (!hasHotspots) return;
    const runtime = getGameRuntime();
    if (!runtime) return;
    return runtime.on("hotspot:noAction", () => {
      const { showSpeechBubble: show, getPhrase: phrase, noActionDialogKey: key } = latestRef.current;
      show(phrase(key), { dialogKey: key });
    });
  }, [hasHotspots]);

  // Cierra el menu al cambiar de escena o al bloquearse la entrada.
  useEffect(() => setMenu(null), [sceneId]);
  useEffect(
    () =>
      useInputLockStore.subscribe((s) => {
        if (s.inputLocked) setMenu(null);
      }),
    [],
  );

  const run = useCallback((hotspotId: string, verb: Verb | "useItem", itemId?: string) => {
    getGameRuntime()?.executeCommand({
      type: "hotspot:interact",
      hotspotId,
      verb,
      ...(itemId !== undefined ? { itemId } : {}),
    });
  }, []);

  /** Click sobre un hotspot en `position` (pixeles de pantalla). */
  const activate = useCallback(
    (hotspot: GameSceneHotspot, position: { x: number; y: number }) => {
      if (getInputLockState().inputLocked) return;
      const world = useWorldStateStore.getState();
      const ctx: ConditionContext = {
        flags: world.flags,
        inventory: useInventoryStateStore.getState().slots,
        placedItems: usePlacedItemsStateStore.getState().items,
        sceneId: useSceneStore.getState().sceneId,
        visitedSceneIds: world.visitedSceneIds,
      };
      const plan = planHotspotClick(hotspot, ctx);
      if (plan.kind === "menu") setMenu({ hotspot, verbs: plan.verbs, position });
      else run(hotspot.id, plan.verb);
    },
    [run],
  );

  /** Suelta un item del inventario sobre un hotspot. */
  const dropItem = useCallback(
    (hotspot: GameSceneHotspot, itemId: string) => {
      clearDrag();
      if (getInputLockState().inputLocked) return;
      run(hotspot.id, "useItem", itemId);
    },
    [clearDrag, run],
  );

  const select = useCallback(
    (verb: Verb) => {
      if (menu && !getInputLockState().inputLocked) run(menu.hotspot.id, verb);
      setMenu(null);
    },
    [menu, run],
  );
  const closeMenu = useCallback(() => setMenu(null), []);
  const labels = useMemo(() => buildVerbLabels(t), [t]);

  return { hotspots, menu, labels, activate, dropItem, select, closeMenu };
}
