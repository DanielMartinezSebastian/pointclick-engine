"use client";

import { useEffect, useState } from "react";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { Texture, TextureLoader } from "three";

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
  const [texture, setTexture] = useState<Texture | null>(null);
  const collisionHalfSize = item.collisionHalfSize ?? [0.34, 0.34, 0.34];

  useEffect(() => {
    let mounted = true;
    const loader = new TextureLoader();
    let loadedTexture: Texture | null = null;

    loader.load(
      item.spriteUrl,
      (nextTexture) => {
        if (!mounted) {
          nextTexture.dispose();
          return;
        }

        loadedTexture = nextTexture;
        setTexture(nextTexture);
      },
      undefined,
      () => {
        // Silenciar errores de carga para no romper la interacción del juego.
      },
    );

    return () => {
      mounted = false;
      if (loadedTexture) {
        loadedTexture.dispose();
      }
    };
  }, [item.spriteUrl]);

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
      {texture && (
        <sprite scale={[1.35, 1.35, 1]}>
          <spriteMaterial map={texture} transparent />
        </sprite>
      )}
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
