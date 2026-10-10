# Library Consumption Guide

Guía para integrar el Point & Click Game Engine en una aplicación host (paquetes 0.5.0). Ejemplo verificable: `apps/web-demo/app/example-minimal/page.tsx`.

## 1. Paquetes

```bash
npm install @pointclick-engine/engine-core @pointclick-engine/engine-renderer-r3f
# + peer deps del renderer (ver packages/engine-renderer-r3f/README.md)
```

| Paquete | Responsabilidad |
|---------|----------------|
| `@pointclick-engine/engine-core` | Runtime agnóstico (`createGameRuntime`, registros, comandos/eventos), stores, reglas, pathfinding, puertos. Cero React. |
| `@pointclick-engine/engine-renderer-r3f` | `GameViewport` jugable, hooks de estado, sprites y escena R3F. Depende del core. |

El runtime vive en `packages/engine-core/src/game/runtime/`. Contrato exacto de exports: [`LIBRARY_API_CONTRACT_V1.md`](LIBRARY_API_CONTRACT_V1.md).

## 2. Flujo canónico

Resumen de `apps/web-demo/app/example-minimal/page.tsx` (importa solo de los paquetes): crear el runtime una vez, y montar `GameViewport` cuando exista.

```tsx
"use client";

import { useEffect, useState } from "react";
import {
  createGameRuntime,
  sceneTransitionOnCollision,
  type GameItemConfig,
  type GameRuntime,
  type GameSceneConfig,
} from "@pointclick-engine/engine-core";
import { GameViewport } from "@pointclick-engine/engine-renderer-r3f";

const SCENE_A: GameSceneConfig = {
  id: "minimal-a",
  label: "Minimal Scene A",
  background: "/assets/background/town.jpg",
  playerSpawn: [3.08, 1.05, 13.44],
  ground: { minX: -12, maxX: 17, minZ: -15, maxZ: 30, y: -3.25 },
  walls: [], interactions: [],
  transitions: [
    sceneTransitionOnCollision({
      id: "transition-a-to-b",
      targetSceneId: "minimal-b",
      position: [2, -1, -12], halfSize: [6, 4, 2],
      spawnPosition: [0, -1.1, 20], targetPosition: [0, -1.1, 10],
    }),
  ],
};

// Resumida: el ejemplo real añade la transición de vuelta B -> A.
const SCENE_B: GameSceneConfig = {
  id: "minimal-b",
  label: "Minimal Scene B",
  background: "/assets/background/mazmorra.jpg",
  playerSpawn: [0, -1.1, 13.44],
  ground: { minX: -14.4, maxX: 15.8, minZ: -20.6, maxZ: 60.6, y: -3.15 },
  walls: [], interactions: [],
};

const TROPHY_ITEM: GameItemConfig = {
  id: "trophy",
  name: "Trophy",
  spriteUrl: "/assets/trophy/trophy.png",
  interactionRules: {}, defaultRule: { outcome: "return" },
};

export default function MinimalGame() {
  const [runtime, setRuntime] = useState<GameRuntime | null>(null);
  useEffect(() => {
    const created = createGameRuntime({ scenes: [SCENE_A, SCENE_B], items: [TROPHY_ITEM] });
    setRuntime(created);
    return () => {
      created.dispose();
      setRuntime(null);
    };
  }, []);

  if (!runtime) return null;
  return (
    <GameViewport
      runtime={runtime}
      initialSceneId="minimal-a"
      getInitialPlacedItems={(sceneId) =>
        sceneId !== "minimal-a"
          ? null
          : [
              {
                id: "trophy-in-scene-a", itemId: "trophy",
                interactionId: "trophy-pickup-zone", name: "Trophy", spriteUrl: "/assets/trophy/trophy.png",
                worldPosition: [6.5, -2.4, 13.4],
                canPickup: true,
              },
            ]
      }
    />
  );
}
```

Con estos valores por defecto el juego es jugable: personaje incluido, inventario, recogida/colocación de ítems y transiciones. Sin `storage` no persiste la escena; sin `audio` no suena.

## 3. Opciones de `GameViewport`

`GameViewportProps` = opciones de `useGameViewportController` + props de `GameViewportView` + `debug` y `onRuntimeEvent`. Todas son opcionales.

| Para... | Opciones |
|---------|----------|
| **Escena inicial y persistencia** | `initialSceneId` (escena si no hay guardada), `storage` (`SceneProgressStorage`: `loadSceneId`/`saveSceneId`), `startPersistence` (arranca el guardado de inventario e ítems; devuelve su limpieza), `resolveScene` (por defecto, el registro del runtime) |
| **Reglas del juego** | `canLeaveScene` (`true` deja salir; `{ text, dialogKey? }` bloquea y muestra el diálogo), `getInitialPlacedItems(sceneId, allItems)` (array = siembra; `null` = no marca la escena como sembrada), `onSceneEnter(sceneId, { showDialog })`, `getPhrase(key)`, `itemContext`, `filterPlacedItems`, `canPickupItems` |
| **Audio** | `audio`: `{ port, defaults, items, transitions, settingsStore, scenes? }`. Sin `audio` no hay sonido. Los sonidos se declaran en datos (`pickupSoundUrl`/`dropSoundUrl` del ítem, `music` de la escena). Solo `outcome: "place"` reproduce el sonido de soltar |
| **Personaje** | `character: CharacterDefinition` (por defecto, el incluido), `spriteRuntimeProps` |
| **Extensión** | `children` (dentro de `<Physics>`, p. ej. puertas), `canvasChildren` (en el Canvas, fuera de `<Physics>`), `overlay` (HTML sobre el canvas), `cameraMode` (`"fixed"` por defecto), `onSceneReady` |
| **Observación** | `runtime` (por defecto, `getGameRuntime()`), `onRuntimeEvent` (callback legacy), `debug` |

## 4. `useGameViewportController` + `GameViewportView`

`GameViewport` es la composición de ambos. Úsalos por separado cuando tu UI necesita datos del controlador (escena actual, estado del diálogo, inventario) fuera del Canvas:

```tsx
import {
  GameViewportView,
  useGameViewportController,
} from "@pointclick-engine/engine-renderer-r3f";

function Game() {
  const controller = useGameViewportController({ initialSceneId: "minimal-a" });
  return <GameViewportView controller={controller} overlay={<p>{controller.sceneId}</p>} />;
}
```

## 5. Comandos y eventos

```ts
import { getGameRuntime } from "@pointclick-engine/engine-core";

const runtime = getGameRuntime(); // null antes de createGameRuntime o tras dispose()

runtime?.executeCommand({ type: "scene:set", sceneId: "minimal-b", spawnPosition: [0, -1.1, 20] });
runtime?.executeCommand({ type: "dialog:trigger", dialogKey: "welcomeMessage" });
runtime?.executeCommand({ type: "inventory:toggle" });

const unsub = runtime?.on("item:pickedUp", (ev) => console.log(ev.itemId));
unsub?.();
```

- `scene:set` acepta `spawnPosition?`; `transition:activate` respeta el `spawnPosition` de la transición.
- `player:stop` aborta una caminata por ruta (emite `player:walkAborted`); **no** detiene el movimiento manual por teclado/joystick.
- Texto de diálogos: `registerRule({ key, phrases })` (o `rules` en `createGameRuntime`). Sin regla, `dialog:trigger` muestra la propia clave.
- Catálogo completo de comandos y eventos: [`architecture/05-bidirectional-communication.md`](architecture/05-bidirectional-communication.md).

## 6. Leer estado desde la UI

```tsx
import { useGameActions, useGameState } from "@pointclick-engine/engine-renderer-r3f";

export function SceneSwitcher() {
  const sceneId = useGameState((s) => s.sceneId);
  const { setScene } = useGameActions();
  return (
    <button onClick={() => setScene("minimal-b")}>
      {sceneId} → B
    </button>
  );
}
```

`GameState` = `sceneId`, `scene`, `playerPosition`, `respawnSignal`. `GameActions` también trae `setPlayerPosition` y `requestRespawn`. `GameActions.setScene` es `(sceneId: string) => void`.

Stores reactivos del core (selector de zustand, como en el ejemplo): `useSceneStore`, `useInventoryStateStore` (`slots`), `usePlacedItemsStateStore` (`items`), `useDialogStore`, `useInventoryUiStore`. La persistencia del inventario va por puerto (`KeyValueStoragePort`, `loadInventorySlotsState`/`saveInventorySlotsState`, `loadPlacedItemsState`/`savePlacedItemsState`).

## 7. SSR

- `GameViewport` y los hooks del renderer llevan `"use client"`: no renderizan en servidor.
- Crea el runtime en `useEffect` y monta el viewport cuando exista (como en el flujo canónico).

## 8. Limitaciones conocidas

- `inventory:pickup` e `inventory:drop` siguen sin executor (solo avisan por consola): recoger y soltar ocurre por la interacción del viewport.
- Las puertas son de la demo (`apps/web-demo/app/lib/engine/runtime/useDoorSystem.ts`), no del motor.
- Los registros de escenas, ítems y reglas son globales de módulo: un solo juego por página.
- Algunos outcomes legacy (`rule-miss`, `on-player`, `pickup-blocked`, `item-interact`, `unknown-item`) siguen viajando como `item:dropped` con un `outcome` fuera del tipo; filtra por `outcome`.

## 9. Errores comunes

| No hacer | En su lugar |
|----------|-------------|
| Importar `createGameRuntime` o `registerRule` de `engine-renderer-r3f` | Importar del core: `@pointclick-engine/engine-core` |
| Escuchar `item:dropped` para detectar recogidas | Escuchar `item:pickedUp` |
| Montar `GameViewport` antes de crear el runtime | Esperar al runtime (estado + `useEffect`) |
| Crear el runtime varias veces | Un `createGameRuntime()` por juego; `dispose()` al desmontar |
| Esperar que `player:stop` frene el teclado | Solo detiene caminatas por ruta |

## 10. Ver también

- [`LIBRARY_API_CONTRACT_V1.md`](LIBRARY_API_CONTRACT_V1.md) — Superficie soportada y novedades 0.5.0
- [`architecture/02-public-api.md`](architecture/02-public-api.md) — Resumen de la API pública
- [`architecture/05-bidirectional-communication.md`](architecture/05-bidirectional-communication.md) — Commands & Events
