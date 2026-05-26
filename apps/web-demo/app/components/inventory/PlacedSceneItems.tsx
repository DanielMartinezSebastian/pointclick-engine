"use client";

import { useEffect, useState } from "react";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { Texture, TextureLoader } from "three";
import type { PlacedSceneItem } from "../../lib/engine/types/gameRuntime";

function PlacedSceneItemMesh({
  item,
  onPickup,
  canPickup,
}: {
  item: PlacedSceneItem;
  onPickup: (item: PlacedSceneItem) => void;
  canPickup: boolean;
}) {
  const [texture, setTexture] = useState<Texture | null>(null);
  const [spriteAspectRatio, setSpriteAspectRatio] = useState(1);
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
          const image = nextTexture.image as { width?: number; height?: number } | undefined;
          const width = image?.width ?? 1;
          const height = image?.height ?? 1;
          setSpriteAspectRatio(height > 0 ? width / height : 1);
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
          if (!canPickup) return;
          onPickup(item);
        }}
      >
        <boxGeometry args={[1.6, 1.6, 1.6]} />
        <meshBasicMaterial transparent opacity={0.01} depthWrite={false} />
      </mesh>
      {texture && (
        <sprite scale={[1.35 * spriteAspectRatio, 1.35, 1]}>
          <spriteMaterial map={texture} transparent />
        </sprite>
      )}
    </RigidBody>
  );
}

export function PlacedSceneItems({
  items,
  onPickup,
  canPickup,
}: {
  items: PlacedSceneItem[];
  onPickup: (item: PlacedSceneItem) => void;
  canPickup: boolean;
}) {
  return (
    <>
      {items.map((item) => (
        <PlacedSceneItemMesh key={item.id} item={item} onPickup={onPickup} canPickup={canPickup} />
      ))}
    </>
  );
}

