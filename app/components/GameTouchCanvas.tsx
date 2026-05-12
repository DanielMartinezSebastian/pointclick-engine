"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { Physics, RigidBody, CuboidCollider, BallCollider, type RapierRigidBody } from "@react-three/rapier";
import { MathUtils, Mesh, TextureLoader, Vector2 } from "three";

import AnimatedSprite, { type AnimatedSpriteHandle } from "./sprite/AnimatedSprite";
import MouseCursor from "./MouseCursor";
import PixelSelect from "./PixelSelect";
import {
  ATLAS_SIZE,
  GAME_CHARACTER_CLIPS,
  GAME_CHARACTERS,
  type GameCharacterName,
  type GameDirection,
} from "./sprite/clips";

type MovementAction = GameDirection;

const MOVEMENT_KEYS = new Set(["arrowleft", "arrowright", "arrowup", "arrowdown", "a", "d", "w", "s"]);
const CLICK_ARRIVAL_THRESHOLD = 0.15;
// Angle from horizontal axis above which vertical animation fires (55° = 35° cone around vertical)
const VERTICAL_ANGLE_THRESHOLD = 55 * (Math.PI / 180);
const GROUND_WIDTH = 44;
const GROUND_DEPTH = 34;
const DEPTH_FAR_Z = -16;
const DEPTH_NEAR_Z = 8;
const SPRITE_MIN_SCALE = 1.0;
const SPRITE_MAX_SCALE = 2.1;

function resolveAction(horizontal: number, vertical: number): MovementAction {
  if (horizontal === 0 && vertical === 0) return "idle";
  const angle = Math.atan2(Math.abs(vertical), Math.abs(horizontal));
  if (angle >= VERTICAL_ANGLE_THRESHOLD) {
    return vertical < 0 ? "up" : "down";
  }
  return horizontal < 0 ? "left" : "right";
}

function GroundPlane({ onClickWorld }: { onClickWorld: (x: number, z: number) => void }) {
  // Suelo horizontal único: visual, colisión y point-and-click en la misma superficie.
  return (
    <RigidBody type="fixed" colliders="trimesh">
      <mesh
        position={[0, -1.15, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerDown={(e) => {
          e.stopPropagation();
          onClickWorld(e.point.x, e.point.z);
        }}
      >
          <planeGeometry args={[GROUND_WIDTH, GROUND_DEPTH]} />
          <meshStandardMaterial color="#142549" roughness={1} metalness={0.05} />
      </mesh>
    </RigidBody>
  );
}

function CollisionCube() {
  return (
    <RigidBody
      type="dynamic"
      colliders={false}
      position={[1.8, 4.5, -0.6]}
      gravityScale={1.2}
      linearDamping={1.2}
      angularDamping={1.8}
      ccd
      enabledRotations={[false, false, false]}
    >
      <CuboidCollider args={[0.55, 0.55, 0.55]} friction={2.8} restitution={0} />
      <mesh>
        <boxGeometry args={[1.1, 1.1, 1.1]} />
        <meshStandardMaterial color="#ffb000" roughness={0.7} metalness={0.1} />
      </mesh>
    </RigidBody>
  );
}

function CollisionSphere() {
  const globeTexture = useLoader(TextureLoader, "/globe.svg");

  return (
    <RigidBody
      type="dynamic"
      colliders={false}
      position={[-1.4, 4.2, -1.4]}
      gravityScale={1.2}
      linearDamping={1.0}
      angularDamping={0.8}
      ccd
    >
      <BallCollider args={[0.5]} friction={1.5} restitution={0.05} />
      <mesh>
        <sphereGeometry args={[0.5, 48, 48]} />
        <meshStandardMaterial map={globeTexture} roughness={0.55} metalness={0.02} />
      </mesh>
    </RigidBody>
  );
}

function GameTouchSprite({
  activeCharacter,
  onSpriteReady,
}: {
  activeCharacter: GameCharacterName;
  onSpriteReady: (spriteRef: React.RefObject<AnimatedSpriteHandle | null>) => void;
}) {
  const spriteRef = useRef<AnimatedSpriteHandle | null>(null);
  const meshRef = useRef<Mesh>(null);
  const characterBodyRef = useRef<RapierRigidBody>(null);
  const keysPressedRef = useRef(new Set<string>());
  const clickTargetRef = useRef<Vector2 | null>(null);
  const currentActionRef = useRef<MovementAction>("idle");
  const [action, setAction] = useState<MovementAction>("idle");

  const handleClickWorld = useCallback((x: number, z: number) => {
    clickTargetRef.current = new Vector2(x, z);
  }, []);

  const characterClips = useMemo(
    () => GAME_CHARACTER_CLIPS[activeCharacter],
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
    const body = characterBodyRef.current;

    if (!body) {
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
      const currentPosition = body.translation();
      const dx = clickTargetRef.current.x - currentPosition.x;
      const dz = clickTargetRef.current.y - currentPosition.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      const step = 2.5 * delta;

      if (dist <= step || dist < CLICK_ARRIVAL_THRESHOLD) {
        // Snap to target and stop
        body.setTranslation({ x: clickTargetRef.current.x, y: currentPosition.y, z: clickTargetRef.current.y }, true);
        clickTargetRef.current = null;
      } else {
        // Normalize direction
        horizontal = dx / dist;
        vertical = dz / dist;
      }
    }

    const nextAction: MovementAction = resolveAction(horizontal, vertical);

    if (currentActionRef.current !== nextAction) {
      currentActionRef.current = nextAction;
      setAction(nextAction);
    }

    const speed = 3.5;
    const currentVelocity = body.linvel();
    const targetVelocity = {
      x: horizontal * speed,
      y: currentVelocity.y,
      z: vertical * speed,
    };

    if (horizontal === 0 && vertical === 0) {
      body.setLinvel({ x: 0, y: currentVelocity.y, z: 0 }, true);
    } else {
      body.setLinvel(targetVelocity, true);
    }

    const currentPosition = body.translation();
    const depthFactor = MathUtils.clamp(
      MathUtils.inverseLerp(DEPTH_FAR_Z, DEPTH_NEAR_Z, currentPosition.z),
      0,
      1,
    );
    const spriteScale = MathUtils.lerp(SPRITE_MIN_SCALE, SPRITE_MAX_SCALE, depthFactor);
    if (meshRef.current) {
      meshRef.current.scale.set(spriteScale, spriteScale, 1);
      // El centro del collider queda en el medio del cuerpo; el sprite debe subir
      // exactamente su semialtura menos la semialtura del collider para apoyar los pies.
      meshRef.current.position.y = spriteScale - 0.95;
    }
  });

  return (
    <>
      <GroundPlane onClickWorld={handleClickWorld} />
      <CollisionCube />
      <CollisionSphere />
      <RigidBody
        ref={characterBodyRef}
        type="dynamic"
        colliders={false}
        position={[0, 7, 0]}
        gravityScale={1.2}
        linearDamping={7}
        angularDamping={20}
        ccd
        enabledRotations={[false, false, false]}
      >
        <CuboidCollider args={[0.55, 0.95, 0.18]} friction={2.2} restitution={0} />
        <AnimatedSprite
          ref={spriteRef}
          meshRef={meshRef}
          textureUrl="/assets/sprites/maniac-mansion.png"
          atlas={ATLAS_SIZE}
          clip={characterClips[action]}
          scale={[SPRITE_MIN_SCALE, SPRITE_MIN_SCALE, 1]}
          flipX={false}
          isPaused={false}
        />
      </RigidBody>
    </>
  );
}

export default function GameTouchCanvas() {
  const [selectedCharacter, setSelectedCharacter] = useState<GameCharacterName>("Dave");

  const characterOptions = useMemo(
    () =>
      GAME_CHARACTERS.map((character) => ({
        label: character.name,
        value: character.name,
      })),
    [],
  );
  const spriteRefRef = useRef<React.RefObject<AnimatedSpriteHandle | null> | null>(null);
  const readyMessage = `${selectedCharacter} listo — flechas/WASD o click para moverse`;

  const handleSpriteReady = (spriteRef: React.RefObject<AnimatedSpriteHandle | null>) => {
    spriteRefRef.current = spriteRef;
  };

  return (
    <div style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh", overflow: "hidden", cursor: "none" }}>
      <MouseCursor />
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 5.4, 25.0]} rotation={[-0.24, 0, 0]} fov={46} near={0.1} far={120} />
        <color attach="background" args={["#070d1f"]} />
        <fog attach="fog" args={["#070d1f", 11, 50]} />
        <ambientLight intensity={1.1} color="#8bc2ff" />
        <directionalLight position={[3, 9, 6]} intensity={1.5} color="#d8ecff" />
        <Physics gravity={[0, -20, 0]}>
          <Suspense fallback={null}>
            <GameTouchSprite activeCharacter={selectedCharacter} onSpriteReady={handleSpriteReady} />
          </Suspense>
        </Physics>
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
          padding: "1rem 1.2rem",
          borderRadius: "2px",
          border: "3px solid #00ff41",
          background: "rgb(12 19 48 / 95%)",
          color: "#00ff41",
          backdropFilter: "blur(4px)",
          minWidth: "260px",
          boxShadow: "0 0 16px rgba(0, 255, 65, 0.3), inset 0 0 8px rgba(0, 255, 65, 0.1)",
          fontFamily: "var(--font-pixel), monospace",
          fontSize: "13px",
          letterSpacing: "1px",
          textShadow: "0 0 10px rgba(0, 255, 65, 0.4)",
        }}
      >
        <PixelSelect
          label="Debug personaje"
          value={selectedCharacter}
          onChange={(value) => setSelectedCharacter(value as GameCharacterName)}
          options={characterOptions}
        />
        <strong style={{ fontSize: "12px", fontWeight: "bold", letterSpacing: "1px", lineHeight: "1.6" }}>{readyMessage}</strong>
      </div>
    </div>
  );
}
