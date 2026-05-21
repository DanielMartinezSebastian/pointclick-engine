"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrthographicCamera } from "@react-three/drei";
import { Physics, RigidBody, CuboidCollider, BallCollider, type RapierRigidBody } from "@react-three/rapier";
import { MathUtils, Mesh, OrthographicCamera as ThreeOrthoCamera, TextureLoader, Vector2, Vector3, DoubleSide } from "three";
import { usePathname } from "next/navigation";

import DavidSprite, { type DavidSpriteHandle } from "./sprite/DavidSprite";
import PixelSelect from "./PixelSelect";
import SpeechBubble from "./SpeechBubble";
import { getRandomPhrase } from "../dialogs/getRandomPhrase";
import {
  GAME_CHARACTER_SPRITES,
  type GameCharacterName,
  type GameDirection,
} from "./sprite/clips";
import { useSceneStore } from "../store/sceneStore";
import dynamic from "next/dynamic";
import { SCENES, type SceneInteraction, type SceneWall } from "../scenes/scenes";
import { useMobileInputStore } from "../store/mobileInputStore";
import { DraggedInventoryGhost, InventoryUI, type InventorySlots, type InventoryStack } from "./InventoryUI";
import { SceneDropTargets, type DraggedInventoryPayload } from "./inventory/SceneDropTargets";
import { PlacedSceneItems, type PlacedSceneItem } from "./inventory/PlacedSceneItems";
import { getItemDefinition, resolveItemRule } from "../items";

// Carga el joystick solo en cliente (ssr: false); la detección de dispositivo
// táctil se realiza dentro del propio componente con window garantizado.
const Joystick = dynamic(() => import("./Joystick"), { ssr: false });

type MovementAction = GameDirection;
type WallResizeHandle = "x+" | "x-" | "z+" | "z-";
type WallToolMode = "manual" | "points";
type WallPointStart = { point: Vector2; resetSignal: number };
type WallPointPreview = { start: Vector2; end: Vector2; resetSignal: number };
type WallInteraction =
  | { mode: "move"; offsetX: number; offsetZ: number }
  | { mode: "resize"; handle: WallResizeHandle }
  | null;

const MOVEMENT_KEYS = new Set(["arrowleft", "arrowright", "arrowup", "arrowdown", "a", "d", "w", "s"]);
const CLICK_ARRIVAL_THRESHOLD = 0.15;
// Angle from horizontal axis above which vertical animation fires (55° = 35° cone around vertical)
const VERTICAL_ANGLE_THRESHOLD = 55 * (Math.PI / 180);
const DEPTH_FAR_Z = -16;
const DEPTH_NEAR_Z = 8;
const SPRITE_MIN_SCALE = 1.4;
const SPRITE_MAX_SCALE = 2.94;
const MIN_WALL_HALF_EXTENT = 0.15;
const PLAYER_BOUND_MARGIN = 1.55;
const BOUNDARY_HIT_COOLDOWN_MS = 4000;
const CAMERA_POSITION: [number, number, number] = [0, 5.4, 25.0];
const CAMERA_FRONT_PLAYABLE_MARGIN = 2.5;
const DEBUG_ROUTE_ENABLED = process.env.NEXT_PUBLIC_ENABLE_DEBUG === "true";

function createInitialInventorySlots(): InventorySlots {
  return Array.from({ length: 9 }, (_, index) => {
    if (index !== 0) return null;
    return {
      id: "gameboy",
      name: "Gameboy",
      spriteUrl: "/assets/gameboy/gameboy.png",
      quantity: 1,
    } as InventoryStack;
  });
}

function removeOneFromSlot(slots: InventorySlots, slotIndex: number): InventorySlots {
  const slot = slots[slotIndex];
  if (!slot) return slots;
  const next = [...slots];
  if (slot.quantity <= 1) {
    next[slotIndex] = null;
  } else {
    next[slotIndex] = { ...slot, quantity: slot.quantity - 1 };
  }
  return next;
}

function addOneToInventory(slots: InventorySlots, stack: Omit<InventoryStack, "quantity">): { slots: InventorySlots; added: boolean } {
  const existingIndex = slots.findIndex((current) => current?.id === stack.id);
  if (existingIndex >= 0) {
    const next = [...slots];
    const existing = next[existingIndex];
    if (!existing) return { slots, added: false };
    next[existingIndex] = { ...existing, quantity: existing.quantity + 1 };
    return { slots: next, added: true };
  }

  const emptyIndex = slots.findIndex((current) => current == null);
  if (emptyIndex < 0) {
    return { slots, added: false };
  }

  const next = [...slots];
  next[emptyIndex] = { ...stack, quantity: 1 };
  return { slots: next, added: true };
}

function getInteractionWorldPosition(interaction: SceneInteraction): [number, number, number] {
  return [
    interaction.position[0],
    interaction.position[1] + interaction.halfSize[1] + 0.175,
    interaction.position[2],
  ];
}

function resolveAction(horizontal: number, vertical: number): MovementAction {
  if (horizontal === 0 && vertical === 0) return "idle";
  const angle = Math.atan2(Math.abs(vertical), Math.abs(horizontal));
  if (angle >= VERTICAL_ANGLE_THRESHOLD) {
    return vertical < 0 ? "north" : "south";
  }
  return horizontal < 0 ? "west" : "east";
}

function getWallAxes(rotationY: number) {
  return {
    axisX: new Vector2(Math.cos(rotationY), -Math.sin(rotationY)),
    axisZ: new Vector2(Math.sin(rotationY), Math.cos(rotationY)),
  };
}

function projectDistance(originX: number, originZ: number, pointX: number, pointZ: number, axis: Vector2) {
  return (pointX - originX) * axis.x + (pointZ - originZ) * axis.y;
}

// ---------------------------------------------------------------------------
// SceneGround — plano de suelo reactivo a la escena activa
// ---------------------------------------------------------------------------

// Shader de tablero de ajedrez: celdas alternando verde semitransparente / negro casi invisible
const checkerVertexShader = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const checkerFragmentShader = /* glsl */`
  varying vec2 vUv;
  uniform float uCells;
  void main() {
    vec2 cell = floor(vUv * uCells);
    float checker = mod(cell.x + cell.y, 2.0);
    // verde para una celda, casi transparente para la otra
    vec3 col = checker > 0.5 ? vec3(0.0, 1.0, 0.25) : vec3(0.0, 0.0, 0.0);
    float alpha = checker > 0.5 ? 0.28 : 0.04;
    gl_FragColor = vec4(col, alpha);
  }
`;

function SceneGround({
  onClickWorld,
  onHoverWorld,
  debug,
}: {
  onClickWorld: (x: number, z: number) => void;
  onHoverWorld?: (x: number, z: number) => void;
  debug: boolean;
}) {
  const ground = useSceneStore((s) => s.scene.ground);
  
  // Calcular dimensiones desde límites
  const width = ground.maxX - ground.minX;
  const depth = ground.maxZ - ground.minZ;
  const centerX = (ground.minX + ground.maxX) / 2;
  const centerZ = (ground.minZ + ground.maxZ) / 2;
  
  const segX = Math.round(width / 2);
  const segZ = Math.round(depth / 2);

  const gy = ground.y + 0.02;
  const t = 0.05;
  const borderWallHalfHeight = 3;
  const borderWallHalfThickness = 0.35;
  const borderWallCenterY = ground.y + borderWallHalfHeight;

  // Celdas totales del checker
  const cells = Math.max(segX, segZ);
  const checkerUniforms = useMemo(() => ({ uCells: { value: cells } }), [cells]);

  return (
    <>
      {/* Malla de física — RigidBody con CuboidCollider explícito */}
      <RigidBody type="fixed" position={[centerX, ground.y, centerZ]}>
        {/* Colisionador: caja con grosor real para solidez */}
        <CuboidCollider args={[width / 2, 0.2, depth / 2]} friction={2.8} restitution={0} />
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          onPointerDown={(e) => {
            e.stopPropagation();
            onClickWorld(e.point.x, e.point.z);
          }}
          onPointerMove={(e) => {
            if (!onHoverWorld) return;
            onHoverWorld(e.point.x, e.point.z);
          }}
        >
          <planeGeometry args={[width, depth]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </RigidBody>

      {/* Paredes invisibles automáticas en bordes del suelo */}
      <RigidBody type="fixed" position={[centerX, borderWallCenterY, ground.minZ - borderWallHalfThickness]}>
        <CuboidCollider args={[width / 2 + borderWallHalfThickness, borderWallHalfHeight, borderWallHalfThickness]} />
      </RigidBody>
      <RigidBody type="fixed" position={[centerX, borderWallCenterY, ground.maxZ + borderWallHalfThickness]}>
        <CuboidCollider args={[width / 2 + borderWallHalfThickness, borderWallHalfHeight, borderWallHalfThickness]} />
      </RigidBody>
      <RigidBody type="fixed" position={[ground.minX - borderWallHalfThickness, borderWallCenterY, centerZ]}>
        <CuboidCollider args={[borderWallHalfThickness, borderWallHalfHeight, depth / 2 + borderWallHalfThickness]} />
      </RigidBody>
      <RigidBody type="fixed" position={[ground.maxX + borderWallHalfThickness, borderWallCenterY, centerZ]}>
        <CuboidCollider args={[borderWallHalfThickness, borderWallHalfHeight, depth / 2 + borderWallHalfThickness]} />
      </RigidBody>

      {/* Visuales de debug */}
      {debug && (
        <>
          {/* Tablero de ajedrez */}
          <mesh position={[centerX, gy, centerZ]} rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
            <planeGeometry args={[width, depth, segX, segZ]} />
            <shaderMaterial
              vertexShader={checkerVertexShader}
              fragmentShader={checkerFragmentShader}
              uniforms={checkerUniforms}
              transparent
              depthWrite={false}
            />
          </mesh>
          {/* Grid de líneas */}
          <mesh position={[centerX, gy + 0.001, centerZ]} rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
            <planeGeometry args={[width, depth, segX, segZ]} />
            <meshBasicMaterial color="#00ff41" wireframe transparent opacity={0.45} depthWrite={false} />
          </mesh>

          {/* ── Borde del suelo (4 cajas finas) ───────────────────────── */}
          <mesh position={[centerX, gy, ground.minZ]}><boxGeometry args={[width + t, t, t]} /><meshBasicMaterial color="#00ff88" /></mesh>
          <mesh position={[centerX, gy, ground.maxZ]}><boxGeometry args={[width + t, t, t]} /><meshBasicMaterial color="#00ff88" /></mesh>
          <mesh position={[ground.minX, gy, centerZ]}><boxGeometry args={[t, t, depth]} /><meshBasicMaterial color="#00ff88" /></mesh>
          <mesh position={[ground.maxX, gy, centerZ]}><boxGeometry args={[t, t, depth]} /><meshBasicMaterial color="#00ff88" /></mesh>

          {/* ── Postes verticales en las 4 esquinas ───────────────────── */}
          <mesh position={[ground.minX, ground.y + 1.25, ground.minZ]}><boxGeometry args={[t, 2.5, t]} /><meshBasicMaterial color="#ffff00" /></mesh>
          <mesh position={[ground.maxX, ground.y + 1.25, ground.minZ]}><boxGeometry args={[t, 2.5, t]} /><meshBasicMaterial color="#ffff00" /></mesh>
          <mesh position={[ground.minX, ground.y + 1.25, ground.maxZ]}><boxGeometry args={[t, 2.5, t]} /><meshBasicMaterial color="#ffff00" /></mesh>
          <mesh position={[ground.maxX, ground.y + 1.25, ground.maxZ]}><boxGeometry args={[t, 2.5, t]} /><meshBasicMaterial color="#ffff00" /></mesh>

          {/* ── Marcadores de rango de escala del jugador ─────────────── */}
          <mesh position={[centerX, gy, DEPTH_NEAR_Z]}><boxGeometry args={[width, t, t]} /><meshBasicMaterial color="#ff8800" /></mesh>
          <mesh position={[centerX, gy, DEPTH_FAR_Z]}><boxGeometry args={[width, t, t]} /><meshBasicMaterial color="#ff4400" /></mesh>
        </>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// SceneWalls — colisiones fijas de la escena activa
// ---------------------------------------------------------------------------
function SceneWalls({
  debug,
  onStartWallMove,
  onStartWallResize,
}: {
  debug: boolean;
  onStartWallMove: (index: number, pointX: number, pointZ: number) => void;
  onStartWallResize: (index: number, handle: WallResizeHandle) => void;
}) {
  const walls = useSceneStore((s) => s.scene.walls);
  const selectedWallIndex = useSceneStore((s) => s.selectedWallIndex);
  const selectWall = useSceneStore((s) => s.selectWall);
  return (
    <>
      {walls.map((wall: SceneWall, i: number) => (
        <RigidBody key={i} type="fixed" position={wall.position} rotation={[0, wall.rotationY ?? 0, 0]}>
          <CuboidCollider args={wall.halfSize} />
          {debug && (
            <>
              <mesh
                onPointerDown={(e) => {
                  e.stopPropagation();
                  selectWall(i);
                  onStartWallMove(i, e.point.x, e.point.z);
                }}
              >
                <boxGeometry args={[wall.halfSize[0] * 2, wall.halfSize[1] * 2, wall.halfSize[2] * 2]} />
                <meshBasicMaterial color={selectedWallIndex === i ? "#ffff00" : "#ff4400"} wireframe />
              </mesh>

              {selectedWallIndex === i && (
                <>
                  <mesh
                    position={[wall.halfSize[0], 0, 0]}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      onStartWallResize(i, "x+");
                    }}
                  >
                    <boxGeometry args={[0.35, 0.35, 0.35]} />
                    <meshBasicMaterial color="#00d8ff" />
                  </mesh>
                  <mesh
                    position={[-wall.halfSize[0], 0, 0]}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      onStartWallResize(i, "x-");
                    }}
                  >
                    <boxGeometry args={[0.35, 0.35, 0.35]} />
                    <meshBasicMaterial color="#00d8ff" />
                  </mesh>
                  <mesh
                    position={[0, 0, wall.halfSize[2]]}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      onStartWallResize(i, "z+");
                    }}
                  >
                    <boxGeometry args={[0.35, 0.35, 0.35]} />
                    <meshBasicMaterial color="#ff00aa" />
                  </mesh>
                  <mesh
                    position={[0, 0, -wall.halfSize[2]]}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      onStartWallResize(i, "z-");
                    }}
                  >
                    <boxGeometry args={[0.35, 0.35, 0.35]} />
                    <meshBasicMaterial color="#ff00aa" />
                  </mesh>
                </>
              )}
            </>
          )}
        </RigidBody>
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// CameraController — sigue al jugador en X con lerp y clamping por ground
// Obtiene camera y size del estado del frame para no violar la regla
// react-hooks/immutability; usa setX() en lugar de asignación directa.
// ---------------------------------------------------------------------------
function CameraController() {
  useFrame(({ camera, size }) => {
    const { playerPosition, scene: { ground } } = useSceneStore.getState();
    const zoom = (camera as ThreeOrthoCamera).zoom;
    const halfViewW = size.width / (2 * zoom);
    const groundCenterX = (ground.minX + ground.maxX) / 2;
    const minCamX = ground.minX + halfViewW;
    const maxCamX = ground.maxX - halfViewW;
    const targetX = playerPosition[0];
    const clampedX =
      minCamX <= maxCamX
        ? MathUtils.clamp(targetX, minCamX, maxCamX)
        : groundCenterX;
    camera.position.setX(MathUtils.lerp(camera.position.x, clampedX, 0.1));
  });

  return null;
}

// Ajusta el zoom de la cámara ortográfica para que la altura visible
// en unidades mundo coincida con el alto deseado de la escena.
function CameraFitHeight({ desiredWorldHeight = 19.28 }: { desiredWorldHeight?: number }) {
  useFrame(({ camera, size }) => {
    const cam = camera as ThreeOrthoCamera;
    if (!cam) return;

    const pixelHeight = Math.max(1, size.height || (typeof window !== "undefined" ? window.innerHeight : 800));
    const targetZoom = pixelHeight / desiredWorldHeight;

    if (Math.abs(cam.zoom - targetZoom) <= 0.0001) return;
    cam.zoom = targetZoom;
    cam.updateProjectionMatrix();
  });

  return null;
}

// ---------------------------------------------------------------------------
// BackgroundPlane — plano con textura anclado a la cámara
// ---------------------------------------------------------------------------
function BackgroundPlane({ url }: { url: string | null | undefined }) {
  const [texture, setTexture] = useState<import("three").Texture | null>(null);
  const meshRef = useRef<Mesh | null>(null);
  const ground = useSceneStore((s) => s.scene.ground);

  useEffect(() => {
    if (!url) return;

    const loader = new TextureLoader();
    let mounted = true;
    let loadedTexture: import("three").Texture | null = null;

    loader.load(
      url,
      (tex) => {
        if (!mounted) {
          tex.dispose();
          return;
        }

        loadedTexture = tex;
        setTexture(tex);
      },
      undefined,
      (err) => {
        console.warn("BackgroundPlane: texture load error", err);
      },
    );

    return () => {
      mounted = false;
      if (loadedTexture) {
        loadedTexture.dispose();
      }
    };
  }, [url]);

  // calcular tamaño básico a partir del aspect de la imagen si está disponible
  let aspect = 16 / 9;
  const textureImage = texture?.image as { width?: number; height?: number } | undefined;
  if (textureImage?.width && textureImage?.height) {
    aspect = textureImage.width / textureImage.height;
  }

  const height = 19.28;
  const groundCenterX = (ground.minX + ground.maxX) / 2;
  // Tamaño pixel-perfecto: zoom fijo = 56 → 1 px = 1/56 unidades mundo.
  // NO estirar: los muros están calibrados a esta escala exacta.
  const width = height * aspect;

  useFrame(({ camera }) => {
    if (!meshRef.current) return;
    const dir = new Vector3();
    camera.getWorldDirection(dir);
    const distance = 10;
    // Seguir cámara en Y y Z para mantener la profundidad visual correcta,
    // pero fijar X al centro del mundo: así el fondo se desplaza en bloque
    // con los elementos del juego cuando la cámara panea horizontalmente.
    meshRef.current.position
      .copy(camera.position)
      .addScaledVector(dir, distance);
    meshRef.current.position.x = groundCenterX;
    meshRef.current.quaternion.copy(camera.quaternion);
  });

  if (!url) return null;
  if (!texture) return null;

  return (
    <mesh ref={meshRef} frustumCulled={false} renderOrder={-100}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} side={DoubleSide} depthTest={false} depthWrite={false} />
    </mesh>
  );
}

function CollisionSphere() {
  const globeTexture = useLoader(TextureLoader, "/globe.svg");
  const groundY = useSceneStore((s) => s.scene.ground.y);
  // Posicionar sobre el suelo: groundY + collider-height + radio de la esfera
  const posY = groundY + 0.1 + 0.5;

  return (
    <RigidBody
      type="dynamic"
      colliders={false}
      position={[-1.09, posY, 13.01]}
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

function GameSceneContents({
  selectedCharacter,
  onSpriteReady,
  debug,
  showDebugGround,
  showDebugWalls,
  wallToolMode,
  wallPointResetSignal,
  speechText,
  speechVisible,
  speechTrigger,
  speechCharsPerSecond,
  onBoundaryHit,
  onSpeechDismiss,
}: {
  selectedCharacter: GameCharacterName;
  onSpriteReady: (spriteRef: React.RefObject<DavidSpriteHandle | null>) => void;
  debug: boolean;
  showDebugGround: boolean;
  showDebugWalls: boolean;
  wallToolMode: WallToolMode;
  wallPointResetSignal: number;
  speechText: string;
  speechVisible: boolean;
  speechTrigger: number;
  speechCharsPerSecond: number;
  onBoundaryHit: (phrase: string) => void;
  onSpeechDismiss: () => void;
}) {
  return (
    <GameTouchSprite
      activeCharacter={selectedCharacter}
      onSpriteReady={onSpriteReady}
      debug={debug}
      showDebugGround={showDebugGround}
      showDebugWalls={showDebugWalls}
      wallToolMode={wallToolMode}
      wallPointResetSignal={wallPointResetSignal}
      speechText={speechText}
      speechVisible={speechVisible}
      speechTrigger={speechTrigger}
      speechCharsPerSecond={speechCharsPerSecond}
      onBoundaryHit={onBoundaryHit}
      onSpeechDismiss={onSpeechDismiss}
    />
  );
}

function GameTouchSprite({
  activeCharacter,
  onSpriteReady,
  debug,
  showDebugGround,
  showDebugWalls,
  wallToolMode,
  wallPointResetSignal,
  speechText,
  speechVisible,
  speechTrigger,
  speechCharsPerSecond,
  onBoundaryHit,
  onSpeechDismiss,
}: {
  activeCharacter: GameCharacterName;
  onSpriteReady: (spriteRef: React.RefObject<DavidSpriteHandle | null>) => void;
  debug: boolean;
  showDebugGround: boolean;
  showDebugWalls: boolean;
  wallToolMode: WallToolMode;
  wallPointResetSignal: number;
  speechText: string;
  speechVisible: boolean;
  speechTrigger: number;
  speechCharsPerSecond: number;
  onBoundaryHit: (phrase: string) => void;
  onSpeechDismiss: () => void;
}) {
  const spriteRef = useRef<DavidSpriteHandle | null>(null);
  const meshRef = useRef<Mesh>(null);
  const characterBodyRef = useRef<RapierRigidBody>(null);
  const keysPressedRef = useRef(new Set<string>());
  const clickTargetRef = useRef<Vector2 | null>(null);
  const currentActionRef = useRef<MovementAction>("idle");
  const lastLoggedPositionRef = useRef<{ x: number; y: number; z: number } | null>(null);
  const [action, setAction] = useState<MovementAction>("idle");
  const [wallPointPreviewState, setWallPointPreviewState] = useState<WallPointPreview | null>(null);
  const wallInteractionRef = useRef<WallInteraction>(null);
  const wallPointStartRef = useRef<WallPointStart | null>(null);
  const lastBoundaryHitRef = useRef<number>(0);

  const playerSpawn = useSceneStore((s) => s.scene.playerSpawn);
  const sceneId = useSceneStore((s) => s.sceneId);
  const ground = useSceneStore((s) => s.scene.ground);
  const setPlayerPosition = useSceneStore((s) => s.setPlayerPosition);
  const addWallWithData = useSceneStore((s) => s.addWallWithData);
  const respawnSignal = useSceneStore((s) => s.respawnSignal);

  const clampToPlayableArea = useCallback((x: number, z: number) => {
    const minX = ground.minX + PLAYER_BOUND_MARGIN;
    const maxX = ground.maxX - PLAYER_BOUND_MARGIN;
    const minZ = ground.minZ + PLAYER_BOUND_MARGIN;
    const maxZByGround = ground.maxZ - PLAYER_BOUND_MARGIN;
    const maxZByCamera = CAMERA_POSITION[2] - CAMERA_FRONT_PLAYABLE_MARGIN;
    const maxZ = Math.min(maxZByGround, maxZByCamera);

    const clampMinX = Math.min(minX, maxX);
    const clampMaxX = Math.max(minX, maxX);
    const clampMinZ = Math.min(minZ, maxZ);
    const clampMaxZ = Math.max(minZ, maxZ);

    return {
      x: MathUtils.clamp(x, clampMinX, clampMaxX),
      z: MathUtils.clamp(z, clampMinZ, clampMaxZ),
    };
  }, [ground.maxX, ground.maxZ, ground.minX, ground.minZ]);

  const handleClickWorld = useCallback((x: number, z: number) => {
    if (wallInteractionRef.current) return;

    if (debug && wallToolMode === "points") {
      const clamped = clampToPlayableArea(x, z);
      const clickedPoint = new Vector2(clamped.x, clamped.z);
      const startPoint =
        wallPointStartRef.current?.resetSignal === wallPointResetSignal
          ? wallPointStartRef.current.point
          : null;

      if (!startPoint) {
        wallPointStartRef.current = { point: clickedPoint, resetSignal: wallPointResetSignal };
        setWallPointPreviewState({ start: clickedPoint, end: clickedPoint, resetSignal: wallPointResetSignal });
        return;
      }

      const dx = clickedPoint.x - startPoint.x;
      const dz = clickedPoint.y - startPoint.y;
      const length = Math.sqrt(dx * dx + dz * dz);

      if (length < MIN_WALL_HALF_EXTENT * 2) {
        setWallPointPreviewState({ start: startPoint, end: clickedPoint, resetSignal: wallPointResetSignal });
        return;
      }

      const halfHeight = 2;
      const halfThickness = 0.25;
      const centerX = (startPoint.x + clickedPoint.x) / 2;
      const centerZ = (startPoint.y + clickedPoint.y) / 2;
      const rotationY = -Math.atan2(dz, dx);

      addWallWithData({
        position: [centerX, ground.y + halfHeight, centerZ],
        rotationY,
        halfSize: [Math.max(MIN_WALL_HALF_EXTENT, length / 2), halfHeight, halfThickness],
      });

      // Encadenar segmentos: el segundo punto pasa a ser el nuevo punto inicial.
      wallPointStartRef.current = { point: clickedPoint, resetSignal: wallPointResetSignal };
      setWallPointPreviewState({ start: clickedPoint, end: clickedPoint, resetSignal: wallPointResetSignal });
      return;
    }

    const clamped = clampToPlayableArea(x, z);
    clickTargetRef.current = new Vector2(clamped.x, clamped.z);
  }, [addWallWithData, clampToPlayableArea, debug, ground.y, wallPointResetSignal, wallToolMode]);

  const stopWallInteraction = useCallback(() => {
    wallInteractionRef.current = null;
  }, []);

  const handleStartWallMove = useCallback((index: number, pointX: number, pointZ: number) => {
    const wall = useSceneStore.getState().scene.walls[index];
    if (!wall) return;
    wallInteractionRef.current = {
      mode: "move",
      offsetX: pointX - wall.position[0],
      offsetZ: pointZ - wall.position[2],
    };
  }, []);

  const handleStartWallResize = useCallback((index: number, handle: WallResizeHandle) => {
    useSceneStore.getState().selectWall(index);
    wallInteractionRef.current = {
      mode: "resize",
      handle,
    };
  }, []);

  const handleHoverWorld = useCallback((x: number, z: number) => {
    const interaction = wallInteractionRef.current;
    if (!interaction) return;

    const state = useSceneStore.getState();
    const selectedWallIndex = state.selectedWallIndex;
    if (selectedWallIndex == null) return;

    const wall = state.scene.walls[selectedWallIndex];
    if (!wall) return;

    if (interaction.mode === "move") {
      state.updateSelectedWall((currentWall) => ({
        ...currentWall,
        position: [x - interaction.offsetX, state.scene.ground.y + currentWall.halfSize[1], z - interaction.offsetZ],
      }));
      return;
    }

    const rotationY = wall.rotationY ?? 0;
    const { axisX, axisZ } = getWallAxes(rotationY);
    const centerX = wall.position[0];
    const centerZ = wall.position[2];

    state.updateSelectedWall((currentWall) => {
      const currentRotation = currentWall.rotationY ?? 0;
      const axes = getWallAxes(currentRotation);
      let nextPosition: [number, number, number] = [...currentWall.position] as [number, number, number];
      const nextHalfSize: [number, number, number] = [...currentWall.halfSize] as [number, number, number];

      if (interaction.handle === "x+") {
        const anchorX = centerX - axisX.x * wall.halfSize[0];
        const anchorZ = centerZ - axisX.y * wall.halfSize[0];
        const extent = Math.max(MIN_WALL_HALF_EXTENT * 2, projectDistance(anchorX, anchorZ, x, z, axes.axisX));
        const half = extent / 2;
        nextHalfSize[0] = half;
        nextPosition = [anchorX + axes.axisX.x * half, currentWall.position[1], anchorZ + axes.axisX.y * half];
      } else if (interaction.handle === "x-") {
        const negativeAxisX = new Vector2(-axes.axisX.x, -axes.axisX.y);
        const anchorX = centerX + axes.axisX.x * wall.halfSize[0];
        const anchorZ = centerZ + axes.axisX.y * wall.halfSize[0];
        const extent = Math.max(MIN_WALL_HALF_EXTENT * 2, projectDistance(anchorX, anchorZ, x, z, negativeAxisX));
        const half = extent / 2;
        nextHalfSize[0] = half;
        nextPosition = [anchorX + negativeAxisX.x * half, currentWall.position[1], anchorZ + negativeAxisX.y * half];
      } else if (interaction.handle === "z+") {
        const anchorX = centerX - axisZ.x * wall.halfSize[2];
        const anchorZ = centerZ - axisZ.y * wall.halfSize[2];
        const extent = Math.max(MIN_WALL_HALF_EXTENT * 2, projectDistance(anchorX, anchorZ, x, z, axes.axisZ));
        const half = extent / 2;
        nextHalfSize[2] = half;
        nextPosition = [anchorX + axes.axisZ.x * half, currentWall.position[1], anchorZ + axes.axisZ.y * half];
      } else if (interaction.handle === "z-") {
        const negativeAxisZ = new Vector2(-axes.axisZ.x, -axes.axisZ.y);
        const anchorX = centerX + axes.axisZ.x * wall.halfSize[2];
        const anchorZ = centerZ + axes.axisZ.y * wall.halfSize[2];
        const extent = Math.max(MIN_WALL_HALF_EXTENT * 2, projectDistance(anchorX, anchorZ, x, z, negativeAxisZ));
        const half = extent / 2;
        nextHalfSize[2] = half;
        nextPosition = [anchorX + negativeAxisZ.x * half, currentWall.position[1], anchorZ + negativeAxisZ.y * half];
      }

      return {
        ...currentWall,
        position: nextPosition,
        halfSize: nextHalfSize,
      };
    });
  }, []);

  const handleHoverPointWallTool = useCallback((x: number, z: number) => {
    if (!debug || wallToolMode !== "points") return;
    const startPoint =
      wallPointStartRef.current?.resetSignal === wallPointResetSignal
        ? wallPointStartRef.current.point
        : null;
    if (!startPoint) return;
    const clamped = clampToPlayableArea(x, z);
    setWallPointPreviewState({
      start: startPoint,
      end: new Vector2(clamped.x, clamped.z),
      resetSignal: wallPointResetSignal,
    });
  }, [clampToPlayableArea, debug, wallPointResetSignal, wallToolMode]);

  const characterClips = useMemo(
    () => GAME_CHARACTER_SPRITES[activeCharacter],
    [activeCharacter],
  );

  // Reposicionar personaje cuando cambia la escena
  useEffect(() => {
    const body = characterBodyRef.current;
    if (!body) return;
    const spawn = useSceneStore.getState().scene.playerSpawn;
    body.setTranslation({ x: spawn[0], y: spawn[1], z: spawn[2] }, true);
    body.setLinvel({ x: 0, y: 0, z: 0 }, true);
    clickTargetRef.current = null;
    keysPressedRef.current.clear();
    setPlayerPosition([spawn[0], spawn[1], spawn[2]]);
  }, [sceneId, respawnSignal, setPlayerPosition]);

  useEffect(() => {
    onSpriteReady(spriteRef);
  }, [onSpriteReady]);

  useEffect(() => {
    window.addEventListener("pointerup", stopWallInteraction);
    return () => {
      window.removeEventListener("pointerup", stopWallInteraction);
    };
  }, [stopWallInteraction]);

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

    // Prioridad: joystick táctil > teclado > click-to-move
    const joystick = useMobileInputStore.getState();
    if (joystick.active) {
      horizontal = joystick.x;
      vertical = joystick.z;
      clickTargetRef.current = null;
    } else if (anyKeyPressed) {
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

    const speed = 7;
    const currentVelocity = body.linvel();
    // Movimiento vertical (Z) 3x más rápido que horizontal (X)
    const verticalSpeed = vertical !== 0 ? speed * 3 : speed;
    const targetVelocity = {
      x: horizontal * speed,
      y: currentVelocity.y,
      z: vertical * verticalSpeed,
    };

    if (horizontal === 0 && vertical === 0) {
      body.setLinvel({ x: 0, y: currentVelocity.y, z: 0 }, true);
    } else {
      body.setLinvel(targetVelocity, true);
    }

    const currentPosition = body.translation();
    const clampedPosition = clampToPlayableArea(currentPosition.x, currentPosition.z);
    const wasClampedX = clampedPosition.x !== currentPosition.x;
    const wasClampedZ = clampedPosition.z !== currentPosition.z;
    if (wasClampedX || wasClampedZ) {
      body.setTranslation({ x: clampedPosition.x, y: currentPosition.y, z: clampedPosition.z }, true);
      const vel = body.linvel();
      // Solo cancelar la componente de velocidad que empuja HACIA el límite;
      // si el jugador se mueve HACIA ADENTRO del área jugable, conservar esa velocidad.
      body.setLinvel(
        {
          x: wasClampedX
            ? (currentPosition.x > clampedPosition.x ? Math.min(0, vel.x) : Math.max(0, vel.x))
            : vel.x,
          y: vel.y,
          z: wasClampedZ
            ? (currentPosition.z > clampedPosition.z ? Math.min(0, vel.z) : Math.max(0, vel.z))
            : vel.z,
        },
        true,
      );

      const now = performance.now();
      if (now - lastBoundaryHitRef.current > BOUNDARY_HIT_COOLDOWN_MS) {
        lastBoundaryHitRef.current = now;
        const phrase = getRandomPhrase("boundaryHit");
        onBoundaryHit(phrase);
      }
    }

    const safePosition = body.translation();
    const depthFactor = MathUtils.clamp(
      MathUtils.inverseLerp(DEPTH_FAR_Z, DEPTH_NEAR_Z, safePosition.z),
      0,
      1,
    );

    const roundedX = Number(safePosition.x.toFixed(2));
    const roundedY = Number(safePosition.y.toFixed(2));
    const roundedZ = Number(safePosition.z.toFixed(2));
    const lastLogged = lastLoggedPositionRef.current;
    if (!lastLogged || lastLogged.x !== roundedX || lastLogged.y !== roundedY || lastLogged.z !== roundedZ) {
      console.log(`[player] x=${roundedX}, y=${roundedY}, z=${roundedZ}`);
      lastLoggedPositionRef.current = { x: roundedX, y: roundedY, z: roundedZ };
      setPlayerPosition([roundedX, roundedY, roundedZ]);
    }

    const spriteScale = MathUtils.lerp(SPRITE_MIN_SCALE, SPRITE_MAX_SCALE, depthFactor);
    if (meshRef.current) {
      const flipX = action === "west" ? -1 : 1;
      meshRef.current.scale.set(spriteScale * flipX, spriteScale, 1);
      // El centro del collider queda en el medio del cuerpo; el sprite debe subir
      // exactamente su semialtura menos la semialtura del collider para apoyar los pies.
      meshRef.current.position.y = spriteScale - 0.95;
    }
  });

  const wallPointPreview =
    debug && wallToolMode === "points" && wallPointPreviewState?.resetSignal === wallPointResetSignal
      ? wallPointPreviewState
      : null;

  const pointPreviewLength = wallPointPreview
    ? Math.sqrt(
      (wallPointPreview.end.x - wallPointPreview.start.x) ** 2
      + (wallPointPreview.end.y - wallPointPreview.start.y) ** 2,
    )
    : 0;
  const pointPreviewMidX = wallPointPreview ? (wallPointPreview.start.x + wallPointPreview.end.x) / 2 : 0;
  const pointPreviewMidZ = wallPointPreview ? (wallPointPreview.start.y + wallPointPreview.end.y) / 2 : 0;
  const pointPreviewRotationY = wallPointPreview
    ? -Math.atan2(wallPointPreview.end.y - wallPointPreview.start.y, wallPointPreview.end.x - wallPointPreview.start.x)
    : 0;

  return (
    <>
      <SceneGround
        onClickWorld={handleClickWorld}
        onHoverWorld={
          debug
            ? (x, z) => {
              handleHoverWorld(x, z);
              handleHoverPointWallTool(x, z);
            }
            : undefined
        }
        debug={debug && showDebugGround}
      />
      <SceneWalls debug={debug && showDebugWalls} onStartWallMove={handleStartWallMove} onStartWallResize={handleStartWallResize} />
      {debug && wallToolMode === "points" && wallPointPreview && (
        <>
          <mesh position={[wallPointPreview.start.x, ground.y + 0.12, wallPointPreview.start.y]}>
            <boxGeometry args={[0.22, 0.22, 0.22]} />
            <meshBasicMaterial color="#00ff41" />
          </mesh>
          <mesh position={[wallPointPreview.end.x, ground.y + 0.12, wallPointPreview.end.y]}>
            <boxGeometry args={[0.2, 0.2, 0.2]} />
            <meshBasicMaterial color="#00d8ff" />
          </mesh>
          {pointPreviewLength >= 0.01 && (
            <mesh position={[pointPreviewMidX, ground.y + 0.1, pointPreviewMidZ]} rotation={[0, pointPreviewRotationY, 0]}>
              <boxGeometry args={[pointPreviewLength, 0.08, 0.08]} />
              <meshBasicMaterial color="#00d8ff" transparent opacity={0.85} />
            </mesh>
          )}
        </>
      )}
      <CollisionSphere />
      <RigidBody
        ref={characterBodyRef}
        type="dynamic"
        colliders={false}
        position={playerSpawn}
        gravityScale={1.2}
        linearDamping={7}
        angularDamping={20}
        ccd
        enabledRotations={[false, false, false]}
      >
        <CuboidCollider args={[0.55, 0.95, 0.18]} friction={2.2} restitution={0} />
        <DavidSprite
          ref={spriteRef}
          meshRef={meshRef}
          animation={characterClips[action]}
          scale={[SPRITE_MIN_SCALE, SPRITE_MIN_SCALE, 1]}
          isPaused={false}
        />
        <SpeechBubble
          key={speechTrigger}
          text={speechText}
          visible={speechVisible}
          trigger={speechTrigger}
          charsPerSecond={speechCharsPerSecond}
          onDismiss={onSpeechDismiss}
        />
      </RigidBody>
    </>
  );
}

function DebugNumberInput({
  label,
  value,
  step = 0.1,
  onChange,
}: {
  label: string;
  value: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  return (
    <label style={{ display: "grid", gap: "4px", fontSize: "11px", textTransform: "uppercase" }}>
      <span>{label}</span>
      <input
        type="number"
        value={Number.isFinite(value) ? value : 0}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          width: "100%",
          borderRadius: "2px",
          border: "2px solid #00ff41",
          background: "rgb(8 12 32 / 90%)",
          color: "#00ff41",
          padding: "0.5rem 0.6rem",
          fontSize: "12px",
          fontFamily: "var(--font-pixel), monospace",
          letterSpacing: "1px",
          outline: "none",
          cursor: "auto",
        }}
      />
    </label>
  );
}

function DebugButton({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        borderRadius: "2px",
        border: "2px solid #00ff41",
        background: disabled ? "rgb(8 12 32 / 40%)" : "rgb(8 12 32 / 90%)",
        color: disabled ? "rgb(0 255 65 / 45%)" : "#00ff41",
        padding: "0.55rem 0.7rem",
        fontSize: "11px",
        fontFamily: "var(--font-pixel), monospace",
        letterSpacing: "1px",
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {label}
    </button>
  );
}

function WallEditorPanel({
  wallToolMode,
  setWallToolMode,
  onResetPointTool,
}: {
  wallToolMode: WallToolMode;
  setWallToolMode: (mode: WallToolMode) => void;
  onResetPointTool: () => void;
}) {
  const sceneId = useSceneStore((s) => s.sceneId);
  const walls = useSceneStore((s) => s.scene.walls);
  const groundY = useSceneStore((s) => s.scene.ground.y);
  const playerPosition = useSceneStore((s) => s.playerPosition);
  const selectedWallIndex = useSceneStore((s) => s.selectedWallIndex);
  const selectWall = useSceneStore((s) => s.selectWall);
  const addWall = useSceneStore((s) => s.addWall);
  const removeSelectedWall = useSceneStore((s) => s.removeSelectedWall);
  const updateSelectedWall = useSceneStore((s) => s.updateSelectedWall);
  const [copyLabel, setCopyLabel] = useState("Copiar JSON");

  const selectedWall = selectedWallIndex == null ? null : walls[selectedWallIndex] ?? null;
  const wallOptions = useMemo(
    () => walls.map((_, index) => ({ label: `Muro ${index + 1}`, value: String(index) })),
    [walls],
  );
  const wallsJson = useMemo(() => JSON.stringify(walls, null, 2), [walls]);

  const setWallPosition = useCallback((axis: 0 | 1 | 2, value: number) => {
    updateSelectedWall((wall) => {
      const position = [...wall.position] as [number, number, number];
      position[axis] = value;
      return { ...wall, position };
    });
  }, [updateSelectedWall]);

  const setWallHalfSize = useCallback((axis: 0 | 1 | 2, value: number) => {
    updateSelectedWall((wall) => {
      const halfSize = [...wall.halfSize] as [number, number, number];
      halfSize[axis] = Math.max(0.05, value);
      return { ...wall, halfSize };
    });
  }, [updateSelectedWall]);

  const setWallRotationDeg = useCallback((value: number) => {
    updateSelectedWall((wall) => ({
      ...wall,
      rotationY: (value * Math.PI) / 180,
    }));
  }, [updateSelectedWall]);

  const moveWallToPlayer = useCallback(() => {
    updateSelectedWall((wall) => ({
      ...wall,
      position: [playerPosition[0], groundY + wall.halfSize[1], playerPosition[2]],
    }));
  }, [groundY, playerPosition, updateSelectedWall]);

  const handleCopyJson = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(wallsJson);
      setCopyLabel("Copiado");
      window.setTimeout(() => setCopyLabel("Copiar JSON"), 1200);
    } catch {
      setCopyLabel("Sin portapapeles");
      window.setTimeout(() => setCopyLabel("Copiar JSON"), 1200);
    }
  }, [wallsJson]);

  return (
    <div style={{ display: "grid", gap: "10px", paddingTop: "6px", borderTop: "2px solid rgb(0 255 65 / 30%)" }}>
      <strong style={{ fontSize: "12px", lineHeight: "1.4" }}>Editor de muros ({sceneId})</strong>
      <span style={{ fontSize: "10px", lineHeight: "1.5", opacity: 0.85 }}>
        Edici\u00f3n en vivo solo en navegador. Usa copiar JSON para pegar el resultado en scenes.ts.
      </span>
      <span style={{ fontSize: "10px", lineHeight: "1.5", opacity: 0.85 }}>
        Arrastra el wireframe amarillo para mover. Los cubos azules cambian el largo y los rosas el grosor.
      </span>

      <PixelSelect
        label="Herramienta"
        value={wallToolMode}
        onChange={(value) => setWallToolMode(value as WallToolMode)}
        options={[
          { label: "Manual", value: "manual" },
          { label: "Por puntos", value: "points" },
        ]}
      />

      {wallToolMode === "points" && (
        <>
          <span style={{ fontSize: "10px", lineHeight: "1.5", opacity: 0.85 }}>
            Click 1: punto inicial. Click 2: punto final y se crea el muro. El punto final queda como nuevo inicio.
          </span>
          <DebugButton label="Cancelar trazo" onClick={onResetPointTool} />
        </>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
        <DebugButton label="Nuevo muro" onClick={addWall} />
        <DebugButton label="Borrar muro" onClick={removeSelectedWall} disabled={selectedWall == null} />
      </div>

      {walls.length > 0 && (
        <PixelSelect
          label="Muro seleccionado"
          value={selectedWallIndex == null ? "0" : String(selectedWallIndex)}
          onChange={(value) => selectWall(Number(value))}
          options={wallOptions}
        />
      )}

      {selectedWall && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
            <DebugNumberInput label="Pos X" value={selectedWall.position[0]} onChange={(value) => setWallPosition(0, value)} />
            <DebugNumberInput label="Pos Y" value={selectedWall.position[1]} onChange={(value) => setWallPosition(1, value)} />
            <DebugNumberInput label="Pos Z" value={selectedWall.position[2]} onChange={(value) => setWallPosition(2, value)} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
            <DebugNumberInput label="Half X" value={selectedWall.halfSize[0]} onChange={(value) => setWallHalfSize(0, value)} />
            <DebugNumberInput label="Half Y" value={selectedWall.halfSize[1]} onChange={(value) => setWallHalfSize(1, value)} />
            <DebugNumberInput label="Half Z" value={selectedWall.halfSize[2]} onChange={(value) => setWallHalfSize(2, value)} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            <DebugNumberInput
              label="Rot Y deg"
              value={MathUtils.radToDeg(selectedWall.rotationY ?? 0)}
              step={1}
              onChange={setWallRotationDeg}
            />
            <div style={{ display: "grid", alignItems: "end" }}>
              <DebugButton label="Mover al jugador" onClick={moveWallToPlayer} />
            </div>
          </div>
        </>
      )}

      <textarea
        readOnly
        value={wallsJson}
        style={{
          width: "100%",
          minHeight: "120px",
          borderRadius: "2px",
          border: "2px solid #00ff41",
          background: "rgb(8 12 32 / 90%)",
          color: "#00ff41",
          padding: "0.6rem",
          fontSize: "11px",
          fontFamily: "var(--font-pixel), monospace",
          letterSpacing: "0.5px",
          resize: "vertical",
          cursor: "auto",
        }}
      />

      <DebugButton label={copyLabel} onClick={() => { void handleCopyJson(); }} />
    </div>
  );
}

function GroundEditorPanel() {
  const sceneId = useSceneStore((s) => s.sceneId);
  const ground = useSceneStore((s) => s.scene.ground);
  const updateGround = useSceneStore((s) => s.updateGround);
  const [copyLabel, setCopyLabel] = useState("Copiar JSON suelo");

  const setGroundValue = useCallback((key: keyof typeof ground, value: number) => {
    updateGround((currentGround) => {
      const nextGround = { ...currentGround, [key]: value };

      // Mantener límites válidos
      if (nextGround.minX >= nextGround.maxX) {
        if (key === "minX") nextGround.minX = nextGround.maxX - 0.1;
        if (key === "maxX") nextGround.maxX = nextGround.minX + 0.1;
      }
      if (nextGround.minZ >= nextGround.maxZ) {
        if (key === "minZ") nextGround.minZ = nextGround.maxZ - 0.1;
        if (key === "maxZ") nextGround.maxZ = nextGround.minZ + 0.1;
      }

      return nextGround;
    });
  }, [updateGround]);

  const groundJson = useMemo(() => JSON.stringify(ground, null, 2), [ground]);

  const handleCopyJson = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(groundJson);
      setCopyLabel("Copiado");
      window.setTimeout(() => setCopyLabel("Copiar JSON suelo"), 1200);
    } catch {
      setCopyLabel("Sin portapapeles");
      window.setTimeout(() => setCopyLabel("Copiar JSON suelo"), 1200);
    }
  }, [groundJson]);

  const width = (ground.maxX - ground.minX).toFixed(2);
  const depth = (ground.maxZ - ground.minZ).toFixed(2);

  return (
    <div style={{ display: "grid", gap: "10px", paddingTop: "6px", borderTop: "2px solid rgb(0 255 65 / 30%)" }}>
      <strong style={{ fontSize: "12px", lineHeight: "1.4" }}>Editor de suelo ({sceneId})</strong>
      <span style={{ fontSize: "10px", lineHeight: "1.5", opacity: 0.85 }}>
        Cambios en vivo para ajustar el plano. Incluye límites y altura Y.
      </span>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px" }}>
        <DebugNumberInput label="minX" value={ground.minX} onChange={(value) => setGroundValue("minX", value)} />
        <DebugNumberInput label="maxX" value={ground.maxX} onChange={(value) => setGroundValue("maxX", value)} />
        <DebugNumberInput label="minZ" value={ground.minZ} onChange={(value) => setGroundValue("minZ", value)} />
        <DebugNumberInput label="maxZ" value={ground.maxZ} onChange={(value) => setGroundValue("maxZ", value)} />
      </div>

      <DebugNumberInput label="Y suelo" value={ground.y} onChange={(value) => setGroundValue("y", value)} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
        <span style={{ fontSize: "10px", opacity: 0.85 }}>Ancho: {width}</span>
        <span style={{ fontSize: "10px", opacity: 0.85 }}>Fondo: {depth}</span>
      </div>

      <textarea
        readOnly
        value={groundJson}
        style={{
          width: "100%",
          minHeight: "90px",
          borderRadius: "2px",
          border: "2px solid #00ff41",
          background: "rgb(8 12 32 / 90%)",
          color: "#00ff41",
          padding: "0.6rem",
          fontSize: "11px",
          fontFamily: "var(--font-pixel), monospace",
          letterSpacing: "0.5px",
          resize: "vertical",
          cursor: "auto",
        }}
      />

      <DebugButton label={copyLabel} onClick={() => { void handleCopyJson(); }} />
    </div>
  );
}

export default function GameTouchCanvas() {
  const selectedCharacter: GameCharacterName = "Dave";
  const pathname = usePathname();
  const isDebug = DEBUG_ROUTE_ENABLED && pathname === "/debug";

  useEffect(() => {
    console.log("GameTouchCanvas: debug mode ->", isDebug, { pathname });
  }, [isDebug, pathname]);

  useEffect(() => {
    if (!isDebug) return;
    const styleEl = document.createElement("style");
    styleEl.setAttribute("data-debug-cursor-override", "true");
    styleEl.innerHTML = `* { cursor: auto !important; }`;
    document.head.appendChild(styleEl);
    return () => {
      styleEl.remove();
    };
  }, [isDebug]);
  const [debugPanelSide, setDebugPanelSide] = useState<"left" | "right">("left");
  const [isDebugGroundVisible, setIsDebugGroundVisible] = useState(true);
  const [isDebugWallsVisible, setIsDebugWallsVisible] = useState(true);
  const [editorMode, setEditorMode] = useState<"walls" | "ground">("walls");
  const [wallToolMode, setWallToolMode] = useState<WallToolMode>("manual");
  const [wallPointResetSignal, setWallPointResetSignal] = useState(0);
  const [speechDraft, setSpeechDraft] = useState("Hola. Este es un bocadillo de prueba.");
  const [speechText, setSpeechText] = useState("");
  const [speechVisible, setSpeechVisible] = useState(false);
  const [speechTrigger, setSpeechTrigger] = useState(0);
  const [speechCharsPerSecond, setSpeechCharsPerSecond] = useState(28);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [inventorySlots, setInventorySlots] = useState<InventorySlots>(() => createInitialInventorySlots());
  const [draggedStack, setDraggedStack] = useState<(DraggedInventoryPayload & { pointerX: number; pointerY: number }) | null>(null);
  const [placedItems, setPlacedItems] = useState<PlacedSceneItem[]>([]);
  const sceneId = useSceneStore((s) => s.sceneId);
  const sceneBackground = useSceneStore((s) => s.scene.background);
  const setScene = useSceneStore((s) => s.setScene);
  const sceneInteractions = useSceneStore((s) => s.scene.interactions);
  const requestRespawn = useSceneStore((s) => s.requestRespawn);

  const sceneOptions = useMemo(
    () => Object.values(SCENES).map((s) => ({ label: s.label, value: s.id })),
    [],
  );

  const spriteRefRef = useRef<React.RefObject<DavidSpriteHandle | null> | null>(null);
  const readyMessage = `${selectedCharacter} listo — flechas/WASD o click para moverse`;

  const handleWallToolModeChange = useCallback((mode: WallToolMode) => {
    setWallToolMode(mode);
    setWallPointResetSignal((signal) => signal + 1);
  }, []);

  const handleSpriteReady = (spriteRef: React.RefObject<DavidSpriteHandle | null>) => {
    spriteRefRef.current = spriteRef;
  };

  const handleBoundaryHit = useCallback((phrase: string) => {
    setSpeechText(phrase);
    setSpeechVisible(true);
    setSpeechTrigger((current) => current + 1);
  }, []);

  const showSpeechBubble = useCallback((nextText: string) => {
    setSpeechText(nextText);
    setSpeechVisible(true);
    setSpeechTrigger((current) => current + 1);
  }, []);

  const runSpeechBubble = useCallback(() => {
    const nextText = speechDraft.trim();
    if (!nextText) return;
    showSpeechBubble(nextText);
  }, [showSpeechBubble, speechDraft]);

  const hideSpeechBubble = useCallback(() => {
    setSpeechVisible(false);
  }, []);

  const handleInventoryDropHit = useCallback((interaction: SceneInteraction, payload: DraggedInventoryPayload) => {
    const itemDefinition = getItemDefinition(payload.stack.id);
    if (!itemDefinition) {
      showSpeechBubble("No conozco este item todavía.");
      setDraggedStack(null);
      return;
    }

    const rule = resolveItemRule(itemDefinition.id, interaction.id);
    if (!rule) {
      showSpeechBubble(getRandomPhrase(interaction.dialogKeys.miss));
      setDraggedStack(null);
      return;
    }

    if (rule.outcome === "place") {
      setInventorySlots((currentSlots) => removeOneFromSlot(currentSlots, payload.fromSlotIndex));
      setPlacedItems((currentPlaced) => {
        const worldPosition = getInteractionWorldPosition(interaction);
        const placedId = `${itemDefinition.id}-${interaction.id}-${Date.now()}`;
        return [
          ...currentPlaced,
          {
            id: placedId,
            itemId: itemDefinition.id,
            interactionId: interaction.id,
            name: itemDefinition.name,
            spriteUrl: itemDefinition.spriteUrl,
            worldPosition,
            canPickup: rule.placeCanPickup ?? false,
            hasCollision: rule.placeHasCollision ?? false,
            collisionHalfSize: rule.placeCollisionHalfSize,
            pickupSuccessDialogKey: rule.pickupSuccessDialogKey,
            pickupBlockedDialogKey: rule.pickupBlockedDialogKey,
          },
        ];
      });
      showSpeechBubble(getRandomPhrase(rule.hitDialogKey ?? interaction.dialogKeys.hit));
      setDraggedStack(null);
      return;
    }

    if (rule.outcome === "consume") {
      setInventorySlots((currentSlots) => removeOneFromSlot(currentSlots, payload.fromSlotIndex));
      showSpeechBubble(getRandomPhrase(rule.hitDialogKey ?? interaction.dialogKeys.hit));
      setDraggedStack(null);
      return;
    }

    showSpeechBubble(getRandomPhrase(rule.hitDialogKey ?? rule.missDialogKey ?? interaction.dialogKeys.miss));
    setDraggedStack(null);
  }, [showSpeechBubble]);

  const handleInventoryDropMiss = useCallback((payload: DraggedInventoryPayload, interaction?: SceneInteraction) => {
    const itemRule = interaction ? resolveItemRule(payload.stack.id, interaction.id) : null;
    const fallbackMiss = itemRule?.missDialogKey
      ?? interaction?.dialogKeys.miss
      ?? sceneInteractions.find((currentInteraction) => currentInteraction.kind === "drop-target")?.dialogKeys.miss
      ?? "inventoryDropMiss";

    showSpeechBubble(getRandomPhrase(fallbackMiss));
    setDraggedStack(null);
  }, [sceneInteractions, showSpeechBubble]);

  const handlePickupPlacedItem = useCallback((placedItem: PlacedSceneItem) => {
    const itemDefinition = getItemDefinition(placedItem.itemId);
    if (!itemDefinition) {
      return;
    }

    if (!placedItem.canPickup) {
      showSpeechBubble(getRandomPhrase(placedItem.pickupBlockedDialogKey ?? "item.gameboy.pickup.personal-room-gameboy-drop-target.blocked"));
      return;
    }

    let added = false;
    setInventorySlots((currentSlots) => {
      const result = addOneToInventory(currentSlots, {
        id: itemDefinition.id,
        name: itemDefinition.name,
        spriteUrl: itemDefinition.spriteUrl,
      });
      added = result.added;
      return result.added ? result.slots : currentSlots;
    });

    if (!added) {
      showSpeechBubble("Inventario lleno.");
      return;
    }

    setPlacedItems((currentPlaced) => currentPlaced.filter((currentItem) => currentItem.id !== placedItem.id));
    showSpeechBubble(getRandomPhrase(placedItem.pickupSuccessDialogKey ?? "item.gameboy.pickup.personal-room-gameboy-drop-target.allowed"));
  }, [showSpeechBubble]);

  const handleStartInventoryDrag = useCallback((slotIndex: number, clientX: number, clientY: number) => {
    const stack = inventorySlots[slotIndex];
    if (!stack) return;

    setIsInventoryOpen(false);
    setDraggedStack({
      stack,
      fromSlotIndex: slotIndex,
      pointerX: clientX,
      pointerY: clientY,
    });
  }, [inventorySlots]);

  useEffect(() => {
    if (sceneId !== "personalRoom") return;

    const timeoutId = window.setTimeout(() => {
      showSpeechBubble(getRandomPhrase("personalRoomWelcome"));
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [sceneId, showSpeechBubble]);

  return (
    <div style={{ position: "fixed", inset: 0, width: "100dvw", height: "100dvh", overflow: "hidden" }}>

      <Canvas
        gl={{ alpha: false, antialias: true, preserveDrawingBuffer: false }}
        onPointerDownCapture={() => setIsInventoryOpen(false)}
        onCreated={(state) => {
          try {
            const glCtx = state.gl.getContext();
            console.log("Three: renderer created", {
              contextAttributes: glCtx?.getContextAttributes?.(),
              version: glCtx?.getParameter?.(glCtx.VERSION),
              shadingLanguageVersion: glCtx?.getParameter?.(glCtx.SHADING_LANGUAGE_VERSION),
            });
            state.gl.setClearColor(0x0f0f10, 1);
            state.gl.clear();
          } catch (err) {
            console.error("Three: onCreated error", err);
          }
        }}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 1, background: "transparent", display: "block" }}
      >
        <OrthographicCamera makeDefault position={CAMERA_POSITION} rotation={[-0.24, 0, 0]} near={0.01} far={120} />
        <CameraFitHeight desiredWorldHeight={19.28} />
        {/* <fog attach="fog" args={["#070d1f", 20, 55]} /> */}
        <ambientLight intensity={1.1} color="#8bc2ff" />
        <directionalLight position={[3, 9, 6]} intensity={1.5} color="#d8ecff" />
        <BackgroundPlane url={sceneBackground} />
        <CameraController />
        <Physics gravity={[0, -20, 0]}>
          <Suspense fallback={null}>
            <GameSceneContents
              selectedCharacter={selectedCharacter}
              onSpriteReady={handleSpriteReady}
              debug={isDebug}
              showDebugGround={isDebugGroundVisible}
              showDebugWalls={isDebugWallsVisible}
              wallToolMode={wallToolMode}
              wallPointResetSignal={wallPointResetSignal}
              speechText={speechText}
              speechVisible={speechVisible}
              speechTrigger={speechTrigger}
              speechCharsPerSecond={speechCharsPerSecond}
              onBoundaryHit={handleBoundaryHit}
              onSpeechDismiss={hideSpeechBubble}
            />
          </Suspense>
          <SceneDropTargets
            targets={sceneInteractions}
            draggedStack={draggedStack ? { stack: draggedStack.stack, fromSlotIndex: draggedStack.fromSlotIndex } : null}
            onDropHit={handleInventoryDropHit}
            onDropMiss={handleInventoryDropMiss}
          />
          <PlacedSceneItems items={placedItems} onPickup={handlePickupPlacedItem} />
        </Physics>
      </Canvas>

      <Joystick />
      <InventoryUI
        isOpen={isInventoryOpen}
        slots={inventorySlots}
        onToggle={() => setIsInventoryOpen((open) => !open)}
        onStartDrag={handleStartInventoryDrag}
      />
      {draggedStack && (
        <DraggedInventoryGhost
          stack={draggedStack.stack}
          initialPointerX={draggedStack.pointerX}
          initialPointerY={draggedStack.pointerY}
        />
      )}
      {isDebug && (
        <div
          style={{
            position: "fixed",
            top: "16px",
            left: debugPanelSide === "left" ? "16px" : undefined,
            right: debugPanelSide === "right" ? "16px" : undefined,
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            zIndex: 10001,
            padding: "1rem 1.2rem",
            borderRadius: "2px",
            border: "3px solid #00ff41",
            background: "rgb(12 19 48 / 95%)",
            color: "#00ff41",
            backdropFilter: "blur(4px)",
            minWidth: "260px",
            maxWidth: "420px",
            maxHeight: "calc(100vh - 32px)",
            overflowY: "auto",
            boxShadow: "0 0 16px rgba(0, 255, 65, 0.3), inset 0 0 8px rgba(0, 255, 65, 0.1)",
            fontFamily: "var(--font-pixel), monospace",
            fontSize: "13px",
            letterSpacing: "1px",
            textShadow: "0 0 10px rgba(0, 255, 65, 0.4)",
            pointerEvents: "auto",
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            <DebugButton
              label={isDebugGroundVisible ? "Ocultar suelo" : "Mostrar suelo"}
              onClick={() => setIsDebugGroundVisible((visible) => !visible)}
            />
            <DebugButton
              label={isDebugWallsVisible ? "Ocultar paredes" : "Mostrar paredes"}
              onClick={() => setIsDebugWallsVisible((visible) => !visible)}
            />
          </div>
          <DebugButton
            label={debugPanelSide === "left" ? "Panel a derecha" : "Panel a izquierda"}
            onClick={() => setDebugPanelSide((side) => (side === "left" ? "right" : "left"))}
          />
        <PixelSelect
          label="Escenario"
          value={sceneId}
          onChange={(value) => setScene(value)}
          options={sceneOptions}
        />
        <strong style={{ fontSize: "12px", fontWeight: "bold", letterSpacing: "1px", lineHeight: "1.6" }}>{readyMessage}</strong>
        <DebugButton label="Reaparecer en spawn" onClick={requestRespawn} />
        {isDebug && (
          <PixelSelect
            label="Modo editor"
            value={editorMode}
            onChange={(value) => setEditorMode(value as "walls" | "ground")}
            options={[
              { label: "Editar paredes", value: "walls" },
              { label: "Editar suelo", value: "ground" },
            ]}
          />
        )}
        {isDebug && (
          <div style={{ display: "grid", gap: "8px", paddingTop: "6px", borderTop: "2px solid rgb(0 255 65 / 30%)" }}>
            <strong style={{ fontSize: "12px", lineHeight: "1.4" }}>Bocadillo de dialogo</strong>
            <textarea
              value={speechDraft}
              onChange={(e) => setSpeechDraft(e.target.value)}
              placeholder="Escribe el texto para el personaje"
              rows={4}
              style={{
                width: "100%",
                minHeight: "84px",
                borderRadius: "2px",
                border: "2px solid #00ff41",
                background: "rgb(8 12 32 / 90%)",
                color: "#00ff41",
                padding: "0.6rem",
                fontSize: "11px",
                fontFamily: "var(--font-pixel), monospace",
                letterSpacing: "0.5px",
                resize: "vertical",
                outline: "none",
                cursor: "auto",
              }}
            />
            <DebugNumberInput
              label="Velocidad (chars/seg)"
              value={speechCharsPerSecond}
              step={1}
              onChange={(value) => setSpeechCharsPerSecond(Math.max(1, Math.round(value)))}
            />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              <DebugButton label="Hablar" onClick={runSpeechBubble} disabled={speechDraft.trim().length === 0} />
              <DebugButton label="Ocultar" onClick={hideSpeechBubble} disabled={!speechVisible} />
            </div>
          </div>
        )}
        {isDebug && editorMode === "walls" && (
          <WallEditorPanel
            wallToolMode={wallToolMode}
            setWallToolMode={handleWallToolModeChange}
            onResetPointTool={() => setWallPointResetSignal((signal) => signal + 1)}
          />
        )}
        {isDebug && editorMode === "ground" && <GroundEditorPanel />}
        </div>
      )}
    </div>
  );
}
