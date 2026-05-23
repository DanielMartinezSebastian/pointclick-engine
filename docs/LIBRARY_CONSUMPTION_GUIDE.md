# Library Consumption Guide

Esta guía documenta la forma recomendada de consumir la librería del engine desde una app host.

Estado del documento: v1
Alcance: integración en Next.js/React con la API pública actual.

## 1. Principio base

Consumir siempre desde la frontera pública:

- `app/lib/engine/publicApi.ts`
- `app/lib/platform-web.ts`

Evitar acoplarse a módulos internos de runtime/render/input salvo mantenimiento interno del engine.

## 2. Superficie pública recomendada

Módulo `publicApi`:

- `createGameRuntime(config)`
- `registerScene(scene)`
- `registerItem(item)`
- `registerRule(rule)`
- `getGameState()`
- `getGameActions()`
- `useGameState(selector)`
- `useGameActions()`
- `GameViewport`

Módulo `platform-web`:

- `webPlatform.storage`
- `webPlatform.clipboard`
- `webPlatform.routing`
- `webPlatform.network`
- `webPlatform.timer`
- `webPlatform.env`

## 3. Flujo canónico de integración

### Paso 1: Registrar contenido

Registrar escenas, ítems y reglas con el contrato público.

```ts
import {
  createGameRuntime,
  registerItem,
  registerRule,
  registerScene,
} from "@/app/lib/engine/publicApi";

registerScene(myScene);
registerItem(myItem);
registerRule({ key: "boundaryHit", phrases: ["Cuidado"] });

createGameRuntime({
  scenes: [myScene],
  items: [myItem],
  rules: [{ key: "boundaryHit", phrases: ["Cuidado"] }],
});
```

### Paso 2: Montar viewport

Usar `GameViewport` como punto de entrada visual del runtime.

```tsx
import { GameViewport } from "@/app/lib/engine/publicApi";

export default function Home() {
  return <GameViewport debug={false} />;
}
```

### Paso 3: Leer estado/acciones desde API pública

```tsx
import { useGameActions, useGameState } from "@/app/lib/engine/publicApi";

export function SceneSwitcher() {
  const sceneId = useGameState((s) => s.sceneId);
  const { setScene, requestRespawn } = useGameActions();

  return (
    <div>
      <p>Escena actual: {sceneId}</p>
      <button onClick={() => setScene("town")}>Town</button>
      <button onClick={() => requestRespawn()}>Respawn</button>
    </div>
  );
}
```

### Paso 4: Consumir capacidades web por puertos

```ts
import { webPlatform } from "@/app/lib/platform-web";

await webPlatform.clipboard.writeText("copiado");

const dispose = webPlatform.env.addWindowEventListener("pointerup", () => {
  // ...
});

dispose();
```

## 4. SSR y cliente

- `GameViewport` es una integración cliente del runtime.
- Los adapters de `platform-web` incluyen fallback seguro para SSR en los puertos definidos.
- Si agregas una nueva capacidad de navegador, exponerla primero en `platform-web` para mantener consistencia.

## 5. Errores comunes

1. Importar módulos internos de runtime/render directamente desde la app host.
2. Mezclar APIs directas de `window/document/navigator` en lógica de interoperabilidad sin pasar por `platform-web`.
3. Mutar estado interno fuera de las acciones públicas.
4. Añadir features en UI sin evaluar si pertenecen a un puerto de plataforma.

## 6. Checklist de consumo correcto

1. El host importa runtime desde `publicApi`.
2. El host monta `GameViewport` y no el runtime interno directamente.
3. Estado y acciones se consumen vía `useGameState`/`useGameActions` o `getGameState`/`getGameActions`.
4. Interoperabilidad web pasa por `platform-web`.
5. Validación de integración en verde:
   - `npm run lint`
   - `npm run test`
   - `npm run build`

## 7. Criterio de cambios

Cambio compatible:

- Añadir funciones nuevas sin romper firmas existentes.
- Añadir campos opcionales en tipos públicos.

Cambio breaking:

- Renombrar/remover exports públicos.
- Cambiar la semántica de acciones/estado públicos.
- Cambiar contratos de `platform-web` sin fallback.

Para breaking changes, documentar migración en la PR y actualizar esta guía.
