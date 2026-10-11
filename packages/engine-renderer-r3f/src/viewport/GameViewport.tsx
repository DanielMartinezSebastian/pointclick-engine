"use client";

import type { GameRuntimeEventHandler, RuntimeEventHandler } from "@pointclick-engine/engine-core";

import {
  useGameViewportController,
  type GameViewportControllerOptions,
} from "./useGameViewportController";
import { GameViewportView, type GameViewportViewProps } from "./GameViewportView";

/** Props del punto de integracion GameViewport (opciones del controlador + props de la vista). */
export type GameViewportProps = Omit<GameViewportControllerOptions, "onRuntimeEvent"> &
  Omit<GameViewportViewProps, "controller"> & {
    /** Activa la depuracion del viewport. */
    debug?: boolean;
    /**
     * Callback de eventos de runtime (contrato v1). Acepta el tipo publico
     * (`GameRuntimeEventHandler`) y el que el motor emite realmente (`RuntimeEventHandler`).
     */
    onRuntimeEvent?: GameRuntimeEventHandler | RuntimeEventHandler;
  };

/**
 * Juego jugable en un solo componente. Con los valores por defecto usa el runtime
 * activo (`getGameRuntime()`), sin persistencia ni audio y con el personaje incluido.
 * Si el host necesita el controlador para su propia UI, usa `useGameViewportController`
 * y `GameViewportView` por separado.
 */
export function GameViewport(props: GameViewportProps) {
  const controller = useGameViewportController({
    ...props,
    onRuntimeEvent: props.onRuntimeEvent as RuntimeEventHandler | undefined,
  });
  return <GameViewportView controller={controller} {...props} />;
}
