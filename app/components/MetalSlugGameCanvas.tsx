"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Mesh, Vector2 } from "three";

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
const CLICK_ARRIVAL_THRESHOLD = 0.15;
// Angle from horizontal axis above which vertical animation fires (55° = 35° cone around vertical)
const VERTICAL_ANGLE_THRESHOLD = 55 * (Math.PI / 180);

function resolveAction(horizontal: number, vertical: number): MovementAction {
  if (horizontal === 0 && vertical === 0) return "idle";
  const angle = Math.atan2(Math.abs(vertical), Math.abs(horizontal));
  if (angle >= VERTICAL_ANGLE_THRESHOLD) {
    return vertical < 0 ? "up" : "down";
  }
  return horizontal < 0 ? "left" : "right";
}

function ClickPlane({ onClickWorld }: { onClickWorld: (x: number, y: number) => void }) {
  const { viewport } = useThree();
  return (
    <mesh
      position={[0, 0, -0.1]}
      onPointerDown={(e) => {
        e.stopPropagation();
        onClickWorld(e.point.x, e.point.y);
      }}
    >
      <planeGeometry args={[viewport.width, viewport.height]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}

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
  const clickTargetRef = useRef<Vector2 | null>(null);
  const currentActionRef = useRef<MovementAction>("idle");
  const [action, setAction] = useState<MovementAction>("idle");
  const { viewport } = useThree();

  const handleClickWorld = useCallback((x: number, y: number) => {
    clickTargetRef.current = new Vector2(x, y);
  }, []);

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

    const anyKeyPressed = moveLeft || moveRight || moveUp || moveDown;

    // Keyboard takes priority; cancel click target while keys are held
    if (anyKeyPressed) {
      clickTargetRef.current = null;
    }

    let horizontal = 0;
    let vertical = 0;

    if (anyKeyPressed) {
      horizontal = Number(moveRight) - Number(moveLeft);
      vertical = Number(moveDown) - Number(moveUp);
    } else if (clickTargetRef.current) {
      const dx = clickTargetRef.current.x - mesh.position.x;
      const dy = clickTargetRef.current.y - mesh.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const step = 2.5 * delta;

      if (dist <= step || dist < CLICK_ARRIVAL_THRESHOLD) {
        // Snap to target and stop
        mesh.position.x = clickTargetRef.current.x;
        mesh.position.y = clickTargetRef.current.y;
        clickTargetRef.current = null;
      } else {
        // Normalize direction
        horizontal = dx / dist;
        // Vertical is inverted vs key convention (world y+ is up)
        vertical = -(dy / dist);
      }
    }

    const nextAction: MovementAction = resolveAction(horizontal, vertical);

    if (currentActionRef.current !== nextAction) {
      currentActionRef.current = nextAction;
      setAction(nextAction);
    }

    if (horizontal === 0 && vertical === 0) {
      return;
    }

    const speed = 2.5;
    const prevX = mesh.position.x;
    const prevY = mesh.position.y;

    mesh.position.x += horizontal * speed * delta;
    mesh.position.y -= vertical * speed * delta;

    const maxX = Math.max(0, viewport.width / 2 - 2.8);
    const maxY = Math.max(0, viewport.height / 2 - 2.8);

    mesh.position.x = Math.min(maxX, Math.max(-maxX, mesh.position.x));
    mesh.position.y = Math.min(maxY, Math.max(-maxY, mesh.position.y));

    // If the character barely moved (stuck against a boundary), cancel the click target
    const actualMovement =
      Math.abs(mesh.position.x - prevX) + Math.abs(mesh.position.y - prevY);
    const expectedMovement = speed * delta * 0.1;
    if (clickTargetRef.current && actualMovement < expectedMovement) {
      clickTargetRef.current = null;
    }
  });

  return (
    <>
      <ClickPlane onClickWorld={handleClickWorld} />
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
    </>
  );
}

export default function MetalSlugGameCanvas() {
  const [selectedCharacter, setSelectedCharacter] = useState<ManiacMansionCharacterName>("Dave");
  const [readyMessage, setReadyMessage] = useState("Dave cargando...");
  const spriteRefRef = useRef<React.RefObject<AnimatedSpriteHandle | null> | null>(null);

  useEffect(() => {
    setReadyMessage(`${selectedCharacter} listo — flechas/WASD o click para moverse`);
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
