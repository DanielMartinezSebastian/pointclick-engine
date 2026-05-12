"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Mesh } from "three";

import AnimatedSprite, { type AnimatedSpriteHandle } from "./sprite/AnimatedSprite";
import {
  ATLAS_SIZE,
  MANIAC_MANSION_CHARACTER_CLIPS,
  MANIAC_MANSION_CHARACTERS,
  type ManiacMansionCharacterName,
  type ManiacMansionDirection,
} from "./sprite/clips";

type MovementAction = ManiacMansionDirection;

const MOVEMENT_KEYS = new Set(["arrowleft", "arrowright", "arrowup", "arrowdown", "a", "d", "w", "s"]);

function MetalSlugSprite({
  activeCharacter,
  onSpriteReady,
}: {
  activeCharacter: ManiacMansionCharacterName;
  onSpriteReady: (spriteRef: React.RefObject<AnimatedSpriteHandle | null>) => void;
}) {
  const spriteRef = useRef<AnimatedSpriteHandle | null>(null);
  const meshRef = useRef<Mesh>(null);
  const keysPressedRef = useRef(new Set<string>());
  const currentActionRef = useRef<MovementAction>("idle");
  const [action, setAction] = useState<MovementAction>("idle");
  const { viewport } = useThree();

  const characterClips = useMemo(
    () => MANIAC_MANSION_CHARACTER_CLIPS[activeCharacter],
    [activeCharacter],
  );

  useEffect(() => {
    onSpriteReady(spriteRef);
  }, [onSpriteReady]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const normalizedKey = event.key.toLowerCase();

      if (MOVEMENT_KEYS.has(normalizedKey)) {
        event.preventDefault();
        keysPressedRef.current.add(normalizedKey);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const normalizedKey = event.key.toLowerCase();

      if (MOVEMENT_KEYS.has(normalizedKey)) {
        event.preventDefault();
        keysPressedRef.current.delete(normalizedKey);
      }
    };

    window.addEventListener("keydown", handleKeyDown, { passive: false });
    window.addEventListener("keyup", handleKeyUp, { passive: false });

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useFrame((_, delta) => {
    const mesh = meshRef.current;

    if (!mesh) {
      return;
    }

    const pressed = keysPressedRef.current;
    const moveLeft = pressed.has("arrowleft") || pressed.has("a");
    const moveRight = pressed.has("arrowright") || pressed.has("d");
    const moveUp = pressed.has("arrowup") || pressed.has("w");
    const moveDown = pressed.has("arrowdown") || pressed.has("s");

    const horizontal = Number(moveRight) - Number(moveLeft);
    const vertical = Number(moveDown) - Number(moveUp);

    const nextAction: MovementAction =
      horizontal < 0
        ? "left"
        : horizontal > 0
          ? "right"
          : vertical < 0
            ? "up"
            : vertical > 0
              ? "down"
              : "idle";

    if (currentActionRef.current !== nextAction) {
      currentActionRef.current = nextAction;
      setAction(nextAction);
    }

    if (horizontal === 0 && vertical === 0) {
      return;
    }

    const speed = 2.5;
    mesh.position.x += horizontal * speed * delta;
    mesh.position.y -= vertical * speed * delta;

    const maxX = Math.max(0, viewport.width / 2 - 2.8);
    const maxY = Math.max(0, viewport.height / 2 - 2.8);

    mesh.position.x = Math.min(maxX, Math.max(-maxX, mesh.position.x));
    mesh.position.y = Math.min(maxY, Math.max(-maxY, mesh.position.y));
  });

  return (
    <AnimatedSprite
      ref={spriteRef}
      meshRef={meshRef}
      textureUrl="/assets/sprites/maniac-mansion.png"
      atlas={ATLAS_SIZE}
      clip={characterClips[action]}
      scale={[1.6, 1.6, 1]}
      flipX={false}
      isPaused={false}
    />
  );
}

export default function MetalSlugGameCanvas() {
  const [selectedCharacter, setSelectedCharacter] = useState<ManiacMansionCharacterName>("Dave");
  const [readyMessage, setReadyMessage] = useState("Dave cargando...");
  const spriteRefRef = useRef<React.RefObject<AnimatedSpriteHandle | null> | null>(null);

  useEffect(() => {
    setReadyMessage(`${selectedCharacter} listo para moverse con flechas o WASD`);
  }, [selectedCharacter]);

  const handleSpriteReady = (spriteRef: React.RefObject<AnimatedSpriteHandle | null>) => {
    spriteRefRef.current = spriteRef;
  };

  return (
    <div style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh", overflow: "hidden" }}>
      <Canvas orthographic camera={{ position: [0, 0, 10], zoom: 72 }}>
        <Suspense fallback={null}>
          <MetalSlugSprite activeCharacter={selectedCharacter} onSpriteReady={handleSpriteReady} />
        </Suspense>
      </Canvas>

      <div
        style={{
          position: "absolute",
          top: "16px",
          left: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          zIndex: 20,
          padding: "0.9rem 1rem",
          borderRadius: "16px",
          border: "1px solid rgb(255 255 255 / 18%)",
          background: "rgb(6 10 24 / 72%)",
          color: "white",
          backdropFilter: "blur(8px)",
          minWidth: "260px",
          boxShadow: "0 14px 32px rgb(0 0 0 / 28%)",
        }}
      >
        <label style={{ display: "grid", gap: "6px", fontSize: "0.8rem", letterSpacing: "0.06em", textTransform: "uppercase" }}>
          Debug personaje
          <select
            value={selectedCharacter}
            onChange={(event) => setSelectedCharacter(event.target.value as ManiacMansionCharacterName)}
            style={{
              appearance: "none",
              borderRadius: "12px",
              border: "1px solid rgb(255 255 255 / 18%)",
              background: "rgb(12 19 48 / 82%)",
              color: "white",
              padding: "0.7rem 0.8rem",
              fontSize: "0.98rem",
              outline: "none",
            }}
          >
            {MANIAC_MANSION_CHARACTERS.map((character) => (
              <option key={character.name} value={character.name}>
                {character.name}
              </option>
            ))}
          </select>
        </label>
        <strong style={{ fontSize: "0.95rem" }}>{readyMessage}</strong>
      </div>
    </div>
  );
}
