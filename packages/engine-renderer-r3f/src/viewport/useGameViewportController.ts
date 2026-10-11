"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getGameRuntime,
  legacyRuntimeEventToGameEvent,
  useDialogStore,
  useDialogueStore,
  useSceneStore,
  type GameScene,
  type GameSceneTransition,
  type InventoryRuleContext,
  type PlacedSceneItem,
  type RuntimeEvent,
  type RuntimeEventHandler,
} from "@pointclick-engine/engine-core";

import { resolveSpeechDismiss, shouldHoldBubble, shouldShowChoices } from "../hooks/dialogueLogic";
import { useDialogue } from "../hooks/useDialogue";
import {
  attachAudioSystem,
  type AttachAudioSystemOpts,
  type MinimalRuntime,
} from "../hooks/attachAudioSystem";
import {
  useInventoryRuntime,
  type SceneEnterApi,
} from "../hooks/useInventoryRuntime";
import {
  useSceneRuntime,
  type SceneProgressStorage,
} from "../hooks/useSceneRuntime";
import { useTransitionSystem, type CanLeaveScene } from "../hooks/useTransitionSystem";
import type { GetInitialPlacedItems } from "../inventory/seedScene";

const EMPTY_TRANSITIONS: GameSceneTransition[] = [];

// Runtime nulo: sin runtime el audio no recibe eventos.
const NOOP_RUNTIME: MinimalRuntime = { on: () => () => {} };

/** Filtro por defecto: un item colocado pertenece a la escena que dice su `sceneId`. */
const defaultFilterPlacedItems = (item: PlacedSceneItem, sceneId: string): boolean =>
  item.sceneId === sceneId;

/** Audio opcional: sin esta opcion el viewport no suena. */
export type GameViewportAudioOptions = Omit<AttachAudioSystemOpts, "runtime" | "scenes"> & {
  scenes?: Record<string, GameScene>;
};

export type GameViewportControllerOptions = {
  /** Runtime que alimenta el audio. Por defecto, el runtime activo (`getGameRuntime()`). */
  runtime?: MinimalRuntime | null;
  /** Escena a sembrar si no hay una guardada. */
  initialSceneId?: string;
  /** Persistencia del id de escena. Sin ella no se guarda. */
  storage?: SceneProgressStorage;
  /** Resuelve la escena completa por id. Por defecto, el registro del runtime. */
  resolveScene?: (id: string) => GameScene | null;
  /** Regla del juego para permitir o bloquear la salida de una escena. */
  canLeaveScene?: CanLeaveScene;
  /** Texto de una clave de dialogo. Por defecto, el `getRandomPhrase` del core. */
  getPhrase?: (key: string) => string;
  /** Items iniciales de cada escena (ver `useInventoryRuntime`). */
  getInitialPlacedItems?: GetInitialPlacedItems;
  /** Se llama al entrar en una escena (p. ej. un dialogo de bienvenida). */
  onSceneEnter?: (sceneId: string, api: SceneEnterApi) => void;
  /** Contexto de reglas de items. Por defecto, el registro del runtime activo. */
  itemContext?: InventoryRuleContext;
  /** Audio por puerto. Sin esta opcion no hay audio. */
  audio?: GameViewportAudioOptions;
  /** Callback legacy del contrato v1; ademas cada evento se reenvia al bus. */
  onRuntimeEvent?: RuntimeEventHandler;
  /** Que items colocados se pintan en la escena actual. Por defecto `item.sceneId === sceneId`. */
  filterPlacedItems?: (item: PlacedSceneItem, sceneId: string) => boolean;
  /**
   * Arranca el guardado automatico de inventario e items colocados. Se llama una vez
   * al montar, justo antes de los efectos del inventario; devuelve su limpieza.
   */
  startPersistence?: () => void | (() => void);
  /** Registra los eventos de runtime en consola. */
  debug?: boolean;
};

/**
 * Hook sin JSX que ejecuta los hooks genericos del juego y devuelve todo lo que la
 * vista (`GameViewportView`) y la UI del host necesitan. El orden de los hooks es
 * deliberado: el audio va ANTES de la siembra de escena (los efectos de un mismo
 * componente corren en orden de declaracion y el de la escena inicial emite
 * `scene:changed`: el audio ya tiene que estar suscrito).
 */
export function useGameViewportController(options: GameViewportControllerOptions = {}) {
  const {
    runtime,
    initialSceneId,
    storage,
    resolveScene,
    canLeaveScene,
    getPhrase,
    getInitialPlacedItems,
    onSceneEnter,
    itemContext,
    audio,
    onRuntimeEvent,
    filterPlacedItems = defaultFilterPlacedItems,
    startPersistence,
    debug = false,
  } = options;

  const baseRuntimeEvent = useCallback((event: RuntimeEvent) => {
    // Legacy callback (backwards compat)
    onRuntimeEvent?.(event);
    // Also emit to the bidirectional event bus (Phase 4)
    const gameEvent = legacyRuntimeEventToGameEvent(event);
    getGameRuntime()?.emit(gameEvent);
    if (!debug) return;
    console.debug("[runtime-event]", event);
  }, [onRuntimeEvent, debug]);

  // IMPORTANTE: antes de useSceneRuntime (ver comentario del hook).
  const audioRuntime = runtime ?? getGameRuntime() ?? NOOP_RUNTIME;
  useEffect(() => {
    if (!audio) return;
    return attachAudioSystem({ ...audio, scenes: audio.scenes ?? {}, runtime: audioRuntime });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioRuntime, audio?.port, audio?.settingsStore]);

  const {
    sceneId,
    sceneBackground,
    storeSetScene,
    sceneInteractions,
    requestRespawn,
    playerPosition,
    scenePlayerSpawn,
    updateInteraction,
    resetInteractionsFromSceneConfig,
  } = useSceneRuntime({ initialSceneId, storage, resolveScene });

  // ── Cortina de fundido para transiciones de escena ───────────────────────
  // El div esta siempre en el DOM. Se manipula directamente (sin estado de React)
  // para que la cortina caiga de forma sincrona antes de cualquier re-render con
  // los datos de la escena nueva (sin fondo).
  const fadeOverlayRef = useRef<HTMLDivElement>(null);

  const handleBeforeSceneChange = useCallback(() => {
    const el = fadeOverlayRef.current;
    if (!el) return;
    el.style.transition = "none";
    el.style.opacity = "1";
    el.style.pointerEvents = "all";
  }, []);

  const handleBackgroundReady = useCallback(() => {
    const el = fadeOverlayRef.current;
    if (!el || el.style.opacity !== "1") return;
    // Force layout flush so the transition triggers on the next style change.
    el.getBoundingClientRect();
    el.style.transition = "opacity 0.45s ease";
    el.style.opacity = "0";
    el.style.pointerEvents = "none";
  }, []);

  const { handleTransitionTriggered, wrapRuntimeEventForTransitions } = useTransitionSystem({
    onBeforeChange: handleBeforeSceneChange,
    resolveScene,
    canLeaveScene,
  });

  // Cadena: base (callback del host + bus) -> comprobacion de transiciones por item.
  const handleRuntimeEvent = useMemo(
    () => wrapRuntimeEventForTransitions(baseRuntimeEvent),
    [wrapRuntimeEventForTransitions, baseRuntimeEvent],
  );

  // El estado del dialogo vive en el core (tambien escribible via dialog:trigger / dialog:dismiss)
  const speechText = useDialogStore((s) => s.text);
  const speechVisible = useDialogStore((s) => s.visible);
  const speechTrigger = useDialogStore((s) => s.triggerCount);
  const speechSpeaker = useDialogStore((s) => s.speaker);

  // Conversaciones con opciones: la linea queda en el bocadillo hasta elegir; las opciones
  // salen al terminar de escribirse. Sin conversacion activa nada de esto cambia nada.
  const dialogue = useDialogue();
  const lineKey = useDialogueStore((s) => s.lineKey);
  const [typedTrigger, setTypedTrigger] = useState(-1);
  const dialogueChoicesVisible = shouldShowChoices({
    active: dialogue.active,
    choiceCount: dialogue.choices.length,
    hasLine: lineKey !== undefined,
    typedTrigger,
    triggerCount: speechTrigger,
  });
  const speechPersistent = shouldHoldBubble(dialogue.active, dialogue.choices.length);
  const dialogueRef = useRef(dialogue);
  dialogueRef.current = dialogue;

  const sceneTransitions = useSceneStore((s) => s.scene.transitions ?? EMPTY_TRANSITIONS);

  // Guardado automatico del host. Va ANTES del hook del inventario: sus efectos
  // (siembra, bienvenida) corren despues.
  useEffect(() => startPersistence?.(), []); // eslint-disable-line react-hooks/exhaustive-deps

  const inventory = useInventoryRuntime({
    sceneId,
    sceneInteractions,
    playerPosition,
    onRuntimeEvent: handleRuntimeEvent,
    getPhrase,
    getInitialPlacedItems,
    onSceneEnter,
    itemContext,
  });

  // Cierre del bocadillo: con conversacion activa se avanza por `dialogue:advance` (el core
  // emite `dialog:dismissed` y pasa al siguiente nodo); si no, se oculta como siempre.
  const { hideSpeechBubble: hideBubbleOnly } = inventory;
  const handleSpeechDismiss = useCallback(() => {
    if (resolveSpeechDismiss(dialogueRef.current.active) === "advance") dialogueRef.current.advance();
    // Sin conversacion se cierra con el comando `dialog:dismiss`, que emite `dialog:dismissed`:
    // una accion `say` de un guion espera ese evento y sin el se quedaria colgada.
    else if (getGameRuntime()) getGameRuntime()!.executeCommand({ type: "dialog:dismiss" });
    else hideBubbleOnly();
  }, [hideBubbleOnly]);

  // Items colocados que se pintan en la escena actual.
  const scenePlacedItems = inventory.placedItems.filter((item) => filterPlacedItems(item, sceneId));

  return {
    debug,
    // Escena
    sceneId,
    sceneBackground,
    storeSetScene,
    sceneInteractions,
    sceneTransitions,
    requestRespawn,
    playerPosition,
    scenePlayerSpawn,
    updateInteraction,
    resetInteractionsFromSceneConfig,
    // Inventario, arrastre, items colocados y bocadillo
    ...inventory,
    scenePlacedItems,
    speechText,
    speechVisible,
    speechTrigger,
    speechSpeaker,
    // Cierre del bocadillo (sustituye al de `...inventory`)
    hideSpeechBubble: handleSpeechDismiss,
    // Conversaciones
    dialogue,
    dialogueChoicesVisible,
    speechPersistent,
    onSpeechTypingDone: setTypedTrigger,
    // Eventos y transiciones
    handleRuntimeEvent,
    handleTransitionTriggered,
    // Cortina de fundido
    fadeOverlayRef,
    handleBackgroundReady,
  };
}

export type GameViewportController = ReturnType<typeof useGameViewportController>;
