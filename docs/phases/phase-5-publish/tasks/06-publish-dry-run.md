# Task 06: Publish dry-run via tarball

**Phase**: 5 | **Estimate**: 3h | **Owner**: —

## Context

Antes de un `npm publish` real, validar que los packages instalados desde un tarball funcionan en un proyecto fuera del monorepo. Esto cazará bugs como: `.d.ts` faltantes, subpath exports que apuntan a paths inexistentes, peer deps sin documentar, side-effects no marcados.

## Prerequisites

- [ ] Task 04 done (exports + metadata listos)
- [ ] Task 05 done (README/LICENSE/CHANGELOG presentes)
- [ ] Build limpio: `npm run build` desde la raíz pasa

## Action

### 1. Construir y empaquetar

```bash
npm run build -w packages/engine-core
npm run build -w packages/engine-renderer-r3f

npm pack -w packages/engine-core
npm pack -w packages/engine-renderer-r3f
```

**Resultado**: 2 tarballs `.tgz` en la raíz (o en los respectivos packages, según versión de npm). Anotar paths.

### 2. Crear sandbox de instalación

Fuera del monorepo:

```bash
mkdir -p /tmp/pointclick-sandbox && cd /tmp/pointclick-sandbox
npm init -y
npm install /<path>/pointclick-engine-core-0.1.0.tgz
```

Validar:

```bash
node -e "const c = require('@pointclick-engine/engine-core'); console.log(Object.keys(c))"
```

**Esperado**: lista de exports (EventBus, CommandHandler, GameVec3, useSceneStore, etc.). Si falla con `ERR_REQUIRE_ESM`, usar:

```bash
node --input-type=module -e "import * as c from '@pointclick-engine/engine-core'; console.log(Object.keys(c))"
```

### 3. Probar subpath imports

Crear `/tmp/pointclick-sandbox/test.mjs`:

```js
import { CommandHandler, type GameCommand } from "@pointclick-engine/engine-core/commands";
import { EventBus, type GameEvent } from "@pointclick-engine/engine-core/events";
import { type GameLoopPort } from "@pointclick-engine/engine-core/ports";

const cmd = new CommandHandler();
cmd.register("scene:set", (c) => console.log("got:", c));
cmd.execute({ type: "scene:set", sceneId: "town" });

const bus = new EventBus();
const unsub = bus.on("scene:changed", (e) => console.log("event:", e));
bus.emit("scene:changed", { type: "scene:changed", sceneId: "town", scene: {} });
unsub();
```

```bash
node test.mjs
```

**Esperado**: imprime `got: { type: 'scene:set', sceneId: 'town' }` y `event: { ... }`.

Si TypeScript imports requieren tooling, hacer una versión `.ts` y probar con `tsx` o `ts-node`:

```bash
npx tsx test.ts
```

### 4. Probar renderer-r3f en un Next.js sandbox

```bash
npx create-next-app@latest /tmp/pointclick-render-sandbox --typescript --no-eslint --no-tailwind --app
cd /tmp/pointclick-render-sandbox
npm install /<path>/pointclick-engine-core-0.1.0.tgz /<path>/pointclick-engine-renderer-r3f-0.1.0.tgz
npm install three @react-three/fiber @react-three/drei @react-three/rapier zustand react react-dom
```

Editar `app/page.tsx`:

```tsx
"use client";
import { useEffect } from "react";
import { createGameRuntime, GameViewport } from "@pointclick-engine/engine-renderer-r3f";

const minimalScene = {
  id: "test",
  label: "Test",
  background: "#000",
  playerSpawn: [0, 0, 0],
  ground: { halfSize: [10, 0.1, 10], color: "#444" },
  walls: [],
  interactions: [],
};

export default function Home() {
  useEffect(() => {
    createGameRuntime({ scenes: [minimalScene] });
  }, []);
  return <GameViewport />;
}
```

```bash
npm run dev
```

Abrir `http://localhost:3000`. **Esperado**: canvas R3F monta sin errores de consola; player en (0,0,0).

### 5. Documentar resultado

Crear `docs/phases/phase-5-publish/tarball-install-report.md`:

```markdown
# Tarball Install Report

Date: <fecha>

## Tarballs producidos

- `pointclick-engine-core-0.1.0.tgz` — N KB
- `pointclick-engine-renderer-r3f-0.1.0.tgz` — N KB

## Sandboxes probados

- Node ESM puro: ✅ imports + subpath exports
- Next.js 16 + React 19: ✅ Canvas monta, runtime crea, no warnings

## Issues encontrados

(Si todo verde, escribir "Ninguno". Si hubo gaps, listarlos con la task que los resuelve.)

## Conclusión

Tarballs publicables. Listo para Task 08 (tag + publish).
```

### 6. Limpieza

```bash
rm -rf /tmp/pointclick-sandbox /tmp/pointclick-render-sandbox
rm packages/engine-core/pointclick-engine-core-0.1.0.tgz
rm packages/engine-renderer-r3f/pointclick-engine-renderer-r3f-0.1.0.tgz
```

(Los tarballs se regeneran en Task 08 justo antes de publish.)

## Success Criteria

- [ ] Ambos tarballs producidos sin errores
- [ ] Sandbox ESM puro: imports principales + 3 subpath exports funcionan
- [ ] Sandbox Next.js: Canvas monta, runtime crea, sin errores de consola
- [ ] `tarball-install-report.md` creado con resultados
- [ ] Si hubo issues: cada uno tiene una task de seguimiento (`06a-fix-X.md`) o se documenta el workaround

## On Complete

1. Marca `[x]` en `../tracking.md` para `06-publish-dry-run`
2. Commit:
   ```
   chore(phase-5): validate publishable tarballs via sandbox install

   - [x] Marked: 06-publish-dry-run

   See docs/phases/phase-5-publish/tasks/06-publish-dry-run.md
   ```

## References

- npm pack docs: https://docs.npmjs.com/cli/v10/commands/npm-pack
- ADR-0007: solo ESM v0.x
- Task 04: subpath exports definidos

## Notes

**Gotcha de Windows**: si estás en PowerShell y rutas `/tmp/` no existen, usar `$env:TEMP\pointclick-sandbox` o equivalente.

**Gotcha de `npm pack`**: en versiones recientes los `.tgz` se generan en `cwd`, no en el package. Verificar con `ls *.tgz`.

**Falso positivo**: si el sandbox tiene `node_modules` compartido con el monorepo (npm workspaces de subir), los imports pueden resolverse vía el monorepo en lugar del tarball. Usar `/tmp/` o un directorio fuera del repo para garantizar aislamiento.

Si peer deps faltan, npm lo avisa con warning. Anotar las que faltan en el report y reflejar en README (Task 05) si no se ha hecho.
