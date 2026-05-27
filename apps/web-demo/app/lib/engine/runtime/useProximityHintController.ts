import { useEffect, useRef } from "react";

import { getRandomPhrase } from "../../../../demo-content/dialogs/getRandomPhrase";
import type { SceneInteraction } from "../../../../demo-content/scenes/scenes";
import type { PlacedSceneItem } from "../types/gameRuntime";

/**
 * Radio máximo (en unidades de mundo, XZ) para activar el hint de proximidad.
 * "Muy cercano" = dentro de 1.8 unidades del centro del target.
 */
const PROXIMITY_RADIUS = 1.8;

/**
 * Cooldown mínimo entre hints del MISMO target (ms).
 * Evita spam si el personaje se queda parado cerca.
 */
const HINT_COOLDOWN_MS = 10_000;

type ShowSpeechBubble = (
  text: string,
  meta?: { source?: "inventory" | "debug"; dialogKey?: string },
) => void;

/**
 * Detecta cuando el personaje entra en la zona de proximidad de un target
 * con `hintDialogKeys` y muestra un diálogo de pista.
 *
 * - Dispara solo al ENTRAR en la zona (edge-triggered, no continuo).
 * - Cooldown por interaction para no repetir spam.
 * - Elige "empty" u "occupied" según si hay un ítem colocado en ese target.
 */
export function useProximityHintController({
  playerPosition,
  interactions,
  placedItems,
  showSpeechBubble,
}: {
  playerPosition: [number, number, number];
  interactions: SceneInteraction[];
  placedItems: PlacedSceneItem[];
  showSpeechBubble: ShowSpeechBubble;
}) {
  // Tracks si el jugador ESTABA dentro de cada zona en el tick anterior
  const wasInsideRef = useRef<Record<string, boolean>>({});
  // Timestamp del último hint por interaction
  const lastHintAtRef = useRef<Record<string, number>>({});

  useEffect(() => {
    const [px, , pz] = playerPosition;

    for (const interaction of interactions) {
      if (!interaction.hintDialogKeys) continue;

      const [ix, , iz] = interaction.position;
      const dx = px - ix;
      const dz = pz - iz;
      const dist = Math.sqrt(dx * dx + dz * dz);
      const isInside = dist <= PROXIMITY_RADIUS;
      const wasInside = wasInsideRef.current[interaction.id] ?? false;

      // Solo dispara al entrar (flanco de subida)
      if (isInside && !wasInside) {
        const now = Date.now();
        const lastAt = lastHintAtRef.current[interaction.id] ?? 0;

        if (now - lastAt >= HINT_COOLDOWN_MS) {
          const isOccupied = placedItems.some(
            (item) => item.interactionId === interaction.id,
          );
          const dialogKey = isOccupied
            ? interaction.hintDialogKeys.occupied
            : interaction.hintDialogKeys.empty;

          showSpeechBubble(getRandomPhrase(dialogKey), { dialogKey });
          lastHintAtRef.current[interaction.id] = now;
        }
      }

      wasInsideRef.current[interaction.id] = isInside;
    }
  }, [playerPosition, interactions, placedItems, showSpeechBubble]);
}
