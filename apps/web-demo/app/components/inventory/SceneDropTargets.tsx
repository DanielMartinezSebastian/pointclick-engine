"use client";

import { useEffect, useRef } from "react";
import { CuboidCollider, RigidBody } from "@react-three/rapier";

import type { SceneInteraction } from "../../../demo-content/scenes/scenes";
import { browserEnvironmentAdapter } from "../../lib/platform-web";
import type { InventoryStack } from "../InventoryUI";

export type DraggedInventoryPayload = {
  stack: InventoryStack;
  fromSlotIndex: number;
};

type SceneDropTargetsProps = {
  targets: SceneInteraction[];
  draggedStack: DraggedInventoryPayload | null;
  onDropHit: (interaction: SceneInteraction, payload: DraggedInventoryPayload) => void;
  onDropMiss: (payload: DraggedInventoryPayload, interaction?: SceneInteraction) => void;
  onInspect?: (interaction: SceneInteraction) => void;
  playerDropTarget?: {
    position: [number, number, number];
    onDrop: (payload: DraggedInventoryPayload) => void;
  };
};

function SceneDropTarget({
  interaction,
  draggedStack,
  onDropHit,
  onDropMiss,
  onInspect,
  markDropHandled,
}: {
  interaction: SceneInteraction;
  draggedStack: DraggedInventoryPayload | null;
  onDropHit: (interaction: SceneInteraction, payload: DraggedInventoryPayload) => void;
  onDropMiss: (payload: DraggedInventoryPayload, interaction?: SceneInteraction) => void;
  onInspect?: (interaction: SceneInteraction) => void;
  markDropHandled: () => void;
}) {
  const acceptsDraggedItem =
    !draggedStack || !interaction.acceptsItemIds || interaction.acceptsItemIds.includes(draggedStack.stack.id);

  return (
    <RigidBody
      type="fixed"
      colliders={false}
      position={interaction.position}
      rotation={[0, interaction.rotationY ?? 0, 0]}
    >
      {interaction.hasCollision && <CuboidCollider args={interaction.halfSize} />}
      <mesh
        position={[0, 0, 0]}
        onPointerUp={(event) => {
          event.stopPropagation();

          if (!draggedStack) {
            // Click sin arrastre: mostrar diálogo de inspección / pista
            onInspect?.(interaction);
            return;
          }

          markDropHandled();
          if (!acceptsDraggedItem) {
            onDropMiss(draggedStack, interaction);
            return;
          }

          onDropHit(interaction, draggedStack);
        }}
      >
        <boxGeometry args={[interaction.halfSize[0] * 2.2, interaction.halfSize[1] * 2.2, interaction.halfSize[2] * 2.2]} />
        <meshStandardMaterial transparent opacity={0.01} depthWrite={false} />
      </mesh>
      {!interaction.invisible && (
        <group>
          <mesh position={[0, -interaction.halfSize[1] * 0.15, 0]}>
            <cylinderGeometry args={[interaction.halfSize[0] * 0.84, interaction.halfSize[0] * 0.92, interaction.halfSize[1] * 0.55, 4]} />
            <meshStandardMaterial color="#3a4f75" roughness={0.9} metalness={0.1} />
          </mesh>
          <mesh position={[0, interaction.halfSize[1] * 0.15, 0]}>
            <boxGeometry args={[interaction.halfSize[0] * 1.1, interaction.halfSize[1] * 0.42, interaction.halfSize[2] * 1.1]} />
            <meshStandardMaterial color="#7fb7ff" emissive="#3f74d2" emissiveIntensity={0.35} roughness={0.45} metalness={0.2} />
          </mesh>
        </group>
      )}
    </RigidBody>
  );
}

export function SceneDropTargets({
  targets,
  draggedStack,
  onDropHit,
  onDropMiss,
  onInspect,
  playerDropTarget,
}: SceneDropTargetsProps) {
  const dropHandledRef = useRef(false);

  useEffect(() => {
    dropHandledRef.current = false;

    if (!draggedStack) {
      return;
    }

    const handleWindowPointerUp = () => {
      if (dropHandledRef.current) return;
      dropHandledRef.current = true;
      onDropMiss(draggedStack);
    };

    return browserEnvironmentAdapter.addWindowEventListener(
      "pointerup",
      handleWindowPointerUp,
    );
  }, [draggedStack, onDropMiss]);

  if (targets.length === 0 && !playerDropTarget) {
    return null;
  }

  return (
    <>
      {targets.map((interaction) => (
        <SceneDropTarget
          key={interaction.id}
          interaction={interaction}
          draggedStack={draggedStack}
          onDropHit={onDropHit}
          onDropMiss={onDropMiss}
          onInspect={onInspect}
          markDropHandled={() => {
            dropHandledRef.current = true;
          }}
        />
      ))}
      {playerDropTarget && (
        <mesh
          position={[
            playerDropTarget.position[0],
            playerDropTarget.position[1] + 1.5,
            playerDropTarget.position[2],
          ]}
          onPointerUp={(event) => {
            event.stopPropagation();
            if (!draggedStack) return;
            dropHandledRef.current = true;
            playerDropTarget.onDrop(draggedStack);
          }}
        >
          <boxGeometry args={[1.7, 4.5, 1.2]} />
          <meshBasicMaterial transparent opacity={0.01} depthWrite={false} />
        </mesh>
      )}
    </>
  );
}