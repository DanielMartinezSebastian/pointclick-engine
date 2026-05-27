"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { CuboidCollider, RigidBody, type RapierRigidBody } from "@react-three/rapier";
import { MathUtils, Mesh, Vector2 } from "three";

import SpeechBubble from "./SpeechBubble";
import DavidSprite, { type DavidSpriteHandle } from "./sprite/DavidSprite";
import {
  DAVE_IDLE_SPEAKING,
  GAME_CHARACTER_SPRITES,
  type GameCharacterName,
  type GameDirection,
} from "./sprite/clips";
import { buildSpeakingAnimation } from "./sprite/speakingAnimation";
import { SceneCollisionSphere } from "./scene/SceneCollisionSphere";
import { SceneGround } from "./scene/SceneGround";
import { SceneWallPointPreview } from "./scene/SceneWallPointPreview";
import { SceneWalls, type WallResizeHandle } from "./scene/SceneWalls";

import { findPath, useSceneStore, emitRuntimeEvent, type RuntimeEventHandler, type GameSceneWall, type WallToolMode } from "@pointclick-engine/engine-core";

type MovementPoint = { x: number; z: number };

// ── Movement controller hook (inline — minimal dependency on three.js) ──────

type ClickProgressState = {
  x: number;
  z: number;
  stuckMs: number;
};

type UseClickToMoveControllerConfig = {
  arrivalThreshold: number;
  stuckMovementEpsilon: number;
  stuckTimeoutMs: number;
};

type AutoMoveDirection = {
  horizontal: number;
  vertical: number;
  snapToTarget?: { x: number; z: number };
};

const DEFAULT_CLICK_CONFIG: UseClickToMoveControllerConfig = {
  arrivalThreshold: 0.15,
  stuckMovementEpsilon: 0.015,
  stuckTimeoutMs: 550,
};

function useClickToMoveController(config = DEFAULT_CLICK_CONFIG) {
  const targetRef = useRef<MovementPoint | null>(null);
  const routeRef = useRef<MovementPoint[]>([]);
  const progressRef = useRef<ClickProgressState | null>(null);

  const setTarget = useCallback((x: number, z: number) => {
    targetRef.current = { x, z };
    routeRef.current = [];
    progressRef.current = null;
  }, []);

  const setRoute = useCallback((route: MovementPoint[]) => {
    if (route.length === 0) return;
    routeRef.current = route;
    targetRef.current = route[route.length - 1] ?? null;
    progressRef.current = null;
  }, []);

  const cancelTarget = useCallback(() => {
    targetRef.current = null;
    routeRef.current = [];
    progressRef.current = null;
  }, []);

  const resolveDirection = useCallback(
    (
      currentX: number,
      currentZ: number,
      delta: number,
      hasManualInput: boolean,
    ): AutoMoveDirection => {
      if (hasManualInput) return { horizontal: 0, vertical: 0 };

      // Advance through route waypoints
      while (routeRef.current.length > 0) {
        const next = routeRef.current[0]!;
        const dx = next.x - currentX;
        const dz = next.z - currentZ;
        if (Math.sqrt(dx * dx + dz * dz) < config.arrivalThreshold) {
          routeRef.current.shift();
        } else {
          break;
        }
      }

      const target = routeRef.current[0] ?? targetRef.current;
      if (!target) return { horizontal: 0, vertical: 0 };

      const dx = target.x - currentX;
      const dz = target.z - currentZ;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist < config.arrivalThreshold) {
        if (routeRef.current.length > 0) routeRef.current.shift();
        if (routeRef.current.length === 0) {
          targetRef.current = null;
          return { horizontal: 0, vertical: 0, snapToTarget: target };
        }
        return { horizontal: 0, vertical: 0 };
      }

      const maxSpeed = 1;
      return {
        horizontal: MathUtils.clamp(dx / dist, -maxSpeed, maxSpeed),
        vertical: MathUtils.clamp(dz / dist, -maxSpeed, maxSpeed),
      };
    },
    [config.arrivalThreshold],
  );

  const registerProgress = useCallback(
    (
      currentX: number,
      currentZ: number,
      delta: number,
      hasManualInput: boolean,
    ): { stuck: boolean } => {
      if (hasManualInput || !targetRef.current) {
        progressRef.current = null;
        return { stuck: false };
      }

      const prev = progressRef.current;
      if (!prev) {
        progressRef.current = { x: currentX, z: currentZ, stuckMs: 0 };
        return { stuck: false };
      }

      const moved = Math.sqrt(
        (currentX - prev.x) ** 2 + (currentZ - prev.z) ** 2,
      );

      if (moved < config.stuckMovementEpsilon) {
        prev.stuckMs += delta * 1000;
        if (prev.stuckMs > config.stuckTimeoutMs) {
          progressRef.current = null;
          return { stuck: true };
        }
      } else {
        prev.x = currentX;
        prev.z = currentZ;
        prev.stuckMs = 0;
      }

      return { stuck: false };
    },
    [config.stuckMovementEpsilon, config.stuckTimeoutMs],
  );

  return { setTarget, setRoute, cancelTarget, resolveDirection, registerProgress };
}

// ── Keyboard movement hook ───────────────────────────────────────────────────

const MOVEMENT_KEYS = new Set(["arrowleft", "arrowright", "arrowup", "arrowdown", "a", "d", "w", "s"]);

function useKeyboardMovementInput() {
  const keysPressedRef = useRef(new Set<string>());

  const clearPressedKeys = useCallback(() => {
    keysPressedRef.current.clear();
  }, []);

  const getKeyboardMovement = useCallback(() => {
    const pressed = keysPressedRef.current;
    const moveLeft = pressed.has("arrowleft") || pressed.has("a");
    const moveRight = pressed.has("arrowright") || pressed.has("d");
    const moveUp = pressed.has("arrowup") || pressed.has("w");
    const moveDown = pressed.has("arrowdown") || pressed.has("s");
    return { moveLeft, moveRight, moveUp, moveDown, anyKeyPressed: moveLeft || moveRight || moveUp || moveDown };
  }, []);

  useEffect(() => {
    const handleKeyDown: EventListener = (event) => {
      const e = event as KeyboardEvent;
      const key = e.key.toLowerCase();
      if (MOVEMENT_KEYS.has(key)) { e.preventDefault(); keysPressedRef.current.add(key); }
    };
    const handleKeyUp: EventListener = (event) => {
      const e = event as KeyboardEvent;
      const key = e.key.toLowerCase();
      if (MOVEMENT_KEYS.has(key)) { e.preventDefault(); keysPressedRef.current.delete(key); }
    };
    window.addEventListener("keydown", handleKeyDown, { passive: false });
    window.addEventListener("keyup", handleKeyUp, { passive: false });
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return { clearPressedKeys, getKeyboardMovement };
}

// ── Main runtime component ───────────────────────────────────────────────────

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
  // DI props for demo-specific dependencies
  getMobileInput = () => ({ active: false, x: 0, z: 0 }),
  addWallWithData,
  getPhrase = () => "",
  selectedWallIndex = null,
  onSelectWall,
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
  /**
   * DI: Returns current joystick/mobile input state.
   * Default: no-op (always inactive). Inject `useMobileInputStore.getState` for demo.
   */
  getMobileInput?: () => { active: boolean; x: number; z: number };
  /**
   * DI: Adds a wall to the scene editor store.
   * Only used in debug mode. Inject from sceneEditorStore for demo.
   */
  addWallWithData?: (wall: GameSceneWall) => void;
  /**
   * DI: Returns a random phrase for a given key.
   * Inject `getRandomPhrase` from demo content for boundary hit messages.
   */
  getPhrase?: (key: string) => string;
  /**
   * DI: Currently selected wall index for debug editor.
   * Inject from sceneEditorStore for demo.
   */
  selectedWallIndex?: number | null;
  /**
   * DI: Callback to select a wall in the editor.
   * Inject from sceneEditorStore for demo.
   */
  onSelectWall?: (index: number) => void;
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

      addWallWithData?.({
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
    onSelectWall?.(index);
    wallInteractionRef.current = {
      mode: "resize",
      handle,
    };
  }, [onSelectWall]);

  const handleHoverWorld = useCallback((x: number, z: number) => {
    const interaction = wallInteractionRef.current;
    if (!interaction) return;

    const sceneState = useSceneStore.getState();
    if (selectedWallIndex == null) return;

    const wall = sceneState.scene.walls[selectedWallIndex];
    if (!wall) return;

    if (interaction.mode === "move") {
      // Note: wall mutation via DI – the editor store handles actual persistence
      // In debug mode, the parent (GameTouchCanvas) is responsible for providing
      // an updateSelectedWall callback. For now, this is a no-op in renderer-r3f.
      // TODO: add updateSelectedWall DI prop if needed.
      return;
    }

    // Wall resize similarly needs editor store DI – left as no-op in renderer-r3f.
    // The debug editor in web-demo should handle this via its own controller.
  }, [selectedWallIndex]);

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

    const joystick = getMobileInput();
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
        const phrase = getPhrase("boundaryHit");
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
      // Cancel the route so the character doesn't keep trying to reach an
      // unreachable destination (e.g. blocked by a wall with no valid path).
      cancelTarget();
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
      <SceneWalls
        debug={debug && showDebugWalls}
        onStartWallMove={handleStartWallMove}
        onStartWallResize={handleStartWallResize}
        selectedWallIndex={selectedWallIndex}
        onSelectWall={onSelectWall}
      />
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
