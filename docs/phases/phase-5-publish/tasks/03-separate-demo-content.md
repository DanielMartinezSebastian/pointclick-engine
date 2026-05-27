# Task 03: Separate demo content from app

**Phase**: 5 | **Estimate**: 3h | **Owner**: —

## Context

Hoy `apps/web-demo/app/{scenes,items,dialogs}` mezcla **demo content** (escenas concretas, ítems del juego, frases) con el **código de la app** (rutas Next.js, layouts, components). Para un consumer externo no es obvio qué es ejemplo y qué es engine. Esta task aísla el contenido de demo en una carpeta clara y deja la app como un envoltorio mínimo que lo consume.

## Prerequisites

- [ ] Phase 4 cerrada
- [ ] Familiaridad con `apps/web-demo/app/page.tsx` (consumer principal del contenido)

## Action

### 1. Crear estructura `demo-content/`

```bash
mkdir -p apps/web-demo/demo-content/{scenes,items,dialogs}
```

Estructura objetivo:

```
apps/web-demo/
├── app/                     # Solo rutas Next.js, components UI, layout
│   ├── page.tsx
│   ├── example-bridge/
│   ├── components/
│   ├── lib/
│   └── store/               # Stores UI específicos demo (inventory/dialog si vive aquí)
├── demo-content/            # ← NUEVO: content registrable vía engine
│   ├── index.ts             # Barrel: re-exporta scenes/items/dialogs
│   ├── README.md            # Qué hay aquí y cómo se usa
│   ├── scenes/
│   ├── items/
│   └── dialogs/
└── package.json
```

### 2. Mover archivos

```bash
git mv apps/web-demo/app/scenes/scenes.ts apps/web-demo/demo-content/scenes/scenes.ts
git mv apps/web-demo/app/items/index.ts apps/web-demo/demo-content/items/index.ts
git mv apps/web-demo/app/items/types.ts apps/web-demo/demo-content/items/types.ts
git mv apps/web-demo/app/dialogs/index.ts apps/web-demo/demo-content/dialogs/index.ts
git mv apps/web-demo/app/dialogs/types.ts apps/web-demo/demo-content/dialogs/types.ts
git mv apps/web-demo/app/dialogs/getRandomPhrase.ts apps/web-demo/demo-content/dialogs/getRandomPhrase.ts
```

### 3. Crear barrel `demo-content/index.ts`

```ts
export { scenes as demoScenes } from "./scenes/scenes";
export { items as demoItems } from "./items";
export { dialogs as demoDialogs } from "./dialogs";
export { getRandomPhrase } from "./dialogs/getRandomPhrase";
```

### 4. Actualizar imports en `apps/web-demo/app/`

Encontrar todos los imports rotos:

```bash
grep -rn "from \"../scenes\|from \"../items\|from \"../dialogs\|from \"@/scenes\|from \"@/items\|from \"@/dialogs" apps/web-demo/app/
```

Reemplazar por `from "../../demo-content"` o el path correcto. Si hay un `@/` alias en `tsconfig.json`, añadir `"@/demo-content/*": ["demo-content/*"]` para mantener legibilidad.

### 5. Crear `demo-content/README.md`

```markdown
# Demo Content

Contenido de juego de la demo: escenas, ítems y diálogos.

**Aviso**: este código NO forma parte del engine publicable. Es el ejemplo
canónico de cómo un consumer construye sus datos y los pasa a `createGameRuntime`.

Si vienes de un fork o un proyecto nuevo:

1. Reemplaza los archivos en `scenes/`, `items/`, `dialogs/` por los tuyos.
2. Mantén la misma forma (`GameSceneConfig`, `GameItemConfig`, `GameRuleConfig`).
3. Importa todo vía `demoScenes`, `demoItems`, `demoDialogs` en `app/page.tsx`.

## Estructura

- `scenes/`: definiciones `GameSceneConfig[]`
- `items/`: definiciones `GameItemConfig[]` + tipos auxiliares de UI
- `dialogs/`: `GameRuleConfig[]` + helper `getRandomPhrase`

## Por qué está separado del engine

El engine (`packages/engine-core`, `packages/engine-renderer-r3f`) es agnóstico al
contenido. Cualquier proyecto consumidor escribirá su propio `demo-content/`. Tener
este ejemplo separado documenta el contrato sin acoplarlo a Next.js o React.
```

### 6. Actualizar `apps/web-demo/app/page.tsx`

El compositor principal ahora importa:

```tsx
import { demoScenes, demoItems, demoDialogs } from "../../demo-content";
import { createGameRuntime } from "./lib/engine/publicApi";

// ... createGameRuntime({ scenes: demoScenes, items: demoItems, rules: demoDialogs })
```

### 7. Verificar que el renderer no importa demo-content

```bash
grep -rn "demo-content" packages/
```

**Esperado**: 0 resultados. Si aparece, es regresión grave: el engine quedó acoplado a la demo.

### 8. Actualizar `apps/web-demo/tsconfig.json`

Si añadiste alias `@/demo-content/*`, registrarlo en `paths`. Verificar `include` cubre `demo-content/**/*`.

## Success Criteria

- [ ] `apps/web-demo/demo-content/` existe con scenes/, items/, dialogs/, README.md, index.ts
- [ ] `apps/web-demo/app/scenes/`, `/items/`, `/dialogs/` ya no existen (todo movido)
- [ ] `grep "demo-content" packages/` devuelve 0 resultados
- [ ] `npm run build -w apps/web-demo` pasa
- [ ] `npm run test -w apps/web-demo` pasa
- [ ] Demo principal `/` carga con todo el contenido visible (escenas, ítems, diálogos)
- [ ] `/example-bridge` sigue funcionando
- [ ] Bundle size de Next.js no creció >5% (medir antes/después con `npm run build` output)

## On Complete

1. Marca `[x]` en `../tracking.md` para `03-separate-demo-content`
2. Commit:
   ```
   refactor(web-demo): isolate demo content into demo-content/

   Demo scenes/items/dialogs moved to apps/web-demo/demo-content/
   to clarify what is engine vs what is consumer example.

   - [x] Marked: 03-separate-demo-content

   See docs/phases/phase-5-publish/tasks/03-separate-demo-content.md
   ```

## References

- Architecture: `docs/architecture/01-layers.md` (la capa "Presentación" es content; el engine no debería conocerla)
- `apps/web-demo/app/page.tsx` (compositor principal)

## Notes

**Trampa común**: si `app/items/types.ts` define tipos que también usa la UI (`InventorySlot`, etc.), separar:

- Tipos puros de **content** (qué define un ítem) → `demo-content/items/types.ts`
- Tipos de **UI** (cómo se pinta un slot, estado del inventario) → `app/components/inventory/types.ts` o store

Si la división es ambigua, mantener tipo en `demo-content/` y re-exportar desde la UI con un alias específico.

**No mover a `packages/`**: este content NO es parte del engine publicable. Si en el futuro se quiere un "demo content package" para que la gente lo instale como punto de partida, eso es post-v1.0.
