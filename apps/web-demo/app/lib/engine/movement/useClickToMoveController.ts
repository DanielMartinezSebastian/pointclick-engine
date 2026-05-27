"use client";

import { useCallback, useRef } from "react";
import { Vector2 } from "three";
import type { MovementPoint } from "@pointclick-engine/engine-core";

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

const DEFAULT_CONFIG: UseClickToMoveControllerConfig = {
  arrivalThreshold: 0.15,
  stuckMovementEpsilon: 0.015,
  stuckTimeoutMs: 550,
};

export function useClickToMoveController(
  config: Partial<UseClickToMoveControllerConfig> = {},
) {
  const mergedConfig: UseClickToMoveControllerConfig = {
    ...DEFAULT_CONFIG,
    ...config,
  };

  const routeRef = useRef<Vector2[] | null>(null);
  const progressRef = useRef<ClickProgressState | null>(null);

  const cancelTarget = useCallback(() => {
    routeRef.current = null;
    progressRef.current = null;
  }, []);

  const setTarget = useCallback((x: number, z: number) => {
    routeRef.current = [new Vector2(x, z)];
    progressRef.current = null;
  }, []);

  const setRoute = useCallback((points: MovementPoint[]) => {
    routeRef.current = points.map((point) => new Vector2(point.x, point.z));
    progressRef.current = null;
  }, []);

  const resolveDirection = useCallback(
    (
      positionX: number,
      positionZ: number,
      delta: number,
      manualInputActive: boolean,
    ): AutoMoveDirection => {
      if (manualInputActive || !routeRef.current?.length) {
        if (manualInputActive) {
          cancelTarget();
        }
        return { horizontal: 0, vertical: 0 };
      }

      let route = routeRef.current;
      const step = 2.5 * delta;

      while (route?.length) {
        const currentTarget = route[0];
        const dx = currentTarget.x - positionX;
        const dz = currentTarget.y - positionZ;
        const dist = Math.sqrt(dx * dx + dz * dz);

        if (dist > step && dist >= mergedConfig.arrivalThreshold) {
          return {
            horizontal: dx / dist,
            vertical: dz / dist,
          };
        }

        if (route.length === 1) {
          const snapToTarget = { x: currentTarget.x, z: currentTarget.y };
          cancelTarget();
          return { horizontal: 0, vertical: 0, snapToTarget };
        }

        route = route.slice(1);
        routeRef.current = route;
        progressRef.current = null;
      }

      cancelTarget();
      return { horizontal: 0, vertical: 0 };
    },
    [cancelTarget, mergedConfig.arrivalThreshold],
  );

  const registerProgress = useCallback(
    (
      positionX: number,
      positionZ: number,
      delta: number,
      manualInputActive: boolean,
    ) => {
      if (manualInputActive || !routeRef.current?.length) {
        progressRef.current = null;
        return { stuck: false };
      }

      const currentTarget = routeRef.current[0];
      const dx = currentTarget.x - positionX;
      const dz = currentTarget.y - positionZ;
      const distToTarget = Math.sqrt(dx * dx + dz * dz);

      if (distToTarget <= mergedConfig.arrivalThreshold) {
        progressRef.current = null;
        return { stuck: false };
      }

      const previousProgress = progressRef.current ?? {
        x: positionX,
        z: positionZ,
        stuckMs: 0,
      };

      const moved = Math.hypot(
        positionX - previousProgress.x,
        positionZ - previousProgress.z,
      );
      const nextProgress: ClickProgressState = {
        x: positionX,
        z: positionZ,
        stuckMs:
          moved < mergedConfig.stuckMovementEpsilon
            ? previousProgress.stuckMs + delta * 1000
            : 0,
      };

      progressRef.current = nextProgress;

      if (nextProgress.stuckMs >= mergedConfig.stuckTimeoutMs) {
        cancelTarget();
        return { stuck: true };
      }

      return { stuck: false };
    },
    [
      cancelTarget,
      mergedConfig.arrivalThreshold,
      mergedConfig.stuckMovementEpsilon,
      mergedConfig.stuckTimeoutMs,
    ],
  );

  return {
    setTarget,
    setRoute,
    cancelTarget,
    resolveDirection,
    registerProgress,
  };
}
