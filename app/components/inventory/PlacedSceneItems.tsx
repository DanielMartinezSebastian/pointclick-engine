"use client";

import { useLoader } from "@react-three/fiber";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { TextureLoader } from "three";

type PlacedSceneItem = {
  id: string;
  itemId: string;
  interactionId: string;
  name: string;
  spriteUrl: string;
  worldPosition: [number, number, number];
  canPickup: boolean;
  hasCollision?: boolean;
  collisionHalfSize?: [number, number, number];
  pickupSuccessDialogKey?: string;
  pickupBlockedDialogKey?: string;
};

function PlacedSceneItemMesh({
  item,
  onPickup,
}: {
  item: PlacedSceneItem;
  onPickup: (item: PlacedSceneItem) => void;
}) {
  const texture = useLoader(TextureLoader, item.spriteUrl);
  const collisionHalfSize = item.collisionHalfSize ?? [0.34, 0.34, 0.34];

  return (
    <RigidBody type="fixed" colliders={false} position={item.worldPosition}>
      {item.hasCollision && <CuboidCollider args={collisionHalfSize} />}
      <mesh
        onPointerDown={(event) => {
          event.stopPropagation();
          onPickup(item);
        }}
      >
        <boxGeometry args={[1.6, 1.6, 1.6]} />
        <meshBasicMaterial transparent opacity={0.01} depthWrite={false} />
      </mesh>
      <sprite scale={[1.35, 1.35, 1]}>
        <spriteMaterial map={texture} transparent />
      </sprite>
    </RigidBody>
  );
}

export function PlacedSceneItems({
  items,
  onPickup,
}: {
  items: PlacedSceneItem[];
  onPickup: (item: PlacedSceneItem) => void;
}) {
  return (
    <>
      {items.map((item) => (
        <PlacedSceneItemMesh key={item.id} item={item} onPickup={onPickup} />
      ))}
    </>
  );
}

export type { PlacedSceneItem };
