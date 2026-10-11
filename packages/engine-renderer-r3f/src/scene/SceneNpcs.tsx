"use client";

import { Suspense, useMemo } from "react";
import {
  useInventoryStateStore,
  usePlacedItemsStateStore,
  useSceneStore,
  useWorldStateStore,
  type GameSceneNpc,
} from "@pointclick-engine/engine-core";

import type { CharacterDefinition } from "../sprite/character";
import { NpcSprite } from "../sprite/NpcSprite";
import { filterVisibleNpcs } from "./visibleNpcs";

const NO_NPCS: GameSceneNpc[] = [];

/** NPCs de la escena activa cuyo `visibleWhen` se cumple; se recalcula al cambiar el estado. */
export function useVisibleNpcs(): GameSceneNpc[] {
  const npcs = useSceneStore((s) => s.scene.npcs);
  const sceneId = useSceneStore((s) => s.sceneId);
  const flags = useWorldStateStore((s) => s.flags);
  const visitedSceneIds = useWorldStateStore((s) => s.visitedSceneIds);
  const inventory = useInventoryStateStore((s) => s.slots);
  const placedItems = usePlacedItemsStateStore((s) => s.items);
  return useMemo(
    () =>
      npcs?.length
        ? filterVisibleNpcs(npcs, { flags, inventory, placedItems, sceneId, visitedSceneIds })
        : NO_NPCS,
    [npcs, flags, inventory, placedItems, sceneId, visitedSceneIds],
  );
}

export type SceneNpcsProps = {
  /** NPCs a pintar (normalmente `useVisibleNpcs()`). */
  npcs: readonly GameSceneNpc[];
  /** Personajes disponibles por `characterId`. */
  characters?: Record<string, CharacterDefinition>;
  /** Id del NPC que habla ahora (ver `resolveSpeakingNpcId`), o `null`. */
  speakingNpcId?: string | null;
  speechText?: string;
  speechTrigger?: number;
  speechCharsPerSecond?: number;
  onSpeechDismiss?: () => void;
  debug?: boolean;
};

const noop = () => {};

/** Pinta los sprites de los NPCs. Sin NPCs no renderiza nada. */
export function SceneNpcs({
  npcs,
  characters,
  speakingNpcId = null,
  speechText = "",
  speechTrigger = 0,
  speechCharsPerSecond = 28,
  onSpeechDismiss = noop,
  debug = false,
}: SceneNpcsProps) {
  if (npcs.length === 0) return null;
  return (
    <Suspense fallback={null}>
      {npcs.map((npc) => (
        <NpcSprite
          key={npc.id}
          npc={npc}
          character={characters?.[npc.characterId]}
          debug={debug}
          speech={
            npc.id === speakingNpcId
              ? { text: speechText, trigger: speechTrigger, charsPerSecond: speechCharsPerSecond, onDismiss: onSpeechDismiss }
              : undefined
          }
        />
      ))}
    </Suspense>
  );
}
