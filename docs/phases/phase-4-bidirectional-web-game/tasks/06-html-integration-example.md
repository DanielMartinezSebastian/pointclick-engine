# Task 06: HTML integration example

**Phase**: 4 | **Estimate**: 3h | **Owner**: —

## Context

Phase 4 promete que el motor puede integrarse desde fuera de React/R3F. Esta task lo demuestra construyendo una página de ejemplo que:

1. Monta el `GameViewport` normalmente (sigue siendo React).
2. Añade UI **HTML pura** (botones, formulario) que envían **comandos** al runtime y reciben **eventos** del juego.
3. Sirve de smoke test y referencia para los docs (Task 07).

No es una salida del repo: vive en `apps/web-demo/app/example-bridge/page.tsx` como ruta opcional (`/example-bridge`).

## Prerequisites

- [ ] Task 05 done (`runtime.executeCommand`, `runtime.on` expuestos)
- [ ] Demo principal sigue funcionando (`npm run dev` → `http://localhost:3000`)

## Action

### 1. Crear ruta de ejemplo

Estructura:

```
apps/web-demo/app/example-bridge/
├── page.tsx                # Compositor: GameViewport + HTML controls
├── HtmlBridgePanel.tsx     # Panel HTML/JS plano (sin lógica de juego)
└── README.md               # Cómo correr y qué demuestra
```

### 2. `page.tsx` — composición mínima

```tsx
"use client";
import { useEffect, useRef } from "react";
import { GameViewport, createGameRuntime, getGameRuntime, type GameRuntime } from "../lib/engine/publicApi";
import { demoScenes, demoItems, demoRules } from "../lib/demo/content"; // ajustar al path real
import HtmlBridgePanel from "./HtmlBridgePanel";

export default function ExampleBridgePage() {
  const runtimeRef = useRef<GameRuntime | null>(null);
  useEffect(() => {
    runtimeRef.current = createGameRuntime({
      scenes: demoScenes,
      items: demoItems,
      rules: demoRules,
    });
    return () => runtimeRef.current?.dispose();
  }, []);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", height: "100vh" }}>
      <GameViewport />
      <HtmlBridgePanel />
    </div>
  );
}
```

### 3. `HtmlBridgePanel.tsx` — UI HTML que usa el runtime

```tsx
"use client";
import { useEffect, useState } from "react";
import { getGameRuntime } from "../lib/engine/publicApi";

export default function HtmlBridgePanel() {
  const [log, setLog] = useState<string[]>([]);

  useEffect(() => {
    const rt = getGameRuntime();
    if (!rt) return;
    const unsubs = [
      rt.on("scene:changed", (e) => setLog((l) => [...l.slice(-9), `→ scene: ${e.sceneId}`])),
      rt.on("player:collided", (e) => setLog((l) => [...l.slice(-9), `× collision (${e.reason})`])),
      rt.on("item:pickedUp", (e) => setLog((l) => [...l.slice(-9), `+ picked: ${e.itemId}`])),
      rt.on("dialog:triggered", (e) => setLog((l) => [...l.slice(-9), `💬 ${e.text.slice(0, 40)}`])),
    ];
    return () => unsubs.forEach((u) => u());
  }, []);

  function dispatch(cmd: Parameters<NonNullable<ReturnType<typeof getGameRuntime>>["executeCommand"]>[0]) {
    getGameRuntime()?.executeCommand(cmd);
  }

  return (
    <aside style={{ padding: 16, fontFamily: "monospace", borderLeft: "1px solid #333" }}>
      <h3>Bridge panel (HTML → game)</h3>
      <button onClick={() => dispatch({ type: "scene:set", sceneId: "town" })}>Goto town</button>
      <button onClick={() => dispatch({ type: "scene:respawn" })}>Respawn</button>
      <button onClick={() => dispatch({ type: "player:move", position: [0, 0, 5] })}>Move to [0,0,5]</button>
      <h4>Event log (game → HTML)</h4>
      <ul>{log.map((l, i) => <li key={i}>{l}</li>)}</ul>
    </aside>
  );
}
```

### 4. Documentar la ruta

`apps/web-demo/app/example-bridge/README.md`:

```markdown
# Example: Bridge HTML ↔ Game

Demuestra el contrato de Phase 4: comandos web → juego y eventos juego → web.

Run: `npm run dev` → `http://localhost:3000/example-bridge`

- Panel derecho: botones HTML que disparan `executeCommand` y log que se rellena vía `on()`.
- Canvas izquierdo: motor R3F estándar.
- Nada en el panel HTML conoce R3F ni el store: solo el handle `GameRuntime`.

Esto prueba que la misma estrategia funciona desde un iframe, Electron preload, o cualquier wrapper no-React (la única razón por la que el panel está en TSX es para co-ubicarlo en la app de demo, no por dependencia técnica con el runtime).
```

### 5. Smoke test manual

- Abrir `/example-bridge`
- Click en "Goto town": la escena cambia y el log muestra `→ scene: town`
- Mover personaje contra una pared: el log muestra `× collision (boundary)`
- Recoger un ítem: el log muestra `+ picked: <id>`
- Click "Respawn": player vuelve al spawn de la escena actual

Si algún botón no funciona, depurar antes de marcar la task. Probable causa: un comando registrado como no-op en Task 05 que requiere cableado real.

## Success Criteria

- [ ] Ruta `/example-bridge` carga sin error de consola
- [ ] Los 3 botones del panel disparan comandos válidos
- [ ] Al menos 3 de los 4 tipos de evento aparecen en el log durante el smoke test
- [ ] `npm run build` (Next.js) pasa con la nueva ruta
- [ ] `npm run lint` pasa
- [ ] Demo principal en `/` no se afectó (golden path sigue verde)

## On Complete

1. Marca `[x]` en `../tracking.md` para `06-html-integration-example`
2. Commit:
   ```
   feat(demo): add /example-bridge route showcasing bidirectional API

   - [x] Marked: 06-html-integration-example

   See docs/phases/phase-4-bidirectional-web-game/tasks/06-html-integration-example.md
   ```

## References

- Task previa: 05 (expose-bidirectional-api)
- ADR-0006: shape de comandos/eventos
- Patrón paralelo: `apps/web-demo/app/page.tsx` (composición canónica de la demo)

## Notes

Si algún comando aún está como no-op (ej. `inventory:pickup`), agregar un botón pero anotarlo en el README como "wired in Phase 5". No bloquea esta task.

Si la integración revela que `getGameRuntime()` no expone bien el handle (por ejemplo, race en `useEffect`), considerar añadir un evento `runtime:ready` o documentar el patrón en Task 07.
