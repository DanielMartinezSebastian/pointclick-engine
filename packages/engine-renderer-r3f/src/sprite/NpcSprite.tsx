"use client";

import { useEffect, useMemo } from "react";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import type { GameSceneNpc } from "@pointclick-engine/engine-core";

import SpeechBubble from "../SpeechBubble";
import CharacterSprite from "./CharacterSprite";
import { DEFAULT_CHARACTER_SIZE, listCharacterAnimations, type CharacterDefinition } from "./character";
import { spriteScaleAtDepth } from "./depthScale";
import { selectNpcAnimation } from "./npcAnimation";

export type NpcSpeech = {
  text: string;
  trigger: number;
  charsPerSecond: number;
  onDismiss: () => void;
};

export type NpcSpriteProps = {
  npc: GameSceneNpc;
  /** Personaje registrado para `npc.characterId`; `undefined` si falta. */
  character: CharacterDefinition | undefined;
  /** Datos del bocadillo si este NPC es quien habla. */
  speech?: NpcSpeech;
  debug?: boolean;
};

const warnedMissing = new Set<string>();

/**
 * Sprite de un NPC. `npc.position` usa la convencion de `playerSpawn` (centro del cuerpo;
 * los pies quedan en `y - 0.95`). Con un `characterId` sin registrar avisa una vez por consola
 * y solo pinta un volumen en `debug`.
 */
export function NpcSprite({ npc, character, speech, debug = false }: NpcSpriteProps) {
  const missing = character === undefined;
  useEffect(() => {
    if (!missing || warnedMissing.has(npc.characterId)) return;
    warnedMissing.add(npc.characterId);
    console.warn(
      `[npcs] El NPC "${npc.id}" usa el personaje no registrado "${npc.characterId}" (prop \`characters\` del viewport).`,
    );
  }, [missing, npc.characterId, npc.id]);

  const size = character?.size ?? DEFAULT_CHARACTER_SIZE;
  const scale = spriteScaleAtDepth(npc.position[2], size);
  const speaking = speech !== undefined;
  const animation = useMemo(
    () =>
      character
        ? selectNpcAnimation(character, npc.facing, speaking, speech?.trigger ?? 0, speech?.charsPerSecond ?? 28)
        : null,
    [character, npc.facing, speaking, speech?.trigger, speech?.charsPerSecond],
  );
  const preload = useMemo(() => (character ? listCharacterAnimations(character) : undefined), [character]);

  const centerY = scale - 0.95;
  return (
    <group position={npc.position}>
      {npc.hasCollision && (
        <RigidBody type="fixed" colliders={false}>
          <CuboidCollider args={[0.45, scale, 0.18]} position={[0, centerY, 0]} />
        </RigidBody>
      )}
      {animation ? (
        <group position={[0, centerY, 0]}>
          <CharacterSprite animation={animation} preloadAnimations={preload} scale={[scale, scale, 1]} />
        </group>
      ) : (
        debug && (
          <mesh position={[0, centerY, 0]} raycast={() => null}>
            <boxGeometry args={[1.1, 2 * scale, 0.36]} />
            <meshBasicMaterial color="#ff00ff" wireframe />
          </mesh>
        )
      )}
      {speech && (
        <SpeechBubble
          key={speech.trigger}
          text={speech.text}
          visible
          trigger={speech.trigger}
          charsPerSecond={speech.charsPerSecond}
          onDismiss={speech.onDismiss}
          anchorPosition={npc.position}
        />
      )}
    </group>
  );
}
