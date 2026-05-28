"use client";

import { useEffect, useRef } from "react";
import { CuboidCollider, RigidBody } from "@react-three/rapier";

import { useSceneStore } from "@pointclick-engine/engine-core";
import type {
  SceneDoor,
  SceneInteractionHintDialogKeys,
  SceneWallOpening,
} from "../../../demo-content/scenes/scenes";
import { useDoorStore } from "../../store/doorStore";
import { useEditorModeStore } from "../../store/editorModeStore";

/**
 * Renders the interactive doors of the active scene.
 *
 * Each door drives three independent effects on its parent wall:
 *
 * 1. **Texture swap** — `wall.textureUrl` is set to `closedTextureUrl` while
 *    the door is closed and to `openTextureUrl` while it is open. Both
 *    textures bake the door's visual into the wall plane, so there is no
 *    overlay sprite to fight depthTest against (closes issue: door sprite
 *    drawing on top of the character).
 *
 * 2. **Pathfinding opening toggle** — when closed, the wall's `openings[]`
 *    entry matching `openingId` is removed so the core pathfinder treats
 *    the wall as fully solid. When open, the original entry is restored.
 *
 * 3. **Physics collider** — a `<RigidBody type="fixed">` with a single
 *    CuboidCollider is mounted only while closed, plugging the wall opening
 *    so Rapier-driven movement (keyboard / joystick) also fails to cross.
 *
 * Clicking the invisible mesh that covers the door's footprint toggles it.
 * The click mesh only mounts while the door is closed — once open the
 * player has unrestricted access to the opening. To re-close from the
 * demo, reload or call `useDoorStore.getState().setOpen(id, false)`.
 *
 * Door state lives in `doorStore` (keyed by door id) and survives scene
 * changes — open/closed persists until you call `reset()`.
 *
 * MUST be a child of `<Physics>` so the `<RigidBody>` mounts a Rapier body.
 */
export function SceneDoors({ doors }: { doors: readonly SceneDoor[] }) {
  if (doors.length === 0) return null;
  return (
    <>
      {doors.map((door) => (
        <SceneDoorEntry key={door.id} door={door} />
      ))}
    </>
  );
}

function SceneDoorEntry({ door }: { door: SceneDoor }) {
  const setOpen = useDoorStore((s) => s.setOpen);
  const isOpen = useDoorStore((s) => s.isOpen(door.id));
  const toggle = useDoorStore((s) => s.toggle);
  // Edit mode = quick debug toggle by clicking on the door. In `game` mode
  // doors are opened only through the engine's item-drop pipeline (drag the
  // matching key onto the door drop-target). Keeps the gameplay rule-driven
  // and the editor productive.
  const interactionMode = useEditorModeStore((s) => s.interactionMode);
  const allowDebugClickToggle = interactionMode === "edit";

  // Snapshot the wall's original opening matching openingId. We need this
  // to restore the opening when the door re-opens — `useSceneStore` may
  // not still hold it (we mutated it on close).
  const originalOpeningRef = useRef<SceneWallOpening | null>(null);
  // Snapshot the drop-target's original hintDialogKeys so we can hide them
  // when the door is open (since "use a key" no longer applies) and restore
  // them on close. `door.showHintWhenOpen` opts out of this hiding.
  const originalHintKeysRef = useRef<SceneInteractionHintDialogKeys | null>(null);

  // Seed the door state on first mount only — preserve any pre-existing
  // user toggle across scene changes / unmounts.
  useEffect(() => {
    const state = useDoorStore.getState().doorOpenStates;
    if (state[door.id] === undefined) {
      setOpen(door.id, Boolean(door.openByDefault));
    }
  }, [door.id, door.openByDefault, setOpen]);

  // Snapshot the original opening + matching interaction's hintDialogKeys
  // on first mount so we can restore them when toggling. Only runs once per
  // door instance.
  useEffect(() => {
    const scene = useSceneStore.getState().scene;
    const wall = scene.walls[door.wallIndex];
    if (wall) {
      const opening = wall.openings?.find((o) => o.id === door.openingId);
      if (opening) {
        originalOpeningRef.current = {
          id: opening.id,
          position: [...opening.position],
          halfSize: [...opening.halfSize],
        };
      }
    }
    const interaction = scene.interactions.find((i) => i.id === door.id);
    if (interaction?.hintDialogKeys) {
      originalHintKeysRef.current = { ...interaction.hintDialogKeys };
    }
    // intentional: snapshot once on mount of this door entry
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply texture swap + opening toggle whenever isOpen changes.
  useEffect(() => {
    const updateWall = useSceneStore.getState().updateWall;
    updateWall(door.wallIndex, (wall) => {
      // Texture
      const textureUrl = isOpen ? door.openTextureUrl : door.closedTextureUrl;
      // Openings: open → ensure original opening is present; closed → remove.
      const original = originalOpeningRef.current;
      const existing = wall.openings ?? [];
      let nextOpenings: SceneWallOpening[] | undefined;
      if (isOpen) {
        const alreadyPresent = existing.some((o) => o.id === door.openingId);
        if (!alreadyPresent && original) {
          nextOpenings = [...existing, original];
        } else {
          nextOpenings = existing;
        }
      } else {
        const filtered = existing.filter((o) => o.id !== door.openingId);
        nextOpenings = filtered.length > 0 ? filtered : undefined;
      }
      return {
        ...wall,
        textureUrl,
        openings: nextOpenings,
      };
    });
  }, [door.closedTextureUrl, door.openTextureUrl, door.openingId, door.wallIndex, isOpen]);

  // Hide the drop-target's hint dialogs when the door is open. Once unlocked
  // the "use a key" hint is no longer relevant, and any further proximity
  // chatter would just be noise. Opt back in with `door.showHintWhenOpen`.
  useEffect(() => {
    const updateInteraction = useSceneStore.getState().updateInteraction;
    const restored = originalHintKeysRef.current;
    const shouldHide = isOpen && !door.showHintWhenOpen;
    updateInteraction(door.id, (interaction) => ({
      ...interaction,
      hintDialogKeys: shouldHide ? undefined : (restored ?? interaction.hintDialogKeys),
    }));
  }, [door.id, door.showHintWhenOpen, isOpen]);

  // Closed: render click box + collider. Open: nothing (player can walk
  // through; the wall texture already shows the hole).
  if (isOpen) return null;

  return (
    <RigidBody
      type="fixed"
      colliders={false}
      position={door.position}
      rotation={[0, door.rotationY ?? 0, 0]}
    >
      <CuboidCollider args={door.halfSize} />
      {/* Click area only mounted in edit mode — gameplay opens the door via
          the engine's item-drop pipeline. */}
      {allowDebugClickToggle && (
        <mesh
          onPointerDown={(event) => {
            event.stopPropagation();
            toggle(door.id);
          }}
        >
          <boxGeometry
            args={[door.halfSize[0] * 2, door.halfSize[1] * 2, door.halfSize[2] * 2]}
          />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}
    </RigidBody>
  );
}
