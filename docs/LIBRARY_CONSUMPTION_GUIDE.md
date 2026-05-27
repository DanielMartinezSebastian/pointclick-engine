# Library Consumption Guide

Guía para integrar el Point & Click Game Engine en una aplicación host.

**Estado**: v2 (post Phase 4 + Phase 5) | **Última revisión**: 2026-05-27

---

## 1. Packages disponibles

```bash
npm install @pointclick-engine/engine-core
npm install @pointclick-engine/engine-renderer-r3f  # + peer deps (ver README del package)
```

| Package | Responsabilidad |
|---------|----------------|
| `@pointclick-engine/engine-core` | Estado, reglas, pathfinding, ports. Cero React, cero browser globals. |
| `@pointclick-engine/engine-renderer-r3f` | Renderer React Three Fiber. `GameViewport`, `createGameRuntime`, sprites, scene primitives. |

---

## 2. Flujo canónico

### Paso 1: Crear el runtime

```tsx
"use client";
import { useEffect } from "react";
import { createGameRuntime, GameViewport } from "@pointclick-engine/engine-renderer-r3f";

const myScenes = [
  {
    id: "town",
    label: "Town",
    background: "/assets/bg/town.jpg",
    playerSpawn: [0, 0, 10],
    ground: { minX: -15, maxX: 15, minZ: -10, maxZ: 30, y: -3 },
    walls: [],
    interactions: [],
  },
];

export default function GamePage() {
  useEffect(() => {
    const runtime = createGameRuntime({
      scenes: myScenes,
    });
    return () => runtime.dispose();
  }, []);

  return <GameViewport />;
}
```

### Paso 2: Comunicación bidireccional (host → juego)

Desde cualquier componente HTML (fuera del Canvas), envía comandos al runtime:

```ts
import { getGameRuntime } from "@pointclick-engine/engine-renderer-r3f";

const runtime = getGameRuntime();

// Cambiar escena
runtime?.executeCommand({ type: "scene:set", sceneId: "dungeon" });

// Mostrar diálogo
runtime?.executeCommand({ type: "dialog:trigger", dialogKey: "welcomeMessage" });

// Abrir/cerrar inventario
runtime?.executeCommand({ type: "inventory:toggle" });
```

### Paso 3: Escuchar eventos del juego (juego → host)

```ts
const unsub = runtime?.on("scene:changed", (ev) => {
  console.log("Entered scene:", ev.sceneId);
});

// También: "player:moved", "dialog:triggered", "dialog:dismissed"

// Limpiar al desmontar:
unsub?.();
```

### Paso 4: Leer estado React desde la UI

```tsx
import { useGameState, useGameActions } from "@pointclick-engine/engine-renderer-r3f";

export function SceneSwitcher() {
  const sceneId = useGameState((s) => s.sceneId);
  const { setScene, requestRespawn } = useGameActions();

  return (
    <div>
      <p>Escena: {sceneId}</p>
      <button onClick={() => setScene("volcano")}>Volcano</button>
      <button onClick={() => requestRespawn()}>Respawn</button>
    </div>
  );
}
```

---

## 3. Subpath exports de `engine-core`

Para trees-haking granular, importa solo el módulo que necesitas:

```ts
import type { GameCommand }   from "@pointclick-engine/engine-core/commands";
import type { GameEvent }     from "@pointclick-engine/engine-core/events";
import type { IGameLoopPort } from "@pointclick-engine/engine-core/ports";
import type { GameVec3 }      from "@pointclick-engine/engine-core/types";
import { useSceneStore }      from "@pointclick-engine/engine-core/state";
```

---

## 4. Registrar diálogos personalizados

```ts
import { registerRule } from "@pointclick-engine/engine-renderer-r3f";

registerRule({ key: "welcomeMessage", phrases: ["¡Bienvenido al pueblo!", "¿Primera vez por aquí?"] });
registerRule({ key: "boundaryHit", phrases: ["¡Hay una pared ahí!"] });
```

---

## 5. Consideraciones SSR

- `GameViewport` lleva `"use client"` — no renderiza en servidor.
- `createGameRuntime` inicializa el store; hacerlo en `useEffect` para evitar hidratación conflictiva.
- `getGameRuntime()` devuelve `null` antes de que el runtime se cree (útil para verificar antes de llamar).

---

## 6. Errores comunes

| ❌ Hacer | ✅ En su lugar |
|----------|--------------|
| Importar módulos internos de `app/lib/engine/runtime/` directamente | Importar desde `@pointclick-engine/engine-renderer-r3f` |
| Usar `window.document` en lógica de juego | Pasar por ports / platform adapters |
| Mutar `useSceneStore` directamente desde la UI | Usar `useGameActions()` o `executeCommand()` |
| Crear el runtime varias veces | Un solo `createGameRuntime()` por instancia de juego |

---

## 7. Criterio de breaking change

**Compatible** (no requiere migración):
- Nuevas funciones en la API pública sin cambiar firmas existentes.
- Nuevos campos opcionales en tipos públicos.
- Nuevos subpath exports.

**Breaking** (requiere issue + guía de migración):
- Renombrar o eliminar exports públicos.
- Cambiar la semántica de commands/events.
- Cambiar la forma de `GameViewport` props.

---

## 8. Ver también

- [`architecture/05-bidirectional-communication.md`](architecture/05-bidirectional-communication.md) — Protocolo completo de commands & events
- [`architecture/06-renderer-implementation-guide.md`](architecture/06-renderer-implementation-guide.md) — Escribir un renderer alternativo
- [`architecture/02-public-api.md`](architecture/02-public-api.md) — Contrato estable de `publicApi`
- `packages/engine-core/README.md` — Quickstart engine-core aislado
- `packages/engine-renderer-r3f/README.md` — Quickstart renderer R3F
