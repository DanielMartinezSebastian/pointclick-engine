"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { CuboidCollider, RigidBody, type RapierRigidBody } from "@react-three/rapier";
import { MathUtils, Mesh, Vector2 } from "three";

import SpeechBubble from "../render/SpeechBubble";
import DavidSprite, { type DavidSpriteHandle } from "../render/sprite/DavidSprite";
import {
  DAVE_IDLE_SPEAKING,
  GAME_CHARACTER_SPRITES,
  type GameCharacterName,
  type GameDirection,
} from "../render/sprite/clips";
import { buildSpeakingAnimation } from "../render/sprite/speakingAnimation";
import { findPath, useClickToMoveController, useKeyboardMovementInput } from "../movement";
import { useMobileInputStore } from "../../../store/mobileInputStore";
import { useSceneStore } from "@pointclick/engine-core";
import { useSceneEditorStore } from "../../../store/sceneEditorStore";
import { getRandomPhrase } from "../../../../demo-content/dialogs/getRandomPhrase";
import { browserEnvironmentAdapter } from "../../platform-web";
import { type WallToolMode } from "../types/gameRuntime";
import { emitRuntimeEvent, type RuntimeEventHandler } from "@pointclick/engine-core";
import { SceneCollisionSphere } from "../render/scene/SceneCollisionSphere";
import { SceneGround } from "../render/scene/SceneGround";
import { SceneWallPointPreview } from "../render/scene/SceneWallPointPreview";
import { SceneWalls, type WallResizeHandle } from "../render/scene/SceneWalls";

type MovementAction = GameDirection;
type WallPointStart = { point: Vector2; resetSignal: number };
type WallPointPreview = { start: Vector2; end: Vector2; resetSignal: number };
type WallInteraction =
  | { mode: "move"; offsetX: number; offsetZ: number }
  | { mode: "resize"; handle: WallResizeHandle }
  | null;

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
const MOVEMENT_INPUT_DEADZONE = 0.12;
const SHOULD_LOG_STATE_TRANSITIONS = process.env.NODE_ENV !== "production";
const DEV_DUPLICATE_RESET_WINDOW_MS = 500;

type LastRuntimeResetSnapshot = {
  sceneId: string;
  respawnSignal: number;
  spawn: [number, number, number];
  at: number;
};

let lastRuntimeResetSnapshot: LastRuntimeResetSnapshot | null = null;

function logRuntimeState(event: string, payload: Record<string, unknown>) {
  if (!SHOULD_LOG_STATE_TRANSITIONS) return;
  if (typeof window !== "undefined") {
    const nextEntry = { scope: "runtime", event, payload, ts: Date.now() };
    const currentTrace = ((window as unknown as { __gameTrace?: unknown[] }).__gameTrace ?? []);
    (window as unknown as { __gameTrace: unknown[] }).__gameTrace = [...currentTrace, nextEntry].slice(-300);
  }
  console.info(`[runtime-state] ${event}`, payload);
}

function applyDeadzone(value: number, threshold: number) {
  return Math.abs(value) < threshold ? 0 : value;
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

export function GameTouchSpriteRuntime({
  activeCharacter,
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
  onRuntimeEvent,
}: {
  activeCharacter: GameCharacterName;
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
  onRuntimeEvent?: RuntimeEventHandler;
}) {
  const spriteRef = useRef<DavidSpriteHandle | null>(null);
  const meshRef = useRef<Mesh>(null);
  const characterBodyRef = useRef<RapierRigidBody>(null);
  const currentActionRef = useRef<MovementAction>("idle");
  const currentInputModeRef = useRef<"auto" | "keyboard" | "joystick">("auto");
  const hadManualInputRef = useRef(false);
  const lastPublishedPositionRef = useRef<{ x: number; y: number; z: number } | null>(null);
  const lastResetRef = useRef<{ sceneId: string; respawnSignal: number } | null>(null);
  const [action, setAction] = useState<MovementAction>("idle");
  const [wallPointPreviewState, setWallPointPreviewState] = useState<WallPointPreview | null>(null);
  const wallInteractionRef = useRef<WallInteraction>(null);
  const wallPointStartRef = useRef<WallPointStart | null>(null);
  const lastBoundaryHitRef = useRef<number>(0);
  const lastStuckHitRef = useRef<number>(0);

  const playerSpawn = useSceneStore((s) => s.scene.playerSpawn);
  const sceneId = useSceneStore((s) => s.sceneId);
  const ground = useSceneStore((s) => s.scene.ground);
  const setPlayerPosition = useSceneStore((s) => s.setPlayerPosition);
  const addWallWithData = useSceneEditorStore((s) => s.addWallWithData);
  const respawnSignal = useSceneStore((s) => s.respawnSignal);

  const { setTarget, setRoute, cancelTarget, resolveDirection, registerProgress } = useClickToMoveController();
  const { clearPressedKeys, getKeyboardMovement } = useKeyboardMovementInput();

  const playableBounds = useMemo(() => {
    const minX = ground.minX + PLAYER_BOUND_MARGIN;
    const maxX = ground.maxX - PLAYER_BOUND_MARGIN;
    const minZ = ground.minZ + PLAYER_BOUND_MARGIN;
    const maxZByGround = ground.maxZ - PLAYER_BOUND_MARGIN;
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
    useSceneEditorStore.getState().selectWall(index);
    wallInteractionRef.current = {
      mode: "resize",
      handle,
    };
  }, []);

  const handleHoverWorld = useCallback((x: number, z: number) => {
    const interaction = wallInteractionRef.current;
    if (!interaction) return;

    const sceneState = useSceneStore.getState();
    const editorState = useSceneEditorStore.getState();
    const selectedWallIndex = editorState.selectedWallIndex;
    if (selectedWallIndex == null) return;

    const wall = sceneState.scene.walls[selectedWallIndex];
    if (!wall) return;

    if (interaction.mode === "move") {
      editorState.updateSelectedWall((currentWall) => ({
        ...currentWall,
        position: [x - interaction.offsetX, sceneState.scene.ground.y + currentWall.halfSize[1], z - interaction.offsetZ],
      }));
      return;
    }

    const rotationY = wall.rotationY ?? 0;
    const { axisX, axisZ } = getWallAxes(rotationY);
    const centerX = wall.position[0];
    const centerZ = wall.position[2];

    editorState.updateSelectedWall((currentWall) => {
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
  const characterAnimations = useMemo(
    () => [...Object.values(characterClips), DAVE_IDLE_SPEAKING],
    [characterClips],
  );
  const activeAnimation = useMemo(
    () =>
      speechVisible && action === "idle"
        ? buildSpeakingAnimation(speechTrigger, speechCharsPerSecond)
        : characterClips[action],
    [speechVisible, action, characterClips, speechTrigger, speechCharsPerSecond],
  );

  useEffect(() => {
    const body = characterBodyRef.current;
    if (!body) return;
    const spawn = useSceneStore.getState().scene.playerSpawn;
    const previousReset = lastResetRef.current;
    const reason = !previousReset
      ? "initial-mount"
      : previousReset.sceneId !== sceneId
        ? "scene-change"
        : "respawn";

    logRuntimeState("player-reset", {
      reason,
      sceneId,
      respawnSignal,
      spawn,
    });

    const now = Date.now();
    const duplicateDevMountReset = SHOULD_LOG_STATE_TRANSITIONS
      && (reason === "initial-mount" || reason === "respawn")
      && lastRuntimeResetSnapshot != null
      && now - lastRuntimeResetSnapshot.at < DEV_DUPLICATE_RESET_WINDOW_MS
      && lastRuntimeResetSnapshot.sceneId === sceneId
      && lastRuntimeResetSnapshot.respawnSignal === respawnSignal
      && lastRuntimeResetSnapshot.spawn[0] === spawn[0]
      && lastRuntimeResetSnapshot.spawn[1] === spawn[1]
      && lastRuntimeResetSnapshot.spawn[2] === spawn[2];

    if (duplicateDevMountReset) {
      logRuntimeState("player-reset-skipped", {
        reason: "duplicate-dev-reset",
        originalReason: reason,
        sceneId,
        respawnSignal,
        spawn,
      });
      lastResetRef.current = { sceneId, respawnSignal };
      return;
    }

    body.setTranslation({ x: spawn[0], y: spawn[1], z: spawn[2] }, true);
    body.setLinvel({ x: 0, y: 0, z: 0 }, true);
    cancelTarget();
    clearPressedKeys();
    setPlayerPosition([spawn[0], spawn[1], spawn[2]]);
    lastPublishedPositionRef.current = { x: spawn[0], y: spawn[1], z: spawn[2] };
    lastResetRef.current = { sceneId, respawnSignal };
    lastRuntimeResetSnapshot = {
      sceneId,
      respawnSignal,
      spawn: [spawn[0], spawn[1], spawn[2]],
      at: now,
    };
  }, [cancelTarget, clearPressedKeys, sceneId, respawnSignal, setPlayerPosition]);

  useEffect(() => {
    return browserEnvironmentAdapter.addWindowEventListener(
      "pointerup",
      stopWallInteraction,
    );
  }, [stopWallInteraction]);

  useFrame((_, delta) => {
    const body = characterBodyRef.current;

    if (!body) {
      return;
    }

    const { moveLeft, moveRight, moveUp, moveDown, anyKeyPressed } = getKeyboardMovement();

    const joystick = useMobileInputStore.getState();
    const manualInputActive = anyKeyPressed || joystick.active;
    const nextInputMode: "auto" | "keyboard" | "joystick" = joystick.active
      ? "joystick"
      : anyKeyPressed
        ? "keyboard"
        : "auto";

    if (currentInputModeRef.current !== nextInputMode) {
      logRuntimeState("input-mode-change", {
        from: currentInputModeRef.current,
        to: nextInputMode,
        sceneId,
      });
      currentInputModeRef.current = nextInputMode;
    }

    // El primer input manual debe invalidar cualquier ruta pendiente de click-to-move.
    if (manualInputActive && !hadManualInputRef.current) {
      cancelTarget();
      logRuntimeState("click-move-cancelled", {
        reason: "manual-input",
        inputMode: nextInputMode,
        sceneId,
      });
    }
    hadManualInputRef.current = manualInputActive;

    let horizontal = 0;
    let vertical = 0;

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

    horizontal = applyDeadzone(horizontal, MOVEMENT_INPUT_DEADZONE);
    vertical = applyDeadzone(vertical, MOVEMENT_INPUT_DEADZONE);

    const nextAction: MovementAction = resolveAction(horizontal, vertical);

    if (currentActionRef.current !== nextAction) {
      logRuntimeState("action-change", {
        from: currentActionRef.current,
        to: nextAction,
        inputMode: currentInputModeRef.current,
        sceneId,
      });
      currentActionRef.current = nextAction;
      setAction(nextAction);
    }

    const speed = 7;
    const currentVelocity = body.linvel();
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
        emitRuntimeEvent(onRuntimeEvent, {
          type: "onCollide",
          reason: "boundary",
          position: [clampedPosition.x, currentPosition.y, clampedPosition.z],
        });
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
      const now = performance.now();
      if (now - lastStuckHitRef.current > BOUNDARY_HIT_COOLDOWN_MS) {
        lastStuckHitRef.current = now;
        emitRuntimeEvent(onRuntimeEvent, {
          type: "onCollide",
          reason: "stuck",
          position: [safePosition.x, safePosition.y, safePosition.z],
        });
      }
    }

    const depthFactor = MathUtils.clamp(
      MathUtils.inverseLerp(DEPTH_FAR_Z, DEPTH_NEAR_Z, safePosition.z),
      0,
      1,
    );

    const roundedX = Number(safePosition.x.toFixed(2));
    const roundedY = Number(safePosition.y.toFixed(2));
    const roundedZ = Number(safePosition.z.toFixed(2));
    const lastLogged = lastPublishedPositionRef.current;
    if (!lastLogged || lastLogged.x !== roundedX || lastLogged.y !== roundedY || lastLogged.z !== roundedZ) {
      lastPublishedPositionRef.current = { x: roundedX, y: roundedY, z: roundedZ };
      setPlayerPosition([roundedX, roundedY, roundedZ]);
      emitRuntimeEvent(onRuntimeEvent, {
        type: "onMove",
        position: [roundedX, roundedY, roundedZ],
        action: nextAction,
      });
    }

    const spriteScale = MathUtils.lerp(SPRITE_MIN_SCALE, SPRITE_MAX_SCALE, depthFactor);
    if (meshRef.current) {
      const flipX = action === "west" ? -1 : 1;
      meshRef.current.scale.set(spriteScale * flipX, spriteScale, 1);
      meshRef.current.position.y = spriteScale - 0.95;
    }
  });

  const wallPointPreview =
    debug && wallToolMode === "points" && wallPointPreviewState?.resetSignal === wallPointResetSignal
      ? wallPointPreviewState
      : null;

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
        depthNearZ={DEPTH_NEAR_Z}
        depthFarZ={DEPTH_FAR_Z}
      />
      <SceneWalls debug={debug && showDebugWalls} onStartWallMove={handleStartWallMove} onStartWallResize={handleStartWallResize} />
      {debug && wallToolMode === "points" && (
        <SceneWallPointPreview preview={wallPointPreview} groundY={ground.y} />
      )}
      <SceneCollisionSphere />
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
          animation={activeAnimation}
          preloadAnimations={characterAnimations}
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
