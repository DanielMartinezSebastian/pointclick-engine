"use client";

import { useCallback, useMemo } from "react";
import { getGameRuntime, useDialogueStore } from "@pointclick-engine/engine-core";

import { useI18n } from "./useI18n";

export interface DialogueChoiceItem {
  /** Posicion original en `node.choices`; es lo que espera `dialogue:choose`. */
  index: number;
  /** Texto ya traducido. */
  text: string;
}

export interface UseDialogueResult {
  active: boolean;
  /** Id del NPC que habla ("player" o un id de NPC), si el nodo lo indica. */
  speaker?: string;
  choices: DialogueChoiceItem[];
  choose(index: number): void;
  advance(): void;
  end(): void;
}

/** Vista React de la conversacion activa y atajos a sus comandos (`dialogue:*`). */
export function useDialogue(): UseDialogueResult {
  const active = useDialogueStore((s) => s.activeDialogueId !== null);
  const speaker = useDialogueStore((s) => s.speaker);
  const views = useDialogueStore((s) => s.choices);
  const { t } = useI18n();

  const choices = useMemo(
    () => views.map((v) => ({ index: v.index, text: t(v.textKey) })),
    [views, t],
  );
  const choose = useCallback(
    (index: number) => getGameRuntime()?.executeCommand({ type: "dialogue:choose", index }),
    [],
  );
  const advance = useCallback(() => getGameRuntime()?.executeCommand({ type: "dialogue:advance" }), []);
  const end = useCallback(() => getGameRuntime()?.executeCommand({ type: "dialogue:end" }), []);

  return { active, speaker, choices, choose, advance, end };
}
