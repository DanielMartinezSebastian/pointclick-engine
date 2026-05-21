"use client";

import { useCallback, useEffect, useRef } from "react";

const MOVEMENT_KEYS = new Set([
  "arrowleft",
  "arrowright",
  "arrowup",
  "arrowdown",
  "a",
  "d",
  "w",
  "s",
]);

type KeyboardMovementState = {
  moveLeft: boolean;
  moveRight: boolean;
  moveUp: boolean;
  moveDown: boolean;
  anyKeyPressed: boolean;
};

export function useKeyboardMovementInput() {
  const keysPressedRef = useRef(new Set<string>());

  const clearPressedKeys = useCallback(() => {
    keysPressedRef.current.clear();
  }, []);

  const getKeyboardMovement = useCallback((): KeyboardMovementState => {
    const pressed = keysPressedRef.current;
    const moveLeft = pressed.has("arrowleft") || pressed.has("a");
    const moveRight = pressed.has("arrowright") || pressed.has("d");
    const moveUp = pressed.has("arrowup") || pressed.has("w");
    const moveDown = pressed.has("arrowdown") || pressed.has("s");

    return {
      moveLeft,
      moveRight,
      moveUp,
      moveDown,
      anyKeyPressed: moveLeft || moveRight || moveUp || moveDown,
    };
  }, []);

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

  return {
    clearPressedKeys,
    getKeyboardMovement,
  };
}
