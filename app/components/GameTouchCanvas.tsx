"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrthographicCamera } from "@react-three/drei";
import { Physics, RigidBody, CuboidCollider, BallCollider, type RapierRigidBody } from "@react-three/rapier";
import { MathUtils, Mesh, OrthographicCamera as ThreeOrthoCamera, TextureLoader, Vector2, Vector3, DoubleSide } from "three";

import DavidSprite, { type DavidSpriteHandle } from "./sprite/DavidSprite";
import { DebugOverlayPanel } from "./DebugOverlayPanel";
import SpeechBubble from "./SpeechBubble";
import { getRandomPhrase } from "../dialogs/getRandomPhrase";
import {
  GAME_CHARACTER_SPRITES,
  type GameCharacterName,
  type GameDirection,
} from "./sprite/clips";
import { useSceneStore } from "../store/sceneStore";
import dynamic from "next/dynamic";
import { type SceneWall } from "../scenes/scenes";
import { useMobileInputStore } from "../store/mobileInputStore";
import { DraggedInventoryGhost, InventoryUI } from "./InventoryUI";
import { SceneDropTargets } from "./inventory/SceneDropTargets";
import { PlacedSceneItems } from "./inventory/PlacedSceneItems";
import { GroundEditorPanel } from "./debug/GroundEditorPanel";
import { InteractionTargetsEditorPanel } from "./debug/InteractionTargetsEditorPanel";
import { PlacedItemsEditorPanel } from "./debug/PlacedItemsEditorPanel";
import { WallEditorPanel, type WallToolMode } from "./debug/WallEditorPanel";
import { findPath, useClickToMoveController, useKeyboardMovementInput } from "./movement";
import { useInventoryRuntimeController } from "../lib/engine/runtime/useInventoryRuntimeController";
import { useInteractionEditorController } from "../lib/engine/runtime/useInteractionEditorController";
import { useDebugPanelController } from "../lib/engine/runtime/useDebugPanelController";
import { useDebugModeEffects } from "../lib/engine/runtime/useDebugModeEffects";
import { useSceneRuntimeController } from "../lib/engine/runtime/useSceneRuntimeController";

// Carga el joystick solo en cliente (ssr: false); la detección de dispositivo
// táctil se realiza dentro del propio componente con window garantizado.
const Joystick = dynamic(() => import("./Joystick"), { ssr: false });

type MovementAction = GameDirection;
type WallResizeHandle = "x+" | "x-" | "z+" | "z-";
type WallPointStart = { point: Vector2; resetSignal: number };
type WallPointPreview = { start: Vector2; end: Vector2; resetSignal: number };
type WallInteraction =
  | { mode: "move"; offsetX: number; offsetZ: number }
  | { mode: "resize"; handle: WallResizeHandle }
  | null;

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
const CAMERA_FRONT_PLAYABLE_MARGIN = 1.2;

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

  const { setTarget, setRoute, cancelTarget, resolveDirection, registerProgress } = useClickToMoveController();
  const { clearPressedKeys, getKeyboardMovement } = useKeyboardMovementInput();

  const playableBounds = useMemo(() => {
    const minX = ground.minX + PLAYER_BOUND_MARGIN;
    const maxX = ground.maxX - PLAYER_BOUND_MARGIN;
    const minZ = ground.minZ + PLAYER_BOUND_MARGIN;
    const maxZByGround = ground.maxZ - PLAYER_BOUND_MARGIN;
    // Limita el frente para no entrar en clipping de cámara (corte del sprite).
    // El margen se mantiene corto para permitir bajar más sin recortarse.
    const maxZByCamera = CAMERA_POSITION[2] - CAMERA_FRONT_PLAYABLE_MARGIN;
    const maxZ = Math.min(maxZByGround, maxZByCamera);

    return {
      minX: Math.min(minX, maxX),
      maxX: Math.max(minX, maxX),
      minZ: Math.min(minZ, maxZ),
      maxZ: Math.max(minZ, maxZ),
    };
  }, [ground.maxX, ground.maxZ, ground.minX, ground.minZ]);

  const clampToPlayableArea = useCallback((x: number, z: number) => {
    return {
      x: MathUtils.clamp(x, playableBounds.minX, playableBounds.maxX),
      z: MathUtils.clamp(z, playableBounds.minZ, playableBounds.maxZ),
    };
  }, [playableBounds.maxX, playableBounds.maxZ, playableBounds.minX, playableBounds.minZ]);

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
    const body = characterBodyRef.current;
    const scene = useSceneStore.getState().scene;
    const startPosition = body?.translation() ?? { x: playerSpawn[0], z: playerSpawn[2] };
    const route = findPath({
      start: { x: startPosition.x, z: startPosition.z },
      goal: clamped,
      bounds: playableBounds,
      walls: scene.walls,
      interactions: scene.interactions,
    });

    if (route && route.length > 0) {
      setRoute(route);
      return;
    }

    setTarget(clamped.x, clamped.z);
  }, [addWallWithData, clampToPlayableArea, debug, ground.y, playableBounds, playerSpawn, setRoute, setTarget, wallPointResetSignal, wallToolMode]);

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
    cancelTarget();
    clearPressedKeys();
    setPlayerPosition([spawn[0], spawn[1], spawn[2]]);
  }, [cancelTarget, clearPressedKeys, sceneId, respawnSignal, setPlayerPosition]);

  useEffect(() => {
    onSpriteReady(spriteRef);
  }, [onSpriteReady]);

  useEffect(() => {
    window.addEventListener("pointerup", stopWallInteraction);
    return () => {
      window.removeEventListener("pointerup", stopWallInteraction);
    };
  }, [stopWallInteraction]);

  useFrame((_, delta) => {
    const body = characterBodyRef.current;

    if (!body) {
      return;
    }

    const { moveLeft, moveRight, moveUp, moveDown, anyKeyPressed } = getKeyboardMovement();

    const joystick = useMobileInputStore.getState();
    const manualInputActive = anyKeyPressed || joystick.active;

    let horizontal = 0;
    let vertical = 0;

    // Prioridad: joystick táctil > teclado > click-to-move
    if (joystick.active) {
      horizontal = joystick.x;
      vertical = joystick.z;
    } else if (anyKeyPressed) {
      horizontal = Number(moveRight) - Number(moveLeft);
      vertical = Number(moveDown) - Number(moveUp);
    } else {
      const currentPosition = body.translation();
      const autoMove = resolveDirection(
        currentPosition.x,
        currentPosition.z,
        delta,
        manualInputActive,
      );
      horizontal = autoMove.horizontal;
      vertical = autoMove.vertical;

      if (autoMove.snapToTarget) {
        body.setTranslation(
          {
            x: autoMove.snapToTarget.x,
            y: currentPosition.y,
            z: autoMove.snapToTarget.z,
          },
          true,
        );
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

    const { stuck } = registerProgress(
      safePosition.x,
      safePosition.z,
      delta,
      manualInputActive,
    );

    if (stuck) {
      const vel = body.linvel();
      body.setLinvel({ x: 0, y: vel.y, z: 0 }, true);
    }

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

export default function GameTouchCanvas() {
  const selectedCharacter: GameCharacterName = "Dave";
  const { isDebug } = useDebugModeEffects();

  const {
    debugPanelSide,
    setDebugPanelSide,
    isDebugGroundVisible,
    setIsDebugGroundVisible,
    isDebugWallsVisible,
    setIsDebugWallsVisible,
    editorMode,
    setEditorMode,
    wallToolMode,
    wallPointResetSignal,
    handleWallToolModeChange,
    resetWallPointTool,
    speechDraft,
    setSpeechDraft,
    speechCharsPerSecond,
    setSpeechCharsPerSecond,
  } = useDebugPanelController();
  const {
    sceneId,
    sceneBackground,
    setScene,
    sceneInteractions,
    requestRespawn,
    playerPosition,
    scenePlayerSpawn,
    updateInteraction,
    resetInteractionsFromSceneConfig,
    sceneOptions,
  } = useSceneRuntimeController();

  const {
    speechText,
    speechVisible,
    speechTrigger,
    isInventoryOpen,
    inventorySlots,
    draggedStack,
    placedItems,
    setIsInventoryOpen,
    handleBoundaryHit,
    showSpeechBubble,
    hideSpeechBubble,
    handleInventoryDropHit,
    handleInventoryDropMiss,
    handleInventoryDropOnPlayer,
    handlePickupPlacedItem,
    updatePlacedItemPosition,
    movePlacedItemToPlayer,
    removePlacedItemById,
    handleStartInventoryDrag,
  } = useInventoryRuntimeController({
    sceneId,
    sceneInteractions,
    playerPosition,
  });

  const {
    updateInteractionPosition,
    updateInteractionHalfSize,
    updateInteractionRotationDeg,
    moveInteractionToPlayer,
  } = useInteractionEditorController({
    playerPosition,
    scenePlayerSpawnY: scenePlayerSpawn[1],
    updateInteraction,
  });

  const spriteRefRef = useRef<React.RefObject<DavidSpriteHandle | null> | null>(null);
  const readyMessage = `${selectedCharacter} listo — flechas/WASD o click para moverse`;

  const handleSpriteReady = (spriteRef: React.RefObject<DavidSpriteHandle | null>) => {
    spriteRefRef.current = spriteRef;
  };

  const runSpeechBubble = useCallback(() => {
    const nextText = speechDraft.trim();
    if (!nextText) return;
    showSpeechBubble(nextText);
  }, [showSpeechBubble, speechDraft]);

  const debugEditorContent =
    editorMode === "walls" ? (
      <WallEditorPanel
        wallToolMode={wallToolMode}
        setWallToolMode={handleWallToolModeChange}
        onResetPointTool={resetWallPointTool}
      />
    ) : editorMode === "ground" ? (
      <GroundEditorPanel />
    ) : editorMode === "targets" ? (
      <InteractionTargetsEditorPanel
        interactions={sceneInteractions}
        onSetPosition={updateInteractionPosition}
        onSetHalfSize={updateInteractionHalfSize}
        onSetRotationDeg={updateInteractionRotationDeg}
        onMoveToPlayer={moveInteractionToPlayer}
        onResetFromSceneConfig={resetInteractionsFromSceneConfig}
      />
    ) : editorMode === "items" ? (
      <PlacedItemsEditorPanel
        items={placedItems}
        onSetPosition={updatePlacedItemPosition}
        onMoveToPlayer={movePlacedItemToPlayer}
        onRemove={removePlacedItemById}
      />
    ) : null;

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
            playerDropTarget={{
              position: playerPosition,
              onDrop: handleInventoryDropOnPlayer,
            }}
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
      <DebugOverlayPanel
        isDebug={isDebug}
        debugPanelSide={debugPanelSide}
        onTogglePanelSide={() =>
          setDebugPanelSide((side) => (side === "left" ? "right" : "left"))
        }
        isDebugGroundVisible={isDebugGroundVisible}
        onToggleGround={() => setIsDebugGroundVisible((visible) => !visible)}
        isDebugWallsVisible={isDebugWallsVisible}
        onToggleWalls={() => setIsDebugWallsVisible((visible) => !visible)}
        sceneId={sceneId}
        onSceneChange={setScene}
        sceneOptions={sceneOptions}
        readyMessage={readyMessage}
        onRespawn={requestRespawn}
        editorMode={editorMode}
        onEditorModeChange={setEditorMode}
        speechDraft={speechDraft}
        onSpeechDraftChange={setSpeechDraft}
        speechCharsPerSecond={speechCharsPerSecond}
        onSpeechCharsPerSecondChange={(value) =>
          setSpeechCharsPerSecond(Math.max(1, Math.round(value)))
        }
        onRunSpeech={runSpeechBubble}
        onHideSpeech={hideSpeechBubble}
        speechVisible={speechVisible}
        editorContent={debugEditorContent}
      />
    </div>
  );
}
